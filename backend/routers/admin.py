from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from dependencies import require_admin
from models.account import Account
from models.character import Character, CharacterStatus
from models.submission import Submission
from models.task import Task, TaskStatus
from schemas.task import TaskCreate, TaskOut

router = APIRouter()


class BanAction(BaseModel):
    banned: bool


@router.get("/tasks/pending", response_model=list[TaskOut])
async def list_pending_tasks(
    _: Account = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(
        select(Task).where(Task.status == TaskStatus.pending).order_by(Task.created_at)
    )
    tasks = result.scalars().all()
    return [
        TaskOut(
            id=t.id,
            title=t.title,
            description=t.description,
            point_value=t.point_value,
            level_required=t.level_required,
            status=t.status.value,
            created_by=t.created_by,
            primary_faction_slug=t.primary_faction_slug,
            is_task_vision_eligible=t.is_task_vision_eligible,
            created_at=t.created_at,
        )
        for t in tasks
    ]


@router.put("/tasks/{task_id}/approve", response_model=TaskOut)
async def approve_task(
    task_id: int,
    _: Account = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    task = await session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    if task.status != TaskStatus.pending:
        raise HTTPException(status_code=422, detail="Only pending tasks can be approved.")
    task.status = TaskStatus.active
    await session.commit()
    await session.refresh(task)
    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        point_value=task.point_value,
        level_required=task.level_required,
        status=task.status.value,
        created_by=task.created_by,
        primary_faction_slug=task.primary_faction_slug,
        is_task_vision_eligible=task.is_task_vision_eligible,
        created_at=task.created_at,
    )


@router.put("/tasks/{task_id}/retire", response_model=TaskOut)
async def retire_task(
    task_id: int,
    _: Account = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    task = await session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")
    if task.status != TaskStatus.active:
        raise HTTPException(status_code=422, detail="Only active tasks can be retired.")
    task.status = TaskStatus.retired
    await session.commit()
    await session.refresh(task)
    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        point_value=task.point_value,
        level_required=task.level_required,
        status=task.status.value,
        created_by=task.created_by,
        primary_faction_slug=task.primary_faction_slug,
        is_task_vision_eligible=task.is_task_vision_eligible,
        created_at=task.created_at,
    )


@router.delete("/submissions/{submission_id}", status_code=204)
async def delete_submission(
    submission_id: int,
    _: Account = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    sub = await session.get(Submission, submission_id)
    if sub is None:
        raise HTTPException(status_code=404, detail="Submission not found.")
    await session.delete(sub)
    await session.commit()


@router.post("/characters/{character_id}/ban", status_code=200)
async def ban_character(
    character_id: int,
    data: BanAction,
    _: Account = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    character = await session.get(Character, character_id)
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found.")
    character.status = CharacterStatus.banned if data.banned else CharacterStatus.active
    await session.commit()
    return {"character_id": character_id, "banned": data.banned}


@router.post("/tasks", response_model=TaskOut, status_code=201)
async def admin_create_task(
    data: TaskCreate,
    admin: Account = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    """Admin-only: create a task directly in active status."""
    result = await session.execute(
        select(Character)
        .where(
            Character.account_id == admin.id,
            Character.status == CharacterStatus.active,
        )
        .limit(1)
    )
    character = result.scalar_one_or_none()
    if character is None:
        raise HTTPException(status_code=422, detail="Admin must have an active character.")

    task = Task(
        title=data.title,
        description=data.description or "",
        point_value=data.point_value,
        level_required=data.level_required,
        primary_faction_slug=data.primary_faction_slug or "na",
        created_by=character.id,
        status=TaskStatus.active,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        point_value=task.point_value,
        level_required=task.level_required,
        status=task.status.value,
        created_by=task.created_by,
        primary_faction_slug=task.primary_faction_slug,
        is_task_vision_eligible=task.is_task_vision_eligible,
        created_at=task.created_at,
    )
