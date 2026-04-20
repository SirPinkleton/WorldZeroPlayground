from typing import Optional

from pydantic import BaseModel

from schemas.character import CharacterOut


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CurrentUser(BaseModel):
    # account_id is the one deliberate exception to the "never expose account_id publicly" rule.
    # The /auth/me endpoint is authenticated — it returns the caller's own account_id only.
    # Authorization: SPEC-backend-architecture.md §4
    account_id: int
    character: Optional[CharacterOut] = None
    is_admin: bool = False
    # Eligibility flags computed server-side from existing character levels so the
    # frontend can hide controls it cannot use (per WORLD_ZERO_STYLE validation pattern).
    can_create_additional_character: bool = False
    can_start_as_albescent: bool = False
