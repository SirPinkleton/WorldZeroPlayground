import logging
import os
import re
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

logger = logging.getLogger(__name__)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db import get_db
from dependencies import get_current_character
from models.account import Account
from models.character import Character
from models.relationship import Relationship
from models.submission import MediaItem, Submission
from models.task import Task
from schemas.character import CharacterCreate, CharacterOut, CharacterUpdate
from schemas.relationship import RelationshipOut
from schemas.submission import MediaItemOut, SubmissionOut
from services.auth import get_current_account
from services.character import (
    create_character,
    soft_delete_character,
    update_character,
)
from services.submission import compute_submission_score_from_db

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
    query = select(Character).where(Character.is_active == True)
    if search:
        query = query.where(Character.username.ilike(f"%{search}%"))
    if faction:
        query = query.where(Character.faction_slug == faction)
    query = query.order_by(Character.score.desc()).limit(limit).offset(offset)
    result = await session.execute(query)
    characters = result.scalars().all()
    return [CharacterOut.model_validate(c) for c in characters]


@router.get("/{character_id}", response_model=CharacterOut)
async def get_character(
    character_id: int,
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Character).where(Character.id == character_id, Character.is_active == True)
    )
    character = result.scalar_one_or_none()
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found.")
    return CharacterOut.model_validate(character)


@router.post("", response_model=CharacterOut, status_code=201)
async def create_character_route(
    data: CharacterCreate,
    account: Account = Depends(get_current_account),
    session: AsyncSession = Depends(get_db),
):
    character = await create_character(account.id, data, session)
    return CharacterOut.model_validate(character)


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
    return CharacterOut.model_validate(character)


@router.delete("/{character_id}", status_code=204)
async def delete_character_route(
    character_id: int,
    current_character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    if current_character.id != character_id:
        raise HTTPException(status_code=403, detail="Cannot delete another character.")
    await soft_delete_character(character_id, session)


@router.get("/{character_id}/submissions", response_model=list[SubmissionOut])
async def get_character_submissions(
    character_id: int,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Submission)
        .where(Submission.character_id == character_id)
        .order_by(Submission.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    submissions = result.scalars().all()
    out = []
    for sub in submissions:
        task_result = await session.get(Task, sub.task_id)
        point_value = task_result.point_value if task_result else 0
        score = await compute_submission_score_from_db(sub.id, point_value, session)
        media_result = await session.execute(
            select(MediaItem)
            .where(MediaItem.submission_id == sub.id)
            .order_by(MediaItem.display_order)
        )
        media = [MediaItemOut.model_validate(m) for m in media_result.scalars().all()]
        out.append(
            SubmissionOut(
                id=sub.id,
                task_id=sub.task_id,
                character_id=sub.character_id,
                title=sub.title,
                body_text=sub.body_text,
                is_flagged=sub.is_flagged,
                created_at=sub.created_at,
                updated_at=sub.updated_at,
                media=media,
                score=score,
            )
        )
    return out


@router.post("/{character_id}/avatar", response_model=CharacterOut)
async def upload_avatar(
    character_id: int,
    file: UploadFile = File(...),
    account: Account = Depends(get_current_account),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Character).where(Character.id == character_id, Character.is_active == True)
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
    raw_name = os.path.basename(file.filename or "avatar")
    filename = re.sub(r"[^\w.\-]", "_", raw_name)[:100] or "avatar"
    abs_path = os.path.join(abs_dir, filename)
    rel_path = os.path.join(rel_dir, filename)

    try:
        os.makedirs(abs_dir, exist_ok=True)
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Avatar too large (max 10 MB).")
        with open(abs_path, "wb") as f:
            f.write(contents)
    except HTTPException:
        raise
    except OSError:
        logger.exception("Failed to save avatar for character %s", character_id)
        raise HTTPException(
            status_code=500,
            detail="We couldn't save your avatar. Please try again or paste a URL instead.",
        )

    character.avatar_url = rel_path
    await session.commit()
    await session.refresh(character)
    return CharacterOut.model_validate(character)


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
    return [RelationshipOut.model_validate(r) for r in relationships]
