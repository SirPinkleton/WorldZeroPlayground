from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MediaItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    file_path: str
    display_order: int


class SubmissionMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    character_id: int
    display_name: str
    faction_slug: Optional[str] = None
    has_submitted: bool
    title: Optional[str] = None
    body_text: Optional[str] = None
    joined_at: datetime


class SubmissionInviteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    submission_id: int
    inviter_id: int
    inviter_display_name: str
    invitee_id: int
    invitee_display_name: str
    invite_type: str
    status: str
    created_at: datetime


class SubmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    submission_type: str      # "solo" | "collaboration" | "duel"
    task_id: int
    task_title: str
    task_point_value: int
    task_faction_slug: Optional[str] = None
    moderation_status: str
    is_withdrawn: bool
    admin_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Solo fields
    character_id: Optional[int] = None
    character_display_name: Optional[str] = None
    character_avatar_url: Optional[str] = None
    title: Optional[str] = None
    body_text: Optional[str] = None
    score: Optional[float] = None
    media: list[MediaItemOut] = []
    # Collab/duel fields
    collab_mode: Optional[str] = None
    collab_status: Optional[str] = None
    created_by_id: Optional[int] = None
    collab_body_text: Optional[str] = None
    members: list[SubmissionMemberOut] = []
    invites: list[SubmissionInviteOut] = []


class SubmissionCreate(BaseModel):
    submission_type: str  # "solo" | "collaboration" | "duel"
    task_id: int
    # Solo fields
    title: Optional[str] = None
    body_text: Optional[str] = None
    meta_task_id: Optional[int] = None
    # Collab fields (for collab/duel)
    collab_mode: Optional[str] = None  # "collaboration" | "duel"


class SubmissionUpdate(BaseModel):
    title: str = Field(..., max_length=200)
    body_text: Optional[str] = Field(None, max_length=10000)


class SubmissionMemberContentUpdate(BaseModel):
    title: str = Field(..., max_length=200)
    body_text: Optional[str] = Field(None, max_length=10000)


class SubmissionInviteCreate(BaseModel):
    invitee_character_id: int


class InviteResponse(BaseModel):
    accept: bool
    drop_task_id: Optional[int] = None


class SubmissionDocumentUpdate(BaseModel):
    body_text: str = Field(..., max_length=50000)


class DuelVoteSummary(BaseModel):
    character_id: int
    display_name: str
    total_stars: int
    is_winning: bool


class SubmissionVoteIn(BaseModel):
    target_character_id: Optional[int] = None
    stars: int = Field(..., ge=1, le=5)


class SubmissionMemberCardOut(BaseModel):
    character_id: int
    display_name: str
    faction_slug: Optional[str] = None
    score: Optional[float] = None


class SubmissionCardOut(BaseModel):
    """Lightweight card for listing published collaborations/duels."""
    id: int
    task_id: int
    task_title: str
    task_faction_slug: Optional[str] = None
    submission_type: str
    collab_mode: Optional[str] = None
    collab_status: Optional[str] = None
    created_at: datetime
    members: list[SubmissionMemberCardOut] = []
