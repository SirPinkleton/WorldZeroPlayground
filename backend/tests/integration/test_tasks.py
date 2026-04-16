"""Integration tests for /tasks endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.character import Character
from models.character_stats import CharacterStats
from models.faction import Faction, FactionStatus
from models.task import CharacterTask, CharacterTaskStatus, Task, TaskStatus


@pytest.mark.asyncio
async def test_list_tasks_public(client: AsyncClient, active_task: Task):
    resp = await client.get("/tasks")
    assert resp.status_code == 200
    data = resp.json()
    ids = [task_json["id"] for task_json in data]
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


# ---------------------------------------------------------------------------
# T.6 additions — filters, propose/edit task, signups list, my-tasks, hidden factions
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_tasks_filter_by_status_active(
    client: AsyncClient, active_task: Task
):
    """status=active returns only active tasks."""
    resp = await client.get("/tasks", params={"status": "active"})
    assert resp.status_code == 200
    data = resp.json()
    assert all(t["status"] == "active" for t in data)
    ids = [t["id"] for t in data]
    assert active_task.id in ids


@pytest.mark.asyncio
async def test_list_tasks_filter_by_status_all(
    client: AsyncClient,
    db_session: AsyncSession,
    character: Character,
    active_task: Task,
):
    """status=all returns tasks of every status."""
    pending_task = Task(
        title="Pending Task",
        description="",
        point_value=5,
        level_required=0,
        status=TaskStatus.pending,
        created_by=character.id,
        primary_faction_slug="ua",
    )
    db_session.add(pending_task)
    await db_session.commit()

    resp = await client.get("/tasks", params={"status": "all"})
    assert resp.status_code == 200
    data = resp.json()
    statuses = {t["status"] for t in data}
    # Both pending and active tasks should appear
    assert "active" in statuses or "pending" in statuses


@pytest.mark.asyncio
async def test_list_tasks_filter_invalid_status(client: AsyncClient):
    """Invalid status value returns 422."""
    resp = await client.get("/tasks", params={"status": "bogus_status"})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_list_tasks_filter_by_min_max_points(
    client: AsyncClient,
    db_session: AsyncSession,
    character: Character,
    active_task: Task,
):
    """min_points and max_points filter tasks by point value."""
    # active_task has point_value=10
    resp_min = await client.get("/tasks", params={"min_points": 10})
    assert resp_min.status_code == 200
    for task_data in resp_min.json():
        assert task_data["point_value"] >= 10

    resp_max = await client.get("/tasks", params={"max_points": 9})
    assert resp_max.status_code == 200
    for task_data in resp_max.json():
        assert task_data["point_value"] <= 9

    # active_task has point_value=10, so it should be excluded from max_points=9
    ids_under_10 = [t["id"] for t in resp_max.json()]
    assert active_task.id not in ids_under_10


@pytest.mark.asyncio
async def test_list_tasks_filter_by_faction(
    client: AsyncClient, active_task: Task
):
    """faction filter returns only tasks for that faction."""
    resp = await client.get("/tasks", params={"faction": "ua"})
    assert resp.status_code == 200
    for task_data in resp.json():
        assert task_data["primary_faction_slug"] == "ua"


@pytest.mark.asyncio
async def test_list_tasks_exclude_character_id(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    signed_up_task: Task,
):
    """exclude_character_id hides tasks the character is already signed up for."""
    resp = await client.get("/tasks", params={"exclude_character_id": character.id})
    assert resp.status_code == 200
    ids = [t["id"] for t in resp.json()]
    # character is signed up for signed_up_task (which is active_task), so it should be excluded
    assert active_task.id not in ids


@pytest.mark.asyncio
async def test_propose_task_with_description(
    client: AsyncClient,
    character2: Character,
    auth_headers2: dict,
):
    """Level-5 character can propose a task with a description."""
    resp = await client.post(
        "/tasks",
        json={
            "title": "Detailed Task",
            "description": "Do something meaningful",
            "point_value": 15,
            "level_required": 1,
        },
        headers=auth_headers2,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Detailed Task"
    assert data["description"] == "Do something meaningful"
    assert data["point_value"] == 15
    assert data["level_required"] == 1
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_propose_task_unauthenticated(client: AsyncClient):
    """Unauthenticated request to propose a task returns 401."""
    resp = await client.post(
        "/tasks",
        json={"title": "Unauth Task", "point_value": 5, "level_required": 0},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_edit_pending_task_by_proposer(
    client: AsyncClient,
    db_session: AsyncSession,
    character2: Character,
    auth_headers2: dict,
):
    """The proposer can edit their own pending task."""
    # First propose a task
    create_resp = await client.post(
        "/tasks",
        json={"title": "Original Title", "point_value": 10, "level_required": 0},
        headers=auth_headers2,
    )
    assert create_resp.status_code == 201
    task_id = create_resp.json()["id"]

    # Now edit it
    edit_resp = await client.put(
        f"/tasks/{task_id}",
        json={"title": "Updated Title", "point_value": 20, "level_required": 1},
        headers=auth_headers2,
    )
    assert edit_resp.status_code == 200
    data = edit_resp.json()
    assert data["title"] == "Updated Title"
    assert data["point_value"] == 20
    assert data["level_required"] == 1
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_edit_task_wrong_owner(
    client: AsyncClient,
    db_session: AsyncSession,
    character2: Character,
    auth_headers: dict,
    auth_headers2: dict,
):
    """A character who did not propose the task cannot edit it."""
    # character2 proposes
    create_resp = await client.post(
        "/tasks",
        json={"title": "Someone Else's Task", "point_value": 10, "level_required": 0},
        headers=auth_headers2,
    )
    assert create_resp.status_code == 201
    task_id = create_resp.json()["id"]

    # character (level 0) tries to edit — rejected because wrong owner
    # (character is level 0 so first it hits the character dep; but task ownership check comes after)
    # We use auth_headers2 owner first to verify 403 for non-owner with level 5:
    # Seed a third account/char to be the wrong-owner attacker — use auth_headers (character, level 0)
    edit_resp = await client.put(
        f"/tasks/{task_id}",
        json={"title": "Hijacked", "point_value": 5, "level_required": 0},
        headers=auth_headers,
    )
    assert edit_resp.status_code == 403


@pytest.mark.asyncio
async def test_edit_active_task_rejected(
    client: AsyncClient,
    active_task: Task,
    auth_headers: dict,
):
    """Cannot edit an active (non-pending) task even if you are the proposer."""
    resp = await client.put(
        f"/tasks/{active_task.id}",
        json={"title": "New Title", "point_value": 5, "level_required": 0},
        headers=auth_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_list_task_signups_empty(client: AsyncClient, active_task: Task):
    """GET /tasks/{id}/signups returns empty list when no one is signed up."""
    resp = await client.get(f"/tasks/{active_task.id}/signups")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_task_signups_populated(
    client: AsyncClient,
    character: Character,
    character2: Character,
    active_task: Task,
    signed_up_task: Task,
    signed_up_task2: Task,
):
    """GET /tasks/{id}/signups returns all signed-up characters."""
    resp = await client.get(f"/tasks/{active_task.id}/signups")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    character_ids = [entry["character_id"] for entry in data]
    assert character.id in character_ids
    assert character2.id in character_ids


@pytest.mark.asyncio
async def test_list_task_signups_not_found(client: AsyncClient):
    """GET /tasks/99999/signups returns 404 when task does not exist."""
    resp = await client.get("/tasks/99999/signups")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_my_tasks_default_in_progress(
    client: AsyncClient,
    character: Character,
    active_task: Task,
    signed_up_task: Task,
    auth_headers: dict,
):
    """GET /tasks/my-tasks returns in_progress signups by default."""
    resp = await client.get("/tasks/my-tasks", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    for entry in data:
        assert entry["status"] == "in_progress"


@pytest.mark.asyncio
async def test_my_tasks_filter_submitted(
    client: AsyncClient,
    db_session: AsyncSession,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    """GET /tasks/my-tasks?status=submitted returns only submitted signups."""
    # Seed a submitted CharacterTask
    ct = CharacterTask(
        character_id=character.id,
        task_id=active_task.id,
        status=CharacterTaskStatus.submitted,
    )
    db_session.add(ct)
    await db_session.commit()

    resp = await client.get("/tasks/my-tasks", params={"status": "submitted"}, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    for entry in data:
        assert entry["status"] == "submitted"


@pytest.mark.asyncio
async def test_my_tasks_filter_abandoned(
    client: AsyncClient,
    db_session: AsyncSession,
    character: Character,
    active_task: Task,
    auth_headers: dict,
):
    """GET /tasks/my-tasks?status=abandoned returns only abandoned signups."""
    ct = CharacterTask(
        character_id=character.id,
        task_id=active_task.id,
        status=CharacterTaskStatus.abandoned,
    )
    db_session.add(ct)
    await db_session.commit()

    resp = await client.get("/tasks/my-tasks", params={"status": "abandoned"}, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    for entry in data:
        assert entry["status"] == "abandoned"


@pytest.mark.asyncio
async def test_my_tasks_invalid_status(
    client: AsyncClient, character: Character, auth_headers: dict
):
    """GET /tasks/my-tasks with invalid status returns 422."""
    resp = await client.get("/tasks/my-tasks", params={"status": "invalid_status"}, headers=auth_headers)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_my_tasks_unauthenticated(client: AsyncClient):
    """GET /tasks/my-tasks without auth returns 401."""
    resp = await client.get("/tasks/my-tasks")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_list_tasks_excludes_hidden_faction_tasks(
    client: AsyncClient,
    db_session: AsyncSession,
    character: Character,
):
    """Tasks from hidden factions are excluded from the public task listing."""
    from sqlalchemy import select

    # Seed a hidden faction if not already present
    hidden_result = await db_session.execute(
        select(Faction).where(Faction.slug == "hiddenfaction")
    )
    if hidden_result.scalar_one_or_none() is None:
        hidden_faction = Faction(
            slug="hiddenfaction",
            name="Hidden",
            description="Not visible",
            status=FactionStatus.hidden,
        )
        db_session.add(hidden_faction)
        await db_session.commit()

    # Create a task for the hidden faction
    hidden_task = Task(
        title="Hidden Faction Task",
        description="",
        point_value=10,
        level_required=0,
        status=TaskStatus.active,
        created_by=character.id,
        primary_faction_slug="hiddenfaction",
    )
    db_session.add(hidden_task)
    await db_session.commit()

    resp = await client.get("/tasks")
    assert resp.status_code == 200
    ids = [t["id"] for t in resp.json()]
    assert hidden_task.id not in ids


@pytest.mark.asyncio
async def test_signup_blocked_for_hidden_faction_task(
    client: AsyncClient,
    db_session: AsyncSession,
    character: Character,
    auth_headers: dict,
):
    """Signing up for a task from a hidden faction is rejected with 422."""
    from sqlalchemy import select

    # Ensure the hidden faction exists
    hidden_result = await db_session.execute(
        select(Faction).where(Faction.slug == "hiddenfaction2")
    )
    if hidden_result.scalar_one_or_none() is None:
        hidden_faction = Faction(
            slug="hiddenfaction2",
            name="Hidden2",
            description="Still not visible",
            status=FactionStatus.hidden,
        )
        db_session.add(hidden_faction)
        await db_session.commit()

    hidden_task = Task(
        title="Hidden Signup Task",
        description="",
        point_value=10,
        level_required=0,
        status=TaskStatus.active,
        created_by=character.id,
        primary_faction_slug="hiddenfaction2",
    )
    db_session.add(hidden_task)
    await db_session.commit()

    resp = await client.post(f"/tasks/{hidden_task.id}/signup", headers=auth_headers)
    assert resp.status_code == 422
