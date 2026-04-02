"""Shared FastAPI dependencies used across multiple routers."""
from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from models.account import Account
from models.character import Character
from models.roles import AccountRole, Role
from services.auth import get_current_account


async def get_current_character(
    account: Account = Depends(get_current_account),
    session: AsyncSession = Depends(get_db),
) -> Character:
    """Return the first active character for the authenticated account.

    Raises 403 if the account has no active character yet.
    """
    result = await session.execute(
        select(Character)
        .where(Character.account_id == account.id, Character.is_active == True)
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


async def require_admin(
    account: Account = Depends(get_current_account),
    session: AsyncSession = Depends(get_db),
) -> Account:
    """Raise 403 unless the authenticated account has the 'admin' role."""
    result = await session.execute(
        select(AccountRole)
        .join(Role, AccountRole.role_id == Role.id)
        .where(AccountRole.account_id == account.id, Role.name == "admin")
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return account
