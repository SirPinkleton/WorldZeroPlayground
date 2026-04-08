from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ContactMessageIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1, max_length=254)
    message: str = Field(..., min_length=1, max_length=5000)


class ContactMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
