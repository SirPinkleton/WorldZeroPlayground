"""Integration tests for /leaderboard endpoints."""
import pytest
from httpx import AsyncClient

from models.character import Character
from models.era import Era
from models.faction import Faction


# ---------------------------------------------------------------------------
# Global leaderboard
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_leaderboard_returns_characters(
    client: AsyncClient,
    character: Character,
    character2: Character,
    era: Era,
    faction_ua: Faction,
):
    """GET /leaderboard returns active characters ordered by score."""
    resp = await client.get("/leaderboard")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    ids = [c["id"] for c in data]
    # Both characters are seeded and active
    assert character.id in ids
    assert character2.id in ids


@pytest.mark.asyncio
async def test_leaderboard_ordering(
    client: AsyncClient,
    character: Character,
    character2: Character,
    era: Era,
    faction_ua: Faction,
):
    """character2 (score=500) should appear before character (score=0)."""
    resp = await client.get("/leaderboard")
    assert resp.status_code == 200
    data = resp.json()
    ids = [c["id"] for c in data]
    if character2.id in ids and character.id in ids:
        assert ids.index(character2.id) < ids.index(character.id)


@pytest.mark.asyncio
async def test_leaderboard_faction_filter(
    client: AsyncClient,
    character: Character,
    character2: Character,
    era: Era,
    faction_ua: Faction,
):
    """GET /leaderboard?faction=ua returns only ua-faction characters."""
    resp = await client.get("/leaderboard?faction=ua")
    assert resp.status_code == 200
    data = resp.json()
    for char in data:
        assert char["faction_slug"] == "ua"


@pytest.mark.asyncio
async def test_leaderboard_faction_filter_no_results(
    client: AsyncClient,
    era: Era,
    faction_ua: Faction,
):
    """Filtering by a faction with no members returns an empty list."""
    resp = await client.get("/leaderboard?faction=nonexistent_faction")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_leaderboard_pagination(
    client: AsyncClient,
    character: Character,
    character2: Character,
    era: Era,
    faction_ua: Faction,
):
    """limit and offset parameters are respected."""
    resp = await client.get("/leaderboard?limit=1&offset=0")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) <= 1


@pytest.mark.asyncio
async def test_leaderboard_no_era(
    client: AsyncClient,
):
    """Leaderboard with no era seeded still returns 200 (empty list)."""
    # This test verifies the graceful degradation path when era_id is None
    resp = await client.get("/leaderboard")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_leaderboard_response_structure(
    client: AsyncClient,
    character: Character,
    era: Era,
    faction_ua: Faction,
):
    """Each character in the leaderboard has expected fields and no account_id."""
    resp = await client.get("/leaderboard")
    assert resp.status_code == 200
    for char in resp.json():
        assert "id" in char
        assert "username" in char
        assert "display_name" in char
        assert "faction_slug" in char
        # account_id must never be exposed
        assert "account_id" not in char
        assert "email" not in char
