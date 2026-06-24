"""Service for recomputing and persisting CharacterStats from current vote data."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character
from models.praxis import (
    ModerationStatus,
    Praxis,
    PraxisMember,
    PraxisStatus,
    PraxisType,
)
from models.task import Task
from models.vote import Vote
from models.era import Era
from services.character import check_faction_graduation
from services.era import get_current_era_row, get_or_create_stats
from services.meta_task import get_meta_task_points_bulk
from services.scoring import (
    COLLABORATION_MODE_COLLAB,
    COLLABORATION_MODE_SOLO,
    compute_duel_multiplier,
    compute_faction_multiplier,
    compute_level,
    compute_praxis_score,
)


async def _score_solo_praxes(
    character_id: int,
    character_faction_slug: str,
    author_level: int,
    session: AsyncSession,
    era: EraConfig,
) -> float:
    """Sum the score contribution of all visible submitted solo praxes this character authored."""
    solo_result = await session.execute(
        select(Praxis).where(
            Praxis.type == PraxisType.solo,
            Praxis.created_by_id == character_id,
            Praxis.moderation_status != ModerationStatus.hidden,
            Praxis.status == PraxisStatus.submitted,
        )
    )
    solo_praxes = solo_result.scalars().all()

    # Bulk-fetch tasks and per-praxis vote sums to avoid N+1 queries in the loop.
    solo_task_ids = {praxis.task_id for praxis in solo_praxes}
    tasks_by_id: dict[int, Task] = {}
    if solo_task_ids:
        tasks_result = await session.execute(
            select(Task).where(Task.id.in_(solo_task_ids))
        )
        tasks_by_id = {task.id: task for task in tasks_result.scalars()}

    solo_praxis_ids = [praxis.id for praxis in solo_praxes]
    solo_stars_by_praxis: dict[int, int] = {}
    if solo_praxis_ids:
        stars_result = await session.execute(
            select(Vote.praxis_id, func.sum(Vote.stars))
            .where(Vote.praxis_id.in_(solo_praxis_ids))
            .group_by(Vote.praxis_id)
        )
        solo_stars_by_praxis = {
            praxis_id: int(stars or 0) for praxis_id, stars in stars_result.all()
        }

    solo_meta_points_by_praxis = await get_meta_task_points_bulk(
        solo_praxis_ids, author_level, session
    )

    subtotal = 0.0
    for praxis in solo_praxes:
        task = tasks_by_id.get(praxis.task_id)
        if task is None:
            continue
        task_faction_slug = task.primary_faction_slug or "na"
        faction_multiplier = compute_faction_multiplier(
            character_faction_slug,
            task_faction_slug,
            era,
            collaboration_mode=COLLABORATION_MODE_SOLO,
        )
        meta_task_points = solo_meta_points_by_praxis.get(praxis.id, 0)
        total_stars = solo_stars_by_praxis.get(praxis.id, 0)
        subtotal += compute_praxis_score(
            task.point_value,
            faction_multiplier,
            total_stars,
            meta_task_points=meta_task_points,
            duel_multiplier=1.0,
        )
    return subtotal


async def _score_collab_praxes(
    character_id: int,
    character_faction_slug: str,
    eligible_praxes: list[Praxis],
    member_tasks_by_id: dict[int, Task],
    session: AsyncSession,
    era: EraConfig,
) -> float:
    """Sum the score contribution of this character's submitted collaboration memberships."""
    collab_praxes = [p for p in eligible_praxes if p.type == PraxisType.collab]
    collab_praxis_ids = [p.id for p in collab_praxes]

    collab_stars_by_praxis: dict[int, int] = {}
    if collab_praxis_ids:
        collab_votes_result = await session.execute(
            select(Vote.praxis_id, func.sum(Vote.stars))
            .where(Vote.praxis_id.in_(collab_praxis_ids))
            .group_by(Vote.praxis_id)
        )
        collab_stars_by_praxis = {
            praxis_id: int(stars or 0) for praxis_id, stars in collab_votes_result.all()
        }

    subtotal = 0.0
    for praxis in collab_praxes:
        task = member_tasks_by_id.get(praxis.task_id)
        if task is None:
            continue
        task_faction_slug = task.primary_faction_slug or "na"
        faction_multiplier = compute_faction_multiplier(
            character_faction_slug,
            task_faction_slug,
            era,
            collaboration_mode=COLLABORATION_MODE_COLLAB,
        )
        total_stars = collab_stars_by_praxis.get(praxis.id, 0)
        subtotal += compute_praxis_score(
            task.point_value,
            faction_multiplier,
            total_stars,
            meta_task_points=0,
            duel_multiplier=1.0,
        )
    return subtotal


