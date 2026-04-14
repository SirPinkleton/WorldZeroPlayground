"""Schemas for the unified activity feed."""
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ActivityFeedItem(BaseModel):
    """A single item in the activity feed.

    The ``type`` field discriminates the payload shape:
    - vote_on_mine: someone voted on your submission
    - friend_completion: a friend completed a task
    - foe_taunt: a foe sent a taunt
    - global_task: a new task was activated
    - era_announcement: a new era started
    - collab_invite: someone invited you to collaborate
    - duel_challenge: someone challenged you to a duel
    - friend_signup: a friend signed up for a task you're doing
    """

    type: str
    timestamp: datetime
    actor_display_name: Optional[str] = None
    actor_faction_slug: Optional[str] = None
    actor_avatar_url: Optional[str] = None
    payload: dict[str, Any]


class FeedCounts(BaseModel):
    """Badge counts for each filter tab."""

    all: int = 0
    friends: int = 0
    foes: int = 0
    your_stuff: int = 0
    global_count: int = 0
    requests: int = 0


class ActivityFeedResponse(BaseModel):
    """Paginated activity feed with badge counts."""

    items: list[ActivityFeedItem]
    counts: FeedCounts
    next_cursor: Optional[str] = None
