from game_config import CURRENT_ERA, ERA_1


def test_current_era_is_defined():
    assert CURRENT_ERA is not None
    assert CURRENT_ERA.config_key != ""


def test_era1_config_key():
    assert ERA_1.config_key == "era_1"


def test_level_thresholds_count():
    # Levels 0–8 = 9 entries
    assert len(ERA_1.level_thresholds) == 9


def test_level_thresholds_start_at_zero():
    assert ERA_1.level_thresholds[0] == 0


def test_level_thresholds_strictly_increasing():
    thresholds = ERA_1.level_thresholds
    for index in range(1, len(thresholds)):
        assert thresholds[index] > thresholds[index - 1], (
            f"Threshold at index {index} ({thresholds[index]}) must be > index {index - 1} ({thresholds[index - 1]})"
        )


def test_faction_slugs_match_keys():
    for slug, faction in ERA_1.factions.items():
        assert faction.slug == slug, f"Faction key '{slug}' doesn't match slug '{faction.slug}'"


def test_all_factions_have_valid_point_multipliers():
    for slug, faction in ERA_1.factions.items():
        assert 0 < faction.point_multiplier <= 2.0, (
            f"Faction '{slug}' has out-of-range point_multiplier: {faction.point_multiplier}"
        )


def test_all_factions_have_valid_duel_bonus():
    for slug, faction in ERA_1.factions.items():
        assert 0.0 <= faction.duel_bonus_multiplier <= 1.0, (
            f"Faction '{slug}' has out-of-range duel_bonus_multiplier: {faction.duel_bonus_multiplier}"
        )


def test_ua_faction_exists_and_not_selectable():
    assert "ua" in ERA_1.factions
    assert ERA_1.factions["ua"].is_selectable is False


def test_aged_out_faction_not_selectable():
    assert "aged_out" in ERA_1.factions
    assert ERA_1.factions["aged_out"].is_selectable is False


def test_albescent_faction_not_selectable():
    assert "albescent" in ERA_1.factions
    assert ERA_1.factions["albescent"].is_selectable is False


def test_selectable_factions_exist():
    selectable = [faction for faction in ERA_1.factions.values() if faction.is_selectable]
    assert len(selectable) >= 1


def test_vote_budget_base_positive():
    assert ERA_1.vote_budget_base > 0


def test_vote_budget_multiplier_positive():
    assert ERA_1.vote_budget_multiplier > 0


def test_max_task_signups_positive():
    assert ERA_1.max_task_signups > 0


def test_task_submit_level_gap_non_negative():
    assert ERA_1.task_submit_level_gap >= 0


def test_reset_all_time_score_is_false():
    # Per spec: reset_all_time_score is almost always False
    assert ERA_1.reset_all_time_score is False
