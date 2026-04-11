from pydantic import BaseModel, Field


class FactionOut(BaseModel):
    slug: str
    name: str
    description: str
    status: str

    model_config = {"from_attributes": True}


class FactionUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=2000)
