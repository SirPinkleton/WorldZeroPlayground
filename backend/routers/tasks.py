from typing import Optional

from fastapi import APIRouter, Cookie, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from dependencies import get_current_character
from models.account import Account, AccountStatus
from models.character import Character, CharacterStatus
from models.faction import Faction, FactionStatus
from models.praxis import Praxis, PraxisMember, PraxisStatus, PraxisType
from models.roles import AccountRole, Role
from models.task import Task, TaskStatus, TaskType
from schemas.task import TaskCreate, TaskOut
from services.auth import decode_jwt, get_current_account
from services.task import (
    build_task_out,
    build_task_out_for_viewer,
    list_tasks as service_list_tasks,
    propose_task,
)

router = APIRouter()


_OPTIONAL_BEARER = HTTPBearer(auto_error=False)


async def get_current_character_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_OPTIONAL_BEARER),
    access_token: Optional[str] = Cookie(default=None),
    session: AsyncSession = Depends(get_db),
) -> Optional[Character]:
    """Return the authenticated viewer's active character, or None if anonymous.

    Mirrors :func:`dependencies.get_current_character` but never raises — used
    by public task endpoints that want to compute viewer-relative fields such
    as ``TaskOut.can_submit_praxis`` when a token is present.
    """
    token = None
    if credentials:
        token = credentials.credentials
    elif access_token:
        token = access_token
    if not token:
        return None

    try:
        payload = decode_jwt(token)
    except Exception:  # invalid/expired token — treat as anonymous
        return None

    try:
        account_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError):
        return None

    account_result = await session.execute(
        select(Account).where(Account.id == account_id)
    )
    account = account_result.scalar_one_or_none()
    if account is None or account.status != AccountStatus.active:
        return None

    char_result = await session.execute(
        select(Character)
        .where(
            Character.account_id == account.id,
            Character.status == CharacterStatus.active,
        )
        .order_by(Character.created_at)
        .limit(1)
    )
    return char_result.scalar_one_or_none()


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    status: Optional[str] = None,
    level: Optional[int] = None,
    faction: Optional[str] = None,
    min_points: Optional[int] = None,
    max_points: Optional[int] = None,
    exclude_character_id: Optional[int] = None,
    task_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_db),
    viewer: Optional[Character] = Depends(get_current_character_optional),
):
    tasks = await service_list_tasks(
        session,
        status=status,
        level=level,
        faction=faction,
        min_points=min_points,
        max_points=max_points,
        exclude_character_id=exclude_character_id,
        task_type=task_type,
        limit=limit,
        offset=offset,
    )
    return [
        await build_task_out_for_viewer(task, viewer, session) for task in tasks
    ]


@router.get("/{task_id}/signups", response_model=list[dict])
async def list_task_signups(
    task_id: int,
    session: AsyncSession = Depends(get_db),
):
    """List characters currently working on a task via praxis membership."""
    task = await session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")

    result = await session.execute(
        select(PraxisMember, Character, Praxis)
        .join(Praxis, PraxisMember.praxis_id == Praxis.id)
        .join(Character, PraxisMember.character_id == Character.id)
        .where(
            Praxis.task_id == task_id,
            Praxis.status == PraxisStatus.in_progress,
            Praxis.is_withdrawn == False,  # noqa: E712
        )
        .order_by(PraxisMember.joined_at.asc())
    )
    rows = result.all()
    return [
        {
            "character_id": character.id,
            "display_name": character.display_name,
            "avatar_url": character.avatar_url,
            "faction_slug": character.faction_slug,
            "praxis_type": praxis.type.value,
            "joined_at": member.joined_at,
        }
        for member, character, praxis in rows
    ]


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: int,
    session: AsyncSession = Depends(get_db),
    viewer: Optional[Character] = Depends(get_current_character_optional),
):
    task = await session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    return await build_task_out_for_viewer(task, viewer, session)


@router.post("", response_model=TaskOut, status_code=201)
async def propose_task_route(
    data: TaskCreate,
    character: Character = Depends(get_current_character),
    account: Account = Depends(get_current_account),
    session: AsyncSession = Depends(get_db),
):
    admin_result = await session.execute(
        select(AccountRole)
        .join(Role, AccountRole.role_id == Role.id)
        .where(AccountRole.account_id == account.id, Role.name == "admin")
    )
    is_admin = admin_result.scalar_one_or_none() is not None
    task = await propose_task(character, data, session, skip_level_check=is_admin)
    return build_task_out(task)


@router.put("/{task_id}", response_model=TaskOut)
async def update_task_route(
    task_id: int,
    data: TaskCreate,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    task = await session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    # Proposer can edit their own pending tasks only
    if task.created_by != character.id or task.status != TaskStatus.pending:
        raise HTTPException(
            status_code=403,
            detail="Only the proposer can edit a pending task.",
        )
    task.title = data.title
    task.description = data.description or ""
    task.point_value = data.point_value
    task.level_required = data.level_required
    task.primary_faction_slug = data.primary_faction_slug or "na"
    # Only allow editing metatask_faction_slug for metatasks.
    if task.task_type == TaskType.metatask and data.metatask_faction_slug is not None:
        task.metatask_faction_slug = data.metatask_faction_slug
    await session.commit()
    await session.refresh(task)
    return build_task_out(task)
