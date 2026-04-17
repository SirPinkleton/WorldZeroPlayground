# World Zero — Game Rules

> Source of truth: `backend/game_config.py` (config shape), `backend/eras/era_1.py` (Era 1 values),
> `backend/services/scoring.py` (formulas). This document describes the rules in English;
> those files are authoritative when they conflict.

---

## What is configurable per era vs. hardcoded

### Configurable per era (fields on `EraConfig`)

| Field | Era 1 value | Effect |
|---|---|---|
| `max_task_signups` | 20 | Max concurrent in-progress praxes per character (bank cap) |
| `task_submit_level_gap` | 2 | Unused in live code — reserved for future enforcement |
| `max_duel_participants` | 2 | Max members in a duel praxis |
| `vote_budget_base` | 100 | Starting votes for a new character; also the reset floor |
| `vote_budget_multiplier` | 2.0 | Votes grow by `floor(multiplier x score)` |
| `level_thresholds` | `(0,10,70,170,330,610,1090,1840,3040)` | Score required to reach each level (index = level) |
| `reset_score` | `True` | Whether era reset zeroes character score |
| `reset_level` | `True` | Whether era reset zeroes character level |
| `reset_faction` | `True` | Whether era reset returns characters to `"na"` (placeholder) |
| `reset_vote_budget` | `True` | Whether era reset resets votes_available to `vote_budget_base` |
| `reset_all_time_score` | `False` | Whether era reset clears all-time score (almost always False) |
| `factions` | dict of `FactionConfig` | Per-faction point multipliers and duel modifiers |
| `tasks` | tuple of `TaskDef` | Task definitions seeded for this era |
| `taunt_templates` | dict | Per-faction taunt message templates |

Per-faction fields on `FactionConfig` (all configurable per era):

| Field | Effect |
|---|---|
| `own_task_modifier` | Solo multiplier when task faction matches character faction (or task is unaffiliated) |
| `other_task_modifier` | Solo multiplier on all other tasks |
| `collab_own_modifier` | Collab multiplier on own-faction tasks |
| `collab_other_modifier` | Collab multiplier on other-faction tasks |
| `duel_win_modifier` | Applied to base points if this character wins a duel |
| `duel_loss_modifier` | Applied to base points if this character loses a duel |
| `is_selectable` | Whether players can choose this faction at level 3 |
| `can_always_rejoin` | Whether a character who left can return (UA Masters, Albescent) |

### Hardcoded in service code

| Rule | Value | Where |
|---|---|---|
| Collaboration minimum level | 1 | `services/praxis.py::COLLABORATION_LEVEL_REQUIRED` |
| Duel minimum level | 2 | `services/praxis.py::DUEL_LEVEL_REQUIRED` |
| Flagging minimum level | 4 | `services/praxis.py::flag_praxis` |
| Second character requires level | 3 on any existing character | `services/character.py::create_character` |
| Faction graduation trigger | Level 3 while in `"ua"` becomes `"aged_out"` | `services/character.py::check_faction_graduation` |
| Stars range | 1-5 | `services/vote.py` |
| Snide tiebreaker rule | Snide always wins a tie vs non-Snide | `services/scoring.py::compute_duel_multiplier` |
| Unaffiliated task slug | `"na"` | `services/scoring.py::UNAFFILIATED_FACTION_SLUG` |

---

## Scoring

### Praxis score formula

```
praxis_score = (task_point_value + meta_task_points) x faction_multiplier x duel_multiplier + total_stars
```

