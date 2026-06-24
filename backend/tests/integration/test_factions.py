"""Integration tests for /factions endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.account import Account
from models.character import Character
from models.era import Era
from models.faction import Faction, FactionStatus


# ---------------------------------------------------------------------------
# List factions (public)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_factions_returns_visible(
    client: AsyncClient,
    faction_ua: Faction,
):
    """GET /factions returns only visible factions."""
    resp = await client.get("/factions")
    assert resp.status_code == 200
    data = resp.json()
    slugs = [f["slug"] for f in data]
    # "ua" is visible; seeded in faction_ua fixture
    assert "ua" in slugs
    # "na" is hidden; must not appear
    assert "na" not in slugs


@pytest.mark.asyncio
async def test_list_factions_structure(
    client: AsyncClient,
    faction_ua: Faction,
):
    """Each faction in the list has the expected fields."""
    resp = await client.get("/factions")
    assert resp.status_code == 200
    for faction in resp.json():
        assert "slug" in faction
        assert "name" in faction
        assert "description" in faction


# ---------------------------------------------------------------------------
# Faction status (authenticated — requires era seed)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_faction_status_authenticated(
    client: AsyncClient,
    character: Character,
    auth_headers: dict,
    faction_ua: Faction,
    era: Era,
):
    """GET /factions/status returns current faction and status map."""
    resp = await client.get("/factions/status", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "current_faction_slug" in data
    assert "all_factions" in data
    assert data["current_faction_slug"] == character.faction_slug


@pytest.mark.asyncio
async def test_faction_status_unauthenticated(client: AsyncClient):
    """GET /factions/status without auth returns 401."""
    resp = await client.get("/factions/status")
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Defection history
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_defection_history_empty(
    client: AsyncClient,
    character: Character,
    auth_headers: dict,
    era: Era,
):
    """A fresh character has no defection history."""
    resp = await client.get("/factions/defection-history", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


# ---------------------------------------------------------------------------
# Choose faction (defection)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_choose_faction_from_ua(
    client: AsyncClient,
    character: Character,
    auth_headers: dict,
    faction_ua: Faction,
    era: Era,
    db_session: AsyncSession,
):
    """Character can defect from UA to wow (a selectable faction in era config)."""
    from models.faction import Faction as FactionModel
    from sqlalchemy import select

    # Seed the wow faction in the DB (required for FK constraint)
    existing = await db_session.execute(select(FactionModel).where(FactionModel.slug == "wow"))
    if existing.scalar_one_or_none() is None:
        db_session.add(FactionModel(
            slug="wow",
            name="Warriors of Whimsy",
            description="Collective-minded",
            status=FactionStatus.visible,
        ))
        await db_session.commit()

    resp = await client.post(
        "/factions/choose",
        json={"faction_slug": "wow"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["slug"] == "wow"


@pytest.mark.asyncio
async def test_choose_nonexistent_faction(
    client: AsyncClient,
    character: Character,
    auth_headers: dict,
    era: Era,
):
    """Choosing a faction not in the era config returns 404."""
    resp = await client.post(
        "/factions/choose",
        json={"faction_slug": "does_not_exist"},
        headers=auth_headers,
    )
    assert resp.status_code == 404
