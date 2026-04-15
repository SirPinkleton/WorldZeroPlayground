from typing import Optional

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character
from models.faction import Faction, FactionStatus
from models.task import CharacterTask, CharacterTaskStatus, Task, TaskStatus
from schemas.task import TaskCreate, TaskOut
from services.era import get_current_era_row, get_or_create_stats

JOURNEYMEN_FACTION_SLUG: str = "journeymen"
ALBESCENT_FACTION_SLUG: str = "albescent"


async def signup_for_task(
    character: Character,
    task: Task,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> CharacterTask:
    era_row = await get_current_era_row(session)
    stats = await get_or_create_stats(session, character.id, era_row.id)

    if stats.level < task.level_required:
        raise HTTPException(
            status_code=403,
            detail=f"Task requires level {task.level_required}; your character is level {stats.level}.",
        )

    # Retired tasks are only accessible to Journeymen/Albescent with Task Vision
    if task.status == TaskStatus.retired:
        has_task_vision = character.faction_slug in (
            JOURNEYMEN_FACTION_SLUG,
            ALBESCENT_FACTION_SLUG,
        )
        if not (task.is_task_vision_eligible and has_task_vision):
            raise HTTPException(
                status_code=403,
                detail="This task is retired and not available to your faction.",
            )

    result = await session.execute(
        select(func.count()).select_from(CharacterTask).where(
            CharacterTask.character_id == character.id,
            CharacterTask.status == CharacterTaskStatus.in_progress,
        )
    )
    active_count = result.scalar_one()
    if active_count >= era.max_task_signups:
        raise HTTPException(
            status_code=403,
            detail=f"Cannot sign up for more than {era.max_task_signups} tasks at once.",
        )

    # Check not already signed up
    existing = await session.execute(
        select(CharacterTask).where(
            CharacterTask.character_id == character.id,
            CharacterTask.task_id == task.id,
            CharacterTask.status == CharacterTaskStatus.in_progress,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Already signed up for this task.")

    character_task = CharacterTask(
        character_id=character.id,
        task_id=task.id,
        status=CharacterTaskStatus.in_progress,
    )
    session.add(character_task)
    await session.commit()
    await session.refresh(character_task)
    return character_task


async def drop_task(character_task: CharacterTask, session: AsyncSession) -> None:
    character_task.status = CharacterTaskStatus.abandoned
    await session.commit()


async def propose_task(
    character: Character,
    data: TaskCreate,
    session: AsyncSession,
) -> Task:
    era_row = await get_current_era_row(session)
    stats = await get_or_create_stats(session, character.id, era_row.id)

    if stats.level < 3:
        raise HTTPException(
            status_code=403,
            detail="Must be level 3 or above to propose tasks.",
        )

    task = Task(
        title=data.title,
        description=data.description or "",
        point_value=data.point_value,
        level_required=data.level_required,
        primary_faction_slug=data.primary_faction_slug or "na",
        created_by=character.id,
        status=TaskStatus.pending,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


def build_task_out(task: Task) -> TaskOut:
    """Convert a Task ORM instance to a TaskOut schema."""
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


async def list_tasks(
    session: AsyncSession,
    *,
    status: Optional[str] = None,
    level: Optional[int] = None,
    faction: Optional[str] = None,
    min_points: Optional[int] = None,
    max_points: Optional[int] = None,
    exclude_character_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Task]:
    """Query tasks with optional filters, excluding hidden-faction tasks."""
    # Collect hidden faction slugs to exclude their tasks
    hidden_result = await session.execute(
        select(Faction.slug).where(Faction.status != FactionStatus.visible)
    )
    hidden_slugs = [row[0] for row in hidden_result.all()]

    query = select(Task)

    if status and status != "all":
        try:
            query = query.where(Task.status == TaskStatus[status])
        except KeyError:
            raise HTTPException(status_code=422, detail=f"Invalid status: {status}")
    elif not status:
        query = query.where(Task.status == TaskStatus.active)
    # status == "all" -> no status filter, return tasks of every status

    if level is not None:
        query = query.where(Task.level_required >= level)
    if faction:
        query = query.where(Task.primary_faction_slug == faction)
    if min_points is not None:
        query = query.where(Task.point_value >= min_points)
    if max_points is not None:
        query = query.where(Task.point_value <= max_points)

    # Exclude tasks from hidden/deprecated factions
    if hidden_slugs:
        query = query.where(Task.primary_faction_slug.notin_(hidden_slugs))

    # Exclude tasks the character has already signed up for or completed
    if exclude_character_id is not None:
        active_task_ids = select(CharacterTask.task_id).where(
            CharacterTask.character_id == exclude_character_id,
            CharacterTask.status.in_([CharacterTaskStatus.in_progress, CharacterTaskStatus.submitted]),
        )
        query = query.where(Task.id.notin_(active_task_ids))

    query = query.order_by(Task.level_required.asc(), Task.point_value.desc()).limit(limit).offset(offset)
    result = await session.execute(query)
    return list(result.scalars().all())
