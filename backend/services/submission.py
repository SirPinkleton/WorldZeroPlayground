"""Unified submission service replacing services/praxis.py and services/collaboration.py.

Handles all three submission types: solo, collaboration, and duel.
"""

from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character
from models.flag import Flag
from models.praxis import MediaItem, ModerationStatus
from models.submission import (
    CollabModeEnum,
    Submission,
    SubmissionInvite,
    SubmissionInviteStatus,
    SubmissionMember,
    SubmissionStatus,
    SubmissionType,
)
from models.task import CharacterTask, CharacterTaskStatus, Task
from models.vote import Vote
from schemas.submission import (
    DuelVoteSummary,
    MediaItemOut,
    SubmissionCardOut,
    SubmissionInviteOut,
    SubmissionMemberCardOut,
    SubmissionMemberOut,
    SubmissionOut,
)
from services.era import get_current_era_row, get_or_create_stats
from services.faction_service import check_and_deliver_invitations
from services.scoring import (
    COLLABORATION_MODE_COLLAB,
    COLLABORATION_MODE_DUEL,
    COLLABORATION_MODE_SOLO,
    compute_duel_multiplier,
    compute_faction_multiplier,
    compute_praxis_score,
)


DUEL_LEVEL_REQUIRED = 2
COLLABORATION_LEVEL_REQUIRED = 1
ANALOG_FACTION_SLUG = "analog"


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _build_member_out(member: SubmissionMember) -> SubmissionMemberOut:
    return SubmissionMemberOut(
        character_id=member.character_id,
        display_name=member.character.display_name,
        faction_slug=member.character.faction_slug,
        has_submitted=member.has_submitted,
        title=member.title,
        body_text=member.body_text,
        joined_at=member.joined_at,
    )


def _build_invite_out(invite: SubmissionInvite) -> SubmissionInviteOut:
    return SubmissionInviteOut(
        id=invite.id,
        submission_id=invite.submission_id,
        inviter_id=invite.inviter_id,
        inviter_display_name=invite.inviter.display_name,
        invitee_id=invite.invitee_id,
        invitee_display_name=invite.invitee.display_name,
        invite_type=invite.invite_type.value,
        status=invite.status.value,
        created_at=invite.created_at,
    )


async def _get_meta_task_points(
    submission_id: int, character_level: int, session: AsyncSession
) -> int:
    """Return flat bonus points from any meta task attached to a solo submission.

    Returns 0 if the character does not meet the meta task's level_required.
    """
    from models.meta_task import MetaTask, PraxisMetaTask

    result = await session.execute(
        select(PraxisMetaTask).where(PraxisMetaTask.submission_id == submission_id)
    )
    praxis_meta_task = result.scalar_one_or_none()
    if praxis_meta_task is None:
        return 0
    meta_task = await session.get(MetaTask, praxis_meta_task.meta_task_id)
    if meta_task is None:
        return 0
    if character_level < meta_task.level_required:
        return 0
    if meta_task.bonus_type.value == "flat":
        return int(meta_task.bonus_value)
    return 0


async def _get_duel_vote_totals(
    submission_id: int, session: AsyncSession
) -> dict[int, int]:
    """Return {character_id: total_stars} for all duel votes on a submission."""
    result = await session.execute(
        select(Vote.duel_vote_for, func.sum(Vote.stars)).where(
            Vote.submission_id == submission_id,
            Vote.duel_vote_for.is_not(None),
        ).group_by(Vote.duel_vote_for)
    )
    return {character_id: int(stars) for character_id, stars in result.all()}


async def _count_active_tasks(character_id: int, session: AsyncSession) -> int:
    """Count in-progress CharacterTask rows for capacity enforcement."""
    result = await session.execute(
        select(CharacterTask).where(
            CharacterTask.character_id == character_id,
            CharacterTask.status == CharacterTaskStatus.in_progress,
        )
    )
    return len(result.scalars().all())


async def _get_character_task(
    character_id: int, task_id: int, session: AsyncSession
) -> CharacterTask | None:
    result = await session.execute(
        select(CharacterTask).where(
            CharacterTask.character_id == character_id,
            CharacterTask.task_id == task_id,
            CharacterTask.status == CharacterTaskStatus.in_progress,
        )
    )
    return result.scalar_one_or_none()


