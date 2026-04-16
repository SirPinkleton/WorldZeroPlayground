"""Unified submissions router.

Serves all submission types (solo, collaboration, duel) under /submissions.
Replaces /praxes and /collaborations routers introduced in U.1/U.2.
"""

import logging
import os
import re
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from db import get_db
from dependencies import get_current_character
from game_config import CURRENT_ERA
from models.character import Character
from models.praxis import MediaItem, MediaType, ModerationStatus
from models.submission import Submission, SubmissionType
from schemas.submission import (
    DuelVoteSummary,
    InviteResponse,
    MediaItemOut,
    SubmissionCardOut,
    SubmissionCreate,
    SubmissionDocumentUpdate,
    SubmissionInviteCreate,
    SubmissionInviteOut,
    SubmissionMemberContentUpdate,
    SubmissionOut,
    SubmissionUpdate,
    SubmissionVoteIn,
)
from schemas.vote import VoteOut
from services.submission import (
    build_submission_out,
    create_collab_submission,
    create_solo_submission,
    edit_submission,
    flag_submission,
    get_submission_vote_summary,
    invite_member,
    kick_member,
    list_published_submissions,
    list_submissions,
    reopen_submission,
    resubmit_submission,
    respond_to_invite,
    submit_for_member,
    update_document,
    update_member_content,
    withdraw_submission,
)
from services.vote import cast_or_update_duel_vote, cast_or_update_vote

logger = logging.getLogger(__name__)

router = APIRouter()


# ---------------------------------------------------------------------------
# List / detail
# ---------------------------------------------------------------------------


@router.get("", response_model=list[SubmissionOut] | list[SubmissionCardOut])
async def list_submissions_route(
    type: Optional[str] = None,
    task_id: Optional[int] = None,
    character_id: Optional[int] = None,
    moderation_status: Optional[str] = None,
    is_flagged: Optional[bool] = None,
    sort: Optional[str] = "recent",
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_db),
):
    """List submissions with optional type filter.

    - ?type=solo       → solo submissions only (returns SubmissionOut list)
    - ?type=collab     → collaborations only
    - ?type=duel       → duels only
    - ?type=published  → published collab/duel cards (returns SubmissionCardOut list)
    - (no type)        → all non-hidden submissions
    """
    if type == "published":
        return await list_published_submissions(session)

    # Normalise short alias → canonical SubmissionType value
    type_filter = type
    if type_filter == "collab":
        type_filter = "collaboration"

    submissions = await list_submissions(
        session=session,
        submission_type=type_filter,
        task_id=task_id,
        character_id=character_id,
        moderation_status=moderation_status,
        is_flagged=is_flagged,
        limit=limit,
        offset=offset,
    )
    return [await build_submission_out(submission, session) for submission in submissions]


