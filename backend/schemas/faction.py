from pydantic import BaseModel, Field


class FactionOut(BaseModel):
    slug: str
    name: str
    description: str | None

    model_config = {"from_attributes": True}


class FactionUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=2000)
