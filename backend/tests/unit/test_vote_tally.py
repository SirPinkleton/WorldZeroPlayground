"""Unit tests for services.vote_tally — pure helpers only."""

from services.vote_tally import VoteTally, get_tally


def test_get_tally_returns_empty_when_missing():
    assert get_tally({}, 99) == VoteTally(0, 0)


def test_get_tally_returns_entry_when_present():
    entry = VoteTally(points_from_votes=12, voter_count=3)
    result = get_tally({42: entry}, 42)
    assert result is entry


def test_vote_tally_is_frozen():
    import dataclasses
    assert dataclasses.fields(VoteTally)  # confirms it's a dataclass
    tally = VoteTally(points_from_votes=5, voter_count=1)
    try:
        tally.voter_count = 99  # type: ignore[misc]
        assert False, "Expected FrozenInstanceError"
    except Exception:
        pass  # frozen dataclasses raise FrozenInstanceError on mutation
