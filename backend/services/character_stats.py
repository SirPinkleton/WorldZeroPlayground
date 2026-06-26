"""Service for recomputing and persisting CharacterStats from current vote data."""

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character
from models.duel import Duel, DuelStatus
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
    excluded_praxis_ids: Optional[set[int]] = None,
) -> float:
    """Sum the score contribution of all visible submitted solo praxes this character authored.

    Pass ``excluded_praxis_ids`` (duel sides) to skip them — they are scored by
    ``_score_duel_praxes`` with the appropriate duel multiplier instead.
    """
    solo_result = await session.execute(
        select(Praxis).where(
            Praxis.type == PraxisType.solo,
            Praxis.created_by_id == character_id,
            Praxis.moderation_status != ModerationStatus.hidden,
            Praxis.status == PraxisStatus.submitted,
        )
    )
    all_solo = solo_result.scalars().all()
    solo_praxes = (
        [p for p in all_solo if p.id not in excluded_praxis_ids]
        if excluded_praxis_ids
        else list(all_solo)
    )

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


async def _score_duel_praxes(
    character_id: int,
    character_faction_slug: str,
    session: AsyncSession,
    era: EraConfig,
) -> tuple[float, set[int]]:
    """Score duel sides for a character (ADR-0011).

    Returns ``(score, own_duel_praxis_ids)`` so the caller can exclude those IDs
    from the plain solo scoring pass.

    Each duel side is a standalone ``type=solo`` praxis linked via the Duel table.
    Votes go directly to the praxis; no per-member routing.
    """
    # Submitted solo praxes by this character
    own_praxes_result = await session.execute(
        select(Praxis).where(
            Praxis.type == PraxisType.solo,
            Praxis.created_by_id == character_id,
            Praxis.status == PraxisStatus.submitted,
            Praxis.moderation_status != ModerationStatus.hidden,
        )
    )
    own_praxes_by_id: dict[int, Praxis] = {
        p.id: p for p in own_praxes_result.scalars().all()
    }
    if not own_praxes_by_id:
        return 0.0, set()

    own_praxis_ids = list(own_praxes_by_id.keys())

    # Duel rows where this character's praxis is a side (active/settled)
    duel_result = await session.execute(
        select(Duel).where(
            (Duel.challenger_praxis_id.in_(own_praxis_ids))
            | (Duel.opponent_praxis_id.in_(own_praxis_ids)),
            Duel.status.in_([DuelStatus.active, DuelStatus.settled]),
        )
    )
    duels = list(duel_result.scalars().all())
    if not duels:
        return 0.0, set()

    # Separate own duel praxis IDs from opponent praxis IDs
    own_duel_praxis_ids: set[int] = set()
    opponent_praxis_ids: set[int] = set()
    for duel in duels:
        if duel.challenger_praxis_id in own_praxes_by_id:
            own_duel_praxis_ids.add(duel.challenger_praxis_id)
            if duel.opponent_praxis_id is not None:
                opponent_praxis_ids.add(duel.opponent_praxis_id)
        if duel.opponent_praxis_id in own_praxes_by_id:
            own_duel_praxis_ids.add(duel.opponent_praxis_id)
            opponent_praxis_ids.add(duel.challenger_praxis_id)

    # Bulk-fetch vote totals for all involved praxes
    all_vote_praxis_ids = own_duel_praxis_ids | opponent_praxis_ids
    stars_result = await session.execute(
        select(Vote.praxis_id, func.sum(Vote.stars))
        .where(Vote.praxis_id.in_(all_vote_praxis_ids))
        .group_by(Vote.praxis_id)
    )
    stars_by_praxis: dict[int, int] = {
        praxis_id: int(stars or 0) for praxis_id, stars in stars_result.all()
    }

    # Bulk-fetch tasks for own duel praxes
    task_ids = {own_praxes_by_id[pid].task_id for pid in own_duel_praxis_ids}
    tasks_by_id: dict[int, Task] = {}
    if task_ids:
        tasks_result = await session.execute(
            select(Task).where(Task.id.in_(task_ids))
        )
        tasks_by_id = {task.id: task for task in tasks_result.scalars()}

    # Opponent praxis → opponent character → faction slug
    opp_praxes_by_id: dict[int, Praxis] = {}
    if opponent_praxis_ids:
        opp_praxes_result = await session.execute(
            select(Praxis).where(Praxis.id.in_(opponent_praxis_ids))
        )
        opp_praxes_by_id = {p.id: p for p in opp_praxes_result.scalars()}

    opp_character_ids = {p.created_by_id for p in opp_praxes_by_id.values()}
    opp_characters_by_id: dict[int, Character] = {}
    if opp_character_ids:
        opp_chars_result = await session.execute(
            select(Character).where(Character.id.in_(opp_character_ids))
        )
        opp_characters_by_id = {c.id: c for c in opp_chars_result.scalars()}

    subtotal = 0.0
    for duel in duels:
        if duel.challenger_praxis_id in own_praxes_by_id:
            own_id: Optional[int] = duel.challenger_praxis_id
            opp_id: Optional[int] = duel.opponent_praxis_id
        else:
            own_id = duel.opponent_praxis_id
            opp_id = duel.challenger_praxis_id

        if own_id is None:
            continue
        own_praxis = own_praxes_by_id.get(own_id)
        if own_praxis is None:
            continue

        task = tasks_by_id.get(own_praxis.task_id)
        if task is None:
            continue

        own_stars = stars_by_praxis.get(own_id, 0)
        opp_stars = stars_by_praxis.get(opp_id, 0) if opp_id is not None else 0

        opponent_faction_slug = "na"
        if opp_id is not None:
            opp_praxis = opp_praxes_by_id.get(opp_id)
            if opp_praxis is not None:
                opp_char = opp_characters_by_id.get(opp_praxis.created_by_id)
                if opp_char is not None:
                    opponent_faction_slug = opp_char.faction_slug

        faction_multiplier = compute_faction_multiplier(
            character_faction_slug,
            task.primary_faction_slug or "na",
            era,
            collaboration_mode=COLLABORATION_MODE_SOLO,
        )
        duel_multiplier = compute_duel_multiplier(
            character_faction_slug,
            opponent_faction_slug,
            is_winner=own_stars > opp_stars,
            is_tied=own_stars == opp_stars,
            era=era,
        )
        subtotal += compute_praxis_score(
            task.point_value,
            faction_multiplier,
            own_stars,
            meta_task_points=0,
            duel_multiplier=duel_multiplier,
        )

    return subtotal, own_duel_praxis_ids


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

    # Score duel sides first to get IDs to exclude from plain solo scoring.
    duel_score, duel_praxis_ids = await _score_duel_praxes(
        character_id, character_faction_slug, session, era
    )
    total_score = await _score_solo_praxes(
        character_id, character_faction_slug, author_level, session, era,
        excluded_praxis_ids=duel_praxis_ids,
    )
    total_score += duel_score

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

    new_score = int(total_score)
    stats = current_stats

    # Vote budget is computed on read (services.scoring.compute_votes_available)
    # from stats.score and stats.votes_spent_this_era, so no bookkeeping is
    # needed here when score changes.
    stats.score = new_score
    stats.all_time_score = max(stats.all_time_score, new_score)
    stats.level = compute_level(new_score, era)

