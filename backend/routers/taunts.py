"""Router for foe taunt messages."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from dependencies import get_current_character
from models.character import Character
from schemas.taunt_message import TauntMessageOut
from services.taunt_service import get_taunts_for_character

router = APIRouter()


@router.get("", response_model=list[TauntMessageOut])
async def list_taunts(
    limit: int = 20,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
) -> list[TauntMessageOut]:
    """Return recent taunts received by the current character."""
    taunts = await get_taunts_for_character(character.id, session, limit=limit)
    return taunts
