from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    from_character_id: int
    to_character_id: int
    body: str
    read_at: Optional[datetime]
    created_at: datetime


class MessageCreate(BaseModel):
    to_character_id: int
    body: str = Field(..., min_length=1, max_length=2000)
