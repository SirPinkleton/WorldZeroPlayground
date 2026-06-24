"""The stamp-detection branch that gates deploys in start.sh."""
from scripts.check_db_stamp import stamp_is_known

KNOWN = {"0001_squashed"}


def test_fresh_db_proceeds():
    assert stamp_is_known(None, KNOWN)


def test_known_revision_proceeds():
    assert stamp_is_known("0001_squashed", KNOWN)


def test_squashed_away_revision_blocks():
    assert not stamp_is_known("0010_drop_analog_double_dipper", KNOWN)
