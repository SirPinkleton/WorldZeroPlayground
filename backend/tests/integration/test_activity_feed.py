"""Integration tests for /activity-feed endpoint.

Exercises the activity feed service end-to-end via the router.  The primary
purpose is to catch ORM-level regressions such as the Praxis.character_id ->
Praxis.created_by_id rename (Bug 5): the queries would only fail at runtime,
not at import time.
"""

import pytest
from httpx import AsyncClient

from models.character import Character
from models.task import Task


@pytest.mark.asyncio
async def test_activity_feed_shows_votes_on_mine(
    client: AsyncClient,
    character: Character,
    character2: Character,
    active_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
):
    """character owns a praxis, character2 votes on it, feed shows vote_on_mine entry."""
    # character creates a solo praxis
    create_resp = await client.post(
        "/praxes",
        json={"task_id": active_task.id, "type": "solo", "title": "Feed praxis"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    praxis_id = create_resp.json()["id"]

    # character2 votes on it (voter != praxis owner, distinct accounts)
    vote_resp = await client.post(
        f"/praxes/{praxis_id}/vote",
        json={"stars": 4},
        headers=auth_headers2,
    )
    assert vote_resp.status_code == 200

    # character fetches their activity feed
    feed_resp = await client.get(
        "/activity-feed",
        params={"filter": "your_stuff"},
        headers=auth_headers,
    )
    assert feed_resp.status_code == 200
    data = feed_resp.json()

    vote_items = [item for item in data["items"] if item["type"] == "vote_on_mine"]
    assert len(vote_items) == 1, f"Expected one vote_on_mine item, got: {data['items']}"
    entry = vote_items[0]
    assert entry["payload"]["praxis_id"] == praxis_id
    assert entry["payload"]["stars"] == 4
    assert entry["actor_display_name"] == character2.display_name
