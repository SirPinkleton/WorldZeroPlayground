"""Integration tests for /admin endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.account import Account
from models.character import Character
from models.character_stats import CharacterStats
from models.contact import ContactMessage
from models.era import Era
from models.praxis import Praxis, ModerationStatus
from models.roles import AccountRole, Role
from models.task import Task, TaskStatus


async def _make_admin(account: Account, session: AsyncSession) -> None:
    """Grant the admin role to an account."""
    role = Role(name="admin", description="Administrator")
    session.add(role)
    await session.flush()
    ar = AccountRole(account_id=account.id, role_id=role.id, granted_by=account.id)
    session.add(ar)
    await session.commit()


# ---------------------------------------------------------------------------
# Auth guard
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_endpoints_require_admin_role(
    client: AsyncClient,
    auth_headers: dict,
):
    """Non-admin accounts get 403 on admin endpoints."""
    resp = await client.get("/admin/tasks/pending", headers=auth_headers)
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Tasks — list, approve, retire, reactivate, create, task-vision
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_list_pending_tasks(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    task = Task(
        title="Pending Admin Test",
        point_value=5,
        level_required=0,
        status=TaskStatus.pending,
        created_by=character.id,
    )
    db_session.add(task)
    await db_session.commit()

    resp = await client.get("/admin/tasks/pending", headers=auth_headers)
    assert resp.status_code == 200
    ids = [t["id"] for t in resp.json()]
    assert task.id in ids


@pytest.mark.asyncio
async def test_admin_approve_task(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    task = Task(
        title="To Approve",
        point_value=5,
        level_required=0,
        status=TaskStatus.pending,
        created_by=character.id,
    )
    db_session.add(task)
    await db_session.commit()

    resp = await client.put(f"/admin/tasks/{task.id}/approve", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "active"


@pytest.mark.asyncio
async def test_admin_retire_task(
    client: AsyncClient,
    account: Account,
    active_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)
    resp = await client.put(f"/admin/tasks/{active_task.id}/retire", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "retired"


@pytest.mark.asyncio
async def test_admin_reactivate_task(
    client: AsyncClient,
    account: Account,
    active_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Retire a task, then reactivate it."""
    await _make_admin(account, db_session)

    # Retire first
    await client.put(f"/admin/tasks/{active_task.id}/retire", headers=auth_headers)

    resp = await client.post(f"/admin/tasks/{active_task.id}/reactivate", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "active"


@pytest.mark.asyncio
async def test_admin_update_task_status(
    client: AsyncClient,
    account: Account,
    active_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Use the generic status endpoint to retire a task."""
    await _make_admin(account, db_session)

    resp = await client.put(
        f"/admin/tasks/{active_task.id}/status",
        json={"status": "retired"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "retired"


@pytest.mark.asyncio
async def test_admin_create_task(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can create a task directly in active status."""
    await _make_admin(account, db_session)

    resp = await client.post(
        "/admin/tasks",
        json={"title": "Admin-created", "point_value": 50, "level_required": 0},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Admin-created"
    assert data["status"] == "active"
    assert data["point_value"] == 50


@pytest.mark.asyncio
async def test_admin_toggle_task_vision(
    client: AsyncClient,
    account: Account,
    active_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    resp = await client.patch(
        f"/admin/tasks/{active_task.id}/task-vision",
        json={"is_task_vision_eligible": True},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["is_task_vision_eligible"] is True


# ---------------------------------------------------------------------------
# Praxis moderation
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_delete_praxis(
    client: AsyncClient,
    account: Account,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "To Delete"},
        headers=auth_headers,
    )
    sub_id = sub_resp.json()["id"]

    resp = await client.delete(f"/admin/praxes/{sub_id}", headers=auth_headers)
    assert resp.status_code == 204

    get_resp = await client.get(f"/praxes/{sub_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_admin_moderate_praxis(
    client: AsyncClient,
    account: Account,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can change moderation status and add a note."""
    await _make_admin(account, db_session)

    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "To Moderate"},
        headers=auth_headers,
    )
    praxis_id = sub_resp.json()["id"]

    resp = await client.patch(
        f"/admin/praxes/{praxis_id}/moderate",
        json={"status": "hidden", "admin_note": "Spam content"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["moderation_status"] == "hidden"


@pytest.mark.asyncio
async def test_admin_list_flagged_praxes(
    client: AsyncClient,
    account: Account,
    character: Character,
    character2: Character,
    signed_up_task: Task,
    auth_headers: dict,
    auth_headers2: dict,
    db_session: AsyncSession,
):
    """Flagged praxes appear in the admin moderation queue."""
    await _make_admin(account, db_session)

    # Create and flag a praxis
    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Flaggable"},
        headers=auth_headers,
    )
    praxis_id = sub_resp.json()["id"]

    # character2 (level 5) flags it
    await client.post(
        f"/praxes/{praxis_id}/flag",
        params={"reason": "inappropriate"},
        headers=auth_headers2,
    )

    resp = await client.get("/admin/praxes/flagged", headers=auth_headers)
    assert resp.status_code == 200
    ids = [p["id"] for p in resp.json()]
    assert praxis_id in ids


# ---------------------------------------------------------------------------
# Character stats
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_patch_character_stats(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can set a character's score, level, and vote budget."""
    await _make_admin(account, db_session)

    resp = await client.patch(
        f"/admin/characters/{character.id}/stats",
        json={"score": 999, "level": 7, "votes_available": 50},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["score"] == 999
    assert data["level"] == 7
    assert data["votes_available"] == 50


@pytest.mark.asyncio
async def test_admin_backfill_stats(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Backfill recomputes stats for all characters."""
    await _make_admin(account, db_session)

    resp = await client.post("/admin/characters/backfill-stats", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["recalculated"] >= 1


# ---------------------------------------------------------------------------
# Character ban
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_ban_character(
    client: AsyncClient,
    account: Account,
    character2: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can ban and unban a character."""
    await _make_admin(account, db_session)

    # Ban
    resp = await client.post(
        f"/admin/characters/{character2.id}/ban",
        json={"banned": True},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["banned"] is True

    # Unban
    resp = await client.post(
        f"/admin/characters/{character2.id}/ban",
        json={"banned": False},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["banned"] is False


# ---------------------------------------------------------------------------
# Accounts & roles
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_list_accounts(
    client: AsyncClient,
    account: Account,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    resp = await client.get("/admin/accounts", headers=auth_headers)
    assert resp.status_code == 200
    emails = [a["email"] for a in resp.json()]
    assert account.email in emails


@pytest.mark.asyncio
async def test_admin_get_account(
    client: AsyncClient,
    account: Account,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    resp = await client.get(f"/admin/accounts/{account.id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == account.email


@pytest.mark.asyncio
async def test_admin_list_characters(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    resp = await client.get("/admin/characters", headers=auth_headers)
    assert resp.status_code == 200
    ids = [c["id"] for c in resp.json()]
    assert character.id in ids


@pytest.mark.asyncio
async def test_admin_suspend_account(
    client: AsyncClient,
    account: Account,
    account2: Account,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    resp = await client.post(
        f"/admin/accounts/{account2.id}/suspend",
        json={"suspended": True},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "suspended"


@pytest.mark.asyncio
async def test_admin_manage_role(
    client: AsyncClient,
    account: Account,
    account2: Account,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can grant and revoke roles."""
    await _make_admin(account, db_session)

    # Grant moderator role
    resp = await client.post(
        f"/admin/accounts/{account2.id}/role",
        json={"role": "moderator", "action": "grant"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["action"] == "grant"


# ---------------------------------------------------------------------------
# Overview & messages
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_overview(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    resp = await client.get("/admin/overview", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "accounts" in data
    assert "characters" in data


@pytest.mark.asyncio
async def test_admin_messages(
    client: AsyncClient,
    account: Account,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can list and archive contact messages."""
    await _make_admin(account, db_session)

    msg = ContactMessage(name="Tester", email="t@t.com", message="Hello")
    db_session.add(msg)
    await db_session.commit()

    # List
    resp = await client.get("/admin/messages", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

    # Archive
    msg_id = resp.json()[0]["id"]
    archive_resp = await client.patch(
        f"/admin/messages/{msg_id}/archive", headers=auth_headers
    )
    assert archive_resp.status_code == 200
    assert archive_resp.json()["is_archived"] is True


# ---------------------------------------------------------------------------
# Hide / unhide praxis via moderation endpoint
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_hide_praxis(
    client: AsyncClient,
    account: Account,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can hide a visible praxis (sets moderation_status=hidden)."""
    await _make_admin(account, db_session)

    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "To Hide"},
        headers=auth_headers,
    )
    assert sub_resp.status_code == 201
    praxis_id = sub_resp.json()["id"]
    assert sub_resp.json()["moderation_status"] == "visible"

    hide_resp = await client.patch(
        f"/admin/praxes/{praxis_id}/moderate",
        json={"status": "hidden"},
        headers=auth_headers,
    )
    assert hide_resp.status_code == 200
    assert hide_resp.json()["moderation_status"] == "hidden"

    # Hidden praxis should return 404 from public endpoint
    get_resp = await client.get(f"/praxes/{praxis_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_admin_unhide_praxis(
    client: AsyncClient,
    account: Account,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can restore a hidden praxis back to visible."""
    await _make_admin(account, db_session)

    # Create and immediately hide
    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "To Unhide"},
        headers=auth_headers,
    )
    praxis_id = sub_resp.json()["id"]

    await client.patch(
        f"/admin/praxes/{praxis_id}/moderate",
        json={"status": "hidden"},
        headers=auth_headers,
    )

    # Now unhide
    unhide_resp = await client.patch(
        f"/admin/praxes/{praxis_id}/moderate",
        json={"status": "visible"},
        headers=auth_headers,
    )
    assert unhide_resp.status_code == 200
    assert unhide_resp.json()["moderation_status"] == "visible"

    # Praxis should be accessible again
    get_resp = await client.get(f"/praxes/{praxis_id}")
    assert get_resp.status_code == 200


@pytest.mark.asyncio
async def test_admin_moderate_praxis_failed(
    client: AsyncClient,
    account: Account,
    character: Character,
    signed_up_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can mark a praxis as failed with an admin note."""
    await _make_admin(account, db_session)

    sub_resp = await client.post(
        "/praxes",
        json={"task_id": signed_up_task.id, "title": "Bad Praxis"},
        headers=auth_headers,
    )
    praxis_id = sub_resp.json()["id"]

    resp = await client.patch(
        f"/admin/praxes/{praxis_id}/moderate",
        json={"status": "failed", "admin_note": "Does not meet requirements."},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["moderation_status"] == "failed"
    assert data["admin_note"] == "Does not meet requirements."


# ---------------------------------------------------------------------------
# Admin character list with filters
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_list_characters_filter_faction(
    client: AsyncClient,
    account: Account,
    character: Character,
    character2: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can filter character list by faction slug."""
    await _make_admin(account, db_session)

    resp = await client.get("/admin/characters?faction=ua", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    ids = [c["id"] for c in data]
    assert character.id in ids
    assert character2.id in ids
    for c in data:
        assert c["faction_slug"] == "ua"


@pytest.mark.asyncio
async def test_admin_list_characters_no_results(
    client: AsyncClient,
    account: Account,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin character list returns empty list for unknown faction."""
    await _make_admin(account, db_session)

    resp = await client.get("/admin/characters?faction=nonexistent", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


# ---------------------------------------------------------------------------
# Era reset
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_era_reset(
    client: AsyncClient,
    account: Account,
    character: Character,
    character2: Character,
    auth_headers: dict,
    db_session: AsyncSession,
    era: Era,
):
    """Era reset creates a new era row and resets character stats."""
    from sqlalchemy import select
    from models.character_stats import CharacterStats

    await _make_admin(account, db_session)

    # Record pre-reset score for character2 (level 5, score 500)
    result = await db_session.execute(
        select(CharacterStats).where(
            CharacterStats.character_id == character2.id,
            CharacterStats.era_id == era.id,
        )
    )
    old_stats = result.scalar_one()
    assert old_stats.score == 500

    resp = await client.put("/admin/era/reset", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "era_id" in data
    assert data["era_id"] != era.id  # New era row created
    assert data["characters_reset"] >= 2  # At least character + character2

    new_era_id = data["era_id"]
    # Both characters should have new stat rows with reset values
    result2 = await db_session.execute(
        select(CharacterStats).where(
            CharacterStats.character_id == character2.id,
            CharacterStats.era_id == new_era_id,
        )
    )
    new_stats = result2.scalar_one()
    # ERA_1 has reset_score=True
    assert new_stats.score == 0


@pytest.mark.asyncio
async def test_admin_era_reset_requires_admin(
    client: AsyncClient,
    auth_headers: dict,
):
    """Non-admin gets 403 on era reset."""
    resp = await client.put("/admin/era/reset", headers=auth_headers)
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Admin edit task (PATCH /admin/tasks/{id})
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_admin_edit_pending_task(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin can edit title and point_value of a pending task."""
    await _make_admin(account, db_session)

    task = Task(
        title="Original Title",
        point_value=5,
        level_required=0,
        status=TaskStatus.pending,
        created_by=character.id,
    )
    db_session.add(task)
    await db_session.commit()

    resp = await client.patch(
        f"/admin/tasks/{task.id}",
        json={"title": "Updated Title", "point_value": 20},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Updated Title"
    assert data["point_value"] == 20


@pytest.mark.asyncio
async def test_admin_edit_active_task_rejected(
    client: AsyncClient,
    account: Account,
    active_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    """Admin cannot edit an active task (must retire first)."""
    await _make_admin(account, db_session)

    resp = await client.patch(
        f"/admin/tasks/{active_task.id}",
        json={"title": "Should Fail"},
        headers=auth_headers,
    )
    assert resp.status_code == 400
