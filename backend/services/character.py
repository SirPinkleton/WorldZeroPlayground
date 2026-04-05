from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character
from schemas.character import CharacterCreate, CharacterUpdate
from services.scoring import compute_level, compute_vote_budget


async def get_character_by_id(character_id: int, session: AsyncSession) -> Character | None:
    result = await session.execute(
        select(Character).where(Character.id == character_id, Character.is_active == True)
    )
    return result.scalar_one_or_none()


async def create_character(
    account_id: int,
    data: CharacterCreate,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Character:
    # Count existing active characters for this account
    result = await session.execute(
        select(func.count()).select_from(Character).where(
            Character.account_id == account_id,
            Character.is_active == True,
        )
    )
    existing_count = result.scalar_one()

    if existing_count > 0:
        # Need level >= 3 on at least one character to create another
        level_check = await session.execute(
            select(Character).where(
                Character.account_id == account_id,
                Character.is_active == True,
                Character.level >= 3,
            )
        )
        if level_check.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=403,
                detail="Must reach level 3 before creating additional characters.",
            )

    character = Character(
        account_id=account_id,
        username=data.username,
        display_name=data.display_name,
        bio=data.bio,
        avatar_url=data.avatar_url,
        location=data.location,
        level=0,
        score=0,
        all_time_score=0,
        faction_slug="ua",
        votes_available=era.vote_budget_base,
    )
    session.add(character)
    await session.commit()
    await session.refresh(character)
    return character


async def update_character(
    character_id: int,
    data: CharacterUpdate,
    session: AsyncSession,
) -> Character:
    character = await get_character_by_id(character_id, session)
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found.")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(character, field, value)

    await session.commit()
    await session.refresh(character)
    return character


async def soft_delete_character(character_id: int, session: AsyncSession) -> None:
    character = await get_character_by_id(character_id, session)
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found.")
    character.is_active = False
    await session.commit()


def check_faction_graduation(
    character: Character, era: EraConfig = CURRENT_ERA
) -> str | None:
    """Returns 'aged_out' if the character just hit level 3 while still in 'ua', else None."""
    if character.faction_slug != "ua":
        return None
    current_level = compute_level(character.score, era)
    if current_level >= 3:
        return "aged_out"
    return None