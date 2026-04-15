from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from dependencies import get_current_character
from models.character import Character
from models.praxis import Praxis
from models.vote import Vote
from schemas.vote import VoterDetail, VoteIn, VoteOut, VoteSummary
from services.praxis import compute_praxis_score_from_db
from services.vote import cast_or_update_vote

router = APIRouter()


@router.post("/praxes/{praxis_id}/vote", response_model=VoteOut)
async def cast_vote(
    praxis_id: int,
    data: VoteIn,
    voter: Character = Depends(get_current_character),
    session: AsyncSession = Depends(get_db),
):
    praxis = await session.get(Praxis, praxis_id)
    if praxis is None:
        raise HTTPException(status_code=404, detail="Praxis not found.")

    # Proper account-level anti-self-vote check
    author_result = await session.get(Character, praxis.character_id)
    if author_result and author_result.account_id == voter.account_id:
        raise HTTPException(status_code=403, detail="Cannot vote on your own praxis.")

    vote = await cast_or_update_vote(voter, praxis, data.stars, session)
    return VoteOut.model_validate(vote)


@router.get("/praxes/{praxis_id}/votes", response_model=VoteSummary)
async def get_vote_summary(
    praxis_id: int,
    session: AsyncSession = Depends(get_db),
):
    praxis = await session.get(Praxis, praxis_id)
    if praxis is None:
        raise HTTPException(status_code=404, detail="Praxis not found.")

    count_result = await session.execute(
        select(func.count()).select_from(Vote).where(Vote.praxis_id == praxis_id)
    )
    total_votes = count_result.scalar_one()

    avg_result = await session.execute(
        select(func.avg(Vote.stars)).where(Vote.praxis_id == praxis_id)
    )
    avg_stars = float(avg_result.scalar_one_or_none() or 0.0)
    total_score = await compute_praxis_score_from_db(praxis, session)

    return VoteSummary(
        praxis_id=praxis_id,
        total_votes=total_votes,
        average_stars=avg_stars,
        total_score=total_score,
    )


@router.get("/praxes/{praxis_id}/voters", response_model=list[VoterDetail])
async def list_voters(
    praxis_id: int,
    session: AsyncSession = Depends(get_db),
):
    praxis = await session.get(Praxis, praxis_id)
    if praxis is None:
        raise HTTPException(status_code=404, detail="Praxis not found.")

    result = await session.execute(
        select(Vote, Character)
        .join(Character, Character.id == Vote.voter_character_id)
        .where(Vote.praxis_id == praxis_id)
        .order_by(Vote.created_at.desc())
    )
    return [
        VoterDetail(
            character_id=character.id,
            display_name=character.display_name,
            avatar_url=character.avatar_url,
            faction_slug=character.faction_slug,
            stars=vote.stars,
        )
        for vote, character in result.all()
    ]
