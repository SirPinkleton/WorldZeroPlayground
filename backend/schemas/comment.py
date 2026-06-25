from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from models.comment import MAX_COMMENT_BODY


class CommentAuthor(BaseModel):
    """Public author identity — drives the actor-scoped theming on the frontend.

    Never exposes account_id or email (CLAUDE.md Do-NOT).
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    display_name: str
    avatar_url: str
    faction_slug: str


class CommentMentionOut(BaseModel):
    """A resolved @mention — the frontend linkifies these handles in the body."""

    character_id: int
    username: str
    display_name: str


class CommentIn(BaseModel):
    # max_length enforces the ≤2000 trust-boundary cap at the API edge (ADR-0006).
    body_text: str = Field(..., min_length=1, max_length=MAX_COMMENT_BODY)


class FlagIn(BaseModel):
    reason: str = ""


class CommentOut(BaseModel):
    id: int
    praxis_id: Optional[int] = None
    task_id: Optional[int] = None
    body_text: str
    is_edited: bool
    created_at: datetime
    updated_at: datetime
    author: CommentAuthor
    mentions: list[CommentMentionOut] = []
