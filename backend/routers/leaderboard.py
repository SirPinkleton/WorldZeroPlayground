from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.sql import false as sa_false
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models.character import Character, CharacterStatus
from models.character_stats import CharacterStats
from schemas.character import CharacterOut
from services.character import build_character_out
from services.era import get_current_era_row_safe

router = APIRouter()


@router.get("", response_model=list[CharacterOut])
async def get_leaderboard(
    faction: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_db),
):
    """Top characters by current era score, optionally filtered by faction."""
    era_row = await get_current_era_row_safe(session)
    era_id = era_row.id if era_row else None

    join_condition = CharacterStats.character_id == Character.id
    if era_id is not None:
        join_condition = join_condition & (CharacterStats.era_id == era_id)
    else:
        join_condition = join_condition & sa_false()

    query = (
        select(Character, CharacterStats)
        .outerjoin(CharacterStats, join_condition)
        .where(Character.status == CharacterStatus.active)
    )
    if faction:
        query = query.where(Character.faction_slug == faction)
    query = query.order_by(
        CharacterStats.score.desc().nulls_last()
    ).limit(limit).offset(offset)

    result = await session.execute(query)
    rows = result.all()
    return [build_character_out(c, s) for c, s in rows]
