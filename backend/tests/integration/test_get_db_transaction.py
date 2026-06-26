"""Regression tests for the transactional contract of ``get_db``.

Services no longer own commit; the router dependency does. These tests
exercise the dependency directly to verify:

* On successful handler return, pending writes are committed.
* On exception during the handler, pending writes are rolled back so no
  partial state reaches the database.

The tests use the *real* production ``get_db`` (not the test override),
against the test database. Each test wraps its work in a session it owns
and cleans up after itself so no cross-test pollution is possible.
"""
from __future__ import annotations

import uuid

import pytest
import pytest_asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

import db as db_module
from models.contact import ContactMessage
from tests.integration.conftest import _TEST_DB_URL


@pytest_asyncio.fixture
async def real_engine_bound(test_engine, monkeypatch):
    """Point ``get_db`` at the test database for the duration of one test.

    Requires ``test_engine`` (session-scoped) so the schema exists. We swap
    ``db.AsyncSessionLocal`` with a sessionmaker bound to a freshly created
    engine against ``worldzero_test``. Uses NullPool so asyncpg connections
    are closed on session exit.
    """
    engine = create_async_engine(_TEST_DB_URL, echo=False, poolclass=NullPool)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    monkeypatch.setattr(db_module, "AsyncSessionLocal", session_factory)
    yield session_factory
    await engine.dispose()


@pytest.mark.asyncio
async def test_get_db_commits_on_success(real_engine_bound):
    """A write inside ``get_db`` is visible after the generator exits cleanly."""
    unique_name = f"rollback-test-{uuid.uuid4()}"

    # Drive the ``get_db`` generator end-to-end: yield, write, close cleanly.
    gen = db_module.get_db()
    session = await gen.__anext__()
    session.add(
        ContactMessage(
            name=unique_name,
            email="commit@example.com",
            message="should persist",
        )
    )
    with pytest.raises(StopAsyncIteration):
        await gen.__anext__()

    # Open a NEW session to confirm the row persisted across sessions.
    new_session = real_engine_bound()
    try:
        result = await new_session.execute(
            select(ContactMessage).where(ContactMessage.name == unique_name)
        )
        row = result.scalar_one_or_none()
        assert row is not None, "Expected commit to persist the row"
        # Clean up so we don't leak state into other tests.
        await new_session.delete(row)
        await new_session.commit()
    finally:
        await new_session.close()


@pytest.mark.asyncio
async def test_get_db_rolls_back_on_exception(real_engine_bound):
    """A write followed by an exception inside ``get_db`` must not persist."""
    unique_name = f"rollback-test-{uuid.uuid4()}"

    # Drive the generator: yield, write, then throw -> rollback path.
    gen = db_module.get_db()
    session = await gen.__anext__()
    session.add(
        ContactMessage(
            name=unique_name,
            email="rollback@example.com",
            message="should NOT persist",
        )
    )
    # Flush the INSERT to the DB so we can distinguish 'never written'
    # from 'written-but-rolled-back'. The rollback must still discard it.
    await session.flush()

    with pytest.raises(RuntimeError, match="boom"):
        await gen.athrow(RuntimeError("boom"))

    # In a brand new session, the row should NOT be there.
    new_session = real_engine_bound()
    try:
        result = await new_session.execute(
            select(ContactMessage).where(ContactMessage.name == unique_name)
        )
        row = result.scalar_one_or_none()
        assert row is None, "Rollback should have discarded the pending insert"
    finally:
        await new_session.close()
