"""Integration test fixtures.

Requires a running PostgreSQL instance. Set TEST_DATABASE_URL in the environment
(defaults to replacing the dev DB name with worldzero_test).

Usage:
    TEST_DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/worldzero_test \
    pytest backend/tests/integration/ -v
"""
import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from config import settings
from db import get_db
from main import app
import models  # noqa: F401 — registers all models on Base.metadata for create_all
from models.account import Account, OAuthProvider
from models.base import Base
from models.character import Character
from models.character_stats import CharacterStats
from models.era import Era
from models.faction import Faction
from models.praxis import Praxis
from models.task import CharacterTask, CharacterTaskStatus, Task
from models.vote import Vote
from services.auth import create_jwt

# ---------------------------------------------------------------------------
# Test database URL — replace DB name so we never touch the dev database
# ---------------------------------------------------------------------------
_TEST_DB_URL = os.environ.get(
    "TEST_DATABASE_URL",
    settings.DATABASE_URL.replace("/worldzero", "/worldzero_test"),
)


@pytest_asyncio.fixture(scope="session")
async def test_engine():
    engine = create_async_engine(_TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine):
    """Provide a test DB session that rolls back after each test."""
    session_factory = async_sessionmaker(test_engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    """Provide an AsyncClient with the get_db dependency overridden."""

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Seed fixtures
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def account(db_session: AsyncSession) -> Account:
    acc = Account(email="test@example.com")
    db_session.add(acc)
    await db_session.commit()
    await db_session.refresh(acc)
    return acc


@pytest_asyncio.fixture
async def account2(db_session: AsyncSession) -> Account:
    acc = Account(email="other@example.com")
    db_session.add(acc)
    await db_session.commit()
    await db_session.refresh(acc)
    return acc


@pytest_asyncio.fixture
async def era(db_session: AsyncSession, account: Account) -> Era:
    """Seed the current Era 1 row required for CharacterStats FK."""
    from game_config import CURRENT_ERA
    e = Era(
        name=CURRENT_ERA.name,
        config_key=CURRENT_ERA.config_key,
        started_by=account.id,
    )
    db_session.add(e)
    await db_session.commit()
    await db_session.refresh(e)
    return e


@pytest_asyncio.fixture
async def faction_ua(db_session: AsyncSession) -> Faction:
    """Seed the 'ua' and 'na' factions required for FK constraints."""
    from models.faction import FactionStatus
    from sqlalchemy import select

    factions_to_seed = [
        Faction(slug="ua", name="UA", description="Default starting faction", status=FactionStatus.visible),
        Faction(slug="na", name="None", description="Sentinel for no faction affiliation", status=FactionStatus.hidden),
    ]
    for faction in factions_to_seed:
        result = await db_session.execute(select(Faction).where(Faction.slug == faction.slug))
        if result.scalar_one_or_none() is None:
            db_session.add(faction)
    await db_session.commit()

    result = await db_session.execute(select(Faction).where(Faction.slug == "ua"))
    return result.scalar_one()


@pytest_asyncio.fixture
async def character(db_session: AsyncSession, account: Account, era: Era, faction_ua: Faction) -> Character:
    ch = Character(
        account_id=account.id,
        username="testcharacter",
        display_name="Test Character",
        faction_slug="ua",
    )
    db_session.add(ch)
    await db_session.flush()

    stats = CharacterStats(
        character_id=ch.id,
        era_id=era.id,
        score=0,
        all_time_score=0,
        level=0,
        votes_available=10,
    )
    db_session.add(stats)
    await db_session.commit()
    await db_session.refresh(ch)
    await db_session.refresh(stats)
    return ch


@pytest_asyncio.fixture
async def character2(db_session: AsyncSession, account2: Account, era: Era, faction_ua: Faction) -> Character:
    ch = Character(
        account_id=account2.id,
        username="othercharacter",
        display_name="Other Character",
        faction_slug="ua",
    )
    db_session.add(ch)
    await db_session.flush()

    stats = CharacterStats(
        character_id=ch.id,
        era_id=era.id,
        score=500,
        all_time_score=500,
        level=5,
        votes_available=10,
    )
    db_session.add(stats)
    await db_session.commit()
    await db_session.refresh(ch)
    await db_session.refresh(stats)
    return ch


@pytest_asyncio.fixture
async def auth_headers(account: Account) -> dict:
    token = create_jwt(account.id)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def auth_headers2(account2: Account) -> dict:
    token = create_jwt(account2.id)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def active_task(db_session: AsyncSession, character: Character) -> Task:
    from models.task import TaskStatus
    task = Task(
        title="Test Task",
        description="A test task",
        point_value=10,
        level_required=0,
        status=TaskStatus.active,
        created_by=character.id,
        primary_faction_slug="na",
    )
    db_session.add(task)
    await db_session.commit()
    await db_session.refresh(task)
    return task


@pytest_asyncio.fixture
async def signed_up_task(
    db_session: AsyncSession, character: Character, active_task: Task
) -> Task:
    """An active task with character already signed up."""
    ct = CharacterTask(
        character_id=character.id,
        task_id=active_task.id,
        status=CharacterTaskStatus.in_progress,
    )
    db_session.add(ct)
    await db_session.commit()
    return active_task


@pytest_asyncio.fixture
async def signed_up_task2(
    db_session: AsyncSession, character2: Character, active_task: Task
) -> Task:
    """An active task with character2 already signed up."""
    ct = CharacterTask(
        character_id=character2.id,
        task_id=active_task.id,
        status=CharacterTaskStatus.in_progress,
    )
    db_session.add(ct)
    await db_session.commit()
    return active_task
