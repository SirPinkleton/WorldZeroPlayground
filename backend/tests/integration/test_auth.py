"""Integration tests for /auth endpoints."""
import pytest
from httpx import AsyncClient

from models.account import Account
from models.character import Character


@pytest.mark.asyncio
async def test_auth_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_no_character(client: AsyncClient, account: Account, auth_headers: dict):
    """Authenticated account with no character returns account_id + character=None."""
    resp = await client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["account_id"] == account.id
    assert data["character"] is None


@pytest.mark.asyncio
async def test_auth_me_with_character(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
):
    resp = await client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["account_id"] == account.id
    assert data["character"]["id"] == character.id
    assert data["character"]["username"] == character.username


@pytest.mark.asyncio
async def test_auth_logout(client: AsyncClient):
    resp = await client.post("/auth/logout")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_invalid_token(client: AsyncClient):
    resp = await client.get("/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert resp.status_code == 401
