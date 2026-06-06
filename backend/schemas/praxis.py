from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from models.praxis import PraxisType, PraxisStatus, PraxisInviteStatus, MediaType, ModerationStatus


class MediaItemOut(BaseModel):
    id: int
    praxis_id: int
    type: MediaType
    file_path: str
    display_order: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PraxisMemberOut(BaseModel):
    id: int
    praxis_id: int
    character_id: int
    character_display_name: str  # populated by build_praxis_out
    has_submitted: bool
    joined_at: datetime

    model_config = {"from_attributes": True}


class PraxisInviteOut(BaseModel):
    id: int
    praxis_id: int
    inviter_id: int
    invitee_id: int
    inviter_display_name: str   # populated by build_praxis_out
    invitee_display_name: str   # populated by build_praxis_out
    status: PraxisInviteStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class DuelVoteSummary(BaseModel):
    member_id: int
    character_id: int
    character_display_name: str
    total_stars: int
    vote_count: int


class PraxisOut(BaseModel):
    id: int
    task_id: int
    task_title: str             # populated by build_praxis_out
    task_point_value: int       # populated by build_praxis_out
    task_faction_slug: Optional[str] = None  # populated by build_praxis_out; drives per-faction vote UI
    type: PraxisType
    status: PraxisStatus
    title: Optional[str]
    body_text: Optional[str]
    is_withdrawn: bool
    moderation_status: ModerationStatus
    admin_note: Optional[str]
    flagged_at: Optional[datetime]
    created_by_id: int
    created_by_display_name: str  # populated by build_praxis_out
    created_at: datetime
    updated_at: datetime
    members: List[PraxisMemberOut]
    invites: List[PraxisInviteOut]
    media_items: List[MediaItemOut]
    score: float                # populated by build_praxis_out
    duel_vote_summary: Optional[List[DuelVoteSummary]]  # only for duels
    can_flag: bool = False      # populated by build_praxis_out; viewer-relative

    model_config = {"from_attributes": True}


class PraxisCardOut(BaseModel):
    """Lightweight list-view schema."""
    id: int
    task_id: int
    task_title: str
    task_point_value: int
    type: PraxisType
    status: PraxisStatus
    title: Optional[str]
    is_withdrawn: bool
    moderation_status: ModerationStatus
    created_by_id: int
    created_by_display_name: str
    created_at: datetime
    updated_at: datetime
    member_count: int
    score: float
    task_faction_slug: Optional[str] = None

    model_config = {"from_attributes": True}


class PraxisCreate(BaseModel):
    task_id: int
    type: PraxisType = PraxisType.solo
    title: Optional[str] = None
    body_text: Optional[str] = None


class PraxisUpdate(BaseModel):
    title: Optional[str] = None
    body_text: Optional[str] = None


class PraxisInviteCreate(BaseModel):
    invitee_id: int


class PraxisVoteIn(BaseModel):
    stars: int
    praxis_member_id: Optional[int] = None  # required for duel votes
