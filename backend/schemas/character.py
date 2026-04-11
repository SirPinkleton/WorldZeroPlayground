from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CharacterOut(BaseModel):
    """Public character response. Stats (score, level, all_time_score) come from CharacterStats."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    display_name: str
    bio: str
    avatar_url: str
    location: str
    level: int
    score: int
    all_time_score: int
    faction_slug: str
    status: str
    created_at: datetime


class CharacterCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    display_name: str = Field(..., max_length=50)
    bio: str = Field(default="", max_length=500)
    avatar_url: str = Field(default="", max_length=500)
    location: str = Field(default="", max_length=100)


class CharacterUpdate(BaseModel):
    display_name: str | None = Field(None, max_length=50)
    bio: str | None = Field(None, max_length=500)
    avatar_url: str | None = Field(None, max_length=500)
    location: str | None = Field(None, max_length=100)
