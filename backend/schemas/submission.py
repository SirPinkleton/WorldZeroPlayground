from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MediaItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    file_path: str
    display_order: int


class SubmissionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    character_id: int
    title: str
    body_text: Optional[str]
    is_flagged: bool
    created_at: datetime
    updated_at: datetime
    media: list[MediaItemOut] = []
    score: Optional[float] = None


class SubmissionCreate(BaseModel):
    task_id: int
    title: str
    body_text: Optional[str] = None
