"""Shared FastAPI dependencies used across multiple routers."""
from typing import Optional

from fastapi import Cookie, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models.account import Account, AccountStatus
from models.character import Character, CharacterStatus
from models.roles import AccountRole, Role
from services.auth import decode_jwt, get_current_account

_OPTIONAL_BEARER = HTTPBearer(auto_error=False)


async def get_current_character(
    account: Account = Depends(get_current_account),
    session: AsyncSession = Depends(get_db),
) -> Character:
    """Return the first active character for the authenticated account.

    Raises 403 if the account has no active character yet.
    """
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
    if character is None:
        raise HTTPException(
            status_code=403,
            detail="No active character found. Create a character first.",
        )
    return character


async def get_current_character_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_OPTIONAL_BEARER),
    access_token: Optional[str] = Cookie(default=None),
    session: AsyncSession = Depends(get_db),
) -> Optional[Character]:
    """Mirror of :func:`get_current_character` that never raises.

    Used by public detail endpoints (praxis, task) that compute viewer-relative
    fields when a token is present but still serve anonymous traffic.
    """
    token = None
    if credentials:
        token = credentials.credentials
    elif access_token:
        token = access_token
    if not token:
        return None

    try:
        payload = decode_jwt(token)
    except Exception:
        return None

    try:
        account_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        return None

    account_result = await session.execute(
        select(Account).where(Account.id == account_id)
    )
    account = account_result.scalar_one_or_none()
    if account is None or account.status != AccountStatus.active:
        return None

    char_result = await session.execute(
        select(Character)
        .where(
            Character.account_id == account.id,
            Character.status == CharacterStatus.active,
        )
        .order_by(Character.created_at)
        .limit(1)
    )
    return char_result.scalar_one_or_none()


async def require_admin(
    account: Account = Depends(get_current_account),
    session: AsyncSession = Depends(get_db),
) -> Account:
    """Raise 403 unless the authenticated account has the 'admin' role."""
    if not await account_has_admin_role(account.id, session):
        raise HTTPException(status_code=403, detail="Admin access required.")
    return account


async def account_has_admin_role(account_id: int, session: AsyncSession) -> bool:
    """Return True if the given account has the 'admin' role.

    Use this when admin status is informational (e.g. a flag on a response or a
    behaviour modifier) rather than a hard access gate — for the gate, use
    :func:`require_admin`.
    """
    result = await session.execute(
        select(AccountRole)
        .join(Role, AccountRole.role_id == Role.id)
        .where(AccountRole.account_id == account_id, Role.name == "admin")
    )
    return result.scalar_one_or_none() is not None
