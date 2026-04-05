from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CharacterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    display_name: str
    bio: Optional[str]
    avatar_url: Optional[str]
    location: Optional[str]
    level: int
    score: int
    all_time_score: int
    faction_slug: Optional[str]
    created_at: datetime


class CharacterCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    display_name: str = Field(..., max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=100)


class CharacterUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=100)