@router.get("/{submission_id}", response_model=SubmissionOut)
async def get_submission_route(
    submission_id: int,
    character: Optional[Character] = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await session.get(Submission, submission_id)
    if submission is None or submission.moderation_status == ModerationStatus.hidden.value:
        raise HTTPException(status_code=404, detail="Submission not found.")
    viewer_id = character.id if character else None
    return await build_submission_out(submission, session, viewer_character_id=viewer_id)


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


@router.post("", response_model=SubmissionOut, status_code=201)
async def create_submission_route(
    data: SubmissionCreate,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    """Create a new submission.

    Body must include ``submission_type``:
    - ``"solo"``          → requires ``task_id``, ``title``, optional ``body_text`` / ``meta_task_id``
    - ``"collaboration"`` → requires ``task_id``; ``collab_mode`` must be ``"collaboration"``
    - ``"duel"``          → requires ``task_id``; ``collab_mode`` must be ``"duel"``
    """
    if data.submission_type == SubmissionType.solo.value:
        from models.task import Task
        from models.meta_task import MetaTask, PraxisMetaTask

        task = await session.get(Task, data.task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found.")

        if not data.title:
            raise HTTPException(status_code=422, detail="title is required for solo submissions.")

        submission = await create_solo_submission(
            character=character,
            task=task,
            title=data.title,
            body_text=data.body_text,
            meta_task_id=data.meta_task_id,
            session=session,
            era=CURRENT_ERA,
        )

    elif data.submission_type in (SubmissionType.collaboration.value, SubmissionType.duel.value):
        collab_mode = data.collab_mode or data.submission_type
        submission = await create_collab_submission(
            task_id=data.task_id,
            mode=collab_mode,
            character=character,
            session=session,
            era=CURRENT_ERA,
        )

    else:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid submission_type '{data.submission_type}'. Use 'solo', 'collaboration', or 'duel'.",
        )

    return await build_submission_out(submission, session, viewer_character_id=character.id)


# ---------------------------------------------------------------------------
# Edit / lifecycle (solo)
# ---------------------------------------------------------------------------


@router.put("/{submission_id}", response_model=SubmissionOut)
async def edit_submission_route(
    submission_id: int,
    data: SubmissionUpdate,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await edit_submission(
        submission_id=submission_id,
        character=character,
        title=data.title,
        body_text=data.body_text,
        session=session,
    )
    return await build_submission_out(submission, session, viewer_character_id=character.id)


@router.post("/{submission_id}/withdraw", response_model=SubmissionOut)
async def withdraw_submission_route(
    submission_id: int,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await withdraw_submission(
        submission_id=submission_id,
        character=character,
        session=session,
        era=CURRENT_ERA,
    )
    return await build_submission_out(submission, session, viewer_character_id=character.id)


@router.post("/{submission_id}/resubmit", response_model=SubmissionOut)
async def resubmit_submission_route(
    submission_id: int,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await resubmit_submission(
        submission_id=submission_id,
        character=character,
        session=session,
        era=CURRENT_ERA,
    )
    return await build_submission_out(submission, session, viewer_character_id=character.id)


@router.post("/{submission_id}/flag", response_model=SubmissionOut)
async def flag_submission_route(
    submission_id: int,
    reason: str,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await flag_submission(
        submission_id=submission_id,
        flagged_by=character,
        reason=reason,
        session=session,
    )
    return await build_submission_out(submission, session, viewer_character_id=character.id)


# ---------------------------------------------------------------------------
# Media (solo)
# ---------------------------------------------------------------------------


@router.post("/{submission_id}/media", response_model=MediaItemOut, status_code=201)
async def upload_media_route(
    submission_id: int,
    file: UploadFile = File(...),
    display_order: int = Form(0),
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await session.get(Submission, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found.")
    if submission.character_id != character.id:
        raise HTTPException(status_code=403, detail="Cannot add media to another character's submission.")

    content_type = file.content_type or ""
    if content_type.startswith("image/"):
        media_type = MediaType.image
    elif content_type.startswith("video/"):
        media_type = MediaType.video
    elif content_type.startswith("audio/"):
        media_type = MediaType.audio
    else:
        raise HTTPException(status_code=422, detail="Unsupported media type.")

    rel_dir = os.path.join(str(character.id), str(submission_id))
    abs_dir = os.path.join(settings.MEDIA_ROOT, rel_dir)
    raw_name = os.path.basename(file.filename or "upload")
    filename = re.sub(r"[^\w.\-]", "_", raw_name)[:100] or "upload"
    abs_path = os.path.join(abs_dir, filename)
    rel_path = os.path.join(rel_dir, filename)

    try:
        os.makedirs(abs_dir, exist_ok=True)
        contents = await file.read()
        if len(contents) > 100 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large (max 100 MB).")
        with open(abs_path, "wb") as file_handle:
            file_handle.write(contents)
    except HTTPException:
        raise
    except OSError:
        logger.exception("Failed to save media for submission %s", submission_id)
        raise HTTPException(
            status_code=500,
            detail="We couldn't save your file. Please check the file and try again.",
        )

    media_item = MediaItem(
        submission_id=submission_id,
        type=media_type,
        file_path=rel_path,
        display_order=display_order,
    )
    session.add(media_item)
    await session.commit()
    await session.refresh(media_item)
    return MediaItemOut.model_validate(media_item)


@router.delete("/{submission_id}/media/{media_id}", status_code=204)
async def delete_media_route(
    submission_id: int,
    media_id: int,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await session.get(Submission, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found.")
    if submission.character_id != character.id:
        raise HTTPException(status_code=403, detail="Cannot delete media from another character's submission.")

    media_item = await session.get(MediaItem, media_id)
    if media_item is None or media_item.submission_id != submission_id:
        raise HTTPException(status_code=404, detail="Media item not found.")

    abs_path = os.path.join(settings.MEDIA_ROOT, media_item.file_path)
    try:
        os.remove(abs_path)
    except OSError:
        pass

    await session.delete(media_item)
    await session.commit()
    return Response(status_code=204)


# ---------------------------------------------------------------------------
# Collaboration / duel operations
# ---------------------------------------------------------------------------


@router.post("/{submission_id}/invite", response_model=SubmissionInviteOut)
async def invite_member_route(
    submission_id: int,
    data: SubmissionInviteCreate,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    invite = await invite_member(
        submission_id=submission_id,
        inviter=character,
        invitee_character_id=data.invitee_character_id,
        session=session,
        era=CURRENT_ERA,
    )
    from services.submission import _build_invite_out
    return _build_invite_out(invite)


@router.post("/{submission_id}/invites/{invite_id}/respond", response_model=SubmissionOut)
async def respond_to_invite_route(
    submission_id: int,
    invite_id: int,
    data: InviteResponse,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await respond_to_invite(
        invite_id=invite_id,
        character=character,
        accept=data.accept,
        drop_task_id=data.drop_task_id,
        session=session,
        era=CURRENT_ERA,
    )
    return await build_submission_out(submission, session, viewer_character_id=character.id)


@router.post("/{submission_id}/kick/{target_character_id}", response_model=SubmissionOut)
async def kick_member_route(
    submission_id: int,
    target_character_id: int,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await kick_member(
        submission_id=submission_id,
        kicker=character,
        kickee_character_id=target_character_id,
        session=session,
    )
    return await build_submission_out(submission, session, viewer_character_id=character.id)


@router.put("/{submission_id}/document", response_model=SubmissionOut)
async def update_document_route(
    submission_id: int,
    data: SubmissionDocumentUpdate,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await update_document(
        submission_id=submission_id,
        character=character,
        body_text=data.body_text,
        session=session,
    )
    return await build_submission_out(submission, session, viewer_character_id=character.id)


@router.put("/{submission_id}/my-content", response_model=SubmissionOut)
async def update_my_content_route(
    submission_id: int,
    data: SubmissionMemberContentUpdate,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await update_member_content(
        submission_id=submission_id,
        character=character,
        title=data.title,
        body_text=data.body_text,
        session=session,
    )
    return await build_submission_out(submission, session, viewer_character_id=character.id)


@router.post("/{submission_id}/submit", response_model=SubmissionOut)
async def submit_for_member_route(
    submission_id: int,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await submit_for_member(
        submission_id=submission_id,
        character=character,
        session=session,
        era=CURRENT_ERA,
    )
    return await build_submission_out(submission, session, viewer_character_id=character.id)


@router.post("/{submission_id}/reopen", response_model=SubmissionOut)
async def reopen_submission_route(
    submission_id: int,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    submission = await reopen_submission(
        submission_id=submission_id,
        character=character,
        session=session,
    )
    return await build_submission_out(submission, session, viewer_character_id=character.id)


# ---------------------------------------------------------------------------
# Voting
# ---------------------------------------------------------------------------


@router.post("/{submission_id}/vote", response_model=VoteOut)
async def cast_vote_route(
    submission_id: int,
    data: SubmissionVoteIn,
    character: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    """Cast a vote on a submission.

    - Solo submissions: omit ``target_character_id`` (or provide None). Uses ``cast_or_update_vote``.
    - Duel submissions: ``target_character_id`` must be set to a duel member.
    """
    submission = await session.get(Submission, submission_id)
    if submission is None or submission.moderation_status == ModerationStatus.hidden.value:
        raise HTTPException(status_code=404, detail="Submission not found.")

    if submission.submission_type == SubmissionType.duel:
        if data.target_character_id is None:
            raise HTTPException(status_code=422, detail="target_character_id is required for duel votes.")
        vote = await cast_or_update_duel_vote(
            voter=character,
            submission_id=submission_id,
            target_character_id=data.target_character_id,
            stars=data.stars,
            session=session,
            era=CURRENT_ERA,
        )
    else:
        # Solo or collaboration — anti-self-vote at account level
        if submission.character_id is not None:
            author = await session.get(Character, submission.character_id)
            if author and author.account_id == character.account_id:
                raise HTTPException(status_code=403, detail="Cannot vote on your own submission.")
        vote = await cast_or_update_vote(
            voter=character,
            submission=submission,
            stars=data.stars,
            session=session,
            era=CURRENT_ERA,
        )
    return VoteOut.model_validate(vote)


@router.get("/{submission_id}/votes", response_model=list[DuelVoteSummary])
async def get_vote_summary_route(
    submission_id: int,
    session: AsyncSession = Depends(get_db),
):
    """Get live vote tally for a duel submission."""
    return await get_submission_vote_summary(submission_id, session)
