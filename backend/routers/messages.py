from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from dependencies import get_current_character
from models.character import Character
from models.message import Message
from schemas.message import MessageCreate, MessageOut

router = APIRouter()


@router.get("", response_model=list[MessageOut])
async def get_inbox(
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    """Return all messages sent to or from the current character."""
    result = await session.execute(
        select(Message)
        .where(
            or_(
                Message.to_character_id == character.id,
                Message.from_character_id == character.id,
            )
        )
        .order_by(Message.created_at.desc())
    )
    messages = result.scalars().all()
    return [MessageOut.model_validate(message) for message in messages]


@router.post("", response_model=MessageOut, status_code=201)
async def send_message(
    data: MessageCreate,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    if data.to_character_id == character.id:
        raise HTTPException(status_code=422, detail="Cannot send a message to yourself.")

    msg = Message(
        from_character_id=character.id,
        to_character_id=data.to_character_id,
        body=data.body,
    )
    session.add(msg)
    await session.flush()
    await session.refresh(msg)
    return MessageOut.model_validate(msg)


@router.get("/{message_id}", response_model=MessageOut)
async def read_message(
    message_id: int,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    msg = await session.get(Message, message_id)
    if msg is None:
        raise HTTPException(status_code=404, detail="Message not found.")
    if character.id not in (msg.from_character_id, msg.to_character_id):
        raise HTTPException(status_code=403, detail="Not a party to this message.")

    # Mark as read if recipient
    if msg.to_character_id == character.id and msg.read_at is None:
        msg.read_at = datetime.now(timezone.utc)
        await session.flush()
        await session.refresh(msg)

    return MessageOut.model_validate(msg)
