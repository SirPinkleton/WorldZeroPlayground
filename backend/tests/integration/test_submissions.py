"""Integration tests for /praxes endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.character import Character
from models.character_stats import CharacterStats
from models.era import Era
from models.task import Task


@pytest.mark.asyncio
async def test_list_praxes_public(client: AsyncClient):
    resp = await client.get("/praxes")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_create_praxis(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "My Praxis", "body_text": "I did the thing."},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["task_id"] == signed_up_task.id
    assert data["character_id"] == character.id
    assert data["title"] == "My Praxis"
    assert data["moderation_status"] == "visible"
    assert data["media"] == []


@pytest.mark.asyncio
async def test_create_praxis_requires_signup(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    """Creating a praxis without signing up first returns 403."""
    resp = await client.post(
        "/praxes",
        json={"task_id": active_task.id, "title": "No signup"},
        headers=auth_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_praxis_updates_stats(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
    era: Era,
):
    """Submitting a praxis awards base points and updates the character's stats."""
    # Verify score starts at 0
    result = await db_session.execute(
        select(CharacterStats).where(
            CharacterStats.character_id == character.id,
            CharacterStats.era_id == era.id,
        )
    )
    stats = result.scalar_one()
    assert stats.score == 0

    resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Score test"},
        headers=auth_headers,
    )
    assert resp.status_code == 201

    # Refresh stats from DB — score should now include base task points
    await db_session.refresh(stats)
    assert stats.score > 0
    assert stats.score >= signed_up_task.point_value


@pytest.mark.asyncio
async def test_get_praxis(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Test Praxis"},
        headers=auth_headers,
    )
    praxis_id = create_resp.json()["id"]
    resp = await client.get(f"/praxes/{praxis_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == praxis_id


@pytest.mark.asyncio
async def test_edit_praxis(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Original Title"},
        headers=auth_headers,
    )
    praxis_id = create_resp.json()["id"]
    resp = await client.put(
        f"/praxes/{praxis_id}",
        json={"task_id": signed_up_task.id, "title": "Updated Title"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Title"


@pytest.mark.asyncio
async def test_edit_praxis_wrong_owner(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "My Praxis"},
        headers=auth_headers,
    )
    praxis_id = create_resp.json()["id"]
    resp = await client.put(
        f"/praxes/{praxis_id}",
        json={"task_id": signed_up_task.id, "title": "Hacked"},
        headers=auth_headers2,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_flag_praxis_level_gate(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
    character2: Character,
):
    """character2 (level 5) can flag; character (level 0) cannot."""
    create_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Flaggable Praxis"},
        headers=auth_headers,
    )
    praxis_id = create_resp.json()["id"]

    # character (level 0) tries to flag — should fail
    resp_low = await client.post(
        f"/praxes/{praxis_id}/flag",
        params={"reason": "spam"},
        headers=auth_headers,
    )
    assert resp_low.status_code == 403

    # character2 (level 5) flags — should succeed
    resp_high = await client.post(
        f"/praxes/{praxis_id}/flag",
        params={"reason": "spam"},
        headers=auth_headers2,
    )
    assert resp_high.status_code == 200
    assert resp_high.json()["moderation_status"] == "flagged"
