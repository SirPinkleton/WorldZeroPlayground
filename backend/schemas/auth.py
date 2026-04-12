from typing import Optional

from pydantic import BaseModel

from schemas.character import CharacterOut


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUser(BaseModel):
    account_id: int
    character: Optional[CharacterOut] = None
    is_admin: bool = False
