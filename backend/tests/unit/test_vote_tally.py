"""Unit tests for services.vote_tally — pure helpers only."""

from services.vote_tally import PerVoterEntry, VoteTally, get_tally


def test_get_tally_returns_empty_when_missing():
    assert get_tally({}, 99) == VoteTally(0, 0)


def test_get_tally_returns_entry_when_present():
    entry = VoteTally(points_from_votes=12, voter_count=3)
    result = get_tally({42: entry}, 42)
    assert result is entry


def test_vote_tally_defaults():
    tally = VoteTally(points_from_votes=0, voter_count=0)
    assert tally.per_voter == ()


def test_vote_tally_with_per_voter():
    voters = (
        PerVoterEntry(character_id=1, display_name="Alice", value=4),
        PerVoterEntry(character_id=2, display_name="Bob", value=5),
    )
    tally = VoteTally(points_from_votes=9, voter_count=2, per_voter=voters)
    assert len(tally.per_voter) == 2
    assert tally.points_from_votes == 9


def test_vote_tally_is_frozen():
    import dataclasses
    assert dataclasses.fields(VoteTally)  # confirms it's a dataclass
    tally = VoteTally(points_from_votes=5, voter_count=1)
    try:
        tally.voter_count = 99  # type: ignore[misc]
        assert False, "Expected FrozenInstanceError"
    except Exception:
        pass  # frozen dataclasses raise FrozenInstanceError on mutation
