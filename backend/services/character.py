import dataclasses
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.sql import Select, false as sa_false
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character, CharacterStatus
from models.character_stats import CharacterStats
from schemas.character import CharacterCreate, CharacterOut, CharacterUpdate
from services.era import get_current_era_row, get_current_era_row_safe, get_or_create_stats
from services.scoring import compute_level, compute_vote_budget, compute_votes_available


def build_character_out(
    character: Character,
    stats: CharacterStats | None,
) -> CharacterOut:
    """Flatten a Character row plus its (optional) CharacterStats into CharacterOut.

    votes_available is computed on read from stats.score and votes_spent_this_era.
    """
    return CharacterOut(
        id=character.id,
        username=character.username,
        display_name=character.display_name,
        bio=character.bio,
        avatar_url=character.avatar_url,
        location=character.location,
        faction_slug=character.faction_slug,
        status=character.status.value,
        created_at=character.created_at,
        score=stats.score if stats else 0,
        all_time_score=stats.all_time_score if stats else 0,
        level=stats.level if stats else 0,
        votes_available=compute_votes_available(stats) if stats else 0,
    )


@dataclasses.dataclass(frozen=True)
class CharacterCreationResult:
    character: Character
    stats: CharacterStats


async def get_character_by_id(character_id: int, session: AsyncSession) -> Character | None:
    result = await session.execute(
        select(Character).where(
            Character.id == character_id,
            Character.status == CharacterStatus.active,
        )
    )
    return result.scalar_one_or_none()


ALBESCENT_FACTION_SLUG = "albescent"


async def _account_has_character_at_level(
    account_id: int,
    min_level: int,
    session: AsyncSession,
) -> bool:
    """True when the account has at least one active character with stats.level >= min_level
    in the current era."""
    era_row = await get_current_era_row(session)
    result = await session.execute(
        select(Character.id)
        .join(
            CharacterStats,
            (CharacterStats.character_id == Character.id)
            & (CharacterStats.era_id == era_row.id),
        )
        .where(
            Character.account_id == account_id,
            Character.status == CharacterStatus.active,
            CharacterStats.level >= min_level,
        )
        .limit(1)
    )
    return result.scalar_one_or_none() is not None


async def can_create_additional_character(
    account_id: int,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> bool:
    """True when this account may create another character.

    Requires at least one existing active character at level
    ``era.second_character_level_required`` or above in the current era.
    """
    return await _account_has_character_at_level(
        account_id, era.second_character_level_required, session
    )


async def can_start_as_albescent(
    account_id: int,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> bool:
    """True when this account may create a new character in the Albescent faction.

    Requires at least one existing active character at level
    ``era.albescent_level_required`` or above in the current era.
    """
    return await _account_has_character_at_level(
        account_id, era.albescent_level_required, session
    )


async def create_character(
    account_id: int,
    data: CharacterCreate,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> CharacterCreationResult:
    era_row = await get_current_era_row(session)

    requested_faction_slug = (data.faction_slug or "").strip().lower() or None

    # Count existing active characters for this account
    result = await session.execute(
        select(func.count()).select_from(Character).where(
            Character.account_id == account_id,
            Character.status == CharacterStatus.active,
        )
    )
    existing_count = result.scalar_one()

    if existing_count > 0:
        # Need level >= era.second_character_level_required on at least one
        # character to create another.
        if not await can_create_additional_character(account_id, session, era):
            raise HTTPException(
                status_code=403,
                detail=(
                    f"Must reach level {era.second_character_level_required} "
                    "before creating additional characters."
                ),
            )

    # Albescent unlock gate: requires at least one character at era.albescent_level_required.
    if requested_faction_slug == ALBESCENT_FACTION_SLUG:
        if not await can_start_as_albescent(account_id, session, era):
            raise HTTPException(
                status_code=403,
                detail=(
                    f"Albescent characters require a level-{era.albescent_level_required} "
                    "character on the account."
                ),
            )
        starting_faction_slug = ALBESCENT_FACTION_SLUG
    elif requested_faction_slug in (None, "", "ua"):
        # Default onboarding: everyone starts in UA.
        starting_faction_slug = "ua"
    else:
        raise HTTPException(
            status_code=400,
            detail=(
                "New characters must start in UA (or Albescent, if unlocked). "
                "Other factions are joined later via faction graduation."
            ),
        )

    character = Character(
        account_id=account_id,
        username=data.username,
        display_name=data.display_name,
        bio=data.bio or "",
        avatar_url=data.avatar_url or "",
        location=data.location or "",
        faction_slug=starting_faction_slug,
    )
    session.add(character)
    await session.flush()  # get character.id before creating stats

    stats = await get_or_create_stats(
        session,
        character_id=character.id,
        era_id=era_row.id,
    )

    await session.flush()
    await session.refresh(character)
    await session.refresh(stats)
    return CharacterCreationResult(character=character, stats=stats)


async def update_character(
    character_id: int,
    data: CharacterUpdate,
    session: AsyncSession,
) -> Character:
    character = await get_character_by_id(character_id, session)
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found.")

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is None:
            value = ""
        setattr(character, field, value)

    await session.flush()
    await session.refresh(character)
    return character


async def soft_delete_character(character_id: int, session: AsyncSession) -> None:
    character = await get_character_by_id(character_id, session)
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found.")
    character.status = CharacterStatus.banned
    await session.flush()


def _character_stats_era_join(era_id: int | None) -> Select:
    """Return a ``select(Character, CharacterStats)`` outer-joined on the given era.

    When ``era_id`` is None (era unseeded), the join evaluates to false so every
    ``CharacterStats`` column is NULL — the caller still gets a row per Character
    and ``build_character_out`` substitutes zero stats.
    """
    if era_id is None:
        join_condition = (CharacterStats.character_id == Character.id) & sa_false()
    else:
        join_condition = (
            (CharacterStats.character_id == Character.id)
            & (CharacterStats.era_id == era_id)
        )
    return (
        select(Character, CharacterStats)
        .outerjoin(CharacterStats, join_condition)
        .where(Character.status == CharacterStatus.active)
    )


async def list_characters_for_viewer(
    session: AsyncSession,
    *,
    search: Optional[str] = None,
    faction_slug: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[tuple[Character, CharacterStats | None]]:
    """List active characters with current-era stats. Optional name/faction filters."""
    era_row = await get_current_era_row_safe(session)
    era_id = era_row.id if era_row else None

    query = _character_stats_era_join(era_id)
    if search:
        query = query.where(Character.username.ilike(f"%{search}%"))
    if faction_slug:
        query = query.where(Character.faction_slug == faction_slug)
    query = (
        query.order_by(CharacterStats.score.desc().nulls_last())
        .limit(limit)
        .offset(offset)
    )

    result = await session.execute(query)
    return list(result.all())


def check_faction_graduation(
    character: Character,
    stats: CharacterStats,
    era: EraConfig = CURRENT_ERA,
) -> str | None:
    """Returns 'aged_out' if the character just hit level 3 while still in 'ua', else None."""
    if character.faction_slug != "ua":
        return None
    current_level = compute_level(stats.score, era)
    if current_level >= 3:
        return "aged_out"
    return None
