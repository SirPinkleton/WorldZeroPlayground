from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Depends, Response
from fastapi import Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db import get_db
from models.account import Account
from models.character import Character, CharacterStatus
from routers.characters import _build_character_out, _load_stats
from schemas.auth import CurrentUser
from schemas.character import CharacterOut
from services.auth import create_jwt, create_or_get_account, get_current_account
from services.era import get_current_era_row

router = APIRouter()

_ENV_PRODUCTION = "production"

_OAUTH = OAuth()
_OAUTH.register(
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
    return await _OAUTH.google.authorize_redirect(request, settings.GOOGLE_REDIRECT_URI)


@router.get("/google/callback")
async def auth_google_callback(
    request: Request,
    session: AsyncSession = Depends(get_db),
):
    """Exchange the OAuth code for a token, create/get the Account, set JWT cookie."""
    token = await _OAUTH.google.authorize_access_token(request)
    user_info = token.get("userinfo") or await _OAUTH.google.userinfo(token=token)

    account = await create_or_get_account(
        provider="google",
        provider_user_id=user_info["sub"],
        email=user_info["email"],
        access_token=token.get("access_token", ""),
        session=session,
    )

    jwt_token = create_jwt(account.id)
    response = Response(status_code=302, headers={"location": settings.FRONTEND_URL})
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        samesite="lax",
        secure=settings.ENVIRONMENT == _ENV_PRODUCTION,
        max_age=_COOKIE_MAX_AGE,
        domain=settings.COOKIE_DOMAIN,
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
        .where(
            Character.account_id == account.id,
            Character.status == CharacterStatus.active,
        )
        .order_by(Character.created_at)
        .limit(1)
    )
    character = result.scalar_one_or_none()

    char_out = None
    if character:
        try:
            era_row = await get_current_era_row(session)
            stats = await _load_stats(character.id, era_row.id, session)
        except Exception:
            stats = None
        char_out = _build_character_out(character, stats)

    return CurrentUser(account_id=account.id, character=char_out)


@router.post("/logout")
async def auth_logout(response: Response):
    """Clear the JWT cookie."""
    response.delete_cookie("access_token")
    return {"message": "Logged out"}


@router.post("/dev-login")
async def dev_login(
    response: Response,
    session: AsyncSession = Depends(get_db),
):
    """Dev-only: create/get a test account and set a JWT cookie. Disabled in production."""
    if settings.ENVIRONMENT == _ENV_PRODUCTION:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not found.")

    account = await create_or_get_account(
        provider="dev",
        provider_user_id="dev-user-1",
        email="dev@localhost",
        access_token="",
        session=session,
    )

    jwt_token = create_jwt(account.id)
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=_COOKIE_MAX_AGE,
    )
    return {"message": "Dev login successful"}
