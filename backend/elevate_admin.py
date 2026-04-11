"""
Elevate a character's account to admin role.

Finds the account linked to the given character username, ensures the
'admin' Role row exists, then creates an AccountRole entry.
Safe to run more than once — skips if already an admin.

Usage:
    python elevate_admin.py pixie                # dev (default)
    python elevate_admin.py pixie --env prod     # production
    python elevate_admin.py --env prod           # defaults username to 'pixie'
"""

import argparse
import asyncio
import sys

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from models.character import Character
from models.roles import AccountRole, Role
from script_utils import add_env_argument, get_settings


async def run(username: str, env: str) -> None:
    settings = get_settings(env)
    print(f"Environment : {env}")
    print(f"Database    : {settings.DATABASE_URL.split('@')[-1]}\n")  # host/db only, no creds
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:

        # 1. Find the character
        char_result = await session.execute(
            select(Character).where(Character.username == username)
        )
        character = char_result.scalar_one_or_none()
        if not character:
            print(f"ERROR: No character found with username '{username}'")
            await engine.dispose()
            sys.exit(1)

        account_id = character.account_id
        print(f"Found character '{username}' → account_id={account_id}")

        # 2. Find or create the 'admin' role
        role_result = await session.execute(
            select(Role).where(Role.name == "admin")
        )
        admin_role = role_result.scalar_one_or_none()
        if not admin_role:
            print("'admin' role not found — creating it")
            admin_role = Role(name="admin", description="Full administrative access")
            session.add(admin_role)
            await session.flush()
        else:
            print(f"Found 'admin' role (id={admin_role.id})")

        # 3. Check if already an admin
        existing = await session.execute(
            select(AccountRole).where(
                AccountRole.account_id == account_id,
                AccountRole.role_id == admin_role.id,
            )
        )
        if existing.scalar_one_or_none():
            print(f"Account {account_id} is already an admin. Nothing to do.")
            await engine.dispose()
            return

        # 4. Grant admin — self-granted bootstrap (granted_by = own account_id)
        account_role = AccountRole(
            account_id=account_id,
            role_id=admin_role.id,
            granted_by=account_id,
        )
        session.add(account_role)
        await session.commit()

        print(f"\n✓ Account {account_id} (character: '{username}') is now an admin.")

    await engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser(description="Elevate a character's account to admin.")
    parser.add_argument("username", nargs="?", default="pixie", help="Character username (default: pixie)")
    add_env_argument(parser)
    args = parser.parse_args()
    asyncio.run(run(args.username, args.env))


if __name__ == "__main__":
    main()
