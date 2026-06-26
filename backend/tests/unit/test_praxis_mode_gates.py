"""Unit tests for services.praxis.allowed_praxis_modes.

Pure-function tests — no DB, no fixtures. Verifies that allowed_praxis_modes is
the single source for mode-by-level gates, and that enforcement in
_check_create_preconditions and the UI flag both derive from the same predicate.

ADR-0011: Duels are no longer created via POST /praxes — use POST /duels/challenge.
``PraxisType.duel`` is therefore not returned by allowed_praxis_modes.

Era 1 thresholds (era_1.py): collaboration_level_required=1.
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
    # Level 0: below collab threshold.
    (_CHAR, 0, [PraxisType.solo]),
    # Level 1 = collaboration_level_required: collab unlocked.
    (_CHAR, 1, [PraxisType.solo, PraxisType.collab]),
    # Higher levels: solo + collab only (duel uses challenge endpoint).
    (_CHAR, 2, [PraxisType.solo, PraxisType.collab]),
    (_CHAR, 5, [PraxisType.solo, PraxisType.collab]),
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
    strict_era = replace(CURRENT_ERA, collaboration_level_required=5)
    assert allowed_praxis_modes(_CHAR, 4, strict_era) == [PraxisType.solo]
    assert allowed_praxis_modes(_CHAR, 5, strict_era) == [
        PraxisType.solo,
        PraxisType.collab,
    ]


def test_mode_gate_collab_predicate() -> None:
    """Below collab threshold → collab absent; at threshold → collab present.

    PraxisType.duel is deliberately absent from allowed_praxis_modes
    (use POST /duels/challenge instead — see ADR-0011).
    """
    below = CURRENT_ERA.collaboration_level_required - 1
    at_threshold = CURRENT_ERA.collaboration_level_required

    assert PraxisType.collab not in allowed_praxis_modes(_CHAR, below, CURRENT_ERA)
    assert PraxisType.collab in allowed_praxis_modes(_CHAR, at_threshold, CURRENT_ERA)
    assert PraxisType.duel not in allowed_praxis_modes(_CHAR, 99, CURRENT_ERA)
