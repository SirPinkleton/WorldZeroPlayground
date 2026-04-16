"""Integration tests for /relationships endpoints."""
import pytest
from httpx import AsyncClient

from models.character import Character


# ---------------------------------------------------------------------------
# Create relationship
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_friend_relationship(
    client: AsyncClient,
    character: Character,
    character2: Character,
    auth_headers: dict,
):
    """character can declare character2 as a friend."""
    resp = await client.post(
        "/relationships",
        json={"to_character_id": character2.id, "type": "friend"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["from_character_id"] == character.id
    assert data["to_character_id"] == character2.id
    assert data["type"] == "friend"
    assert data["status"] == "active"


@pytest.mark.asyncio
async def test_create_foe_relationship(
    client: AsyncClient,
    character: Character,
    character2: Character,
    auth_headers: dict,
):
    """character can declare character2 as a foe."""
    resp = await client.post(
        "/relationships",
        json={"to_character_id": character2.id, "type": "foe"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["type"] == "foe"


@pytest.mark.asyncio
async def test_create_relationship_unauthenticated(
    client: AsyncClient,
    character2: Character,
):
    """Unauthenticated requests return 401."""
    resp = await client.post(
        "/relationships",
        json={"to_character_id": character2.id, "type": "friend"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_duplicate_relationship_rejected(
    client: AsyncClient,
    character: Character,
    character2: Character,
    auth_headers: dict,
):
    """Creating the same relationship twice returns a 409 conflict."""
    await client.post(
        "/relationships",
        json={"to_character_id": character2.id, "type": "friend"},
        headers=auth_headers,
    )
    resp = await client.post(
        "/relationships",
        json={"to_character_id": character2.id, "type": "friend"},
        headers=auth_headers,
    )
    assert resp.status_code == 409


# ---------------------------------------------------------------------------
# List relationships
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_relationships_empty(
    client: AsyncClient,
    character: Character,
    auth_headers: dict,
):
    """A new character has no relationships."""
    resp = await client.get("/relationships", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_relationships_includes_created(
    client: AsyncClient,
    character: Character,
    character2: Character,
    auth_headers: dict,
):
    """Created relationship appears in the list."""
    await client.post(
        "/relationships",
        json={"to_character_id": character2.id, "type": "friend"},
        headers=auth_headers,
    )

    resp = await client.get("/relationships", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    target_ids = [r["to_character_id"] for r in data]
    assert character2.id in target_ids


@pytest.mark.asyncio
async def test_list_relationships_unauthenticated(client: AsyncClient):
    """GET /relationships without auth returns 401."""
    resp = await client.get("/relationships")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Block relationship
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_block_relationship(
    client: AsyncClient,
    character: Character,
    character2: Character,
    auth_headers: dict,
):
    """A relationship can be blocked."""
    create_resp = await client.post(
        "/relationships",
        json={"to_character_id": character2.id, "type": "friend"},
        headers=auth_headers,
    )
    relationship_id = create_resp.json()["id"]

    block_resp = await client.put(
        f"/relationships/{relationship_id}",
        headers=auth_headers,
    )
    assert block_resp.status_code == 200
    assert block_resp.json()["status"] == "blocked"


# ---------------------------------------------------------------------------
# Delete relationship
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_delete_relationship(
    client: AsyncClient,
    character: Character,
    character2: Character,
    auth_headers: dict,
):
    """The declaring character can delete their own relationship."""
    create_resp = await client.post(
        "/relationships",
        json={"to_character_id": character2.id, "type": "foe"},
        headers=auth_headers,
    )
    relationship_id = create_resp.json()["id"]

    del_resp = await client.delete(
        f"/relationships/{relationship_id}", headers=auth_headers
    )
    assert del_resp.status_code == 204


@pytest.mark.asyncio
async def test_delete_relationship_wrong_owner(
    client: AsyncClient,
    character: Character,
    character2: Character,
    auth_headers: dict,
    auth_headers2: dict,
):
    """Only the declaring party can delete the relationship; others get 403."""
    create_resp = await client.post(
        "/relationships",
        json={"to_character_id": character2.id, "type": "friend"},
        headers=auth_headers,
    )
    relationship_id = create_resp.json()["id"]

    # character2 tries to delete character's relationship declaration
    del_resp = await client.delete(
        f"/relationships/{relationship_id}", headers=auth_headers2
    )
    assert del_resp.status_code == 403
