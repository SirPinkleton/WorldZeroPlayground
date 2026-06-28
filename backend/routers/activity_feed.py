"""Router for the unified activity feed."""
from dataclasses import asdict
from datetime import datetime
from typing import Callable, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db, get_session_factory
from dependencies import get_current_character
from models.character import Character
from schemas.activity_feed import ActivityFeedResponse
from services.activity_feed import get_activity_feed

router = APIRouter()


@router.get("", response_model=ActivityFeedResponse)
async def activity_feed(
    filter: Optional[str] = Query(None, alias="filter"),
    before: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
    session_factory: Callable = Depends(get_session_factory),
) -> ActivityFeedResponse:
    """Return a unified, paginated activity feed for the current character."""
    # Unknown filters fall back to "all" in the service (FILTER_QUERIES.get default).
    before_cursor: Optional[datetime] = None
    if before:
        before_cursor = datetime.fromisoformat(before)

    dc_response = await get_activity_feed(
        character_id=character.id,
        session=session,
        session_factory=session_factory,
        feed_filter=filter,
        before_cursor=before_cursor,
        limit=limit,
    )
    return ActivityFeedResponse.model_validate(asdict(dc_response))
