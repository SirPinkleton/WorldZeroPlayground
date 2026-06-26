"""Single source for vote aggregation (ADR-0014).

``tally_votes`` is the one place in the codebase that runs
``func.sum(Vote.value)`` / ``func.count`` / per-voter breakdown queries.
All scoring code and display code consume it; scattered per-query vote sums
are deleted.
"""
from dataclasses import dataclass, field
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.character import Character
from models.vote import Vote


@dataclass(frozen=True)
class PerVoterEntry:
    character_id: int
    display_name: str
    value: int


@dataclass(frozen=True)
class VoteTally:
    """Aggregated vote data for one praxis."""

    points_from_votes: int
    voter_count: int
    per_voter: tuple[PerVoterEntry, ...] = field(default_factory=tuple)


_EMPTY_TALLY = VoteTally(points_from_votes=0, voter_count=0, per_voter=())


async def tally_votes(
    praxis_ids: list[int],
    session: AsyncSession,
    *,
    include_per_voter: bool = False,
) -> dict[int, VoteTally]:
    """Return a ``VoteTally`` for each requested praxis id.

    Praxes with no votes are not included in the result; callers should use
    ``.get(praxis_id, EMPTY_TALLY)`` or the helper :func:`get_tally`.

    ``include_per_voter=True`` populates each tally's ``per_voter`` list with
    (character_id, display_name, value) entries sorted by vote creation time.
    Leave it False (the default) for scoring paths that only need the sum.
    """
    if not praxis_ids:
        return {}

    agg_result = await session.execute(
        select(Vote.praxis_id, func.sum(Vote.value), func.count(Vote.id))
        .where(Vote.praxis_id.in_(praxis_ids))
        .group_by(Vote.praxis_id)
    )
    tallies: dict[int, VoteTally] = {
        pid: VoteTally(
            points_from_votes=int(total or 0),
            voter_count=int(count or 0),
        )
        for pid, total, count in agg_result.all()
    }

    if include_per_voter and tallies:
        voter_result = await session.execute(
            select(Vote.praxis_id, Vote.voter_character_id, Vote.value, Character.display_name)
            .join(Character, Character.id == Vote.voter_character_id)
            .where(Vote.praxis_id.in_(list(tallies.keys())))
            .order_by(Vote.praxis_id, Vote.created_at)
        )
        per_voter_map: dict[int, list[PerVoterEntry]] = {}
        for pid, char_id, val, name in voter_result.all():
            per_voter_map.setdefault(pid, []).append(
                PerVoterEntry(character_id=char_id, display_name=name, value=val)
            )
        tallies = {
            pid: VoteTally(
                points_from_votes=t.points_from_votes,
                voter_count=t.voter_count,
                per_voter=tuple(per_voter_map.get(pid, [])),
            )
            for pid, t in tallies.items()
        }

    return tallies


def get_tally(tallies: dict[int, VoteTally], praxis_id: int) -> VoteTally:
    """Return the tally for ``praxis_id``, falling back to an empty tally."""
    return tallies.get(praxis_id, _EMPTY_TALLY)
