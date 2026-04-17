"""Integration tests for /collaborations endpoints."""
import pytest

pytestmark = pytest.mark.skip(reason="collaboration layer being gutted — re-enable after migration")
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.character import Character
from models.era import Era
from models.faction import Faction
from models.task import Task


# ---------------------------------------------------------------------------
# Helper fixture: a signed-up task for character2 (level 5)
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def signed_up_task_for_char2(
    db_session: AsyncSession,
    character2: Character,
    active_task: Task,
) -> Task:
    """character2 signed up for active_task (needed to create a collaboration)."""
    from models.task import CharacterTask, CharacterTaskStatus

    ct = CharacterTask(
        character_id=character2.id,
        task_id=active_task.id,
        status=CharacterTaskStatus.in_progress,
    )
    db_session.add(ct)
    await db_session.commit()
    return active_task


# ---------------------------------------------------------------------------
# List collaborations (public)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_collaborations_public(
    client: AsyncClient,
    era: Era,
    faction_ua: Faction,
):
    """GET /collaborations returns a list (may be empty) without auth."""
    resp = await client.get("/collaborations")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


# ---------------------------------------------------------------------------
# Create collaboration
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_collaboration_requires_level(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    era: Era,
):
    """character (level 0) cannot create a collaboration (requires level 1)."""
    resp = await client.post(
        "/collaborations",
        json={"task_id": signed_up_task.id, "mode": "collaboration"},
        headers=auth_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_collaboration_success(
    client: AsyncClient,
    character2: Character,
    signed_up_task_for_char2: Task,
    auth_headers2: dict,
    era: Era,
):
    """character2 (level 5) can create a collaboration."""
    resp = await client.post(
        "/collaborations",
        json={"task_id": signed_up_task_for_char2.id, "mode": "collaboration"},
        headers=auth_headers2,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "collaboration"
    assert data["status"] == "in_progress"
    assert data["task_id"] == signed_up_task_for_char2.id
    # Creator is automatically the first member
    member_ids = [m["character_id"] for m in data["members"]]
    assert character2.id in member_ids


@pytest.mark.asyncio
async def test_create_collaboration_unauthenticated(
    client: AsyncClient,
    active_task: Task,
):
    """Creating a collaboration without auth returns 401."""
    resp = await client.post(
        "/collaborations",
        json={"task_id": active_task.id, "mode": "collaboration"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_create_collaboration_not_signed_up(
    client: AsyncClient,
    character2: Character,
    active_task: Task,
    auth_headers2: dict,
    era: Era,
):
    """Cannot create a collaboration for a task not in-progress for character."""
    resp = await client.post(
        "/collaborations",
        json={"task_id": active_task.id, "mode": "collaboration"},
        headers=auth_headers2,
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# Get collaboration
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_collaboration(
    client: AsyncClient,
    character2: Character,
    signed_up_task_for_char2: Task,
    auth_headers2: dict,
    era: Era,
):
    """GET /collaborations/{id} returns collaboration details."""
    create_resp = await client.post(
        "/collaborations",
        json={"task_id": signed_up_task_for_char2.id, "mode": "collaboration"},
        headers=auth_headers2,
    )
    collab_id = create_resp.json()["id"]

    resp = await client.get(f"/collaborations/{collab_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == collab_id


@pytest.mark.asyncio
async def test_get_collaboration_not_found(client: AsyncClient):
    """GET /collaborations/99999 returns 404."""
    resp = await client.get("/collaborations/99999")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Invite member
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_invite_member(
    client: AsyncClient,
    character: Character,
    character2: Character,
    signed_up_task: Task,
    signed_up_task_for_char2: Task,
    auth_headers: dict,
    auth_headers2: dict,
    era: Era,
    db_session: AsyncSession,
):
    """Collaboration creator can invite another character."""
    # Boost character's level to allow collaborations
    from sqlalchemy import select
    from models.character_stats import CharacterStats

    result = await db_session.execute(
        select(CharacterStats).where(CharacterStats.character_id == character2.id)
    )
    stats = result.scalar_one()
    stats.level = 3
    await db_session.commit()

    create_resp = await client.post(
        "/collaborations",
        json={"task_id": signed_up_task_for_char2.id, "mode": "collaboration"},
        headers=auth_headers2,
    )
    assert create_resp.status_code == 200
    collab_id = create_resp.json()["id"]

    invite_resp = await client.post(
        f"/collaborations/{collab_id}/invite",
        json={"invitee_character_id": character.id},
        headers=auth_headers2,
    )
    assert invite_resp.status_code == 200
    data = invite_resp.json()
    assert data["invitee_id"] == character.id
    assert data["status"] == "pending"


# ---------------------------------------------------------------------------
# Document update
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_update_document(
    client: AsyncClient,
    character2: Character,
    signed_up_task_for_char2: Task,
    auth_headers2: dict,
    era: Era,
):
    """A member can update the shared collaboration document."""
    create_resp = await client.post(
        "/collaborations",
        json={"task_id": signed_up_task_for_char2.id, "mode": "collaboration"},
        headers=auth_headers2,
    )
    collab_id = create_resp.json()["id"]

    doc_resp = await client.post(
        f"/collaborations/{collab_id}/document",
        json={"body_text": "Updated document content"},
        headers=auth_headers2,
    )
    assert doc_resp.status_code == 200
    assert doc_resp.json()["body_text"] == "Updated document content"
