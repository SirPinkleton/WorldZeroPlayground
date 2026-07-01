from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db import get_db
from dependencies import get_current_character
from models.character import Character
from models.praxis import Praxis
from models.vote import Vote
from schemas.vote import VoterDetail, VoteIn, VoteOut, VoteSummary
from services.vote import cast_or_update_vote
from services.vote_tally import tally_votes

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
    vote = await cast_or_update_vote(voter, praxis, data.value, session)
    return VoteOut.model_validate(vote)


@router.get("/praxes/{praxis_id}/votes", response_model=VoteSummary)
async def get_vote_summary(
    praxis_id: int,
    session: AsyncSession = Depends(get_db),
):
    praxis = await session.get(Praxis, praxis_id)
    if praxis is None:
        raise HTTPException(status_code=404, detail="Praxis not found.")

    tallies = await tally_votes([praxis_id], session)
    tally = tallies.get(praxis_id)
    total_votes = tally.voter_count if tally else 0
    total_score = float(tally.points_from_votes) if tally else 0.0

    return VoteSummary(
        praxis_id=praxis_id,
        total_votes=total_votes,
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
            value=vote.value,
        )
        for vote, character in result.all()
    ]
