"""Integration tests for /submissions endpoints."""
import pytest
from httpx import AsyncClient

from models.character import Character
from models.submission import Submission
from models.task import Task


@pytest.mark.asyncio
async def test_list_submissions_public(client: AsyncClient):
    resp = await client.get("/submissions")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_create_submission(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "My Praxis", "body_text": "I did the thing."},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["task_id"] == active_task.id
    assert data["character_id"] == character.id
    assert data["title"] == "My Praxis"
    assert data["is_flagged"] is False
    assert data["media"] == []


@pytest.mark.asyncio
async def test_get_submission(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    create_resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "Test Sub"},
        headers=auth_headers,
    )
    sub_id = create_resp.json()["id"]
    resp = await client.get(f"/submissions/{sub_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == sub_id


@pytest.mark.asyncio
async def test_edit_submission(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    create_resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "Original Title"},
        headers=auth_headers,
    )
    sub_id = create_resp.json()["id"]
    resp = await client.put(
        f"/submissions/{sub_id}",
        json={"task_id": active_task.id, "title": "Updated Title"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Title"


@pytest.mark.asyncio
async def test_edit_submission_wrong_owner(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    create_resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "My Sub"},
        headers=auth_headers,
    )
    sub_id = create_resp.json()["id"]
    resp = await client.put(
        f"/submissions/{sub_id}",
        json={"task_id": active_task.id, "title": "Hacked"},
        headers=auth_headers2,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_flag_submission_level_gate(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
    character2: Character,
):
    """character2 (level 5) can flag; character (level 0) cannot."""
    create_resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "Flaggable Sub"},
        headers=auth_headers,
    )
    sub_id = create_resp.json()["id"]

    # character (level 0) tries to flag — should fail
    resp_low = await client.post(
        f"/submissions/{sub_id}/flag",
        params={"reason": "spam"},
        headers=auth_headers,
    )
    assert resp_low.status_code == 403

    # character2 (level 5) flags — should succeed
    resp_high = await client.post(
        f"/submissions/{sub_id}/flag",
        params={"reason": "spam"},
        headers=auth_headers2,
    )
    assert resp_high.status_code == 200
    assert resp_high.json()["is_flagged"] is True
