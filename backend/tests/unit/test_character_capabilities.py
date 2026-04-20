"""Unit tests for services.character_capabilities.compute_capabilities.

Pure function — no DB, no fixtures. Table-driven against the level thresholds
defined on ``CURRENT_ERA`` (Era 1: propose_task=3, propose_metatask=6,
see_retired=2, see_pending=3).
"""
import pytest

from game_config import CURRENT_ERA
from services.character_capabilities import (
    CharacterCapabilities,
    compute_capabilities,
)


# (level, is_admin) -> expected (can_propose_task, can_propose_metatask,
#                                can_see_retired_tasks, can_see_pending_tasks)
# Era 1 thresholds: 3 / 6 / 2 / 3.
_TABLE = [
    # No character at all -> everything False.
    (None, False, False, False, False, False),
    # Below every threshold.
    (0, False, False, False, False, False),
    (1, False, False, False, False, False),
    # Meets see_retired only (threshold 2).
    (2, False, False, False, True, False),
    # Meets propose_task and see_pending (both threshold 3).
    (3, False, True, False, True, True),
    (4, False, True, False, True, True),
    (5, False, True, False, True, True),
    # Meets every flag (metatask threshold 6).
    (6, False, True, True, True, True),
    (7, False, True, True, True, True),
    # Admin short-circuit — every flag True regardless of level, even None.
    (None, True, True, True, True, True),
    (0, True, True, True, True, True),
    (1, True, True, True, True, True),
]


@pytest.mark.parametrize(
    "level,is_admin,propose_task,propose_meta,see_retired,see_pending",
    _TABLE,
)
def test_compute_capabilities_table(
    level: int | None,
    is_admin: bool,
    propose_task: bool,
    propose_meta: bool,
    see_retired: bool,
    see_pending: bool,
) -> None:
    result = compute_capabilities(level, is_admin)
    assert isinstance(result, CharacterCapabilities)
    assert result.can_propose_task is propose_task
    assert result.can_propose_metatask is propose_meta
    assert result.can_see_retired_tasks is see_retired
    assert result.can_see_pending_tasks is see_pending


def test_compute_capabilities_reads_from_era_arg() -> None:
    """Passing a custom EraConfig overrides the threshold values (not CURRENT_ERA)."""
    from dataclasses import replace

    strict_era = replace(
        CURRENT_ERA,
        level_to_propose_task=10,
        level_to_propose_metatask=10,
        level_to_see_retired_tasks=10,
        level_to_see_pending_tasks=10,
    )
    # A level-9 non-admin gets nothing under stricter thresholds.
    result = compute_capabilities(9, is_admin=False, era=strict_era)
    assert result == CharacterCapabilities(
        can_propose_task=False,
        can_propose_metatask=False,
        can_see_retired_tasks=False,
        can_see_pending_tasks=False,
    )
