import pytest

from game_config import ERA_1
from services.scoring import compute_level


@pytest.mark.parametrize("level", range(len(ERA_1.level_thresholds)))
def test_exact_threshold_reaches_level(level):
    threshold = ERA_1.level_thresholds[level]
    assert compute_level(score=threshold, era=ERA_1) == level


@pytest.mark.parametrize("level", range(1, len(ERA_1.level_thresholds)))
def test_one_below_threshold_stays_at_previous_level(level):
    threshold = ERA_1.level_thresholds[level]
    assert compute_level(score=threshold - 1, era=ERA_1) == level - 1


def test_score_zero_is_level_zero():
    assert compute_level(score=0, era=ERA_1) == 0


def test_score_far_above_max_threshold_stays_at_max():
    max_level = len(ERA_1.level_thresholds) - 1
    huge_score = ERA_1.level_thresholds[-1] * 100
    assert compute_level(score=huge_score, era=ERA_1) == max_level


def test_level_3_threshold():
    """Level 3 is the faction-choice / second-character gate — explicitly tested."""
    threshold = ERA_1.level_thresholds[3]
    assert compute_level(score=threshold - 1, era=ERA_1) == 2
    assert compute_level(score=threshold, era=ERA_1) == 3


def test_level_4_threshold():
    """Level 4 is the flagging gate — explicitly tested."""
    threshold = ERA_1.level_thresholds[4]
    assert compute_level(score=threshold - 1, era=ERA_1) == 3
    assert compute_level(score=threshold, era=ERA_1) == 4
