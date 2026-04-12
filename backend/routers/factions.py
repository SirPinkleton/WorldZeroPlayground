from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from dependencies import require_admin
from models.account import Account
from models.faction import Faction
from schemas.faction import FactionOut, FactionUpdate

router = APIRouter()


@router.get("", response_model=list[FactionOut])
async def list_factions(session: AsyncSession = Depends(get_db)):
    """Return all non-hidden factions."""
    result = await session.execute(
        select(Faction).where(Faction.is_hidden == False).order_by(Faction.slug)
    )
    return [FactionOut.model_validate(faction) for faction in result.scalars().all()]


@router.put("/{slug}", response_model=FactionOut)
async def update_faction(
    slug: str,
    data: FactionUpdate,
    _: Account = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    """Admin-only: update a faction's name and description."""
    faction = await session.get(Faction, slug)
    if faction is None:
        raise HTTPException(status_code=404, detail="Faction not found.")
    faction.name = data.name
    faction.description = data.description
    await session.commit()
    await session.refresh(faction)
    return FactionOut.model_validate(faction)