# ---------------------------------------------------------------------------
# Score computation
# ---------------------------------------------------------------------------


async def compute_submission_score(
    submission: Submission,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> float:
    """Compute the score for a solo submission from current votes."""
    task = submission.task
    if task is None:
        return 0.0
    character_faction_slug = submission.character.faction_slug if submission.character else "na"
    task_faction_slug = task.primary_faction_slug or "na"
    faction_multiplier = compute_faction_multiplier(
        character_faction_slug,
        task_faction_slug,
        era,
        collaboration_mode=COLLABORATION_MODE_SOLO,
    )
    character_level = submission.character.level if submission.character else 0
    meta_task_points = await _get_meta_task_points(submission.id, character_level, session)
    total_stars = int(sum(vote.stars for vote in submission.votes))
    return compute_praxis_score(task.point_value, faction_multiplier, total_stars, meta_task_points)


# ---------------------------------------------------------------------------
# Build output objects
# ---------------------------------------------------------------------------


async def build_submission_out(
    submission: Submission,
    session: AsyncSession,
    viewer_character_id: int | None = None,
    era: EraConfig = CURRENT_ERA,
) -> SubmissionOut:
    """Build a SubmissionOut for any submission type.

    - Solo: populates character fields, score, media.
    - Collab/duel: populates members, invites (only if viewer is a member).
    """
    task_title = submission.task.title if submission.task else ""
    task_point_value = submission.task.point_value if submission.task else 0
    task_faction_slug = submission.task.primary_faction_slug if submission.task else None

    # Solo-specific
    character_id = None
    character_display_name = None
    character_avatar_url = None
    title = submission.title
    body_text = submission.body_text
    score = None
    media: list[MediaItemOut] = []

    # Collab/duel-specific
    collab_mode = None
    collab_status = None
    created_by_id = None
    collab_body_text = None
    members: list[SubmissionMemberOut] = []
    invites: list[SubmissionInviteOut] = []

    if submission.submission_type == SubmissionType.solo:
        character_id = submission.character_id
        character_display_name = submission.character.display_name if submission.character else ""
        character_avatar_url = (submission.character.avatar_url or None) if submission.character else None
        score = await compute_submission_score(submission, session, era)
        media = [MediaItemOut.model_validate(item) for item in submission.media_items]
    else:
        # Collaboration or duel
        collab_mode = submission.collab_mode.value if submission.collab_mode else None
        collab_status = submission.collab_status.value if submission.collab_status else None
        created_by_id = submission.created_by_id
        collab_body_text = submission.collab_body_text
        members = [_build_member_out(m) for m in submission.members]

        # Invites only visible to members
        member_ids = {m.character_id for m in submission.members}
        include_invites = viewer_character_id in member_ids if viewer_character_id else False
        if include_invites:
            invites = [_build_invite_out(i) for i in submission.invites]

    return SubmissionOut(
        id=submission.id,
        submission_type=submission.submission_type.value,
        task_id=submission.task_id,
        task_title=task_title,
        task_point_value=task_point_value,
        task_faction_slug=task_faction_slug,
        moderation_status=submission.moderation_status,
        is_withdrawn=submission.is_withdrawn,
        admin_note=submission.admin_note,
        created_at=submission.created_at,
        updated_at=submission.updated_at,
        character_id=character_id,
        character_display_name=character_display_name,
        character_avatar_url=character_avatar_url,
        title=title,
        body_text=body_text,
        score=score,
        media=media,
        collab_mode=collab_mode,
        collab_status=collab_status,
        created_by_id=created_by_id,
        collab_body_text=collab_body_text,
        members=members,
        invites=invites,
    )


def build_submission_card_out(
    submission: Submission,
    vote_totals: dict[int, int],
    vote_counts: dict[int, int],
) -> SubmissionCardOut:
    """Serialize a published collab/duel Submission for display on the listing page."""
    members_out = []
    for member in submission.members:
        total_stars = vote_totals.get(member.character_id, 0)
        count = vote_counts.get(member.character_id, 0)
        avg_score = round(total_stars / count, 1) if count > 0 else None
        members_out.append(
            SubmissionMemberCardOut(
                character_id=member.character_id,
                display_name=member.character.display_name,
                faction_slug=member.character.faction_slug,
                score=avg_score,
            )
        )
    return SubmissionCardOut(
        id=submission.id,
        task_id=submission.task_id,
        task_title=submission.task.title,
        task_faction_slug=submission.task.primary_faction_slug,
        submission_type=submission.submission_type.value,
        collab_mode=submission.collab_mode.value if submission.collab_mode else None,
        collab_status=submission.collab_status.value if submission.collab_status else None,
        created_at=submission.created_at,
        members=members_out,
    )


# ---------------------------------------------------------------------------
# CRUD — submission lifecycle
# ---------------------------------------------------------------------------


async def get_submission(submission_id: int, session: AsyncSession) -> Submission:
    """Fetch a submission by id, raising 404 if not found."""
    submission = await session.get(Submission, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found.")
    return submission


async def create_solo_submission(
    character: Character,
    task: Task,
    title: str,
    body_text: str | None,
    meta_task_id: int | None,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Submission:
    """Create a new solo submission. The character must be signed up for the task."""
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

    submission = Submission(
        submission_type=SubmissionType.solo,
        task_id=task.id,
        character_id=character.id,
        title=title,
        body_text=body_text or "",
        moderation_status="visible",
        is_withdrawn=False,
    )
    session.add(submission)
    character_task.status = CharacterTaskStatus.submitted
    await session.commit()
    await session.refresh(submission)

    if meta_task_id is not None:
        from models.meta_task import PraxisMetaTask
        session.add(PraxisMetaTask(submission_id=submission.id, meta_task_id=meta_task_id))
        await session.commit()

    from services.character_stats import recalculate_character_stats
    await recalculate_character_stats(character.id, session, era)
    await check_and_deliver_invitations(character, task, session)
    await session.commit()
    return submission


async def create_collab_submission(
    task_id: int,
    mode: str,
    character: Character,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Submission:
    """Create a new collaboration or duel submission.

    The initiating character automatically becomes the first member.
    Their existing CharacterTask row is reused (not replaced).
    """
    # Level gate
    era_row = await get_current_era_row(session)
    stats = await get_or_create_stats(session, character.id, era_row.id)
    level_required = DUEL_LEVEL_REQUIRED if mode == "duel" else COLLABORATION_LEVEL_REQUIRED
    if stats.level < level_required:
        raise HTTPException(
            status_code=403,
            detail=f"{'Duels' if mode == 'duel' else 'Collaborations'} require level {level_required}.",
        )

    # Validate mode
    try:
        collab_mode = CollabModeEnum(mode)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid mode '{mode}'. Use 'collaboration' or 'duel'.")

    # Character must have the task in-progress
    character_task = await _get_character_task(character.id, task_id, session)
    if character_task is None:
        raise HTTPException(
            status_code=400,
            detail="You must have this task in-progress before starting a collaboration.",
        )

    # Validate task exists
    task = await session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found.")

    submission_type = SubmissionType.duel if mode == "duel" else SubmissionType.collaboration

    submission = Submission(
        submission_type=submission_type,
        task_id=task_id,
        collab_mode=collab_mode,
        collab_status=SubmissionStatus.in_progress,
        collab_body_text="",
        created_by_id=character.id,
        moderation_status="visible",
        is_withdrawn=False,
    )
    session.add(submission)
    await session.flush()  # Get submission.id

    member = SubmissionMember(
        submission_id=submission.id,
        character_id=character.id,
        has_submitted=False,
    )
    session.add(member)
    await session.commit()
    await session.refresh(submission)
    return submission


async def edit_submission(
    submission_id: int,
    character: Character,
    title: str,
    body_text: str | None,
    session: AsyncSession,
) -> Submission:
    """Edit the title/body of a solo submission."""
    submission = await get_submission(submission_id, session)
    if submission.character_id != character.id:
        raise HTTPException(status_code=403, detail="Cannot edit another character's submission.")
    submission.title = title
    submission.body_text = body_text if body_text is not None else ""
    await session.commit()
    await session.refresh(submission)
    return submission


async def withdraw_submission(
    submission_id: int,
    character: Character,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Submission:
    """Withdraw a submitted solo submission back to editing state.

    Sets is_withdrawn=True, reverts CharacterTask status to in_progress,
    and recalculates stats so points/votes no longer count.
    """
    submission = await get_submission(submission_id, session)
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
    from services.character_stats import recalculate_character_stats
    await recalculate_character_stats(character.id, session, era)
    await session.commit()
    await session.refresh(submission)
    return submission


async def resubmit_submission(
    submission_id: int,
    character: Character,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Submission:
    """Resubmit a previously withdrawn solo submission.

    Clears is_withdrawn, sets CharacterTask status back to submitted,
    and recalculates stats so points/votes count again.
    """
    submission = await get_submission(submission_id, session)
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
    from services.character_stats import recalculate_character_stats
    await recalculate_character_stats(character.id, session, era)
    await session.commit()
    await session.refresh(submission)
    return submission


async def flag_submission(
    submission_id: int,
    flagged_by: Character,
    reason: str,
    session: AsyncSession,
) -> Submission:
    """Flag a submission for moderation review. Works for all submission types.

    Requires level 4 or above. Cannot flag your own submission.
    """
    submission = await get_submission(submission_id, session)

    era_row = await get_current_era_row(session)
    stats = await get_or_create_stats(session, flagged_by.id, era_row.id)

    if stats.level < 4:
        raise HTTPException(
            status_code=403,
            detail="Must be level 4 or above to flag a submission.",
        )

    # Determine owner id for anti-self-flag check
    owner_id = submission.character_id if submission.submission_type == SubmissionType.solo else submission.created_by_id
    if flagged_by.id == owner_id:
        raise HTTPException(status_code=403, detail="Cannot flag your own submission.")

    submission.moderation_status = ModerationStatus.flagged.value
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


async def list_submissions(
    session: AsyncSession,
    submission_type: str | None = None,
    task_id: int | None = None,
    character_id: int | None = None,
    moderation_status: str | None = None,
    is_flagged: bool | None = None,
    limit: int = 50,
    offset: int = 0,
) -> list[Submission]:
    """Query submissions with optional filters."""
    query = select(Submission)

    if submission_type is not None:
        try:
            type_enum = SubmissionType(submission_type)
            query = query.where(Submission.submission_type == type_enum)
        except ValueError:
            pass

    if moderation_status is not None:
        try:
            status_enum = ModerationStatus(moderation_status)
            query = query.where(Submission.moderation_status == status_enum.value)
        except ValueError:
            pass
    elif is_flagged:
        query = query.where(Submission.moderation_status == ModerationStatus.flagged.value)
    else:
        query = query.where(Submission.moderation_status != ModerationStatus.hidden.value)

    if task_id is not None:
        query = query.where(Submission.task_id == task_id)

    if character_id is not None:
        query = query.where(Submission.character_id == character_id)

    query = query.order_by(Submission.created_at.desc()).limit(limit).offset(offset)
    result = await session.execute(query)
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Collaboration/duel specific operations
# ---------------------------------------------------------------------------


async def invite_member(
    submission_id: int,
    inviter: Character,
    invitee_character_id: int,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> SubmissionInvite:
    """Send a collaboration or duel invite. The inviter must be a current member."""
    submission = await get_submission(submission_id, session)

    if submission.collab_status == SubmissionStatus.published:
        raise HTTPException(status_code=400, detail="Cannot invite to a published collaboration.")

    # Inviter must be a member
    member_ids = {m.character_id for m in submission.members}
    if inviter.id not in member_ids:
        raise HTTPException(status_code=403, detail="Only members can send invites.")

    # Duels: max 2 participants
    if submission.collab_mode == CollabModeEnum.duel and len(submission.members) >= 2:
        raise HTTPException(status_code=400, detail="Duels can only have 2 participants.")

    # Collaborations: max capacity from era config
    if len(submission.members) >= era.max_task_signups:
        raise HTTPException(status_code=400, detail="This collaboration is already at max capacity.")

    # Can't invite yourself
    if invitee_character_id == inviter.id:
        raise HTTPException(status_code=400, detail="Cannot invite yourself.")

    # Can't invite someone already in the collaboration
    if invitee_character_id in member_ids:
        raise HTTPException(status_code=409, detail="Player is already a member.")

    # Can't send a duplicate pending invite
    existing_invite = await session.execute(
        select(SubmissionInvite).where(
            SubmissionInvite.submission_id == submission_id,
            SubmissionInvite.inviter_id == inviter.id,
            SubmissionInvite.invitee_id == invitee_character_id,
            SubmissionInvite.status == SubmissionInviteStatus.pending,
        )
    )
    if existing_invite.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=409,
            detail="A pending invite already exists. Resolve it before sending another.",
        )

    invitee = await session.get(Character, invitee_character_id)
    if invitee is None:
        raise HTTPException(status_code=404, detail="Invitee not found.")

    # Eligibility check: skip for Analog faction (they can redo tasks via Double Dipper)
    if invitee.faction_slug != ANALOG_FACTION_SLUG:
        existing_solo_result = await session.execute(
            select(Submission).where(
                Submission.submission_type == SubmissionType.solo,
                Submission.character_id == invitee_character_id,
                Submission.task_id == submission.task_id,
                Submission.is_withdrawn == False,
            )
        )
        if existing_solo_result.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=409,
                detail="This player has already submitted proof for this task and is not eligible to be invited.",
            )

        existing_collab_result = await session.execute(
            select(SubmissionMember)
            .join(Submission, SubmissionMember.submission_id == Submission.id)
            .where(
                SubmissionMember.character_id == invitee_character_id,
                Submission.task_id == submission.task_id,
                Submission.collab_status == SubmissionStatus.published,
            )
        )
        if existing_collab_result.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=409,
                detail="This player has already completed this task in a collaboration and is not eligible to be invited.",
            )

    invite = SubmissionInvite(
        submission_id=submission_id,
        inviter_id=inviter.id,
        invitee_id=invitee_character_id,
        invite_type=submission.collab_mode,
        status=SubmissionInviteStatus.pending,
    )
    session.add(invite)
    await session.commit()
    await session.refresh(invite)
    return invite


async def respond_to_invite(
    invite_id: int,
    character: Character,
    accept: bool,
    drop_task_id: int | None,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Submission:
    """Accept or decline a collaboration invite.

    If accepting with a full task list (era.max_task_signups tasks), the caller
    must supply drop_task_id — a task to drop before joining. Returns 409 if the
    list is full and no drop_task_id was provided.

    For duel challenges: if the invitee already has the task as an in-progress
    solo submission, accepting withdraws that submission.
    """
    invite = await session.get(SubmissionInvite, invite_id)
    if invite is None:
        raise HTTPException(status_code=404, detail="Invite not found.")

    if invite.invitee_id != character.id:
        raise HTTPException(status_code=403, detail="This invite is not for you.")

    if invite.status != SubmissionInviteStatus.pending:
        raise HTTPException(status_code=400, detail="Invite has already been resolved.")

    if not accept:
        invite.status = SubmissionInviteStatus.declined
        await session.commit()
        submission = await session.get(Submission, invite.submission_id)
        return submission

    submission = await session.get(Submission, invite.submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Collaboration no longer exists.")

    if submission.collab_status == SubmissionStatus.published:
        raise HTTPException(status_code=400, detail="Cannot join a published collaboration.")

    # Check task list capacity
    active_count = await _count_active_tasks(character.id, session)
    existing_task = await _get_character_task(character.id, submission.task_id, session)
    will_add_task = existing_task is None

    if will_add_task and active_count >= era.max_task_signups:
        if drop_task_id is None:
            raise HTTPException(
                status_code=409,
                detail=f"Task list is full ({era.max_task_signups} tasks). Provide drop_task_id to drop a task and accept.",
            )
        # Drop the specified task
        task_to_drop = await _get_character_task(character.id, drop_task_id, session)
        if task_to_drop is None:
            raise HTTPException(
                status_code=400,
                detail="The task you want to drop is not in your in-progress list.",
            )
        task_to_drop.status = CharacterTaskStatus.abandoned
        await session.flush()

    # For duels: if the invitee already has this task as an in-progress solo submission, withdraw it
    if submission.collab_mode == CollabModeEnum.duel and existing_task is not None:
        existing_solo_result = await session.execute(
            select(Submission).where(
                Submission.submission_type == SubmissionType.solo,
                Submission.character_id == character.id,
                Submission.task_id == submission.task_id,
                Submission.is_withdrawn == False,
            )
        )
        existing_solo = existing_solo_result.scalar_one_or_none()
        if existing_solo is not None:
            existing_solo.is_withdrawn = True
            await session.flush()

    # Add CharacterTask if not already present
    if will_add_task:
        new_task = CharacterTask(
            character_id=character.id,
            task_id=submission.task_id,
            status=CharacterTaskStatus.in_progress,
        )
        session.add(new_task)
        await session.flush()

    # Add member
    member = SubmissionMember(
        submission_id=submission.id,
        character_id=character.id,
        has_submitted=False,
    )
    session.add(member)

    invite.status = SubmissionInviteStatus.accepted
    await session.commit()
    await session.refresh(submission)
    return submission


async def submit_for_member(
    submission_id: int,
    character: Character,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Submission:
    """Mark this member as having submitted. Publishes when all members have submitted."""
    submission = await get_submission(submission_id, session)

    member_ids = {m.character_id for m in submission.members}
    if character.id not in member_ids:
        raise HTTPException(status_code=403, detail="You are not a member of this collaboration.")

    # Mark this member submitted
    for member in submission.members:
        if member.character_id == character.id:
            member.has_submitted = True
            break

    await session.flush()

    # Reload to check if all are submitted
    await session.refresh(submission)
    if all(m.has_submitted for m in submission.members):
        submission.collab_status = SubmissionStatus.published
        await session.flush()
        # Award base points to each member
        from services.character_stats import recalculate_character_stats
        for member in submission.members:
            await recalculate_character_stats(member.character_id, session, era)

    await session.commit()
    await session.refresh(submission)
    return submission


async def reopen_submission(
    submission_id: int,
    character: Character,
    session: AsyncSession,
) -> Submission:
    """Reset all submit states; reopen for editing. Any member can trigger this."""
    submission = await get_submission(submission_id, session)

    member_ids = {m.character_id for m in submission.members}
    if character.id not in member_ids:
        raise HTTPException(status_code=403, detail="You are not a member of this collaboration.")

    submission.collab_status = SubmissionStatus.in_progress
    for member in submission.members:
        member.has_submitted = False

    await session.commit()
    await session.refresh(submission)
    return submission


async def kick_member(
    submission_id: int,
    kicker: Character,
    kickee_character_id: int,
    session: AsyncSession,
) -> Submission:
    """Remove a member from the collaboration. Any member can kick any other member.

    - Kicked member's CharacterTask is abandoned (they lose the task and progress).
    - Their contributed body_text content remains in the shared document.
    - All submission states reset.
    """
    submission = await get_submission(submission_id, session)

    member_ids = {m.character_id for m in submission.members}
    if kicker.id not in member_ids:
        raise HTTPException(status_code=403, detail="You are not a member of this collaboration.")

    if kickee_character_id not in member_ids:
        raise HTTPException(status_code=400, detail="Target player is not a member.")

    if kickee_character_id == kicker.id:
        raise HTTPException(status_code=400, detail="Cannot kick yourself. Use /edit to leave.")

    # Remove the member record
    kickee_member_result = await session.execute(
        select(SubmissionMember).where(
            SubmissionMember.submission_id == submission_id,
            SubmissionMember.character_id == kickee_character_id,
        )
    )
    kickee_member = kickee_member_result.scalar_one_or_none()
    if kickee_member:
        await session.delete(kickee_member)

    # Abandon the kicked member's CharacterTask
    kickee_task = await _get_character_task(kickee_character_id, submission.task_id, session)
    if kickee_task:
        kickee_task.status = CharacterTaskStatus.abandoned

    # Reset all submit states
    for member in submission.members:
        if member.character_id != kickee_character_id:
            member.has_submitted = False
    submission.collab_status = SubmissionStatus.in_progress

    await session.commit()
    await session.refresh(submission)
    return submission


async def update_document(
    submission_id: int,
    character: Character,
    body_text: str,
    session: AsyncSession,
) -> Submission:
    """Update the shared document. Any member can edit at any time.

    Editing a published submission reopens it (resets all submit states).
    """
    submission = await get_submission(submission_id, session)

    member_ids = {m.character_id for m in submission.members}
    if character.id not in member_ids:
        raise HTTPException(status_code=403, detail="Only members can edit the document.")

    submission.collab_body_text = body_text

    # Editing a published collab reopens it
    if submission.collab_status == SubmissionStatus.published:
        submission.collab_status = SubmissionStatus.in_progress
        for member in submission.members:
            member.has_submitted = False

    await session.commit()
    await session.refresh(submission)
    return submission


async def update_member_content(
    submission_id: int,
    character: Character,
    title: str,
    body_text: str | None,
    session: AsyncSession,
) -> Submission:
    """Update the current member's individual title and body content."""
    submission = await get_submission(submission_id, session)

    member_ids = {m.character_id for m in submission.members}
    if character.id not in member_ids:
        raise HTTPException(status_code=403, detail="You are not a member of this collaboration.")

    if submission.collab_status == SubmissionStatus.published:
        raise HTTPException(
            status_code=400,
            detail="Cannot edit content in a published collaboration. Reopen it first.",
        )

    for member in submission.members:
        if member.character_id == character.id:
            member.title = title
            member.body_text = body_text
            break

    await session.commit()
    await session.refresh(submission)
    return submission


async def list_published_submissions(
    session: AsyncSession,
) -> list[SubmissionCardOut]:
    """Return all published collaborations and duels for the praxis listing page."""
    result = await session.execute(
        select(Submission).where(
            Submission.collab_status == SubmissionStatus.published,
            Submission.submission_type.in_([SubmissionType.collaboration, SubmissionType.duel]),
        )
    )
    submissions = result.scalars().all()

    if not submissions:
        return []

    submission_ids = [s.id for s in submissions]

    # Fetch vote totals and counts per (submission_id, target_character)
    votes_result = await session.execute(
        select(
            Vote.submission_id,
            Vote.duel_vote_for,
            func.sum(Vote.stars).label("total_stars"),
            func.count(Vote.id).label("vote_count"),
        ).where(
            Vote.submission_id.in_(submission_ids),
            Vote.duel_vote_for.is_not(None),
        ).group_by(Vote.submission_id, Vote.duel_vote_for)
    )

    # Map: submission_id -> {char_id -> (total_stars, count)}
    votes_by_submission: dict[int, dict[int, tuple[int, int]]] = {}
    for submission_id, char_id, total_stars, vote_count in votes_result.all():
        votes_by_submission.setdefault(submission_id, {})[char_id] = (int(total_stars), int(vote_count))

    cards = []
    for submission in submissions:
        char_votes = votes_by_submission.get(submission.id, {})
        vote_totals = {char_id: data[0] for char_id, data in char_votes.items()}
        vote_counts = {char_id: data[1] for char_id, data in char_votes.items()}
        cards.append(build_submission_card_out(submission, vote_totals, vote_counts))

    return cards


async def get_submission_vote_summary(
    submission_id: int,
    session: AsyncSession,
) -> list[DuelVoteSummary]:
    """Return live vote tally per player for a duel, with current winner indicated."""
    submission = await get_submission(submission_id, session)

    if submission.collab_mode != CollabModeEnum.duel:
        raise HTTPException(status_code=400, detail="Vote summaries are only available for duels.")

    # Sum stars per target player
    result = await session.execute(
        select(Vote.duel_vote_for, func.sum(Vote.stars)).where(
            Vote.submission_id == submission_id,
            Vote.duel_vote_for.is_not(None),
        ).group_by(Vote.duel_vote_for)
    )
    vote_totals: dict[int, int] = {char_id: int(stars) for char_id, stars in result.all()}

    member_stars_list = [(m.character_id, vote_totals.get(m.character_id, 0)) for m in submission.members]
    max_stars = max((stars for _, stars in member_stars_list), default=0)

    summaries = []
    for member in submission.members:
        stars = vote_totals.get(member.character_id, 0)
        # "Winning" means highest stars. Ties show both as winning.
        is_winning = stars == max_stars and max_stars > 0
        summaries.append(
            DuelVoteSummary(
                character_id=member.character_id,
                display_name=member.character.display_name,
                total_stars=stars,
                is_winning=is_winning,
            )
        )

    return summaries
