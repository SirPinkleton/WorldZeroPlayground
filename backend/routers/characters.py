import io
import logging
import os
from typing import Optional

from PIL import Image

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

logger = logging.getLogger(__name__)
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db import get_db
from dependencies import get_current_character
from models.account import Account
from models.character import Character, CharacterStatus
from models.character_stats import CharacterStats
from models.relationship import Relationship
from models.praxis import Praxis
from models.vote import Vote
from schemas.character import CharacterCreate, CharacterOut, CharacterUpdate
from schemas.relationship import RelationshipOut
from schemas.praxis import PraxisOut
from services.auth import get_current_account
from services.character import (
    CharacterCreationResult,
    build_character_out,
    create_character,
    soft_delete_character,
    update_character,
)
from services.era import get_current_era_row_safe, load_current_era_stats
from services.praxis import build_praxis_out

router = APIRouter()


@router.get("", response_model=list[CharacterOut])
async def list_characters(
    search: Optional[str] = None,
    faction: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_db),
):
    """List all active characters. Optionally filter by name or faction."""
    era_row = await get_current_era_row_safe(session)
    era_id = era_row.id if era_row else None

    query = (
        select(Character, CharacterStats)
        .outerjoin(
            CharacterStats,
            (CharacterStats.character_id == Character.id)
            & (CharacterStats.era_id == era_id if era_id else False),
        )
        .where(Character.status == CharacterStatus.active)
    )
    if search:
        query = query.where(Character.username.ilike(f"%{search}%"))
    if faction:
        query = query.where(Character.faction_slug == faction)
    query = query.order_by(
        CharacterStats.score.desc().nulls_last()
    ).limit(limit).offset(offset)

    result = await session.execute(query)
    rows = result.all()
    return [build_character_out(c, s) for c, s in rows]


@router.get("/{character_id}", response_model=CharacterOut)
async def get_character(
    character_id: int,
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Character).where(
            Character.id == character_id,
            Character.status == CharacterStatus.active,
        )
    )
    character = result.scalar_one_or_none()
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found.")

    stats = await load_current_era_stats(character_id, session)
    return build_character_out(character, stats)


@router.post("", response_model=CharacterOut, status_code=201)
async def create_character_route(
    data: CharacterCreate,
    account: Account = Depends(get_current_account),
    session: AsyncSession = Depends(get_db),
):
    result: CharacterCreationResult = await create_character(account.id, data, session)
    return build_character_out(result.character, result.stats)


@router.put("/{character_id}", response_model=CharacterOut)
async def update_character_route(
    character_id: int,
    data: CharacterUpdate,
    current_character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    if current_character.id != character_id:
        raise HTTPException(status_code=403, detail="Cannot edit another character.")
    character = await update_character(character_id, data, session)
    stats = await load_current_era_stats(character_id, session)
    return build_character_out(character, stats)


@router.delete("/{character_id}", status_code=204)
async def delete_character_route(
    character_id: int,
    current_character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    if current_character.id != character_id:
        raise HTTPException(status_code=403, detail="Cannot delete another character.")
    await soft_delete_character(character_id, session)


@router.get("/{character_id}/praxes", response_model=list[PraxisOut])
async def get_character_praxes(
    character_id: int,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Praxis)
        .where(Praxis.created_by_id == character_id)
        .order_by(Praxis.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    praxis_list = result.scalars().all()
    return [await build_praxis_out(praxis, session) for praxis in praxis_list]


@router.post("/{character_id}/avatar", response_model=CharacterOut)
async def upload_avatar(
    character_id: int,
    file: UploadFile = File(...),
    account: Account = Depends(get_current_account),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Character).where(
            Character.id == character_id,
            Character.status == CharacterStatus.active,
        )
    )
    character = result.scalar_one_or_none()
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found.")
    if character.account_id != account.id:
        raise HTTPException(status_code=403, detail="Cannot update another character's avatar.")

    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="Avatar must be an image file.")

    rel_dir = os.path.join(str(character_id), "avatar")
    abs_dir = os.path.join(settings.MEDIA_ROOT, rel_dir)
    filename = "avatar.jpg"
    abs_path = os.path.join(abs_dir, filename)
    rel_path = os.path.join(rel_dir, filename)

    AVATAR_MAX_SIZE = 512
    AVATAR_JPEG_QUALITY = 85

    try:
        os.makedirs(abs_dir, exist_ok=True)
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Avatar too large (max 10 MB).")

        img = Image.open(io.BytesIO(contents))
        img = img.convert("RGB")
        img.thumbnail((AVATAR_MAX_SIZE, AVATAR_MAX_SIZE), Image.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=AVATAR_JPEG_QUALITY, optimize=True)
        with open(abs_path, "wb") as f:
            f.write(buffer.getvalue())
    except HTTPException:
        raise
    except Exception:
        logger.exception("Failed to save avatar for character %s", character_id)
        raise HTTPException(
            status_code=500,
            detail="We couldn't save your avatar. Please try again or paste a URL instead.",
        )

    character.avatar_url = rel_path
    await session.commit()
    await session.refresh(character)

    stats = await load_current_era_stats(character_id, session)
    return build_character_out(character, stats)


@router.get("/{character_id}/relationships", response_model=list[RelationshipOut])
async def get_character_relationships(
    character_id: int,
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Relationship).where(
            (Relationship.from_character_id == character_id)
            | (Relationship.to_character_id == character_id)
        )
    )
    relationships = result.scalars().all()
    return [RelationshipOut.model_validate(relationship) for relationship in relationships]


@router.get("/{character_id}/stats/votes-received")
async def get_votes_received_count(
    character_id: int,
    session: AsyncSession = Depends(get_db),
) -> dict[str, int]:
    """Return the total number of votes received on all of a character's praxes."""
    result = await session.execute(
        select(func.count())
        .select_from(Vote)
        .join(Praxis, Vote.praxis_id == Praxis.id)
        .where(Praxis.created_by_id == character_id)
    )
    count = result.scalar_one()
    return {"character_id": character_id, "votes_received": count}
