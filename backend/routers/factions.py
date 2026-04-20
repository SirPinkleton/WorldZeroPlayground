from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from dependencies import get_current_character, require_admin
from game_config import CURRENT_ERA
from models.account import Account
from models.character import Character
from models.faction import Faction, FactionStatus
from schemas.faction import (
    DefectionHistoryOut,
    FactionChoiceRequest,
    FactionOut,
    FactionPageOut,
    FactionStatusOut,
    FactionUpdate,
    InvitationLetterOut,
)
from services.era import get_current_era_row
from services.faction_service import (
    defect_to_faction,
    get_defection_history,
    get_invitation_status,
)
from models.invitation_letter import InvitationLetter

router = APIRouter()


@router.get("", response_model=list[FactionOut])
async def list_factions(session: AsyncSession = Depends(get_db)):
    """Return all non-hidden factions."""
    result = await session.execute(
        select(Faction).where(Faction.status == FactionStatus.visible).order_by(Faction.slug)
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
    await session.flush()
    await session.refresh(faction)
    return FactionOut.model_validate(faction)


@router.post("/choose", response_model=FactionOut)
async def choose_faction(
    data: FactionChoiceRequest,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    """Choose or defect to a new faction.

    Works for initial faction selection (from aged_out) and later defections.
    Players cannot rejoin factions they have left, except UA Masters and Albescent.
    """
    updated_character = await defect_to_faction(
        character, data.faction_slug, session
    )
    faction = await session.get(Faction, updated_character.faction_slug)
    return FactionOut.model_validate(faction)


@router.get("/status", response_model=FactionPageOut)
async def get_faction_status(
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    """Return faction page data: current faction and status of all factions."""
    era_row = await get_current_era_row(session)
    status_map = await get_invitation_status(
        character.id, era_row.id, session
    )
    all_factions = [
        FactionStatusOut(
            slug=slug,
            name=CURRENT_ERA.factions[slug].name if slug in CURRENT_ERA.factions else slug,
            status=status,
        )
        for slug, status in status_map.items()
    ]
    return FactionPageOut(
        current_faction_slug=character.faction_slug,
        all_factions=all_factions,
    )


@router.get("/invitations", response_model=list[InvitationLetterOut])
async def list_invitations(
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    """Return all invitation letters delivered to the current character."""
    era_row = await get_current_era_row(session)
    result = await session.execute(
        select(InvitationLetter).where(
            InvitationLetter.character_id == character.id,
            InvitationLetter.era_id == era_row.id,
        )
    )
    letters = result.scalars().all()
    return [
        InvitationLetterOut(
            faction_slug=letter.faction_slug,
            faction_name=(
                CURRENT_ERA.factions[letter.faction_slug].name
                if letter.faction_slug in CURRENT_ERA.factions
                else letter.faction_slug
            ),
            delivered_at=letter.delivered_at,
        )
        for letter in letters
    ]


@router.get("/defection-history", response_model=list[DefectionHistoryOut])
async def list_defection_history(
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    """Return defection history for the current character in the current era."""
    era_row = await get_current_era_row(session)
    records = await get_defection_history(character.id, era_row.id, session)
    return [
        DefectionHistoryOut(
            faction_slug=record.faction_slug,
            defected_at=record.defected_at,
        )
        for record in records
    ]
