"""Single source for vote aggregation (ADR-0014).

``tally_votes`` is the one place in the codebase that runs
``func.sum(Vote.value)`` / ``func.count``. All scoring code and display code
consume it; scattered per-query vote sums are deleted.
"""
from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.vote import Vote


@dataclass(frozen=True)
class VoteTally:
    """Aggregated vote data for one praxis."""

    points_from_votes: int
    voter_count: int


_EMPTY_TALLY = VoteTally(points_from_votes=0, voter_count=0)


async def tally_votes(
    praxis_ids: list[int],
    session: AsyncSession,
) -> dict[int, VoteTally]:
    """Return a ``VoteTally`` for each requested praxis id.

    Praxes with no votes are not included in the result; callers should use
    the helper :func:`get_tally`.
    """
    if not praxis_ids:
        return {}

    agg_result = await session.execute(
        select(Vote.praxis_id, func.sum(Vote.value), func.count(Vote.id))
        .where(Vote.praxis_id.in_(praxis_ids))
        .group_by(Vote.praxis_id)
    )
    return {
        pid: VoteTally(
            points_from_votes=int(total or 0),
            voter_count=int(count or 0),
        )
        for pid, total, count in agg_result.all()
    }


def get_tally(tallies: dict[int, VoteTally], praxis_id: int) -> VoteTally:
    """Return the tally for ``praxis_id``, falling back to an empty tally."""
    return tallies.get(praxis_id, _EMPTY_TALLY)
