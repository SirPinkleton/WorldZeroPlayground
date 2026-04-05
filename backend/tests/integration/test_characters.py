"""Integration tests for /characters endpoints."""
import pytest
from httpx import AsyncClient

from models.account import Account
from models.character import Character


@pytest.mark.asyncio
async def test_list_characters_public(client: AsyncClient, character: Character):
    resp = await client.get("/characters")
    assert resp.status_code == 200
    data = resp.json()
    ids = [c["id"] for c in data]
    assert character.id in ids


@pytest.mark.asyncio
async def test_get_character(client: AsyncClient, character: Character):
    resp = await client.get(f"/characters/{character.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == character.id
    assert data["username"] == character.username
    # account_id must never be exposed
    assert "account_id" not in data
    assert "email" not in data


@pytest.mark.asyncio
async def test_get_character_not_found(client: AsyncClient):
    resp = await client.get("/characters/99999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_character(client: AsyncClient, account: Account, auth_headers: dict):
    resp = await client.post(
        "/characters",
        json={"username": "newchar", "display_name": "New Character"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "newchar"
    assert data["faction_slug"] == "ua"
    assert "account_id" not in data


@pytest.mark.asyncio
async def test_create_character_unauthenticated(client: AsyncClient):
    resp = await client.post(
        "/characters",
        json={"username": "newchar2", "display_name": "Another"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_update_character(
    client: AsyncClient, character: Character, auth_headers: dict
):
    resp = await client.put(
        f"/characters/{character.id}",
        json={"display_name": "Updated Name"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["display_name"] == "Updated Name"


@pytest.mark.asyncio
async def test_update_character_wrong_owner(
    client: AsyncClient,
    character: Character,
    character2: Character,
    auth_headers2: dict,
):
    """Character owned by account2 cannot edit character owned by account1."""
    resp = await client.put(
        f"/characters/{character.id}",
        json={"display_name": "Hacked"},
        headers=auth_headers2,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_delete_character(
    client: AsyncClient, character: Character, auth_headers: dict
):
    resp = await client.delete(f"/characters/{character.id}", headers=auth_headers)
    assert resp.status_code == 204

    # Should not be visible after deletion
    get_resp = await client.get(f"/characters/{character.id}")
    assert get_resp.status_code == 404
