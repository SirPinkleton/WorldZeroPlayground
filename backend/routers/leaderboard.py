from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models.character import Character, CharacterStatus
from models.character_stats import CharacterStats
from routers.characters import _build_character_out
from schemas.character import CharacterOut
from services.era import get_current_era_row

router = APIRouter()


@router.get("", response_model=list[CharacterOut])
async def get_leaderboard(
    faction: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_db),
):
    """Top characters by current era score, optionally filtered by faction."""
    try:
        era_row = await get_current_era_row(session)
        era_id = era_row.id
    except HTTPException:
        era_id = None

    query = (
        select(Character, CharacterStats)
        .outerjoin(
            CharacterStats,
            (CharacterStats.character_id == Character.id)
            & (CharacterStats.era_id == era_id if era_id else False),
        )
        .where(Character.status == CharacterStatus.active)
    )
    if faction:
        query = query.where(Character.faction_slug == faction)
    query = query.order_by(
        CharacterStats.score.desc().nulls_last()
    ).limit(limit).offset(offset)

    result = await session.execute(query)
    rows = result.all()
    return [_build_character_out(c, s) for c, s in rows]
