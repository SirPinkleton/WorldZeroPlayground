from game_config import ERA_1
from services.scoring import compute_level, compute_submission_score, compute_vote_budget


def test_vote_budget_base():
    assert compute_vote_budget(score=0, era=ERA_1) == ERA_1.vote_budget_base


def test_vote_budget_with_score():
    score = 50
    expected = ERA_1.vote_budget_base + int(ERA_1.vote_budget_multiplier * score)
    assert compute_vote_budget(score=score, era=ERA_1) == expected


def test_vote_budget_floors_fractional():
    # multiplier=2.0 is exact, test with a custom era to verify floor()
    from game_config import EraConfig, ERA_1_FACTIONS
    era = EraConfig(
        name="test",
        config_key="test",
        max_task_signups=20,
        task_submit_level_gap=2,
        vote_budget_base=10,
        vote_budget_multiplier=1.5,
        level_thresholds=ERA_1.level_thresholds,
        reset_score=False,
        reset_level=False,
        reset_faction=False,
        reset_vote_budget=False,
        reset_all_time_score=False,
        factions=ERA_1_FACTIONS,
    )
    # 1.5 * 3 = 4.5 → floor = 4, total = 14
    assert compute_vote_budget(score=3, era=era) == 14


def test_level_zero_at_start():
    assert compute_level(score=0, era=ERA_1) == 0


def test_level_boundaries():
    for level, threshold in enumerate(ERA_1.level_thresholds):
        assert compute_level(score=threshold, era=ERA_1) == level
        if level > 0:
            assert compute_level(score=threshold - 1, era=ERA_1) == level - 1


def test_level_max():
    max_level = len(ERA_1.level_thresholds) - 1
    assert compute_level(score=ERA_1.level_thresholds[-1] + 10000, era=ERA_1) == max_level


def test_submission_score_basic():
    assert compute_submission_score(avg_stars=3.0, task_point_value=10) == 30.0


def test_submission_score_max_stars():
    assert compute_submission_score(avg_stars=5.0, task_point_value=20) == 100.0


def test_submission_score_fractional_stars():
    result = compute_submission_score(avg_stars=2.5, task_point_value=4)
    assert result == 10.0


def test_submission_score_zero_votes():
    assert compute_submission_score(avg_stars=0.0, task_point_value=10) == 0.0
