from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character
from models.task import CharacterTask, CharacterTaskStatus, Task, TaskStatus
from schemas.task import TaskCreate


async def signup_for_task(
    character: Character,
    task: Task,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> CharacterTask:
    if character.level < task.level_required:
        raise HTTPException(
            status_code=403,
            detail=f"Task requires level {task.level_required}; your character is level {character.level}.",
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
    if character.level < 3:
        raise HTTPException(
            status_code=403,
            detail="Must be level 3 or above to propose tasks.",
        )

    task = Task(
        title=data.title,
        description=data.description,
        point_value=data.point_value,
        level_required=data.level_required,
        primary_faction_slug=data.primary_faction_slug,
        created_by=character.id,
        status=TaskStatus.pending,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
