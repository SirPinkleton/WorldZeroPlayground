"""Router for the unified activity feed."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from dependencies import get_current_character
from models.character import Character
from schemas.activity_feed import ActivityFeedResponse
from services.activity_feed import get_activity_feed

VALID_FILTERS = {"all", "friends", "foes", "your_stuff", "global", "requests"}

router = APIRouter()


@router.get("", response_model=ActivityFeedResponse)
async def activity_feed(
    filter: Optional[str] = Query(None, alias="filter"),
    before: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
) -> ActivityFeedResponse:
    """Return a unified, paginated activity feed for the current character."""
    feed_filter = filter if filter in VALID_FILTERS else "all"

    before_cursor: Optional[datetime] = None
    if before:
        before_cursor = datetime.fromisoformat(before)

    return await get_activity_feed(
        character_id=character.id,
        session=session,
        feed_filter=feed_filter,
        before_cursor=before_cursor,
        limit=limit,
    )
