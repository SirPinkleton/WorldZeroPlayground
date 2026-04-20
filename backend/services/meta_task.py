"""Shared metatask scoring helper.

A metatask is a Task row with ``task_type == TaskType.metatask``. Its
``point_value`` is the flat bonus added to any praxis it has been applied to
(subject to the viewing character's level meeting the metatask's
``level_required``). This helper centralises the lookup so scoring code in
``services.praxis`` and ``services.character_stats`` stays in sync.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.meta_task import PraxisMetaTask
from models.task import Task, TaskType


async def get_meta_task_points(
    praxis_id: int, character_level: int, session: AsyncSession
) -> int:
    """Return flat bonus points from metatask tasks attached to a praxis.

    A metatask is a Task row with ``task_type == TaskType.metatask``. Its flat
    bonus is ``task.point_value``. Applied only when the viewing character
    meets the metatask's own ``level_required``. Sums across every attached
    metatask; standard tasks should never be linked here (service guards
    prevent that) but are defensively skipped if encountered.
    """
    result = await session.execute(
        select(Task)
        .join(PraxisMetaTask, PraxisMetaTask.task_id == Task.id)
        .where(PraxisMetaTask.praxis_id == praxis_id)
    )
    total = 0
    for task in result.scalars().all():
        if task.task_type != TaskType.metatask:
            continue
        if character_level < task.level_required:
            continue
        total += int(task.point_value)
    return total
