"""Integration tests for /tasks endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.character import Character
from models.task import Task, TaskStatus


@pytest.mark.asyncio
async def test_list_tasks_public(client: AsyncClient, active_task: Task):
    resp = await client.get("/tasks")
    assert resp.status_code == 200
    data = resp.json()
    ids = [t["id"] for t in data]
    assert active_task.id in ids


@pytest.mark.asyncio
async def test_get_task(client: AsyncClient, active_task: Task):
    resp = await client.get(f"/tasks/{active_task.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == active_task.id
    assert data["status"] == "active"


@pytest.mark.asyncio
async def test_get_task_not_found(client: AsyncClient):
    resp = await client.get("/tasks/99999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_propose_task_requires_level3(
    client: AsyncClient,
    character: Character,
    auth_headers: dict,
):
    """character is level 0 — proposal should be rejected."""
    resp = await client.post(
        "/tasks",
        json={"title": "My Task", "point_value": 5, "level_required": 0},
        headers=auth_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_propose_task_level3(
    client: AsyncClient,
    character2: Character,
    auth_headers2: dict,
):
    """character2 is level 5 — should be allowed to propose."""
    resp = await client.post(
        "/tasks",
        json={"title": "Good Task", "point_value": 10, "level_required": 0},
        headers=auth_headers2,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "pending"
    assert data["title"] == "Good Task"


@pytest.mark.asyncio
async def test_signup_for_task(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    resp = await client.post(f"/tasks/{active_task.id}/signup", headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["task"]["id"] == active_task.id
    assert data["status"] == "in_progress"


@pytest.mark.asyncio
async def test_signup_duplicate(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    await client.post(f"/tasks/{active_task.id}/signup", headers=auth_headers)
    resp = await client.post(f"/tasks/{active_task.id}/signup", headers=auth_headers)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_drop_task(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    await client.post(f"/tasks/{active_task.id}/signup", headers=auth_headers)
    resp = await client.delete(f"/tasks/{active_task.id}/signup", headers=auth_headers)
    assert resp.status_code == 204
