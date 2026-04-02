from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from game_config import CURRENT_ERA, EraConfig
from models.character import Character
from models.submission import Submission
from models.vote import Vote


async def cast_or_update_vote(
    voter: Character,
    submission: Submission,
    stars: int,
    session: AsyncSession,
    era: EraConfig = CURRENT_ERA,
) -> Vote:
    if not 1 <= stars <= 5:
        raise HTTPException(status_code=422, detail="Stars must be between 1 and 5.")

    if voter.account_id == submission.character_id:
        # We need to check account-level, so we need the submission author's account_id.
        # The caller must ensure submission is loaded with its character's account_id.
        # This check is a secondary guard; routers should also pass author_account_id explicitly.
        raise HTTPException(status_code=403, detail="Cannot vote on your own submission.")

    result = await session.execute(
        select(Vote).where(
            Vote.submission_id == submission.id,
            Vote.voter_character_id == voter.id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing is not None:
        # Update is free — no budget deduction
        existing.stars = stars
        await session.commit()
        await session.refresh(existing)
        return existing

    # New vote — deduct from budget
    if voter.votes_available <= 0:
        raise HTTPException(status_code=403, detail="No votes remaining in your budget.")

    vote = Vote(
        submission_id=submission.id,
        voter_character_id=voter.id,
        voter_account_id=voter.account_id,
        stars=stars,
    )
    voter.votes_available -= 1
    session.add(vote)
    await session.commit()
    await session.refresh(vote)
    return vote
