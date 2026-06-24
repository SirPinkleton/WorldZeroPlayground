"""Tests for the public /contact endpoint."""
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.contact import ContactMessage


@pytest.mark.asyncio
async def test_submit_contact_persists_message(
    client: AsyncClient, db_session: AsyncSession
):
    """POST /contact stores the message and returns its id + timestamp."""
    resp = await client.post(
        "/contact",
        json={"name": "Ada", "email": "ada@example.com", "message": "Hello there"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] > 0
    assert "created_at" in data

    row = (
        await db_session.execute(
            select(ContactMessage).where(ContactMessage.id == data["id"])
        )
    ).scalar_one()
    assert row.name == "Ada"
    assert row.email == "ada@example.com"
    assert row.message == "Hello there"


@pytest.mark.asyncio
async def test_submit_contact_rejects_blank_fields(client: AsyncClient):
    """Empty required fields fail schema validation with 422."""
    resp = await client.post(
        "/contact",
        json={"name": "", "email": "", "message": ""},
    )
    assert resp.status_code == 422
