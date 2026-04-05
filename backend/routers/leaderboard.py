from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models.character import Character
from schemas.character import CharacterOut

router = APIRouter()


@router.get("", response_model=list[CharacterOut])
async def get_leaderboard(
    faction: str | None = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_db),
):
    """Top characters by current score, optionally filtered by faction."""
    query = select(Character).where(Character.is_active == True)
    if faction:
        query = query.where(Character.faction_slug == faction)
    query = query.order_by(Character.score.desc()).limit(limit).offset(offset)
    result = await session.execute(query)
    characters = result.scalars().all()
    return [CharacterOut.model_validate(c) for c in characters]
