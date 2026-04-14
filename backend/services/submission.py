from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character
from models.flag import Flag
from models.submission import CollaborationMode, InviteStatus, MediaItem, ModerationStatus, Submission
from models.task import CharacterTask, CharacterTaskStatus, Task
from models.vote import Vote
from schemas.submission import MediaItemOut, SubmissionCreate, SubmissionOut
from services.character_stats import recalculate_character_stats
from services.era import get_current_era_row, get_or_create_stats
from services.faction_service import check_and_deliver_invitations
from services.scoring import compute_faction_multiplier, compute_submission_score


async def create_submission(
    character: Character,
    task: Task,
    data: SubmissionCreate,
    session: AsyncSession,
) -> Submission:
    character_task_result = await session.execute(
        select(CharacterTask).where(
            CharacterTask.character_id == character.id,
            CharacterTask.task_id == task.id,
            CharacterTask.status != CharacterTaskStatus.abandoned,
        )
    )
    character_task = character_task_result.scalar_one_or_none()
    if character_task is None:
        raise HTTPException(status_code=403, detail="Must be signed up for this task to submit proof.")

    collab_mode = CollaborationMode(data.collaboration_mode or "solo")
    partner_id = data.partner_character_id

    if collab_mode != CollaborationMode.solo:
        if partner_id is None:
            raise HTTPException(status_code=422, detail="Partner character required for collab/duel mode.")
        if partner_id == character.id:
            raise HTTPException(status_code=422, detail="Cannot partner with yourself.")
        partner = await session.get(Character, partner_id)
        if partner is None:
            raise HTTPException(status_code=404, detail="Partner character not found.")

    invite_status = InviteStatus.pending if collab_mode != CollaborationMode.solo else None

    submission = Submission(
        task_id=task.id,
        character_id=character.id,
        title=data.title,
        body_text=data.body_text or "",
        collaboration_mode=collab_mode,
        partner_character_id=partner_id,
        invite_status=invite_status,
    )
    session.add(submission)
    character_task.status = CharacterTaskStatus.submitted
    await session.commit()
    await session.refresh(submission)
    await recalculate_character_stats(character.id, session)
    await check_and_deliver_invitations(character, task, session)
    await session.commit()
    return submission


async def withdraw_submission(
    submission: Submission,
    character: Character,
    session: AsyncSession,
) -> Submission:
    """Withdraw a submitted praxis back to editing state.

    Sets is_withdrawn=True, reverts CharacterTask status to in_progress,
    and recalculates stats so points/votes no longer count.
    """
    if submission.character_id != character.id:
        raise HTTPException(status_code=403, detail="Cannot withdraw another character's submission.")
    if submission.is_withdrawn:
        raise HTTPException(status_code=422, detail="Submission is already withdrawn.")

    submission.is_withdrawn = True

    character_task_result = await session.execute(
        select(CharacterTask).where(
            CharacterTask.character_id == character.id,
            CharacterTask.task_id == submission.task_id,
            CharacterTask.status == CharacterTaskStatus.submitted,
        )
    )
    character_task = character_task_result.scalar_one_or_none()
    if character_task is not None:
        character_task.status = CharacterTaskStatus.in_progress

    await session.commit()
    await recalculate_character_stats(character.id, session)
    await session.commit()
    await session.refresh(submission)
    return submission


async def resubmit_submission(
    submission: Submission,
    character: Character,
    session: AsyncSession,
) -> Submission:
    """Resubmit a previously withdrawn praxis.

    Clears is_withdrawn, sets CharacterTask status back to submitted,
    and recalculates stats so points/votes count again.
    """
    if submission.character_id != character.id:
        raise HTTPException(status_code=403, detail="Cannot resubmit another character's submission.")
    if not submission.is_withdrawn:
        raise HTTPException(status_code=422, detail="Submission is not withdrawn.")

    submission.is_withdrawn = False

    character_task_result = await session.execute(
        select(CharacterTask).where(
            CharacterTask.character_id == character.id,
            CharacterTask.task_id == submission.task_id,
            CharacterTask.status == CharacterTaskStatus.in_progress,
        )
    )
    character_task = character_task_result.scalar_one_or_none()
    if character_task is not None:
        character_task.status = CharacterTaskStatus.submitted

    await session.commit()
    await recalculate_character_stats(character.id, session)
    await session.commit()
    await session.refresh(submission)
    return submission


async def edit_submission(
    submission: Submission,
    data: SubmissionCreate,
    session: AsyncSession,
) -> Submission:
    for field, value in data.model_dump(exclude_unset=True, exclude={"task_id"}).items():
        if value is None:
            value = ""
        setattr(submission, field, value)
    await session.commit()
    await session.refresh(submission)
    return submission


