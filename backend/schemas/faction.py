from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


FactionMembershipStatus = Literal[
    "member", "invited", "not_invited", "defected", "can_return"
]


class FactionOut(BaseModel):
    slug: str
    name: str
    description: str
    status: str

    model_config = {"from_attributes": True}


class FactionUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)


class FactionChoiceRequest(BaseModel):
    faction_slug: str = Field(min_length=1, max_length=50)


class FactionStatusOut(BaseModel):
    slug: str
    name: str
    status: FactionMembershipStatus


class FactionPageOut(BaseModel):
    current_faction_slug: str
    all_factions: list[FactionStatusOut]


class InvitationLetterOut(BaseModel):
    faction_slug: str
    faction_name: str
    delivered_at: datetime

    model_config = {"from_attributes": True}


class DefectionHistoryOut(BaseModel):
    faction_slug: str
    defected_at: datetime

    model_config = {"from_attributes": True}