async def _fetch_duel_context(
    character_id: int,
    duel_praxis_ids: list[int],
    session: AsyncSession,
) -> tuple[
    dict[int, PraxisMember],
    dict[int, Character],
    dict[int, dict[int, int]],
]:
    """Bulk-fetch opposing members, opponent characters, and per-member vote tallies."""
    opponent_members_by_praxis: dict[int, PraxisMember] = {}
    opponents_result = await session.execute(
        select(PraxisMember).where(
            PraxisMember.praxis_id.in_(duel_praxis_ids),
            PraxisMember.character_id != character_id,
        )
    )
    for opponent_member in opponents_result.scalars():
        # Duel praxes have exactly one opposing member; first-wins is fine.
        opponent_members_by_praxis.setdefault(opponent_member.praxis_id, opponent_member)

    opponent_character_ids = {om.character_id for om in opponent_members_by_praxis.values()}
    opponents_by_id: dict[int, Character] = {}
    if opponent_character_ids:
        opponents_result = await session.execute(
            select(Character).where(Character.id.in_(opponent_character_ids))
        )
        opponents_by_id = {
            opponent.id: opponent for opponent in opponents_result.scalars()
        }

    duel_vote_totals_by_praxis: dict[int, dict[int, int]] = {}
    duel_votes_result = await session.execute(
        select(Vote.praxis_id, Vote.praxis_member_id, func.sum(Vote.stars))
        .where(
            Vote.praxis_id.in_(duel_praxis_ids),
            Vote.praxis_member_id.is_not(None),
        )
        .group_by(Vote.praxis_id, Vote.praxis_member_id)
    )
    for praxis_id, praxis_member_id, stars in duel_votes_result.all():
        duel_vote_totals_by_praxis.setdefault(praxis_id, {})[praxis_member_id] = int(stars or 0)

    return opponent_members_by_praxis, opponents_by_id, duel_vote_totals_by_praxis


async def _score_duel_praxes(
    character_id: int,
    character_faction_slug: str,
    members: list[PraxisMember],
    eligible_praxes: list[Praxis],
    praxes_by_id: dict[int, Praxis],
    member_tasks_by_id: dict[int, Task],
    session: AsyncSession,
    era: EraConfig,
) -> float:
    """Sum the score contribution of this character's submitted duel memberships."""
    duel_praxis_ids = [p.id for p in eligible_praxes if p.type == PraxisType.duel]
    if not duel_praxis_ids:
        return 0.0

    (
        opponent_members_by_praxis,
        opponents_by_id,
        duel_vote_totals_by_praxis,
    ) = await _fetch_duel_context(character_id, duel_praxis_ids, session)

    subtotal = 0.0
    for member in members:
        praxis = praxes_by_id.get(member.praxis_id)
        if praxis is None or praxis.type != PraxisType.duel:
            continue
        if praxis.status != PraxisStatus.submitted:
            continue
        task = member_tasks_by_id.get(praxis.task_id)
        if task is None:
            continue

        vote_totals = duel_vote_totals_by_praxis.get(praxis.id, {})
        member_stars = vote_totals.get(member.id, 0)

        opponent_member = opponent_members_by_praxis.get(praxis.id)
        opponent_member_id = opponent_member.id if opponent_member else None
        opponent_stars = vote_totals.get(opponent_member_id, 0) if opponent_member_id else 0
        opponent = (
            opponents_by_id.get(opponent_member.character_id)
            if opponent_member
            else None
        )
        opponent_faction_slug = opponent.faction_slug if opponent else "na"

        faction_multiplier = compute_faction_multiplier(
            character_faction_slug,
            task.primary_faction_slug or "na",
            era,
            collaboration_mode=COLLABORATION_MODE_SOLO,  # own/other task, no duel mode
        )
        duel_multiplier = compute_duel_multiplier(
            character_faction_slug,
            opponent_faction_slug,
            is_winner=member_stars > opponent_stars,
            is_tied=member_stars == opponent_stars,
            era=era,
        )
        subtotal += compute_praxis_score(
            task.point_value,
            faction_multiplier,
            member_stars,
            meta_task_points=0,  # meta tasks on collaborations not yet wired
            duel_multiplier=duel_multiplier,
        )
    return subtotal


