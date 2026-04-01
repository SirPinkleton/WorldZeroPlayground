# World Zero — Game Rules

## 6. Scoring & Vote Budget

All formulas are driven by `CURRENT_ERA` (or a passed `EraConfig` in tests).

### Submission Score (computed on-the-fly)
```
submission_score = mean(vote.stars for all votes on submission) × task.point_value
```

### Character Score
```
character.score = sum(submission_score for all non-flagged submissions this era)
```

### All-Time Score
Increments with every point gain, never decremented (including on Era reset).

### Vote Budget
```
votes_available = era.vote_budget_base + floor(era.vote_budget_multiplier × character.score)
```
- First cast of a vote costs 1 from `votes_available`
- Updating an existing vote (changing star value) costs nothing additional
- A character with `votes_available == 0` cannot cast new votes
- On Era reset: `votes_available` recalculated from new (reset) score per era config

### Level Computation
```
character.level = highest index i where character.score >= era.level_thresholds[i]
```
Level is stored on Character for query performance and updated synchronously on every score change that crosses a threshold.

---

## 7. Level Privileges

| Level | Points (Era 1) | Unlocks |
|---|---|---|
| 0 | 0 | Browse tasks |
| 1 | 10 | Sign up for tasks; collaboration |
| 2 | 70 | See pretired tasks; group welcome letters; Duels; group pages |
| 3 | 170 | Choose faction; submit task proposals; create second character |
| 4 | 330 | Meta task unlock (varies by faction); flagging |
| 5 | 610 | Vote for level 0 tasks to be promoted; new UX secrets |
| 6 | 1090 | Meta task unlock (varies by faction) |
| 7 | 1840 | Meta task: do any task "as if" from own faction for full points |
| 8 | 3040 | New UX secrets; special trigger if player has one of each task completed |

Point thresholds come from `era.level_thresholds` — they can differ across eras.

---

## 8. Factions

All faction rules (multipliers, selectability) live in `game_config.py` under each `EraConfig`. The DB `Faction` table exists only for FK references and display.

Characters start in **UA**. At level 3 they must choose a permanent faction (excluding Albescent and special-assignment factions). Characters who hit level 3 while offline are moved to **AgedOutOfUA** and prompted to choose on next login.

### Era 1 Factions

| Slug | Name | Notes |
|---|---|---|
| ua | UA | Default starting faction. Full points. Must leave at level 3. |
| ua_masters | UA Masters | Veterans aged out of UA. 0.8x points on all tasks. |
| snide | Snide | +10% bonus on duel wins. |
| gestalt | Gestalt | +10% on own-faction tasks, -30% on other-faction tasks. |
| journeymen | Journeymen | Task Vision: access to select retired tasks. |
| analog | Analog | Double Dipper: repeat one task per level for points. |
| singularity | Singularity | TBD. |
| albescent | /Albescent | Full points on any task. Unlock-only (not selectable). |
| aged_out | AgedOutOfUA | Placeholder for characters who hit level 3 while offline. |

---

## 11. Era Reset

Triggered by admin via `POST /admin/eras`. Requires a confirmation payload to prevent accidental triggers.

Reset behaviour is entirely driven by the incoming era's `EraConfig` flags:

```
if new_era_config.reset_score       → character.score = 0
if new_era_config.reset_level       → character.level = 0
if new_era_config.reset_faction     → character.faction_slug = "aged_out"
if new_era_config.reset_vote_budget → character.votes_available = new_era_config.vote_budget_base
if new_era_config.reset_all_time_score → character.all_time_score = 0  (almost never true)
```

Always on reset (not config-driven):
- New `Era` record created in DB with `config_key` referencing the new `EraConfig`
- All active tasks → retired
- In-progress CharacterTask rows carry over; characters can submit at no penalty

---

## game_config.py Structure Reference

```python
from dataclasses import dataclass, field

@dataclass(frozen=True)
class EraConfig:
    name: str
    config_key: str
    max_task_signups: int
    task_submit_level_gap: int
    vote_budget_base: int
    vote_budget_multiplier: float
    level_thresholds: tuple[int, ...]
    reset_score: bool
    reset_level: bool
    reset_faction: bool
    reset_vote_budget: bool
    reset_all_time_score: bool
    factions: dict[str, FactionConfig]

# Era 1 values
ERA_1 = EraConfig(
    max_task_signups=20,
    task_submit_level_gap=2,
    vote_budget_base=100,
    vote_budget_multiplier=2.0,
    level_thresholds=(0, 10, 70, 170, 330, 610, 1090, 1840, 3040),
    reset_score=True, reset_level=True, reset_faction=True,
    reset_vote_budget=True, reset_all_time_score=False,
    ...
)

CURRENT_ERA: EraConfig = ERA_1
```
