"""Integration tests for vote endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.character import Character
from models.character_stats import CharacterStats
from models.era import Era
from models.task import Task


@pytest.mark.asyncio
async def test_cast_vote(
    client: AsyncClient,
    character: Character,
    character2: Character,
    signed_up_task: Task,
    signed_up_task2: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    """character2 submits; character votes on it."""
    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task2.id, "title": "Vote me"},
        headers=auth_headers2,
    )
    assert sub_resp.status_code == 201
    praxis_id = sub_resp.json()["id"]

    vote_resp = await client.post(
        f"/praxes/{praxis_id}/vote",
        json={"stars": 4},
        headers=auth_headers,
    )
    assert vote_resp.status_code == 200
    data = vote_resp.json()
    assert data["stars"] == 4
    assert data["praxis_id"] == praxis_id


@pytest.mark.asyncio
async def test_cast_vote_self_blocked(
    client: AsyncClient,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
):
    """Cannot vote on own praxis (account-level check)."""
    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Own praxis"},
        headers=auth_headers,
    )
    praxis_id = sub_resp.json()["id"]

    vote_resp = await client.post(
        f"/praxes/{praxis_id}/vote",
        json={"stars": 5},
        headers=auth_headers,
    )
    assert vote_resp.status_code == 403


@pytest.mark.asyncio
async def test_update_vote_free(
    client: AsyncClient,
    character: Character,
    character2: Character,
    signed_up_task2: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    """Updating a vote does not deduct budget."""
    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task2.id, "title": "Update vote test"},
        headers=auth_headers2,
    )
    praxis_id = sub_resp.json()["id"]

    # Initial vote
    await client.post(f"/praxes/{praxis_id}/vote", json={"stars": 3}, headers=auth_headers)

    # Update
    resp = await client.post(
        f"/praxes/{praxis_id}/vote", json={"stars": 5}, headers=auth_headers
    )
    assert resp.status_code == 200
    assert resp.json()["stars"] == 5


@pytest.mark.asyncio
async def test_vote_summary(
    client: AsyncClient,
    character: Character,
    character2: Character,
    signed_up_task2: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task2.id, "title": "Summary test"},
        headers=auth_headers2,
    )
    praxis_id = sub_resp.json()["id"]
    await client.post(f"/praxes/{praxis_id}/vote", json={"stars": 4}, headers=auth_headers)

    resp = await client.get(f"/praxes/{praxis_id}/votes")
    assert resp.status_code == 200
    data = resp.json()
    assert data["praxis_id"] == praxis_id
    assert data["total_votes"] == 1
    assert data["average_stars"] == 4.0


@pytest.mark.asyncio
async def test_invalid_stars(
    client: AsyncClient,
    character: Character,
    character2: Character,
    signed_up_task2: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task2.id, "title": "Star test"},
        headers=auth_headers2,
    )
    praxis_id = sub_resp.json()["id"]

    resp = await client.post(
        f"/praxes/{praxis_id}/vote", json={"stars": 6}, headers=auth_headers
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_vote_updates_author_stats(
    client: AsyncClient,
    character: Character,
    character2: Character,
    signed_up_task2: Task,
    auth_headers: dict,
    auth_headers2: dict,
    db_session: AsyncSession,
    era: Era,
):
    """Voting on a praxis updates the author's score."""
    # character2 submits a praxis
    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task2.id, "title": "Score via vote"},
        headers=auth_headers2,
    )
    assert sub_resp.status_code == 201
    praxis_id = sub_resp.json()["id"]

    # Record character2's score after praxis creation
    result = await db_session.execute(
        select(CharacterStats).where(
            CharacterStats.character_id == character2.id,
            CharacterStats.era_id == era.id,
        )
    )
    stats = result.scalar_one()
    score_after_praxis = stats.score

    # character votes 4 stars
    vote_resp = await client.post(
        f"/praxes/{praxis_id}/vote",
        json={"stars": 4},
        headers=auth_headers,
    )
    assert vote_resp.status_code == 200

    # character2's score should have increased by the star count
    await db_session.refresh(stats)
    assert stats.score > score_after_praxis
    assert stats.score >= score_after_praxis + 4
