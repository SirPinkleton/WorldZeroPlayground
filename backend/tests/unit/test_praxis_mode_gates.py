"""Unit tests for services.praxis.allowed_praxis_modes.

Pure-function tests — no DB, no fixtures. Verifies that allowed_praxis_modes is
the single source for mode-by-level gates, and that enforcement in
_check_create_preconditions and the UI flag both derive from the same predicate.

Era 1 thresholds (era_1.py): collaboration_level_required=1, duel_level_required=2.
"""
from dataclasses import replace
from unittest.mock import MagicMock

import pytest

from game_config import CURRENT_ERA
from models.praxis import PraxisType
from services.praxis import allowed_praxis_modes


# allowed_praxis_modes only checks `character is None`; no attributes accessed.
_CHAR = MagicMock()

# (character, character_level, expected_modes)
_TABLE = [
    # Anonymous viewer → empty.
    (None, 0, []),
    # Level 0: below both thresholds.
    (_CHAR, 0, [PraxisType.solo]),
    # Level 1 = collaboration_level_required: collab unlocked, duel still locked.
    (_CHAR, 1, [PraxisType.solo, PraxisType.collab]),
    # Level 2 = duel_level_required: all three modes unlocked.
    (_CHAR, 2, [PraxisType.solo, PraxisType.collab, PraxisType.duel]),
    # Higher levels: still all three.
    (_CHAR, 5, [PraxisType.solo, PraxisType.collab, PraxisType.duel]),
]


@pytest.mark.parametrize("character,level,expected", _TABLE)
def test_allowed_praxis_modes_table(
    character: object,
    level: int,
    expected: list[PraxisType],
) -> None:
    result = allowed_praxis_modes(character, level, CURRENT_ERA)
    assert result == expected


def test_allowed_praxis_modes_reads_era_arg() -> None:
    """A custom EraConfig overrides the thresholds — flag cannot drift from values."""
    strict_era = replace(CURRENT_ERA, collaboration_level_required=5, duel_level_required=8)
    assert allowed_praxis_modes(_CHAR, 4, strict_era) == [PraxisType.solo]
    assert allowed_praxis_modes(_CHAR, 5, strict_era) == [
        PraxisType.solo,
        PraxisType.collab,
    ]
    assert allowed_praxis_modes(_CHAR, 8, strict_era) == [
        PraxisType.solo,
        PraxisType.collab,
        PraxisType.duel,
    ]


def test_collab_gate_same_predicate() -> None:
    """Below collaboration_level_required → collab absent from the flag.

    Enforcement in _check_create_preconditions derives from this predicate,
    so the flag and the 403 are guaranteed consistent.
    """
    below = CURRENT_ERA.collaboration_level_required - 1
    at_threshold = CURRENT_ERA.collaboration_level_required

    assert PraxisType.collab not in allowed_praxis_modes(_CHAR, below, CURRENT_ERA)
    assert PraxisType.collab in allowed_praxis_modes(_CHAR, at_threshold, CURRENT_ERA)


def test_duel_gate_same_predicate() -> None:
    """Below duel_level_required → duel absent from the flag."""
    below = CURRENT_ERA.duel_level_required - 1
    at_threshold = CURRENT_ERA.duel_level_required

    assert PraxisType.duel not in allowed_praxis_modes(_CHAR, below, CURRENT_ERA)
    assert PraxisType.duel in allowed_praxis_modes(_CHAR, at_threshold, CURRENT_ERA)
