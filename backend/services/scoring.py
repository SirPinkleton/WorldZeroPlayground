from math import floor

from game_config import CURRENT_ERA, EraConfig


def compute_vote_budget(score: int, era: EraConfig = CURRENT_ERA) -> int:
    return era.vote_budget_base + floor(era.vote_budget_multiplier * score)


def compute_level(score: int, era: EraConfig = CURRENT_ERA) -> int:
    for level, threshold in reversed(list(enumerate(era.level_thresholds))):
        if score >= threshold:
            return level
    return 0


COLLABORATION_MODE_SOLO = "solo"
COLLABORATION_MODE_COLLAB = "collab"
COLLABORATION_MODE_DUEL = "duel"
UNAFFILIATED_FACTION_SLUG = "na"


def compute_faction_multiplier(
    character_faction_slug: str,
    task_faction_slug: str,
    era: EraConfig,
    collaboration_mode: str = COLLABORATION_MODE_SOLO,
    is_duel_winner: bool = False,
) -> float:
    """Return the point multiplier for a character doing a given task.

    Selects the appropriate modifier based on:
    - Whether the task belongs to the character's own faction or another
    - The collaboration mode (solo, collab, or duel)
    - For duels, whether the character won or lost

    Unaffiliated ("na") tasks are treated as own-faction (no penalty).
    Votes are always added flat after the modifier is applied.
    """
    faction_config = era.factions.get(character_faction_slug)
    if faction_config is None:
        return 1.0

    if collaboration_mode == COLLABORATION_MODE_DUEL:
        if is_duel_winner:
            return faction_config.duel_win_modifier
        return faction_config.duel_loss_modifier

    is_own_faction = (
        task_faction_slug == character_faction_slug
        or task_faction_slug == UNAFFILIATED_FACTION_SLUG
        or not task_faction_slug
    )

    if collaboration_mode == COLLABORATION_MODE_COLLAB:
        if is_own_faction:
            return faction_config.collab_own_modifier
        return faction_config.collab_other_modifier

    # Solo (default)
    if is_own_faction:
        return faction_config.own_task_modifier
    return faction_config.other_task_modifier


def compute_praxis_score(
    task_point_value: int,
    faction_multiplier: float,
    total_stars: int,
) -> float:
    """Score for a single praxis.

    Base points are awarded immediately on submission (point_value × multiplier).
    Each star from community votes adds directly to the score.
    """
    return task_point_value * faction_multiplier + total_stars
