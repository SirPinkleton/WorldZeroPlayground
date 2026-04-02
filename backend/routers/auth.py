from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Depends, Response
from fastapi import Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db import get_db
from models.account import Account
from models.character import Character
from schemas.auth import CurrentUser
from schemas.character import CharacterOut
from services.auth import create_jwt, create_or_get_account, get_current_account

router = APIRouter()

_oauth = OAuth()
_oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

_COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days in seconds


@router.get("/google")
async def auth_google(request: Request):
    """Redirect the browser to Google's OAuth consent screen."""
    return await _oauth.google.authorize_redirect(request, settings.GOOGLE_REDIRECT_URI)


@router.get("/google/callback")
async def auth_google_callback(
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    """Exchange the OAuth code for a token, create/get the Account, set JWT cookie."""
    token = await _oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo") or await _oauth.google.userinfo(token=token)

    account = await create_or_get_account(
        provider="google",
        provider_user_id=user_info["sub"],
        email=user_info["email"],
        access_token=token.get("access_token", ""),
        session=session,
    )

    jwt_token = create_jwt(account.id)
    response = Response(status_code=302, headers={"location": "/"})
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == "production",
        max_age=_COOKIE_MAX_AGE,
    )
    return response


@router.get("/me", response_model=CurrentUser)
async def auth_me(
    account: Account = Depends(get_current_account),
    session: AsyncSession = Depends(get_db),
):
    """Return the current account and its first active character."""
    result = await session.execute(
        select(Character)
        .where(Character.account_id == account.id, Character.is_active == True)
        .order_by(Character.created_at)
        .limit(1)
    )
    character = result.scalar_one_or_none()
    return CurrentUser(
        account_id=account.id,
        character=CharacterOut.model_validate(character) if character else None,
    )


@router.post("/logout")
async def auth_logout(response: Response):
    """Clear the JWT cookie."""
    response.delete_cookie("access_token")
    return {"message": "Logged out"}
