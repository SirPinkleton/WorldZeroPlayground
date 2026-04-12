"""Integration tests for /admin endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from models.account import Account
from models.character import Character
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


@pytest.mark.asyncio
async def test_admin_endpoints_require_admin_role(
    client: AsyncClient,
    auth_headers: dict,
):
    """Non-admin accounts get 403 on admin endpoints."""
    resp = await client.get("/admin/tasks/pending", headers=auth_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_admin_list_pending_tasks(
    client: AsyncClient,
    account: Account,
    character: Character,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    # Create a pending task directly
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
    ids = [task_json["id"] for task_json in resp.json()]
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
async def test_admin_delete_submission(
    client: AsyncClient,
    account: Account,
    character: Character,
    active_task: Task,
    auth_headers: dict,
    db_session: AsyncSession,
):
    await _make_admin(account, db_session)

    sub_resp = await client.post(
        "/submissions",
        json={"task_id": active_task.id, "title": "To Delete"},
        headers=auth_headers,
    )
    sub_id = sub_resp.json()["id"]

    resp = await client.delete(f"/admin/submissions/{sub_id}", headers=auth_headers)
    assert resp.status_code == 204

    get_resp = await client.get(f"/submissions/{sub_id}")
    assert get_resp.status_code == 404
