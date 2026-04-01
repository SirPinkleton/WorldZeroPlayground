import enum
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RelationshipTypeEnum(str, enum.Enum):
    friend = "friend"
    foe = "foe"


class RelationshipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    from_character_id: int
    to_character_id: int
    type: str
    status: str
    created_at: datetime


class RelationshipCreate(BaseModel):
    to_character_id: int
    type: RelationshipTypeEnum
