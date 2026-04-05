"""Integration tests for vote endpoints."""
import pytest
from httpx import AsyncClient

from models.character import Character
from models.task import Task


@pytest.mark.asyncio
async def test_cast_vote(
    client: AsyncClient,
    character: Character,
    character2: Character,
    active_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    """character2 submits; character votes on it."""
    sub_resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "Vote me"},
        headers=auth_headers2,
    )
    assert sub_resp.status_code == 201
    sub_id = sub_resp.json()["id"]

    vote_resp = await client.post(
        f"/submissions/{sub_id}/vote",
        json={"stars": 4},
        headers=auth_headers,
    )
    assert vote_resp.status_code == 200
    data = vote_resp.json()
    assert data["stars"] == 4
    assert data["submission_id"] == sub_id


@pytest.mark.asyncio
async def test_cast_vote_self_blocked(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    """Cannot vote on own submission (account-level check)."""
    sub_resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "Own sub"},
        headers=auth_headers,
    )
    sub_id = sub_resp.json()["id"]

    vote_resp = await client.post(
        f"/submissions/{sub_id}/vote",
        json={"stars": 5},
        headers=auth_headers,
    )
    assert vote_resp.status_code == 403


@pytest.mark.asyncio
async def test_update_vote_free(
    client: AsyncClient,
    character: Character,
    character2: Character,
    active_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    """Updating a vote does not deduct budget."""
    sub_resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "Update vote test"},
        headers=auth_headers2,
    )
    sub_id = sub_resp.json()["id"]

    # Initial vote
    await client.post(f"/submissions/{sub_id}/vote", json={"stars": 3}, headers=auth_headers)

    # Update
    resp = await client.post(
        f"/submissions/{sub_id}/vote", json={"stars": 5}, headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["stars"] == 5


@pytest.mark.asyncio
async def test_vote_summary(
    client: AsyncClient,
    character: Character,
    character2: Character,
    active_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    sub_resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "Summary test"},
        headers=auth_headers2,
    )
    sub_id = sub_resp.json()["id"]
    await client.post(f"/submissions/{sub_id}/vote", json={"stars": 4}, headers=auth_headers)

    resp = await client.get(f"/submissions/{sub_id}/votes")
    assert resp.status_code == 200
    data = resp.json()
    assert data["submission_id"] == sub_id
    assert data["total_votes"] == 1
    assert data["average_stars"] == 4.0


@pytest.mark.asyncio
async def test_invalid_stars(
    client: AsyncClient,
    character: Character,
    character2: Character,
    active_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    sub_resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "Star test"},
        headers=auth_headers2,
    )
    sub_id = sub_resp.json()["id"]

    resp = await client.post(
        f"/submissions/{sub_id}/vote", json={"stars": 6}, headers=auth_headers
    )
    assert resp.status_code == 422