- **`task_point_value`** - set on the Task by the proposer/admin.
- **`meta_task_points`** - flat bonus from an attached MetaTask (0 if none, or if character is below MetaTask's `level_required`). Applied per-member for collab and duel.
- **`faction_multiplier`** - see Faction Multipliers section below.
- **`duel_multiplier`** - 1.0 for solo and collab; outcome-based for duels (see Duel section).
- **`total_stars`** - sum of all raw star ratings across every vote on this praxis. Stars add flat after all multipliers. Not an average.

Score is **not stored** -- it is computed on the fly from votes whenever requested.

### Character score

```
character.score = sum of praxis_score for all non-hidden, non-withdrawn praxes this era
```

Updated synchronously on every vote cast/updated and on withdraw/resubmit. The `CharacterStats` row for the current era holds the cached score.

### All-time score

Increments with every point gain. Never decremented, including on era reset. Stored on `CharacterStats.all_time_score`.

### Vote budget

```
votes_available = vote_budget_base + floor(vote_budget_multiplier x character.score)
```

- **First cast** on a praxis costs 1 from `votes_available`.
- **Updating** an existing vote (changing star value) costs 0 -- budget is not re-deducted.
- `votes_available == 0` blocks new votes but not updates.
- Budget is not recalculated continuously -- it is set on era start and depleted as votes are cast. The formula is used at era reset and character creation.

### Level computation

```
character.level = highest index i where character.score >= era.level_thresholds[i]
```

Level is recalculated synchronously every time score changes (via `recalculate_character_stats`). It is stored on `CharacterStats.level` for query performance.

---

## Faction multipliers

Multipliers are applied based on the character's faction and the task's `primary_faction_slug`. A task with `primary_faction_slug = "na"` is treated as own-faction for all characters (no penalty).

### Solo and duel (use `own_task_modifier` / `other_task_modifier`)

| Faction | Own-faction task | Other-faction task |
|---|---|---|
| UA | 1.0x | 1.0x |
| UA Masters | 0.8x | 0.8x |
| S.N.I.D.E. | 1.0x | 0.7x |
| Gestalt | 1.1x | 0.7x |
| Journeymen | 1.0x | 0.7x |
| Analog | 1.0x | 0.7x |
| Singularity | 1.0x | 1.0x |
| /Albescent | 1.0x | 1.0x |

For duels, `faction_multiplier` uses the solo own/other modifiers, and `duel_multiplier` is applied on top.

### Collab (use `collab_own_modifier` / `collab_other_modifier`)

Each member's score is computed individually using their own faction's collab modifiers.

| Faction | Own-faction collab | Other-faction collab |
|---|---|---|
| UA | 1.0x | 1.0x |
| UA Masters | 0.8x | 0.8x |
| S.N.I.D.E. | 1.0x | 0.7x |
| Gestalt | 1.1x | 0.9x (less penalty than solo) |
| Journeymen | 1.0x | 0.7x |
| Analog | 1.0x | 0.7x |
| Singularity | 1.0x | 1.0x |
| /Albescent | 1.0x | 1.0x |

---

## Praxis types

### Solo

- Any character who meets the task's `level_required` and has bank capacity can create a solo praxis.
- Creator is automatically added as the sole `PraxisMember`.
- Votes are praxis-wide (no `praxis_member_id` required). Anti-self-vote is enforced at account level.

### Collaboration

- Requires character level >= 1 (hardcoded).
- Creator invites other characters. Each accepts or declines via the invite flow.
- A collab reaches `submitted` status when **all current members** have individually marked `has_submitted = True`.
- Each member's score is computed independently using their own faction modifiers.
- Votes are praxis-wide. Members cannot vote on their own collab (account-level anti-self-vote).

### Duel

- Requires character level >= 2 (hardcoded).
- Max participants: `era.max_duel_participants` (Era 1: 2).
- Creator invites one opponent. Opponent accepts or declines.
- Votes are **per-member** (`praxis_member_id` required). Voters may vote for one or both members -- each is a separate `Vote` row.
- Duel participants cannot vote on their own duel (character-level anti-self-vote, not account-level -- since a voter can rate both sides independently).
- Winner is determined by the highest `total_stars` across each member's votes.

### Duel outcome multipliers (Era 1)

| Faction | Win | Loss | Tie vs non-Snide | Tie vs Snide |
|---|---|---|---|---|
| UA | 1.5x | 0.5x | 1.0x | 0.5x |
| UA Masters | 0.8x | 0.8x | 1.0x | 0.8x |
| **S.N.I.D.E.** | **2.0x** | **0.0x** | **2.0x** | **1.0x** |
| Gestalt | 1.5x | 0.5x | 1.0x | 0.5x |
| Journeymen | 1.5x | 0.5x | 1.0x | 0.5x |
| Analog | 1.5x | 0.5x | 1.0x | 0.5x |
| Singularity | 1.5x | 0.5x | 1.0x | 0.5x |
| /Albescent | 1.5x | 0.5x | 1.0x | 0.5x |

**Tie tiebreaker rule (hardcoded):** if exactly one participant is Snide, Snide wins the tie -- applying `duel_win_modifier` to Snide and `duel_loss_modifier` to the other. If neither or both are Snide, both get 1.0x.

---

## Level privileges

| Level | Points (Era 1) | Unlocks |
|---|---|---|
| 0 | 0 | Browse tasks |
| 1 | 10 | Sign up for tasks; start collaborations |
| 2 | 70 | See pretired tasks; group welcome letters; start duels; group pages |
| 3 | 170 | Choose permanent faction; propose tasks; create second character |
| 4 | 330 | Meta task access (varies by faction); flag praxes |
| 5 | 610 | Vote to promote level-0 tasks; new UX secrets |
| 6 | 1090 | Meta task access tier 2 (varies by faction) |
| 7 | 1840 | Meta task: complete any task "as if" from own faction for full points |
| 8 | 3040 | New UX secrets; special trigger if player has completed one of each task |

Point thresholds come from `era.level_thresholds` and vary per era.

---

## Factions

### Faction selection

- All characters start in **UA** (not selectable -- assigned automatically).
- At level 3, the character must choose a permanent faction from the selectable ones (excludes UA, /Albescent, AgedOutOfUA, aged_out placeholder, na sentinel).
- If a character reaches level 3 while offline (not logged in when the level-up triggers), they are moved to **AgedOutOfUA** (`aged_out` slug) and prompted to choose on next login.
- **Faction change / defection:** a character can switch factions subject to defection rules tracked in `FactionDefectionHistory`. `can_always_rejoin=True` factions (UA Masters, /Albescent) can always be rejoined after leaving.

### Era 1 selectable factions

| Slug | Name | Identity |
|---|---|---|
| `ua_masters` | UA Masters | Veterans aged out of UA. Flat 0.8x on everything. |
| `snide` | S.N.I.D.E. | High-risk duel specialists. 2.0x wins, 0.0x losses. |
| `gestalt` | Gestalt | Collective-minded. Bonus on own tasks, penalty on other. |
| `journeymen` | Journeymen | Explorers. Task Vision (access to select retired tasks -- deferred v2). |
| `analog` | Analog | Depth over breadth. Double Dipper (repeat one task per level -- deferred v2). |
| `singularity` | Singularity | TBD -- currently 1.0x on all tasks. |

### Special / non-selectable factions

| Slug | Name | Notes |
|---|---|---|
| `ua` | UA | Starting faction. Full points. Forced to leave at level 3. |
| `albescent` | /Albescent | Unlock-only (not choosable at level 3). Full points + any meta tasks. |
| `aged_out` | AgedOutOfUA | Placeholder for characters who hit level 3 while offline. |
| `na` | None | Sentinel for tasks with no faction affiliation. Treated as own-faction. |

---

## Bank cap (task signups)

A character may have at most `era.max_task_signups` (Era 1: 20) in-progress praxes at once, counted across all types. Withdrawn praxes do not count against the cap. Attempting to create a new praxis when at capacity returns a 400 error.

---

## Praxis lifecycle

```
in_progress -> submitted        (all members call /submit)
            -> withdrawn        (creator calls /withdraw; can resubmit)
submitted   -> in_progress      (creator calls /reopen; resets all has_submitted flags)
any state   -> [deleted]        (creator; only if in_progress or withdrawn -- not if submitted)
```

- **Moderation status** (set by admin, not players): `visible | flagged | hidden | failed`
- Hidden praxes are excluded from public listings; their scores are excluded from character stats.
- Failed praxes carry an `admin_note` explaining the decision.
- Players can **flag** a praxis (level 4+ required; cannot flag own praxis).

---

## Era reset

Triggered by admin via `POST /admin/eras`. All behaviour is driven by the incoming era's `EraConfig` flags:

```
if reset_score       -> new CharacterStats.score = 0
if reset_level       -> new CharacterStats.level = 0
if reset_faction     -> character.faction_slug = "na" + defection history cleared
if reset_vote_budget -> new CharacterStats.votes_available = vote_budget_base
if reset_all_time_score -> new CharacterStats.all_time_score = 0  (almost always False)
```

Always on reset (not config-driven):
- New `Era` DB row created with `config_key` referencing the new `EraConfig`.
- Old `CharacterStats` rows preserved for historical queries; new rows created per character.
- All active tasks -> retired.
- In-progress praxis memberships carry over.

---

## Deferred features (v2)

These have schema support but no live service enforcement:

| Feature | Faction | What's missing |
|---|---|---|
| Task Vision | Journeymen | Retired tasks are not surfaced to Journeymen. |
| Double Dipper | Analog | No per-level task-repeat tracking. |
| Multi-faction tasks | -- | `TaskFaction` junction table exists but unused; only `Task.primary_faction_slug` is live. |
