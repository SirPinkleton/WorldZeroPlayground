# DEPRECATED — use services/submission.py
# This file is a thin shim kept for backward compatibility while routers
# are updated in U.3. Do not add new logic here.
"""Backward-compat shim: re-exports from services/submission.py and bridges old interfaces."""

from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character
from models.praxis import Praxis
from models.submission import Submission, SubmissionType
from models.task import Task
from schemas.praxis import MediaItemOut, PraxisCreate, PraxisOut
from services.submission import (
    build_submission_out,
    create_solo_submission,
    edit_submission,
    flag_submission,
    resubmit_submission,
    withdraw_submission,
)


async def build_praxis_out(
    praxis: Praxis,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> PraxisOut:
    """Build PraxisOut from a legacy Praxis object. Used by old praxis router."""
    # The Praxis model is still in the DB during the migration period.
    # We build a SubmissionOut-compatible response manually from the Praxis fields.
    from services.scoring import (
        COLLABORATION_MODE_SOLO,
        compute_faction_multiplier,
        compute_praxis_score,
    )
    from models.meta_task import MetaTask, PraxisMetaTask
    from sqlalchemy import select
    from models.vote import Vote

    task = praxis.task
    score = 0.0
    if task is not None:
        character_faction_slug = praxis.character.faction_slug if praxis.character else "na"
        task_faction_slug = task.primary_faction_slug or "na"
        faction_multiplier = compute_faction_multiplier(
            character_faction_slug,
            task_faction_slug,
            era,
            collaboration_mode=COLLABORATION_MODE_SOLO,
        )
        total_stars = int(sum(vote.stars for vote in praxis.votes))
        score = compute_praxis_score(task.point_value, faction_multiplier, total_stars)

    media = [MediaItemOut.model_validate(item) for item in praxis.media_items]
    character_display_name = praxis.character.display_name if praxis.character else ""
    character_avatar_url = (praxis.character.avatar_url or None) if praxis.character else None
    task_title = praxis.task.title if praxis.task else ""
    task_point_value = praxis.task.point_value if praxis.task else 0
    task_faction_slug = praxis.task.primary_faction_slug if praxis.task else None

    return PraxisOut(
        id=praxis.id,
        submission_type="solo",
        task_id=praxis.task_id,
        character_id=praxis.character_id,
        character_display_name=character_display_name,
        character_avatar_url=character_avatar_url,
        task_title=task_title,
        task_point_value=task_point_value,
        task_faction_slug=task_faction_slug,
        title=praxis.title,
        body_text=praxis.body_text,
        moderation_status=praxis.moderation_status.value if hasattr(praxis.moderation_status, "value") else str(praxis.moderation_status),
        is_withdrawn=praxis.is_withdrawn,
        admin_note=praxis.admin_note,
        created_at=praxis.created_at,
        updated_at=praxis.updated_at,
        media=media,
        score=score,
    )


async def create_praxis(
    character: Character,
    task: Task,
    data: PraxisCreate,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Praxis:
    """DEPRECATED: Use create_solo_submission. Kept for router compatibility."""
    raise NotImplementedError(
        "create_praxis is deprecated. Use services/submission.py create_solo_submission."
    )


async def withdraw_praxis(
    praxis: Praxis,
    character: Character,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Praxis:
    """DEPRECATED: Use withdraw_submission."""
    raise NotImplementedError(
        "withdraw_praxis is deprecated. Use services/submission.py withdraw_submission."
    )


async def resubmit_praxis(
    praxis: Praxis,
    character: Character,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Praxis:
    """DEPRECATED: Use resubmit_submission."""
    raise NotImplementedError(
        "resubmit_praxis is deprecated. Use services/submission.py resubmit_submission."
    )


async def edit_praxis(
    praxis: Praxis,
    data: PraxisCreate,
    session: AsyncSession,
) -> Praxis:
    """DEPRECATED: Use edit_submission."""
    raise NotImplementedError(
        "edit_praxis is deprecated. Use services/submission.py edit_submission."
    )


async def flag_praxis(
    praxis: Praxis,
    flagged_by: Character,
    reason: str,
    session: AsyncSession,
) -> Praxis:
    """DEPRECATED: Use flag_submission."""
    raise NotImplementedError(
        "flag_praxis is deprecated. Use services/submission.py flag_submission."
    )


async def compute_praxis_score_from_db(
    praxis: Praxis,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> float:
    """DEPRECATED: Compute score from old Praxis model. Kept for router compat."""
    from services.scoring import (
        COLLABORATION_MODE_SOLO,
        compute_faction_multiplier,
        compute_praxis_score,
    )
    task = praxis.task
    if task is None:
        return 0.0
    character_faction_slug = praxis.character.faction_slug if praxis.character else "na"
    task_faction_slug = task.primary_faction_slug or "na"
    faction_multiplier = compute_faction_multiplier(
        character_faction_slug,
        task_faction_slug,
        era,
        collaboration_mode=COLLABORATION_MODE_SOLO,
    )
    total_stars = int(sum(vote.stars for vote in praxis.votes))
    return compute_praxis_score(task.point_value, faction_multiplier, total_stars)


__all__ = [
    "build_praxis_out",
    "compute_praxis_score_from_db",
    "create_praxis",
    "withdraw_praxis",
    "resubmit_praxis",
    "edit_praxis",
    "flag_praxis",
]
