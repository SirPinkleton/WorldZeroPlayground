# World Zero — Game Rules

> Source-of-truth spec for World Zero game mechanics. As of the **2026-07-13
> reconciliation** this document describes the **rules as actually enforced in
> code**. Rule *values* live in `backend/eras/era_1.py` (`CURRENT_ERA`); the
> config *shape* in `backend/game_config.py`; the *formulas* in
> `backend/services/scoring.py`. When a value here and the era file disagree,
> **the era file wins** — update this doc.
>
> A handful of rules are intended but **not yet enforced**; each is flagged
> ⚠️ with the GitHub issue tracking the build. Those are the only gaps.

---

## Change log

**2026-07-13 — Reconciliation with live code**
- Faction roster corrected: `ua_masters` **cut** from Era 1 (deferred to Era 2, ADR-0004); `gestalt` → **`wow`** ("Warriors of Whimsy"); `journeymen` → **`ephemerists`**; `analog` → **`everymen`**. Multiplier *values* were preserved across the renames.
- Characters start **unaffiliated (`na`)**, not UA (ADR-0019/0030). UA is now an ordinary invite-joinable faction, not the starter.
- Albescent is **joined in the field by defection** at level `albescent_level_required` (8) after completing at least one task from every faction — **implemented** (`services/character.py::can_start_as_albescent`). It **cannot** be chosen at character creation (returns 400). The old "starts in Albescent at creation" flow is gone.
- `is_selectable` (FactionConfig) and the `aged_out` faction were **removed** (#428, migration `0012`). `check_faction_graduation` is gone — no forced graduation.
- Level gates moved from hardcoded service constants to **`EraConfig` fields** (collab/duel/flag/metatask/comment/second-char/albescent levels). Values unchanged.
- `task_submit_level_gap` **removed** entirely.
- Open forks turned into issues: cross-faction modifier flattening (#452), metatask-list see-gate (#453), invitation-gated defection (#454), L5 "promote level-0 tasks" spec (#455).

**2026-06-05 — June reconciliation (vault SOT sync)**
- Additional character slot level gate: **4**.
- Faction choice: opt-in, not forced. `aged_out` graduation retired.
- Albescent unlock: account has a character at **level 8** who has completed **at least one task from each faction**.
- Collaboration participant cap **removed** — Era 1 collaborations are unlimited.

**2026-04-17 — Truth reconciliation pass** (historical)
- Snide tie rule: opponent uses their own faction's `duel_loss_modifier`.
- Task signup level gate added; `task_submit_level_gap` removed.
- Duel anti-self-vote made account-level.
- Vote budget switched to on-read recomputation.
- "The Terminal" display name → "Singularity". Sunyata faction dropped.

---

## What is configurable per era vs. hardcoded

### Configurable per era (fields on `EraConfig`)

| Field | Era 1 value | Effect |
|---|---|---|
| `max_task_signups` | 20 | Max concurrent in-progress praxes per character (bank cap) |
| `max_duel_participants` | 2 | Max members in a duel |
| `vote_budget_base` | 100 | Base votes for a new character; also the reset floor |
| `vote_budget_multiplier` | 2.0 | Votes grow by `floor(multiplier × score)` |
| `level_thresholds` | `(0,10,70,170,330,610,1090,1840,3040)` | Score to reach each level (index = level) |
| `level_to_propose_task` | 3 | Min level to propose a task |
| `level_to_propose_metatask` | 6 | Min level to propose a metatask |
| `level_to_see_retired_tasks` | 2 | Min level to see retired tasks |
| `level_to_see_pending_tasks` | 3 | Min level to see pending (in-review) tasks |
| `duel_level_required` | 2 | Min level to issue a duel challenge |
| `collaboration_level_required` | 1 | Min level to create a collab |
| `collab_auto_submit_days` | 10 | Silence-is-consent publish window for collabs (ADR-0012) |
| `metatask_apply_level` | 7 | Min level to apply a metatask (non-Albescent) |
| `flag_level_required` | 4 | Min level to flag a praxis for moderation |
| `comment_level_required` | 2 | Min level to post a comment (ADR-0006) |
| `comment_flag_review_threshold` | 1 | Flags before a comment hits the review queue |
| `second_character_level_required` | 4 | Min level on an existing character to create another |
| `albescent_level_required` | 8 | Min level (+ task coverage) to join Albescent |
| `faction_graduation_level` | 3 | **DORMANT** — retired by ADR-0022; not read as a gate |
| `invitation_task_threshold` | 2 | Completed tasks for faction X to earn X's invite (ADR-0022) |
| `invitation_point_threshold` | 50 | Points from X's tasks to earn X's invite (ADR-0022) |
| `reset_score` / `reset_level` / `reset_faction` / `reset_vote_budget` | `True` | Era-reset behaviour flags |
| `reset_all_time_score` | `False` | Whether reset clears all-time score (almost always False) |
| `allow_praxis_on_retired_task_factions` | `{ephemerists}` | Factions allowed to praxis on retired tasks (Task Vision) |
| `allow_praxis_on_pending_task_factions` | `∅` | Factions allowed to praxis on pending tasks |
| `factions` | dict of `FactionConfig` | Per-faction multipliers and duel modifiers |
| `tasks` | tuple of `TaskDef` | Task definitions seeded for this era |
| `level_profiles` | tuple of `LevelProfile` | Rank + unlock copy for the level-up pop-up |
| `taunt_templates` | dict | Per-faction taunt templates |

Per-faction fields on `FactionConfig`:

| Field | Effect |
|---|---|
| `own_task_modifier` | Solo/duel multiplier on own-faction (or `na`) tasks |
| `other_task_modifier` | Solo/duel multiplier on other-faction tasks |
| `collab_own_modifier` | Collab multiplier on own-faction tasks |
| `collab_other_modifier` | Collab multiplier on other-faction tasks |
| `duel_win_modifier` | Applied to base points on a duel win |
| `duel_loss_modifier` | Applied to base points on a duel loss |
| `can_always_rejoin` | Whether a character who left may return (Albescent only, in Era 1) |

> **Removed fields:** `is_selectable` (FactionConfig) and `task_submit_level_gap` (EraConfig) no longer exist. Once a character signs up for a task (signup is level-gated), they can always submit it.

### Genuinely hardcoded in service code

| Rule | Value | Where |
|---|---|---|
| Task signup gate | `task.level_required ≤ character.level` | `services/praxis.py` (`evaluate_signup`) |
| Stars range | 1–5 | `services/vote.py` |
| Unaffiliated slug | `"na"` | `services/scoring.py::UNAFFILIATED_FACTION_SLUG` |
| Snide slug (tiebreaker) | `"snide"` | `services/scoring.py::SNIDE_FACTION_SLUG` |
| Era-reset default faction | `"na"` | `services/era.py::ERA_RESET_DEFAULT_FACTION` |

Everything else that used to be "hardcoded" (collab/duel/flag/metatask/second-char/albescent levels) is now an `EraConfig` field — see the table above.

---

## Scoring

### Praxis score formula

```
praxis_score = (task_point_value + meta_task_points) × faction_multiplier × duel_multiplier + total_stars
```

- **`task_point_value`** — set on the Task by the proposer/admin.
- **`meta_task_points`** — flat bonus from attached metatask(s); stacks additively; applied per-member for collab/duel.
- **`faction_multiplier`** — see Faction multipliers.
- **`duel_multiplier`** — 1.0 for solo/collab; outcome-based for duels.
- **`total_stars`** — sum of all raw star ratings across every vote; added flat after all multipliers. Not an average.

Score is **not stored** — computed on the fly from votes. Implemented in `services/scoring.py::compute_praxis_score`.

### Character score

```
character.score = sum of praxis_score for all non-hidden, non-withdrawn praxes this era
```

Updated synchronously on every vote cast/updated and on withdraw/resubmit. Cached on the current-era `CharacterStats` row.

### All-time score

Increments with every point gain; never decremented, including on era reset (unless `reset_all_time_score`). Stored on `CharacterStats.all_time_score`.

### Vote budget

```
votes_available = vote_budget_base + floor(vote_budget_multiplier × character.score) − votes_spent_this_era
```

Always **recomputed on read** (`services/scoring.py::compute_votes_available`), clamped at 0; never stored as a running counter. The stored column is `votes_spent_this_era`.

- **First cast** on a praxis costs 1 (increments `votes_spent_this_era`).
- **Updating** an existing vote costs 0.
- `votes_available ≤ 0` blocks new casts but not updates.
- Era 1: budget grows by 2 votes per point earned.

### Level computation

```
character.level = highest index i where character.score ≥ era.level_thresholds[i]
```

Recalculated synchronously on every score change (`recalculate_character_stats`); stored on `CharacterStats.level`.

---

## Faction multipliers

Applied from the character's faction and the task's `primary_faction_slug`. A task with `primary_faction_slug = "na"` (or none) is treated as own-faction — no penalty. Votes are always added flat after all multipliers.

> ⚠️ **Pending #452:** all *other-faction* modifiers are slated to flatten to 1.0 (no cross-faction penalty for now). The tables below show **current** Era 1 values.

### Solo and duel (`own_task_modifier` / `other_task_modifier`)

| Faction | Own-faction | Other-faction |
|---|---|---|
| UA (`ua`) | 1.0× | 1.0× |
| S.N.I.D.E. (`snide`) | 1.0× | 0.7× |
| Warriors of Whimsy (`wow`) | 1.1× | 0.7× |
| The Ephemerists (`ephemerists`) | 1.0× | 0.7× |
| Everymen (`everymen`) | 1.0× | 0.7× |
| Singularity (`singularity`) | 1.0× | 1.0× |
| /Albescent (`albescent`) | 1.0× | 1.0× |

For duels, `faction_multiplier` uses these own/other modifiers, and `duel_multiplier` (below) is applied on top.

### Collab (`collab_own_modifier` / `collab_other_modifier`)

Each member's score is computed independently with their own faction's collab modifiers.

| Faction | Own-faction | Other-faction |
|---|---|---|
| UA (`ua`) | 1.0× | 1.0× |
| S.N.I.D.E. (`snide`) | 1.0× | 0.7× |
| Warriors of Whimsy (`wow`) | 1.1× | 0.9× |
| The Ephemerists (`ephemerists`) | 1.0× | 0.7× |
| Everymen (`everymen`) | 1.0× | 0.7× |
| Singularity (`singularity`) | 1.0× | 1.0× |
| /Albescent (`albescent`) | 1.0× | 1.0× |

---

## Praxis types

### Solo

- Any character meeting the task's `level_required` with bank capacity can create a solo praxis.
- **Signup level gate:** `character.level ≥ task.level_required` (`services/praxis.py`, `evaluate_signup`).
- Creator is auto-added as the sole `PraxisMember`.
- Votes are praxis-wide. Anti-self-vote is account-level.

### Collaboration

- Requires `character.level ≥ era.collaboration_level_required` (Era 1: 1) **to create**.
- **No participant cap** in Era 1.
- Creator invites other characters; each accepts or declines.
- **Level-lift rule (by design):** accepting a collab invite lets a lower-level player work a task above their own signup level. `respond_to_invite` gates the accept **only** on the invitee's bank cap and the collab not being already submitted — it deliberately does **not** check the invitee's level or the task's `level_required`.
- **Publish:** a collab reaches `submitted` when all current members mark `has_submitted = True`. Lazy-consensus publish window: `era.collab_auto_submit_days` (Era 1: 10) days of silence counts as consent (ADR-0012).
- Each member scores independently with their own faction modifiers.

### Duel

- Issued via the **challenge endpoint** (`services/duel.py`), not the praxis-create path (ADR-0011). Requires `character.level ≥ era.duel_level_required` (Era 1: 2).
- A duel is two linked praxes; max members `era.max_duel_participants` (Era 1: 2).
- Votes are **per-member** (`praxis_member_id` required); voters may vote for one or both sides — separate `Vote` rows.
- **Anti-self-vote (account-level, both sides):** a duel participant — any character on their account — cannot rate **either** side of a duel they're in. Enforced in `services/vote.py` (#309).
- Winner = highest `total_stars` across each member's votes.
- **Forfeit (sticky):** unsubmitting a settled duel side, or having your character banned, forfeits — the opponent wins by default (win/loss modifiers apply, vote tallies ignored) and the duel stays settled. Recorded in `Duel.forfeited_by_character_id`; resubmitting does not restore it (ADR-0011).

### Duel outcome multipliers (Era 1)

| Faction | Win | Loss |
|---|---|---|
| UA (`ua`) | 1.5× | 0.5× |
| S.N.I.D.E. (`snide`) | **2.0×** | **0.0×** |
| Warriors of Whimsy (`wow`) | 1.5× | 0.5× |
| The Ephemerists (`ephemerists`) | 1.5× | 0.5× |
| Everymen (`everymen`) | 1.5× | 0.5× |
| Singularity (`singularity`) | 1.5× | 0.5× |
| /Albescent (`albescent`) | 1.5× | 0.5× |

**Tie tiebreaker** (`services/scoring.py::compute_duel_multiplier`):
- Exactly one participant is Snide → Snide wins the tie: Snide gets its own `duel_win_modifier` (2.0×); the other player gets **their own** faction's `duel_loss_modifier` (e.g. a UA player gets 0.5×, not Snide's 0.0×).
- Neither or both Snide → both get 1.0×.

---

## Level privileges

Ability rows map to real gate constants in `era_1.py`. Rank names come from `level_profiles` (the level-up pop-up).

| Level | Points | Rank | Unlocks |
|---|---|---|---|
| 0 | 0 | — | Browse tasks |
| 1 | 10 | Trailhead | Sign up for tasks (`task.level_required ≤ level`); start collaborations |
| 2 | 70 | Ranger | Issue duel challenges; post comments; see retired tasks |
| 3 | 170 | Surveyor | Propose tasks; see pending (in-review) tasks |
| 4 | 330 | Warden | Flag praxes; create additional characters |
| 5 | 610 | Voyager | *(no rules gate — flavor only; see #455)* |
| 6 | 1090 | Chronicler | Propose metatasks; see the metatask list ⚠️ *(see-gate pending #453)* |
| 7 | 1840 | Luminary | Apply your own faction's metatasks |
| 8 | 3040 | Paragon | Join /Albescent (once you've completed a task from every faction) |

**Notes:**
- Faction choice is **not** a level unlock — it's invitation-gated (see Factions). The dormant `faction_graduation_level` is not read.
- Invitation letters are earned per ADR-0022 (see below), not a level-table unlock.
- Albescent's any-faction metatask access is a faction perk, not a level privilege.

Point thresholds come from `era.level_thresholds`.

---

## Factions

### Faction selection

- Characters start **unaffiliated (`na`)** — assigned automatically at creation (`services/character.py`, ADR-0019). No character starts in UA.
- Joining a faction is **invitation-gated**. A character earns faction X's invitation per ADR-0022 (below). At character *creation*, a non-`na` starting faction must be one the account already holds an invite for (Albescent excluded — it's never a creation option).
- **Defection** (`services/faction_service.py::defect_to_faction`) switches an existing character's faction. It enforces rejoin permission, faction existence, and the Albescent gate. ⚠️ It does **not** yet require the target faction's invitation — that gate is pending **#454** (the intended rule is: joining X requires X's invite, same as at creation).
- There is **no level gate** on faction choice, and **no forced graduation** — a character may stay unaffiliated indefinitely.
- `can_always_rejoin=True` factions (Albescent) can always be re-entered after leaving; defection history is tracked in `FactionDefectionHistory`.

### Era 1 factions

| Slug | Name | Notes |
|---|---|---|
| `ua` | UA — The Gilt Salon | Full points everywhere. Ordinary invite-joinable faction (ADR-0030); not a starter. |
| `snide` | S.N.I.D.E. | Duel specialists. 2.0× wins, 0.0× losses. |
| `wow` | Warriors of Whimsy | Collective-minded. +10% own-faction, penalty elsewhere. (Formerly `gestalt`.) |
| `ephemerists` | The Ephemerists | Task Vision — may praxis on retired tasks (`allow_praxis_on_retired_task_factions`). (Formerly `journeymen`.) |
| `everymen` | Everymen | Reliable generalists. (Formerly `analog`.) |
| `singularity` | Singularity | Hidden/lurker faction. Currently full points; abilities TBD. |
| `albescent` | /Albescent | Unlock-only, joined in the field (see below). Full points, any-faction metatasks. `can_always_rejoin=True`. |
| `na` | None | Sentinel for unaffiliated characters and no-faction tasks. Treated as own-faction. |

> **Not in Era 1:** `ua_masters` is deferred to Era 2 (ADR-0004); its old L4–L7 tasks are reassigned to `ua`. The `aged_out` / AgedOutOfUA faction is **retired** (migration `0012`) — no code path produces it.

### Albescent — join-in-the-field flow

- Albescent **cannot** be chosen at character creation — attempting it returns `400 "Albescent is joined in the field, not chosen at creation."`
- A character joins Albescent by **defection** once `can_start_as_albescent` is satisfied (`services/character.py`): the account has a character at `era.albescent_level_required` (8) **and** that character has completed at least one submitted, non-hidden praxis for **every** faction (each slug except `na`/`albescent`). Enforced — not a stub.
- Albescent grants full points (1.0×) on all tasks and the ability to apply any faction's metatasks. `can_always_rejoin=True`.

### Metatask access

Metatasks are a task type. Access is level- and faction-gated (faction rule routes through the seam below):

- **See the metatask list:** intended at level 6. ⚠️ Not yet enforced — any authenticated user currently sees the list (pending **#453**).
- **Propose** a metatask: `era.level_to_propose_metatask` (6).
- **Apply** a metatask: `era.metatask_apply_level` (7) for your **own** faction; **/Albescent** may apply **any** faction's metatask at any level.

Metatask bonuses are flat points, added before multipliers, and stack additively.

### Faction gating — the single seam

Every "may this character act on this task?" faction decision routes through one predicate: `services.faction_service.faction_permits(character, task, era) -> bool` (ADR-0029, #171). Today the only rule is the metatask gate: standard tasks are faction-open; a metatask requires the character's faction to match `task.metatask_faction_slug`; /Albescent may act on any. The apply-time **level** gate and the **bank cap** are separate axes. Listing visibility (hidden/deprecated factions excluded from task lists) is a faction-*status* axis, exposed as `faction_service.hidden_faction_slugs(session)`.

---

## Bank cap (task signups)

A character may hold at most `era.max_task_signups` (Era 1: 20) in-progress praxes at once, across all types. Withdrawn praxes don't count. Creating past capacity returns 400.

---

## Praxis lifecycle

```
in_progress -> submitted     (all members call /submit; or lazy-consensus after collab_auto_submit_days)
            -> withdrawn      (creator calls /withdraw; can resubmit)
submitted   -> in_progress    (creator calls /reopen; resets all has_submitted flags)
any state   -> [deleted]      (creator; only if in_progress or withdrawn — not if submitted)
```

- **Moderation status** (admin-set): `visible | flagged | hidden | failed`.
- Hidden praxes are excluded from public listings and from character score.
- Failed praxes carry an `admin_note`.
- Players may **flag** a praxis at `era.flag_level_required` (4); cannot flag their own (account-level check).

---

## Era reset

Triggered by admin (`POST /admin/eras`); driven by the incoming era's flags (`services/era.py::apply_era_reset`):

```
if reset_score          -> new CharacterStats.score = 0
if reset_level          -> new CharacterStats.level = 0
if reset_faction        -> character.faction_slug = "na"; defection history cleared for the new era
if reset_vote_budget    -> new CharacterStats.votes_spent_this_era = 0
if reset_all_time_score -> new CharacterStats.all_time_score = 0   (almost always False)
```

Always on reset (not config-driven):
- New `Era` row created with `config_key` for the new `EraConfig`.
- Old `CharacterStats` rows preserved; new per-character rows created.
- All active tasks → retired.
- In-progress praxis memberships **carry over** untouched (the signup level gate grandfathers them in).

---

## Deferred features (v2)

Schema/design intent but no live enforcement:

| Feature | Faction | What's missing |
|---|---|---|
| Task Vision (full) | The Ephemerists | Retired tasks aren't *surfaced* to Ephemerists (praxis-on-retired is allowed via `allow_praxis_on_retired_task_factions`, but discovery/listing isn't). |
| Double Dipper | Everymen | No per-level task-repeat tracking. |
| Lurker vote bank +100 | Singularity | Trigger + increment logic unbuilt. |
| Multi-faction tasks | — | Only `Task.primary_faction_slug` is live; the `TaskFaction` junction was dropped. |
| Promote level-0 tasks by vote | — | Unspecced; tracked in **#455**. |

---

## Open items (issues)

The old "SESSION R" backend fix list is closed — those items are all implemented. Remaining intended-but-unbuilt rules:

- **#452** — flatten all cross-faction (other/collab-other) modifiers to 1.0 for Era 1.
- **#453** — gate metatask-list visibility behind level 6.
- **#454** — require the target faction's invitation on defection.
- **#455** — spec the level-5 "promote level-0 tasks" mechanic.
