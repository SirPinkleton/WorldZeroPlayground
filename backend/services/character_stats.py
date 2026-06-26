"""Service for recomputing and persisting CharacterStats from current vote data."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character
from models.era import Era
from models.praxis import (
    ModerationStatus,
    Praxis,
    PraxisMember,
    PraxisStatus,
    PraxisType,
)
from services.era import get_current_era_row, get_or_create_stats
from services.praxis_scoring import compute_contributions
from services.scoring import compute_level


async def recalculate_character_stats(
    character_id: int,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
    era_row: Era | None = None,
) -> None:
    """Recompute and persist score, level, and vote budget for a character.

    Gathers all submitted praxes the character has a stake in — solo/duel praxes
    they authored, plus collab praxes they are a member of — then delegates all
    scoring arithmetic to ``compute_contributions`` (ADR-0014).

    Safe to call on praxis creation (0 votes → base points only) or after any
    vote change.

    Pass ``era_row`` when calling in a loop to avoid an extra query per iteration.
    """
    if era_row is None:
        era_row = await get_current_era_row(session)

    author = await session.get(Character, character_id)
    if author is None:
        return

    # Pre-fetch current stats to get the author's level for meta-task eligibility.
    # Slight staleness here is acceptable — the level is used only as a gate on
    # bonus points, not as the value being computed.
    stats = await get_or_create_stats(session, character_id, era_row.id)
    author_level = stats.level

    # Gather solo praxes (including duel sides) authored by this character.
    solo_result = await session.execute(
        select(Praxis).where(
            Praxis.created_by_id == character_id,
            Praxis.type == PraxisType.solo,
            Praxis.status == PraxisStatus.submitted,
            Praxis.moderation_status != ModerationStatus.hidden,
        )
    )
    solo_praxes = list(solo_result.scalars().all())

    # Gather collab praxes this character is a member of.
    collab_result = await session.execute(
        select(Praxis)
        .join(PraxisMember, PraxisMember.praxis_id == Praxis.id)
        .where(
            PraxisMember.character_id == character_id,
            Praxis.type == PraxisType.collab,
            Praxis.status == PraxisStatus.submitted,
            Praxis.moderation_status != ModerationStatus.hidden,
        )
    )
    collab_praxes = list(collab_result.scalars().all())

    all_praxes = solo_praxes + collab_praxes
    contributions = await compute_contributions(
        all_praxes, author, era, session, character_level=author_level
    )
    total_score = int(sum(c.total for c in contributions.values()))

    # Vote budget is computed on read (services.scoring.compute_votes_available)
    # from stats.score and stats.votes_spent_this_era, so no bookkeeping needed here.
    stats.score = total_score
    stats.all_time_score = max(stats.all_time_score, total_score)
    stats.level = compute_level(total_score, era)