async def flag_submission(
    submission: Submission,
    flagged_by: Character,
    reason: str,
    session: AsyncSession,
) -> Submission:
    era_row = await get_current_era_row(session)
    stats = await get_or_create_stats(session, flagged_by.id, era_row.id)

    if stats.level < 4:
        raise HTTPException(
            status_code=403,
            detail="Must be level 4 or above to flag submissions.",
        )
    if flagged_by.id == submission.character_id:
        raise HTTPException(status_code=403, detail="Cannot flag your own submission.")

    submission.moderation_status = ModerationStatus.flagged
    submission.flagged_at = datetime.now(timezone.utc)

    flag = Flag(
        submission_id=submission.id,
        flagged_by=flagged_by.id,
        reason=reason or "",
    )
    session.add(flag)
    await session.commit()
    await session.refresh(submission)
    return submission


async def accept_invite(
    submission_id: int,
    character_id: int,
    session: AsyncSession,
) -> Submission:
    """Partner accepts a collab/duel invite."""
    submission = await session.get(Submission, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found.")
    if submission.partner_character_id != character_id:
        raise HTTPException(status_code=403, detail="Only the invited partner can accept.")
    if submission.invite_status != InviteStatus.pending:
        raise HTTPException(status_code=422, detail="Invite is no longer pending.")

    submission.invite_status = InviteStatus.accepted
    await session.commit()
    await session.refresh(submission)
    return submission


async def decline_invite(
    submission_id: int,
    character_id: int,
    session: AsyncSession,
) -> Submission:
    """Partner declines a collab/duel invite."""
    submission = await session.get(Submission, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found.")
    if submission.partner_character_id != character_id:
        raise HTTPException(status_code=403, detail="Only the invited partner can decline.")
    if submission.invite_status != InviteStatus.pending:
        raise HTTPException(status_code=422, detail="Invite is no longer pending.")

    submission.invite_status = InviteStatus.declined
    await session.commit()
    await session.refresh(submission)
    return submission


async def compute_submission_score_from_db(
    submission: Submission,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> float:
    task = await session.get(Task, submission.task_id)
    if task is None:
        return 0.0
    author = await session.get(Character, submission.character_id)
    character_faction_slug = author.faction_slug if author else "na"
    task_faction_slug = task.primary_faction_slug or "na"
    faction_multiplier = compute_faction_multiplier(
        character_faction_slug,
        task_faction_slug,
        era,
        collaboration_mode=submission.collaboration_mode.value,
    )
    sum_result = await session.execute(
        select(func.sum(Vote.stars)).where(Vote.submission_id == submission.id)
    )
    total_stars = int(sum_result.scalar_one_or_none() or 0)
    return compute_submission_score(task.point_value, faction_multiplier, total_stars)


async def build_submission_out(
    submission: Submission, session: AsyncSession
) -> SubmissionOut:
    """Build a complete SubmissionOut with all joined fields (task, character, media, score)."""
    score = await compute_submission_score_from_db(submission, session)
    media_result = await session.execute(
        select(MediaItem)
        .where(MediaItem.submission_id == submission.id)
        .order_by(MediaItem.display_order)
    )
    media = [MediaItemOut.model_validate(item) for item in media_result.scalars().all()]

    character = await session.get(Character, submission.character_id)
    character_display_name = character.display_name if character else ""

    task = await session.get(Task, submission.task_id)
    task_title = task.title if task else ""
    task_point_value = task.point_value if task else 0
    task_faction_slug = task.primary_faction_slug if task else None

    partner_display_name = None
    if submission.partner_character_id:
        partner = await session.get(Character, submission.partner_character_id)
        partner_display_name = partner.display_name if partner else None

    invite_status_value = None
    if submission.invite_status is not None:
        invite_status_value = (
            submission.invite_status.value
            if hasattr(submission.invite_status, "value")
            else str(submission.invite_status)
        )

    return SubmissionOut(
        id=submission.id,
        task_id=submission.task_id,
        character_id=submission.character_id,
        character_display_name=character_display_name,
        task_title=task_title,
        task_point_value=task_point_value,
        task_faction_slug=task_faction_slug,
        title=submission.title,
        body_text=submission.body_text,
        moderation_status=submission.moderation_status.value,
        is_withdrawn=submission.is_withdrawn,
        admin_note=submission.admin_note,
        collaboration_mode=submission.collaboration_mode.value,
        partner_character_id=submission.partner_character_id,
        partner_display_name=partner_display_name,
        invite_status=invite_status_value,
        created_at=submission.created_at,
        updated_at=submission.updated_at,
        media=media,
        score=score,
    )
