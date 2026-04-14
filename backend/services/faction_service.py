"""Faction lifecycle: defection, invitation letters, and Analog Double Dipper."""

from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.analog_double_dipper import AnalogDoubleDipper
from models.character import Character
from models.character_stats import CharacterStats
from models.faction_defection_history import FactionDefectionHistory
from models.invitation_letter import InvitationLetter
from models.task import Task
from services.era import get_current_era_row, get_or_create_stats

FACTION_GRADUATION_LEVEL: int = 3
INVITATION_POINT_THRESHOLD: int = 20
ANALOG_FACTION_SLUG: str = "analog"
UA_MASTERS_FACTION_SLUG: str = "ua_masters"
UA_FACTION_SLUG: str = "ua"
UNAFFILIATED_FACTION_SLUG: str = "na"


# ---------------------------------------------------------------------------
# Defection
# ---------------------------------------------------------------------------


async def can_join_faction(
    character_id: int,
    target_slug: str,
    era_id: int,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> bool:
    """Check whether a character is allowed to join the target faction.

    Returns False if the character has previously defected from this faction
    in the current era and the faction does not allow rejoining.
    """
    faction_config = era.factions.get(target_slug)
    if faction_config is None:
        return False
    if faction_config.can_always_rejoin:
        return True
    result = await session.execute(
        select(FactionDefectionHistory).where(
            FactionDefectionHistory.character_id == character_id,
            FactionDefectionHistory.faction_slug == target_slug,
            FactionDefectionHistory.era_id == era_id,
        )
    )
    return result.scalar_one_or_none() is None


async def defect_to_faction(
    character: Character,
    target_slug: str,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Character:
    """Move a character to a new faction, recording the defection.

    Works for both initial faction choice (from aged_out) and later defections.
    Raises 422 if the target is the current faction, 404 if the target doesn't
    exist or isn't selectable, and 403 if the player previously left this faction
    and it doesn't allow rejoining.
    """
    if character.faction_slug == target_slug:
        raise HTTPException(
            status_code=422,
            detail="Already a member of this faction.",
        )

    faction_config = era.factions.get(target_slug)
    if faction_config is None:
        raise HTTPException(status_code=404, detail="Faction not found.")
    if not faction_config.is_selectable and not faction_config.can_always_rejoin:
        raise HTTPException(
            status_code=422,
            detail="This faction cannot be chosen directly.",
        )

    era_row = await get_current_era_row(session)

    if not await can_join_faction(
        character.id, target_slug, era_row.id, session, era
    ):
        raise HTTPException(
            status_code=403,
            detail="Cannot rejoin a faction you have left.",
        )

    # Record defection from current faction (if it's a real faction, not na)
    old_slug = character.faction_slug
    if old_slug and old_slug != UNAFFILIATED_FACTION_SLUG:
        defection = FactionDefectionHistory(
            character_id=character.id,
            faction_slug=old_slug,
            era_id=era_row.id,
        )
        session.add(defection)

    character.faction_slug = target_slug
    await session.commit()
    await session.refresh(character)
    return character


async def get_defection_history(
    character_id: int,
    era_id: int,
    session: AsyncSession,
) -> list[FactionDefectionHistory]:
    """Return all defection records for a character in the given era."""
    result = await session.execute(
        select(FactionDefectionHistory).where(
            FactionDefectionHistory.character_id == character_id,
            FactionDefectionHistory.era_id == era_id,
        )
    )
    return list(result.scalars().all())


async def clear_defection_history_for_era(
    era_id: int,
    session: AsyncSession,
) -> None:
    """Delete all defection records for a given era. Called during era reset."""
    await session.execute(
        delete(FactionDefectionHistory).where(
            FactionDefectionHistory.era_id == era_id,
        )
    )


# ---------------------------------------------------------------------------
# Invitation Letters
# ---------------------------------------------------------------------------


async def check_and_deliver_invitations(
    character: Character,
    task: Task,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> list[InvitationLetter]:
    """Deliver invitation letters if the character qualifies.

    Trigger conditions (all must be true):
    - Character level >= FACTION_GRADUATION_LEVEL (3)
    - Character score >= INVITATION_POINT_THRESHOLD (20)

    When conditions are met, delivers a letter for the task's faction. UA Masters
    always sends an invitation to every qualifying player.
    """
    era_row = await get_current_era_row(session)
    stats = await get_or_create_stats(session, character.id, era_row.id)

    if stats.level < FACTION_GRADUATION_LEVEL:
        return []
    if stats.score < INVITATION_POINT_THRESHOLD:
        return []

    task_faction_slug = task.primary_faction_slug or UNAFFILIATED_FACTION_SLUG
    factions_to_invite: set[str] = set()

    # Always invite to UA Masters if qualifying
    if UA_MASTERS_FACTION_SLUG in era.factions:
        factions_to_invite.add(UA_MASTERS_FACTION_SLUG)

    # Invite to the task's faction if it's a real selectable faction
    if task_faction_slug != UNAFFILIATED_FACTION_SLUG:
        faction_config = era.factions.get(task_faction_slug)
        if faction_config is not None and faction_config.is_selectable:
            factions_to_invite.add(task_faction_slug)

    delivered: list[InvitationLetter] = []
    for slug in factions_to_invite:
        existing = await session.execute(
            select(InvitationLetter).where(
                InvitationLetter.character_id == character.id,
                InvitationLetter.faction_slug == slug,
                InvitationLetter.era_id == era_row.id,
            )
        )
        if existing.scalar_one_or_none() is not None:
            continue

        letter = InvitationLetter(
            character_id=character.id,
            faction_slug=slug,
            era_id=era_row.id,
        )
        session.add(letter)
        delivered.append(letter)

    if delivered:
        await session.flush()

    return delivered


async def get_invitation_status(
    character_id: int,
    era_id: int,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> dict[str, str]:
    """Return a dict mapping faction slug to relationship status.

    Possible values: "member", "invited", "not_invited", "defected", "can_return".
    """
    character = await session.get(Character, character_id)
    if character is None:
        return {}

    current_faction = character.faction_slug

    defections = await get_defection_history(character_id, era_id, session)
    defected_slugs = {defection.faction_slug for defection in defections}

    invitation_result = await session.execute(
        select(InvitationLetter).where(
            InvitationLetter.character_id == character_id,
            InvitationLetter.era_id == era_id,
        )
    )
    invited_slugs = {
        letter.faction_slug for letter in invitation_result.scalars().all()
    }

    status_map: dict[str, str] = {}
    for slug, faction_config in era.factions.items():
        if slug == current_faction:
            status_map[slug] = "member"
        elif slug in defected_slugs and faction_config.can_always_rejoin:
            status_map[slug] = "can_return"
        elif slug in defected_slugs:
            status_map[slug] = "defected"
        elif slug in invited_slugs:
            status_map[slug] = "invited"
        else:
            status_map[slug] = "not_invited"

    return status_map


# ---------------------------------------------------------------------------
# Analog Double Dipper
# ---------------------------------------------------------------------------


async def designate_double_dipper(
    character: Character,
    task: Task,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> AnalogDoubleDipper:
    """Designate a task as the character's repeatable task for their current level.

    Only available to Analog faction members. One designation per level tier,
    locked on insert (cannot be changed).
    """
    if character.faction_slug != ANALOG_FACTION_SLUG:
        raise HTTPException(
            status_code=403,
            detail="Only Analog faction members can use Double Dipper.",
        )

    era_row = await get_current_era_row(session)
    stats = await get_or_create_stats(session, character.id, era_row.id)
    current_level = stats.level

    existing = await session.execute(
        select(AnalogDoubleDipper).where(
            AnalogDoubleDipper.character_id == character.id,
            AnalogDoubleDipper.level_tier == current_level,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=409,
            detail="Already designated a repeated task for this level.",
        )

    designation = AnalogDoubleDipper(
        character_id=character.id,
        level_tier=current_level,
        task_id=task.id,
    )
    session.add(designation)
    await session.commit()
    await session.refresh(designation)
    return designation


async def get_double_dipper_for_level(
    character_id: int,
    level_tier: int,
    session: AsyncSession,
) -> AnalogDoubleDipper | None:
    """Return the Double Dipper designation for a character at a given level, or None."""
    result = await session.execute(
        select(AnalogDoubleDipper).where(
            AnalogDoubleDipper.character_id == character_id,
            AnalogDoubleDipper.level_tier == level_tier,
        )
    )
    return result.scalar_one_or_none()