async def _fetch_membership_context(
    character_id: int,
    session: AsyncSession,
) -> tuple[list[PraxisMember], list[Praxis], dict[int, Praxis], dict[int, Task]]:
    """Bulk-fetch memberships, their praxes, and eligible praxis tasks for a character."""
    member_result = await session.execute(
        select(PraxisMember).where(
            PraxisMember.character_id == character_id,
        )
    )
    members = list(member_result.scalars().all())

    member_praxis_ids = {member.praxis_id for member in members}
    praxes_by_id: dict[int, Praxis] = {}
    if member_praxis_ids:
        praxes_result = await session.execute(
            select(Praxis).where(Praxis.id.in_(member_praxis_ids))
        )
        praxes_by_id = {praxis.id: praxis for praxis in praxes_result.scalars()}

    eligible_praxes = [
        praxes_by_id[member.praxis_id]
        for member in members
        if member.praxis_id in praxes_by_id
        and praxes_by_id[member.praxis_id].status == PraxisStatus.submitted
    ]

    member_task_ids = {praxis.task_id for praxis in eligible_praxes}
    member_tasks_by_id: dict[int, Task] = {}
    if member_task_ids:
        tasks_result = await session.execute(
            select(Task).where(Task.id.in_(member_task_ids))
        )
        member_tasks_by_id = {task.id: task for task in tasks_result.scalars()}

    return members, eligible_praxes, praxes_by_id, member_tasks_by_id


async def recalculate_character_stats(
    character_id: int,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
    era_row: Era | None = None,
) -> None:
    """Recompute and persist score, level, and vote budget for a character.

    Sums scores across:
    - All solo praxis records (formula: (base + meta) × faction × duel_multiplier + stars)
    - All submitted collaborations/duels the character is a member of

    Safe to call on praxis creation (0 votes → base points only) or after any vote change.

    Pass ``era_row`` when calling in a loop to avoid an extra query per iteration.
    """
    if era_row is None:
        era_row = await get_current_era_row(session)

    author = await session.get(Character, character_id)
    character_faction_slug = author.faction_slug if author else "na"

    # Pre-fetch current stats to get author level for meta task lookups.
    # This is the *current* level before recalculation; it's used only for
    # meta-task eligibility checks, where slight staleness is acceptable.
    current_stats = await get_or_create_stats(session, character_id, era_row.id)
    author_level = current_stats.level

    total_score = await _score_solo_praxes(
        character_id, character_faction_slug, author_level, session, era
    )

    members, eligible_praxes, praxes_by_id, member_tasks_by_id = (
        await _fetch_membership_context(character_id, session)
    )

    total_score += await _score_collab_praxes(
        character_id,
        character_faction_slug,
        eligible_praxes,
        member_tasks_by_id,
        session,
        era,
    )
    total_score += await _score_duel_praxes(
        character_id,
        character_faction_slug,
        members,
        eligible_praxes,
        praxes_by_id,
        member_tasks_by_id,
        session,
        era,
    )

    new_score = int(total_score)
    stats = current_stats

    # Vote budget is computed on read (services.scoring.compute_votes_available)
    # from stats.score and stats.votes_spent_this_era, so no bookkeeping is
    # needed here when score changes.
    stats.score = new_score
    stats.all_time_score = max(stats.all_time_score, new_score)
    stats.level = compute_level(new_score, era)

    if author:
        new_faction = check_faction_graduation(author, stats, era)
        if new_faction:
            author.faction_slug = new_faction
