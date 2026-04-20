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

    total_score = 0.0

    # ── Solo praxes ───────────────────────────────────────────────────────────
    solo_result = await session.execute(
        select(Praxis).where(
            Praxis.type == PraxisType.solo,
            Praxis.created_by_id == character_id,
            Praxis.moderation_status != ModerationStatus.hidden,
            Praxis.is_withdrawn == False,  # noqa: E712
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
        total_score += compute_praxis_score(
            task.point_value,
            faction_multiplier,
            total_stars,
            meta_task_points=meta_task_points,
            duel_multiplier=1.0,
        )

    # ── Submitted collaborations and duels ────────────────────────────────────
    member_result = await session.execute(
        select(PraxisMember).where(
            PraxisMember.character_id == character_id,
        )
    )
    members = member_result.scalars().all()

    # Bulk-fetch the praxes referenced by these memberships, then filter to
    # only the submitted, non-withdrawn ones and bulk-fetch their tasks, the
    # other members (for duels), and those opponents' characters.
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
        and not praxes_by_id[member.praxis_id].is_withdrawn
    ]

    member_task_ids = {praxis.task_id for praxis in eligible_praxes}
    member_tasks_by_id: dict[int, Task] = {}
    if member_task_ids:
        tasks_result = await session.execute(
            select(Task).where(Task.id.in_(member_task_ids))
        )
        member_tasks_by_id = {task.id: task for task in tasks_result.scalars()}

    duel_praxis_ids = [p.id for p in eligible_praxes if p.type == PraxisType.duel]
    opponent_members_by_praxis: dict[int, PraxisMember] = {}
    if duel_praxis_ids:
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

    # Bulk-fetch vote totals for duels (grouped by praxis + member) and for
    # collabs (grouped by praxis only) so the loop below is O(1) per item.
    duel_vote_totals_by_praxis: dict[int, dict[int, int]] = {}
    if duel_praxis_ids:
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

    collab_praxis_ids = [p.id for p in eligible_praxes if p.type == PraxisType.collab]
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

    for member in members:
        praxis = praxes_by_id.get(member.praxis_id)
        if praxis is None or praxis.status != PraxisStatus.submitted:
            continue
        if praxis.is_withdrawn:
            continue

        task = member_tasks_by_id.get(praxis.task_id)
        if task is None:
            continue

        task_faction_slug = task.primary_faction_slug or "na"

        if praxis.type == PraxisType.duel:
            # Determine duel outcome for this member
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

            is_tied = member_stars == opponent_stars
            is_winner = member_stars > opponent_stars

            faction_multiplier = compute_faction_multiplier(
                character_faction_slug,
                task_faction_slug,
                era,
                collaboration_mode=COLLABORATION_MODE_SOLO,  # own/other task, no duel mode
            )
            duel_multiplier = compute_duel_multiplier(
                character_faction_slug,
                opponent_faction_slug,
                is_winner=is_winner,
                is_tied=is_tied,
                era=era,
            )
            total_score += compute_praxis_score(
                task.point_value,
                faction_multiplier,
                member_stars,
                meta_task_points=0,  # meta tasks on collaborations not yet wired
                duel_multiplier=duel_multiplier,
            )
        elif praxis.type == PraxisType.collab:
            # Collaboration
            faction_multiplier = compute_faction_multiplier(
                character_faction_slug,
                task_faction_slug,
                era,
                collaboration_mode=COLLABORATION_MODE_COLLAB,
            )
            # Votes on collaborations use praxis-wide voting (no praxis_member_id)
            total_stars = collab_stars_by_praxis.get(praxis.id, 0)
            total_score += compute_praxis_score(
                task.point_value,
                faction_multiplier,
                total_stars,
                meta_task_points=0,
                duel_multiplier=1.0,
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
