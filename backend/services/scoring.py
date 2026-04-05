from math import floor

from game_config import CURRENT_ERA, EraConfig


def compute_vote_budget(score: int, era: EraConfig = CURRENT_ERA) -> int:
    return era.vote_budget_base + floor(era.vote_budget_multiplier * score)


def compute_level(score: int, era: EraConfig = CURRENT_ERA) -> int:
    for level, threshold in reversed(list(enumerate(era.level_thresholds))):
        if score >= threshold:
            return level
    return 0


def compute_submission_score(avg_stars: float, task_point_value: int) -> float:
    return avg_stars * task_point_value
