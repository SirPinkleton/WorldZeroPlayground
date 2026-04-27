# World Zero — Claude Code Task Queue

> This file is the handoff from Cowork planning sessions to Claude Code execution sessions.
> Molly and her Cowork assistant maintain this file during the day.
> Claude Code agents read it at the start of every session and work through tasks in order.
>
> **Always read CLAUDE.md before starting.**
> **Read the relevant file in `docs/spec/` before implementing any feature** (see the routing table in `CLAUDE.md`).
> **Mark tasks DONE (with date) when complete. Do not delete them.**

---

## 🏗️ SESSION P — Praxis Unification (architectural refactor)

> Planned 2026-04-16. Touches every layer of the stack. Do NOT start any P task
> until you have read this section in full **and** `docs/spec/SPEC-data-models.md`,
> `docs/spec/SPEC-api.md`, and `docs/spec/SPEC-backend-architecture.md`.
>
> **Motivation:** Three overlapping submission systems exist (legacy `praxis` table,
> legacy `collaboration` table, current `submission` table). The canonical noun is
> **Praxis**. A solo praxis is a collab praxis with one member. A duel is a praxis
> with config-driven max participants and per-member star voting. All three systems
> collapse into one table and one service.
>
> **Run tasks in order. Each task depends on the previous.**

### TARGET SCHEMA (reference for all P tasks)

**`praxis` table** (replaces `submission`):

- `id`, `task_id` (FK task), `type` (PraxisType: solo|collab|duel)
- `status` (PraxisStatus: in_progress|submitted)
- `title` (Text nullable), `body_text` (Text nullable) — shared by all members
- `is_withdrawn` (bool), `moderation_status` (str), `admin_note`, `flagged_at`
- `created_by_id` (FK character — always required, never nullable)
- `created_at`, `updated_at`

**`praxis_member` table** (replaces `submission_member` + `character_task`):

- `id`, `praxis_id` (FK praxis), `character_id` (FK character)
- `has_submitted` (bool), `joined_at` (datetime)
- UNIQUE(praxis_id, character_id)

**`praxis_invite` table** (replaces `submission_invite`):

- `id`, `praxis_id` (FK praxis), `inviter_id` (FK character), `invitee_id` (FK character)
- `status` (PraxisInviteStatus: pending|accepted|declined), `created_at`

**`vote` table changes**:

- `submission_id` → `praxis_id` (FK praxis)
- `duel_vote_for` (FK character) → `praxis_member_id` (FK praxis_member, nullable)
- NULL praxis_member_id = solo/collab vote; non-NULL = duel vote for that member

**`media_item`, `flag`, `praxis_meta_task`**: rename `submission_id` → `praxis_id`

**Tables to drop** (after data migration):
`submission`, `submission_member`, `submission_invite`,
legacy `praxis` (old table), `collaboration`, `collaboration_member`,
`collaboration_invite`, `character_task`

---

### TASK P.1 ✅ 2026-04-17 — Alembic migration: unify to single Praxis table

**Scope:** Database only. No Python model/service code changes yet.

**Do:**

1. Write `backend/alembic/versions/XXXX_praxis_unification.py`
2. Create new `praxis`, `praxis_member`, `praxis_invite` tables per the target schema above
3. Data migration — execute in this order:
   a. Migrate legacy `praxis` rows (type='solo') → new `praxis` + `praxis_member` for each `character_id`
   b. Migrate `collaboration` rows → new `praxis` (type = collaboration.mode) + `praxis_member` per `collaboration_member`
   c. Migrate `submission` rows → new `praxis` rows:
   - solo rows: type='solo', `created_by_id` = `character_id`; create `praxis_member`
   - collab/duel rows: type from `collab_mode`, `created_by_id` from `created_by_id`; create `praxis_member` per `submission_member`
     d. Migrate `submission_invite` → `praxis_invite`
     e. Migrate `collaboration_invite` → `praxis_invite` (dedup if same praxis already has the invite)
     f. Migrate `character_task` rows with no corresponding active praxis → skeleton `praxis` (in_progress, no title/body) + `praxis_member`
     g. Update `vote.submission_id` → `praxis_id`; map `duel_vote_for` character FK to the corresponding `praxis_member_id`
     h. Update `media_item.submission_id` → `praxis_id`
     i. Update `flag.submission_id` → `praxis_id`
     j. Update `praxis_meta_task.submission_id` → `praxis_id`
4. Drop old tables: `submission`, `submission_member`, `submission_invite`, legacy `praxis`, `collaboration`, `collaboration_member`, `collaboration_invite`, `character_task`
5. Write downgrade path (re-create old tables, migrate back)

**Files:** `backend/alembic/versions/XXXX_praxis_unification.py`

**Acceptance:**

- `alembic upgrade head` runs clean against a fresh DB and against a DB with existing data
- `alembic downgrade -1` returns to previous state without data loss
- All FK constraints are intact after migration
- No orphaned rows in `vote`, `media_item`, `flag`, `praxis_meta_task`

---

### TASK P.2 ✅ 2026-04-17 — Backend models: rewrite to unified Praxis

**Depends on:** P.1

**Do:**

1. Rewrite `backend/models/praxis.py` — define `PraxisType`, `PraxisStatus`, `PraxisInviteStatus`, `Praxis`, `PraxisMember`, `PraxisInvite`, `MediaItem` (keep MediaItem here as it already lives in this file; update FK to `praxis_id`)
2. Delete `backend/models/submission.py` and `backend/models/collaboration.py`
3. Update `backend/models/vote.py`: rename `submission_id` → `praxis_id`, rename `duel_vote_for` → `praxis_member_id` (FK to `praxis_member.id`, nullable), update unique constraints
4. Update `backend/models/flag.py`: `submission_id` → `praxis_id`
5. Update `backend/models/meta_task.py`: `submission_id` → `praxis_id` in `PraxisMetaTask`
6. Update `backend/models/task.py`: remove `CharacterTask` class, update `Task.praxes` relationship to point to new `Praxis`
7. Update `backend/models/__init__.py` (or wherever models are registered) to remove old imports

**Key model design notes:**

- `Praxis.created_by_id` is always non-nullable — every praxis has an initiating character
- Solo praxes have exactly one `PraxisMember` (the creator); this is enforced in the service, not the DB
- `PraxisMember` has NO `title`/`body_text` — content is on `Praxis` itself
- `PraxisInvite` has no `invite_type` — the praxis's own `type` is authoritative
- `Vote.praxis_member_id` is NULL for solo/collab votes, non-NULL for duel votes

**Files:**

- `backend/models/praxis.py` (rewrite)
- `backend/models/submission.py` (delete)
- `backend/models/collaboration.py` (delete)
- `backend/models/vote.py`
- `backend/models/flag.py`
- `backend/models/meta_task.py`
- `backend/models/task.py`

**Acceptance:** `python -c "from models.praxis import Praxis, PraxisMember, PraxisInvite"` succeeds; no import of `Submission`, `Collaboration`, `CharacterTask` anywhere in `models/`

---

### TASK P.3 ✅ 2026-04-17 — Backend schemas: rewrite to unified Praxis

**Depends on:** P.2

**Do:**

1. Rewrite `backend/schemas/praxis.py` as the single canonical schema file:
   - `PraxisMemberOut` (id, character_id, character_display_name, character_avatar_url, has_submitted, joined_at)
   - `PraxisInviteOut` (id, praxis_id, inviter, invitee, status, created_at)
   - `PraxisOut` (all fields; `members: List[PraxisMemberOut]`; `invites: List[PraxisInviteOut]`; `media_items`; `votes`; `score`)
   - `PraxisCreate` (task_id, type, title optional, body_text optional)
   - `PraxisUpdate` (title optional, body_text optional)
   - `PraxisInviteCreate` (invitee_id)
   - `InviteResponse` (accept: bool)
   - `DuelVoteSummary` (per-member vote totals)
   - `PraxisVoteIn` (stars: int, praxis_member_id: Optional[int])
   - `PraxisCardOut` (lightweight card for lists)
2. Delete `backend/schemas/submission.py` and `backend/schemas/collaboration.py`
3. Update any schema files that imported `SubmissionOut` etc.

**Files:**

- `backend/schemas/praxis.py` (rewrite)
- `backend/schemas/submission.py` (delete)
- `backend/schemas/collaboration.py` (delete)

**Acceptance:** No reference to `SubmissionOut`, `CollaborationOut`, `SubmissionCreate` anywhere in `schemas/`

---

### TASK P.4 ✅ 2026-04-17 — Backend services: rewrite to unified Praxis

**Depends on:** P.3

**Do:**

1. Rewrite `backend/services/praxis.py` as the single canonical service:
   - `_count_active_praxes(character_id, session)` — counts PraxisMember rows where praxis.status=in_progress and not withdrawn; used for bank limit enforcement
   - `build_praxis_out(praxis, session, era)` — unified serializer for all types
   - `create_praxis(character_id, task_id, type, title, body_text, session, era)` — enforces bank limit, creates Praxis + first PraxisMember
   - `edit_praxis(praxis_id, character_id, data, session)` — edit title/body_text (only creator or member, only if in_progress)
   - `withdraw_praxis(praxis_id, character_id, session)` — sets is_withdrawn, removes from bank
   - `resubmit_praxis(praxis_id, character_id, session)`
   - `flag_praxis(praxis_id, character_id, reason, session)`
   - `invite_member(praxis_id, inviter_id, invitee_id, session, era)` — checks duel max via `era.max_duel_participants`
   - `respond_to_invite(invite_id, invitee_id, accept, session)` — on accept: creates PraxisMember, checks invitee's bank limit
   - `kick_member(praxis_id, kicker_id, target_character_id, session)`
   - `submit_for_member(praxis_id, character_id, session)` — sets PraxisMember.has_submitted; if all members submitted, sets Praxis.status=submitted
   - `reopen_praxis(praxis_id, character_id, session)`
   - `list_praxes(session, *, type, task_id, character_id, status, limit, offset)`
   - `cast_vote(praxis_id, voter_character_id, voter_account_id, stars, session, era)`
   - `cast_duel_vote(praxis_id, voter_character_id, voter_account_id, praxis_member_id, stars, session, era)`
   - `get_duel_vote_summary(praxis_id, session)`
2. Update `backend/services/admin_service.py`: replace all `Submission` references with `Praxis`
3. Update `backend/services/character_stats.py`: query `Praxis` not `Submission`
4. Update `backend/services/voting.py` if it exists separately
5. Delete `backend/services/submission.py` and `backend/services/collaboration.py`

**Key rule:** add `max_duel_participants: int` to `EraConfig` in `backend/game_config.py` and set a value in `backend/eras/era_1.py`. The service reads `era.max_duel_participants` — never hardcodes 2.

**Files:**

- `backend/services/praxis.py` (rewrite)
- `backend/services/submission.py` (delete)
- `backend/services/collaboration.py` (delete)
- `backend/services/admin_service.py`
- `backend/services/character_stats.py`
- `backend/game_config.py`
- `backend/eras/era_1.py`

**Acceptance:** No reference to `Submission`, `Collaboration`, or `CharacterTask` in `services/`; `pytest backend/tests/unit/ -v` passes

---

### TASK P.5 ✅ 2026-04-17 — Backend routes: single unified praxes router

**Depends on:** P.4

**Do:**

1. Rewrite `backend/routers/praxes.py` as the single unified router (all endpoints under `/praxes`):
   - `GET /praxes` — list with `?type=solo|collab|duel`, `?task_id=`, `?character_id=`, `?status=`
   - `GET /praxes/{id}` — detail
   - `POST /praxes` — create (solo, collab, or duel based on `type` in body)
   - `PUT /praxes/{id}` — edit title/body_text
   - `POST /praxes/{id}/withdraw`
   - `POST /praxes/{id}/resubmit`
   - `POST /praxes/{id}/flag`
   - `POST /praxes/{id}/media` — upload media (any praxis type)
   - `DELETE /praxes/{id}/media/{media_id}`
   - `POST /praxes/{id}/invite` — invite a member (collab/duel only)
   - `POST /praxes/{id}/invites/{invite_id}/respond`
   - `POST /praxes/{id}/submit` — member marks themselves as submitted
   - `POST /praxes/{id}/reopen`
   - `POST /praxes/{id}/kick/{character_id}`
   - `POST /praxes/{id}/vote` — cast vote (body: `PraxisVoteIn`)
   - `GET /praxes/{id}/votes` — duel vote summary
2. Delete `backend/routers/submissions.py` and `backend/routers/collaborations.py`
3. Update `backend/routers/admin.py`: replace all `Submission` references with `Praxis`; update endpoint paths if any were `/admin/submissions/...` → `/admin/praxes/...`
4. Update `backend/main.py` to remove old router includes, confirm praxes router is included

**Files:**

- `backend/routers/praxes.py` (rewrite)
- `backend/routers/submissions.py` (delete)
- `backend/routers/collaborations.py` (delete)
- `backend/routers/admin.py`
- `backend/main.py`

**Acceptance:** `GET /praxes`, `POST /praxes`, and `GET /praxes/{id}` return 200; no `/submissions` or `/collaborations` routes registered; `pytest backend/tests/integration/ -v` passes

---

### TASK P.6 ✅ 2026-04-17 — Frontend API: single unified praxis client

**Depends on:** P.5 (backend must be running with new routes)

**Do:**

1. Rewrite `frontend/src/api/praxis.ts` as the single canonical client:
   - Types: `PraxisMemberOut`, `PraxisInviteOut`, `PraxisOut`, `PraxisCardOut`, `MediaItemOut`, `DuelVoteSummary`
   - Functions: `listPraxes`, `getPraxis`, `createPraxis`, `updatePraxis`, `withdrawPraxis`, `resubmitPraxis`, `flagPraxis`
   - Media: `addMedia`, `deleteMedia`
   - Collab/duel: `inviteMember`, `respondToInvite`, `submitForMember`, `reopenPraxis`, `kickMember`
   - Voting: `castVote`, `getDuelVoteSummary`
2. Delete `frontend/src/api/submissions.ts` and `frontend/src/api/collaborations.ts`
3. Update `frontend/src/api/admin.ts`: rename `moderatePraxis` if needed, update types
4. Update `frontend/src/api/votes.ts` if it references submission types

**Files:**

- `frontend/src/api/praxis.ts` (rewrite)
- `frontend/src/api/submissions.ts` (delete)
- `frontend/src/api/collaborations.ts` (delete)
- `frontend/src/api/admin.ts`

**Acceptance:** `npm run build` (or `tsc --noEmit`) from `frontend/` completes with no errors referencing old types

---

### TASK P.7 ✅ 2026-04-17 — Frontend pages + components: wire to new API

**Depends on:** P.6

**Do:**

1. Update `frontend/src/pages/PraxisDetail.tsx`: import from `api/praxis`, use `PraxisOut` type; support solo and collab/duel rendering from the same component (or keep as shared detail view)
2. Update `frontend/src/pages/Praxes.tsx`: import from `api/praxis`, use `listPraxes`
3. Update `frontend/src/pages/EditPraxis.tsx`: import from `api/praxis`, use `updatePraxis`
4. Update `frontend/src/pages/CollaborationDetail.tsx`: import from `api/praxis`; consider whether this page can merge into PraxisDetail (collab/duel praxes now use same shape). Keep them separate if the UX is meaningfully different.
5. Update `frontend/src/pages/EditCollaboration.tsx`: import from `api/praxis`
6. Update `frontend/src/pages/SubmitProof.tsx`: import from `api/praxis`, use `createPraxis` with appropriate type
7. Update `frontend/src/components/PraxisCard.tsx`: use `PraxisOut` from `api/praxis`
8. Update `frontend/src/components/CollaborationCard.tsx`: use `PraxisCardOut` from `api/praxis`
9. Update feed components that use `SubmissionInviteOut` or `SubmissionOut` types
10. Update `frontend/src/App.tsx` routing: remove any `/collaborations` legacy routes if they only existed as shims; confirm `/praxes` routes work

**Files:**

- All pages and components listed above
- `frontend/src/App.tsx`

**Acceptance:** Dev server starts clean; `/praxes` list renders; detail page for a solo and collab praxis both load; no TypeScript errors; no console errors referencing undefined API functions

---

### TASK P.8 ✅ 2026-04-17 — Tests and spec docs

**Depends on:** P.5

**Do:**

1. Rewrite `backend/tests/integration/test_submissions.py` → rename to `test_praxis.py`; update all imports and endpoint paths to `/praxes`; cover:
   - Create solo praxis (happy path + bank limit enforcement)
   - Create collab praxis, invite member, member accepts, both submit
   - Create duel praxis, invite opponent, vote per member, get vote summary
   - Withdraw and resubmit
   - Media upload and delete
   - Flag + admin moderation
2. Update `backend/tests/integration/test_admin.py`: update any references to `/admin/submissions/` → `/admin/praxes/`
3. Update `backend/tests/integration/test_votes.py` if it exists
4. Update `docs/spec/SPEC-data-models.md`: describe the new unified Praxis schema
5. Update `docs/spec/SPEC-api.md`: document the `/praxes` endpoints, remove `/submissions` and `/collaborations`
6. Update `docs/BUILD_STATE.md`: mark SESSION P complete, note deprecated tables dropped

**Note:** Tasks T.4 (integration tests: praxes routes) and T.9 (collaborations coverage) are superseded by this task.

**Files:**

- `backend/tests/integration/test_praxis.py` (rename from test_submissions.py)
- `backend/tests/integration/test_admin.py`
- `docs/spec/SPEC-data-models.md`
- `docs/spec/SPEC-api.md`
- `docs/BUILD_STATE.md`

**Acceptance:** `pytest backend/tests/ -v` passes; `grep -ri "Submission\|Collaboration\|character_task" backend/ frontend/src/ docs/` returns no hits (except in migration history and git log)

---

## ⚖️ SESSION R — Rules Reconciliation Fixes

> Implements the open items from the April 17 rules reconciliation (see `docs/spec/SPEC-game-rules.md` backend fix list).
> **Start after SESSION P is complete.**
> **Read before starting:** `CLAUDE.md`, `docs/spec/SPEC-game-rules.md`, `backend/game_config.py`, `backend/eras/era_1.py`.
>
> Items are independent — they can be done in any order unless noted.

### TASK R.1 ✅ 2026-04-17 — Enforce task signup level gate

**Problem:** Praxis creation does not check whether `character.level ≥ task.level_required`.

**Fix:**

1. In `backend/services/praxis.py::create_praxis`, load the task's `level_required` and raise 403 if the character's level is below it.
2. Return a clear error message: `"Character level {n} is below the required level {m} for this task."`

**Files:** `backend/services/praxis.py`

**Acceptance:** A character below `task.level_required` gets a 403 on `POST /praxes`; a character at or above it succeeds.

---

### TASK R.2 ✅ 2026-04-17 — Remove `task_submit_level_gap` from EraConfig

**Problem:** `task_submit_level_gap` is a dead field — once a character signs up, they can always submit regardless of level. The field adds confusion.

**Fix:**

1. Remove `task_submit_level_gap` from the `EraConfig` dataclass in `backend/game_config.py`.
2. Remove it from `backend/eras/era_1.py`.
3. Remove any service code that reads it.

**Files:** `backend/game_config.py`, `backend/eras/era_1.py`, any service that references `task_submit_level_gap`

**Acceptance:** `grep -r "task_submit_level_gap" backend/` returns no hits; tests pass.

---

### TASK R.3 ✅ 2026-04-17 — Add `max_collab_participants` to EraConfig; enforce on collab invite

**Problem:** Collab praxes have no participant cap. The intended limit is 20.

**Fix:**

1. Add `max_collab_participants: int = 20` to `EraConfig` in `backend/game_config.py`.
2. Set the value in `backend/eras/era_1.py`.
3. In `backend/services/praxis.py::respond_to_invite`, when the invitee accepts a collab praxis, count current members and reject with 400 if `count >= era.max_collab_participants`.

**Files:** `backend/game_config.py`, `backend/eras/era_1.py`, `backend/services/praxis.py`

**Acceptance:** Accepting an invite that would push a collab over 20 members returns 400; under 20 succeeds.

---

### TASK R.4 ✅ 2026-04-17 — Switch duel anti-self-vote to account-level

**Problem:** Duel vote validation checks `voter.character_id not in duel members` (character-level). It should check `voter.account_id not in duel participants' account_ids` — a voter cannot use _any_ of their characters to rate either side of a duel they participate in.

**Fix:**

1. In `backend/services/praxis.py::cast_duel_vote`, load the account IDs of both duel members and compare against `voter_account_id`.
2. Reject with 403 if the voter's account owns any member character.

**Files:** `backend/services/praxis.py`

**Acceptance:** A voter whose alt-character is in a duel cannot vote on that duel from any character; an unrelated voter can.

---

### TASK R.5 ✅ 2026-04-17 — Vote budget: on-read recomputation

**Problem:** `votes_available` is stored as a running counter and decremented on each vote. It drifts from the formula if score changes (era reset, stat patch, etc.) and does not grow as the character earns points.

**Fix:**

1. In `CharacterStats`, replace the stored `votes_available` column with `votes_spent_this_era` (count of distinct first-casts this era). **Alembic migration required.**
2. Add a `compute_votes_available(stats, era)` helper in `backend/services/scoring.py`:
   ```python
   return era.vote_budget_base + floor(era.vote_budget_multiplier * stats.score) - stats.votes_spent_this_era
   ```
3. Everywhere `votes_available` was read, call the helper instead.
4. On first vote cast on a praxis, increment `votes_spent_this_era` (not decrement a counter).
5. On era reset with `reset_vote_budget=True`, zero `votes_spent_this_era` (not restore a fixed value).
6. Update `CharacterOut` / `CharacterStatsOut` schemas to expose the computed value, not the raw column.

**Files:** `backend/models/character.py` (or wherever CharacterStats lives), `backend/services/scoring.py`, `backend/services/praxis.py`, `backend/services/character_stats.py`, `backend/schemas/character.py`, `backend/alembic/versions/XXXX_vote_budget_recompute.py`

**Acceptance:** After earning points, a character's displayed vote budget reflects the new score without any explicit budget refresh; era reset zeroes `votes_spent_this_era` and the budget recalculates correctly from the new score.

---

### TASK R.6 ✅ 2026-04-17 — Fix Snide tie rule: opponent uses own faction's loss modifier

**Problem:** `backend/services/scoring.py::compute_duel_multiplier` applies Snide's `duel_loss_modifier` (0.0×) to the non-Snide player in a tie. The correct behavior: the non-Snide player receives **their own faction's** `duel_loss_modifier`.

**Fix:**

1. In `compute_duel_multiplier`, when resolving a tie where exactly one participant is Snide: apply `snide_config.duel_win_modifier` to Snide and `opponent_faction_config.duel_loss_modifier` to the opponent (not `snide_config.duel_loss_modifier`).

**Files:** `backend/services/scoring.py`

**Acceptance:** A UA character tied against Snide receives 0.5× (UA's loss modifier), not 0.0×; Snide still receives 2.0×.

---

### TASK R.7 ✅ 2026-04-17 — Second character level gate (level 5) + Albescent faction gate (level 8)

**Problem:** Creating a second character currently requires level 3 on any existing character. Target: level 5. Additionally, choosing Albescent as the starting faction for a new character requires the account to have at least one character at level 8.

**Backend:**

1. In `backend/services/character.py::create_character`, raise the existing level check from 3 → 5.
2. If the new character's requested faction is `"albescent"`, additionally verify that at least one of the account's existing characters has `stats.level >= 8`. Reject with 403 and a clear message if not.

**Frontend:** 3. Update any frontend copy or gate checks that reference "level 3" for second character creation to "level 5". 4. In the character creation flow, only show Albescent as a choosable starting faction if the account has a character at level 8.

**Files:** `backend/services/character.py`, relevant frontend character creation component

**Acceptance:** Creating a second character at level 4 returns 403; at level 5 succeeds. Choosing Albescent without a level-8 character returns 403; with one succeeds.

---

### TASK R.8 ✅ 2026-04-17 — Albescent onboarding: start in Albescent, skip UA

**Depends on:** R.7

**Problem:** New characters always start in `"ua"`. An Albescent second character should start in `"albescent"` at level 1 and never be assigned to UA.

**Fix:**

1. In `backend/services/character.py::create_character`, if `faction_slug = "albescent"`, set `character.faction_slug = "albescent"` directly instead of the default `"ua"` assignment.
2. Skip the faction graduation check (UA → aged_out) for Albescent characters — they are never in UA.

**Files:** `backend/services/character.py`

**Acceptance:** A second character created as Albescent has `faction_slug = "albescent"` immediately; `GET /characters/{id}` shows faction as Albescent, not UA.

---

### TASK R.9 ✅ 2026-04-17 — Metatask level privileges (covered by M.3)

**Problem:** The level table has stale metatask access rows (level 4 "meta task access"). Correct model: level 6 = see list + propose; level 7 = apply own faction's metatasks; Albescent = apply any faction.

**Backend:**

1. In `backend/services/meta_task.py` (or wherever metatask access is gated), remove any level-4 gate.
2. Gate "see metatask list" and "propose metatask" behind `character.level >= 6`.
3. Gate "apply metatask to praxis" behind `character.level >= 7` OR `character.faction_slug == "albescent"`.
4. For Albescent: allow applying metatasks from any faction; for level-7 characters: only their own faction's metatasks.

**Frontend:** 5. Remove metatask UI elements for characters below level 6. 6. Show "propose" controls at level 6+; show "apply" controls at level 7+ (or Albescent).

**Files:** `backend/services/meta_task.py`, relevant frontend metatask components

**Acceptance:** Level 5 character sees no metatask UI; level 6 sees list and propose button; level 7 can apply own-faction metatasks; Albescent character can apply any-faction metatasks.

---

### TASK R.10 ✅ 2026-04-17 — Remove "group welcome letters" from level-2 frontend display

**Problem:** The level privileges table in the frontend shows "group welcome letters" under level 2. Letters are part of the faction flow, not a level unlock — this is a display error.

**Fix:** Remove the "group welcome letters" entry from whatever component renders the level privileges table.

**Files:** Whichever frontend component renders level unlocks (search for "welcome letters" or "group welcome")

**Acceptance:** Level 2 row no longer mentions welcome letters anywhere in the UI.

---

## 🧩 SESSION M — Metatask as Task Type

> Rebuild metatasks as a task type rather than a separate model.
> **Start after SESSION P is complete** (SESSION P unifies the Praxis model which metatasks attach to).
> **Read before starting:** `CLAUDE.md`, `docs/spec/SPEC-game-rules.md` (Metatask access section), `docs/spec/SPEC-data-models.md`.
>
> A metatask is a task with `task_type = "metatask"`. It cannot be done standalone — it must be
> associated with another (non-metatask) praxis. When applied, its `point_value` is added as a flat
> bonus to the praxis score before faction multipliers.

### TASK M.1 ✅ 2026-04-17 — Add `task_type` to Task model and seed metatask tasks

**Do:**

1. Add `task_type: TaskType` enum column to the `Task` model (`TaskType.standard | TaskType.metatask`). Default `standard`. **Alembic migration required.**
2. Add `metatask_faction_slug: Optional[str]` to `Task` — the faction this metatask belongs to (used for access gating at level 7).
3. Add `TaskType` enum to `backend/models/task.py`.
4. Update `TaskOut` schema to include `task_type` and `metatask_faction_slug`.
5. Update `backend/eras/era_1.py` `TaskDef` definitions to include `task_type` (existing tasks are `standard`; add initial metatask definitions).
6. Update `backend/game_config.py::TaskDef` to include `task_type` and `metatask_faction_slug` fields.

**Files:** `backend/models/task.py`, `backend/schemas/task.py`, `backend/game_config.py`, `backend/eras/era_1.py`, migration file

**Acceptance:** `GET /tasks?task_type=metatask` returns only metatask tasks; `GET /tasks` (no filter) returns all; migration runs clean.

---

### TASK M.2 ✅ 2026-04-17 — Metatask association on Praxis

**Depends on:** M.1, P.1 (praxis unification migration)

**Problem:** Currently `PraxisMetaTask` stores a link between a praxis and an old-model metatask. After M.1, a metatask is just a Task row with `task_type = "metatask"`. The association table needs to point to the task (not a separate metatask model).

**Do:**

1. Rename/rewrite `praxis_meta_task` table: `praxis_id` (FK praxis) + `task_id` (FK task, must have `task_type = "metatask"`). **Alembic migration required.**
2. Drop any separate `meta_task` or `metatask` model/table that is not the unified `Task` table.
3. Add a DB check or service-level guard: only tasks with `task_type = "metatask"` can be linked via `praxis_meta_task`.
4. Update `build_praxis_out` in `backend/services/praxis.py` to compute `meta_task_points` by summing `task.point_value` for all linked metatask tasks.

**Files:** `backend/models/meta_task.py` (or wherever the join table lives), `backend/services/praxis.py`, migration file

**Acceptance:** Linking a standard task as a metatask on a praxis returns 400; linking a metatask task succeeds and adds its points to the praxis score.

---

### TASK M.3 ✅ 2026-04-17 — Metatask apply/remove service + routes

**Depends on:** M.2

**Do:**

1. Add `apply_metatask(praxis_id, task_id, character_id, session, era)` to `backend/services/praxis.py`:
   - Verify `task.task_type == TaskType.metatask`.
   - Verify character's level/faction access (level 7 + own faction, or Albescent + any faction).
   - Verify the praxis is in `in_progress` status.
   - Insert `praxis_meta_task` row; trigger `recalculate_character_stats`.
2. Add `remove_metatask(praxis_id, task_id, character_id, session)` — removes the link; recalculates stats.
3. Add routes to `backend/routers/praxes.py`:
   - `POST /praxes/{id}/metatasks` — body: `{ task_id: int }`
   - `DELETE /praxes/{id}/metatasks/{task_id}`

**Files:** `backend/services/praxis.py`, `backend/routers/praxes.py`

**Acceptance:** A level-7 Gestalt character can apply a Gestalt metatask but not a Snide one; an Albescent character can apply either; applying adds the points; removing subtracts them.

---

### TASK M.4 ✅ 2026-04-17 — Metatask propose + admin approve routes

**Depends on:** M.1

**Do:**

1. Level-6+ characters can propose a new metatask task via `POST /tasks` with `task_type = "metatask"` and `metatask_faction_slug`. Proposed metatasks start in `pending` status like any other task.
2. Admin approves via existing `POST /admin/tasks/{id}/activate` (or equivalent) — no new route needed if the task activation flow already handles `task_type = "metatask"`.
3. Update `GET /tasks` to support `?task_type=metatask` filter.
4. Ensure `propose_task` service enforces level-6 gate for metatask proposals (not the standard level-3 gate).

**Files:** `backend/services/task.py`, `backend/routers/tasks.py`

**Acceptance:** A level-6 character can propose a metatask; a level-5 character cannot; admin can activate it; activated metatask appears in `GET /tasks?task_type=metatask`.

---

### TASK M.5 ⚠️ PARTIAL 2026-04-17 — Frontend: metatask list, apply/remove UI

**Done in this session:**

- `frontend/src/api/metaTasks.ts` rewritten — `listMetatasks` and `proposeMetatask` hit the unified `/tasks` endpoint with `task_type=metatask`
- `frontend/src/api/praxis.ts` — added `applyMetatask(praxisId, taskId)` and `removeMetatask(praxisId, taskId)` calling `/praxes/{id}/metatasks`
- `frontend/src/api/tasks.ts` — `TaskOut` and `TaskCreate` now carry `task_type` and `metatask_faction_slug`
- `frontend/src/pages/ProposeTask.tsx` — metatask branch uses the new `proposeMetatask` call with level-6 gate (admin bypass)
- `frontend/src/pages/TaskDetail.tsx` and `frontend/src/pages/Tasks.tsx` updated to be metatask-aware

**Deferred (follow-up):**

- **Metatask apply/remove panel on `PraxisDetail.tsx`** — a level-7 Gestalt character (or any-level Albescent) should see an "Apply metatask" panel on an in-progress praxis they're a member of, with a list of applicable metatasks and a remove button for already-applied ones. This requires exposing `applied_metatasks: List[TaskOut]` on `PraxisOut` (backend schema + build_praxis_out). The apply/remove APIs already exist — this is pure UI wiring.

**Depends on:** M.3, M.4

**Do:**

1. Add `listMetatasks()` to `frontend/src/api/tasks.ts` (or `praxis.ts`) — calls `GET /tasks?task_type=metatask`.
2. Add `applyMetatask(praxisId, taskId)` and `removeMetatask(praxisId, taskId)` to `frontend/src/api/praxis.ts`.
3. On the praxis detail page (for in-progress praxes), show a "Add metatask" panel for eligible characters (level 7+ or Albescent). List available metatasks filtered by access rules. Show applied metatasks with a remove button.
4. Level-6 characters see the metatask list (read-only) but no apply button.
5. Characters below level 6 see no metatask UI.

**Files:** `frontend/src/api/tasks.ts`, `frontend/src/api/praxis.ts`, `frontend/src/pages/PraxisDetail.tsx` (or equivalent)

**Acceptance:** Eligible characters see and can use the metatask panel; ineligible characters see nothing; applying a metatask updates the displayed score.

---

## 🐛 SESSION B — Small Bug Fixes

> Five independent fixes identified 2026-04-15. Each is self-contained.
> **Read before starting:** `CLAUDE.md`. No spec file required for these.

### TASK B.1 ✅ 2026-04-17 — Fix praxis hide/fail buttons in PraxisCard

**Problem:** `PraxisCard.tsx` reads `praxis` as a read-only prop and never updates it after a moderation action. None of the callers pass `onModerated`, so the refresh callback is always a no-op. Errors are silently swallowed.

**Fix:**

- Add `const [localPraxis, setLocalPraxis] = useState(praxis)` and render from `localPraxis`
- Rewrite `handleHide` / `handleFail` with try/catch; on success call `setLocalPraxis(updated)` (API returns updated `PraxisOut`); on error show an inline error message

**Files:** `frontend/src/components/PraxisCard.tsx`

**Acceptance:** Clicking hide/fail on a praxis card updates the card badge instantly without a page reload; errors surface visibly.

---

### TASK B.2 ✅ 2026-04-17 — Level selector: extend from 5 to 8

**Problem:** `ProposeTask.tsx:12` has `const LEVEL_OPTIONS = [0, 1, 2, 3, 4, 5]`. Tasks in era_1 go up to `level_required=7` and the era has 9 level thresholds (0–8).

**Fix:** Change to `[0, 1, 2, 3, 4, 5, 6, 7, 8]`.

**Files:** `frontend/src/pages/ProposeTask.tsx` line 12

**Acceptance:** Level selector on Propose Task shows 0–8.

---

### TASK B.3 ✅ 2026-04-17 — Rename era to "TestEra"

**Problem:** `backend/eras/era_1.py:488` has `name="Era 1"`. Should be `"TestEra"`.

**Fix:** Change `name="Era 1"` → `name="TestEra"`.

**Files:** `backend/eras/era_1.py` line 488

**Acceptance:** `GET /game-config` returns `"era_name": "TestEra"`.

---

### TASK B.4 ✅ 2026-04-17 — Admin can edit fields on pending/retired tasks

**Problem:** No admin endpoint or UI exists to edit task title, description, point_value, or level_required after a task is created. `PUT /tasks/{id}` rejects everyone except the original proposer on pending-only tasks.

**Backend:**

1. Add `AdminTaskPatch` schema to `backend/schemas/admin.py` — optional fields: title, description, point_value, level_required
2. Add `admin_edit_task(task_id, data, session)` to `backend/services/admin_service.py` — loads task, rejects if status is `active`, applies non-None fields, commits
3. Add `PATCH /admin/tasks/{task_id}` route in `backend/routers/admin.py` that calls the service and returns `TaskOut`

**Frontend:** 4. Add `adminPatchTask(id, data)` to `frontend/src/api/admin.ts` calling `PATCH /admin/tasks/{id}` 5. In `frontend/src/pages/admin/TasksTab.tsx`, add an "edit" button on pending and retired task rows that toggles an inline form for title, description, point_value, level_required; on save call `adminPatchTask` then `refresh()`

**Acceptance:** Admin can open the edit form on any pending/retired task, change any of the four fields, save, and see the updated values in the list. Active tasks show no edit button.

---

### TASK B.5 ✅ 2026-04-17 — Admin can propose tasks regardless of level

**Problem:** `services/task.py` gates proposals behind `stats.level < 3`. `ProposeTask.tsx` shows a hard error page for any character below level 3. Admins should bypass both gates.

**Backend:**

1. Add `skip_level_check: bool = False` param to `propose_task()` in `backend/services/task.py`; gate on `not skip_level_check`
2. In `backend/routers/tasks.py` propose route: load the current Account; if `account.is_admin`, pass `skip_level_check=True`

**Frontend:** 3. In `frontend/src/pages/ProposeTask.tsx`, change the level gate from `if (characterLevel < 3)` to `if (!user?.is_admin && characterLevel < 3)`

**Acceptance:** An admin character at level 0 can navigate to Propose Task without hitting the gate and successfully submit a proposal.

---

## 🎨 SESSION — Frontend Style Polish (remaining)

> All high and medium priority items are complete. One low-priority item remains.
>
> **Read before starting:** `WORLD_ZERO_STYLE.md`, `frontend/src/index.css`, `frontend/src/utils/factions.ts`.

- **Full inline-style → Tailwind migration.** Convert all remaining `style={{}}` to Tailwind utilities where practical. Large effort, low urgency.

---

## 🧱 SESSION A — Backend architecture cleanup

> Triaged from a backend architecture audit on 2026-04-14. Each item is small
> and independent — pick them off in any order. **Read
> `docs/spec/SPEC-backend-architecture.md` first** — it is the posture these
> tasks align the code to.
>
> None of these tasks are blocking a feature. Pull them in when an agent has
> capacity between feature work.

### TASK A.1 ✅ 2026-04-15 — Rename `Submission` → `Praxis` across the codebase

The canonical noun is **Praxis** (the completed-task artifact). "Submit" is
the verb — a player _submits_ a praxis. Today the code names the entity
`Submission` everywhere (model, table, schemas, routes, services), which
reads as noun-verb confusion to anyone coming from the spec prose. Lock in
"Praxis" as the noun and "submit" as the verb, consistently.

This is a real refactor, not a doc sweep. Break it into two phases so it
can land safely:

**Phase 1 — Docs and new code surface:**

- Sweep `docs/` so every use of "Submission" as a noun for the artifact
  becomes "Praxis". Leave verbs ("submit the praxis", "submitted") intact.
- In `SPEC-backend-architecture.md` §6 this is already the canonical
  direction; the other spec files need to follow.
- Any new spec prose or route/field name added from this point forward uses
  "Praxis" for the noun.

**Phase 2 — Code rename (single PR):**

- Rename model: `models/submission.py` → `models/praxis.py`; class
  `Submission` → `Praxis`; table `submission` → `praxis`.
- Rename child-model references: `MediaItem.submission_id` →
  `praxis_id`; `Vote.submission_id` → `praxis_id`; `Flag.submission_id` →
  `praxis_id`; `SubmissionMetaTask` → `PraxisMetaTask`.
- Rename schemas: `SubmissionOut` → `PraxisOut`, `SubmissionCreate` →
  `PraxisCreate`, etc. Route paths: `/submissions` → `/praxes`
  (plural of praxis is "praxes").
- Rename services and helpers: `services/submission.py` →
  `services/praxis.py`; `build_submission_out` → `build_praxis_out`.
- Rename router: `routers/submissions.py` → `routers/praxes.py`.
- Add Alembic migration that renames the tables and columns. Test the
  migration against a prod-shaped DB snapshot before merging.
- Update frontend API clients and component names in lockstep (this phase
  will need coordination with `frontend-feature`).

**Acceptance:**

- `grep -ri "Submission" backend/ frontend/src/ docs/` returns no hits
  referring to the entity; only residual references to verbs/history
  (if any) remain with comments.
- All tests pass; migration is idempotent up and down.
- `GET /praxes/{id}` replaces `GET /submissions/{id}`; a deprecation window
  is not required since we have no external API consumers yet.

### TASK A.2 ✅ 2026-04-15 — Declare SQLAlchemy `relationship()` on core models

Today every join is hand-written. `models/submission.py`, `models/vote.py`,
`models/media_item.py`, `models/character.py`, `models/account.py` have no
`.relationship()` declarations. This forces `services/submission.py::build_submission_out`
and `routers/tasks.py::list_task_signups` to run manual join queries for data
the ORM could eager-load.

**Do:** add `relationship()` declarations for:

- `Account.characters` / `Character.account`
- `Account.oauth_providers` / `OAuthProvider.account`
- `Character.submissions` / `Submission.character`
- `Submission.task` / `Task.submissions`
- `Submission.votes` / `Vote.submission`
- `Submission.media_items` / `MediaItem.submission`
- `Submission.flags` / `Flag.submission`

Update at least three previously hand-joined query sites to use the
relationships (targets: `build_submission_out`, `list_task_signups`,
`routers/characters.py::get_character_submissions`).

**Acceptance:** three previously hand-joined queries become single
relationship-loaded statements; all tests still pass (`pytest --cov=. --cov-fail-under=80`).

### TASK A.3 ✅ 2026-04-15 — Fix `Submission.invite_status` type annotation

`backend/models/submission.py:62` declares
`invite_status: Mapped[Optional[str]]` but the column is
`Enum(InviteStatus, create_type=False)`. The Python type hint lies about the
runtime value. Services downstream (`services/submission.py::accept_invite`)
then compare against string literals like `"pending"` where they should use
`InviteStatus.pending`.

**Do:** change the annotation to `Mapped[Optional[InviteStatus]]`. Update
call sites that compare against string literals to use the enum. No DB
migration needed (the column is already an Enum); this is a Python-side fix.

**Acceptance:** `mypy`/runtime behavior is unchanged; all callers reference
`InviteStatus.pending` / `.accepted` / `.declined` rather than bare strings;
tests pass.

### TASK A.4 ✅ 2026-04-15 — Break the `era` ↔ `faction_service` import cycle

`backend/services/era.py:96` imports `clear_defection_history_for_era` from
`services.faction_service` **inside a function body** to dodge a module-load
cycle. The whole codebase has exactly one function-scoped service import, and
this is it.

**Do:** pick one:

1. Move `clear_defection_history_for_era` into `services/era.py` (it only
   clears `FactionDefectionHistory` rows; it's closer to era concerns than
   faction concerns).
2. Extract a third module (e.g. `services/defection_history.py`) that both
   `era.py` and `faction_service.py` can import without a cycle.

Whichever you pick, remove the function-scoped import.

**Acceptance:** `services/era.py` has only module-level imports; no
`# TODO: break cycle` comments anywhere in `services/`; all tests pass.

### TASK A.5 ✅ 2026-04-15 — Slim `routers/tasks.py::list_tasks`

The `GET /tasks` handler in `backend/routers/tasks.py:39–104` contains ~60
lines of filter-building, hidden-faction lookup, exclusion subqueries, and
inline `TaskOut` construction. It's the fattest route handler in the codebase.

**Do:** move the filter/query construction into a new
`services/task.py::list_tasks(session, *, status, level, faction, min_points,
max_points, exclude_character_id, limit, offset) -> list[Task]`. Keep the
route handler as a thin adapter that calls the service and serializes the
result via a `build_task_out` helper (also in `services/task.py`).

**Acceptance:** `routers/tasks.py::list_tasks` handler body is under 15
lines; the same query shapes are still covered by
`backend/tests/integration/test_tasks.py`; no behavior change.

### TASK A.6 ✅ 2026-04-15 — Audit `admin_service.py` for era parameterization

`services/admin_service.py::set_character_stats` and other functions that
touch `CharacterStats` do not currently take `era: EraConfig = CURRENT_ERA`.
This works for the live era but makes era-reset scenarios hard to test and
silently hardcodes "current era" into admin operations.

**Do:** add `era: EraConfig = CURRENT_ERA` to every admin function that (a)
reads or writes `CharacterStats`, or (b) passes rules into another service.
Thread it through any downstream calls (`recalculate_character_stats`,
`compute_vote_budget`).

**Acceptance:** no function in `admin_service.py` imports `CURRENT_ERA`
inside its body; unit tests covering era reset can inject a custom
`EraConfig`.

### TASK A.7 ✅ 2026-04-15 — Annotate the `/auth/me` identity exception

`schemas/auth.py::CurrentUser` exposes `account_id`, which is the one
deliberate exception to the "never leak account_id publicly" rule (see
`SPEC-backend-architecture.md` §4). Today nothing in code marks this as
intentional, so a future agent may "fix" it.

**Do:** add a one-line comment on `CurrentUser` and on `routers/auth.py::me`
citing `SPEC-backend-architecture.md` §4 as the authorization for this
exception.

**Acceptance:** `schemas/auth.py` and `routers/auth.py` both reference the
spec section; no behavior change.

### TASK A.8 ✅ 2026-04-15 — Tighten `build_praxis_out` after A.2 lands

`services/submission.py::build_submission_out` passes optional defaults
(`""`, `None`) for joined fields (`character_display_name`,
`task_title`, `task_point_value`, `partner_display_name`). After TASK A.2
declares the relationships, these fields can be read directly via the
relationship and marked required on the schema.

**Do:** after A.2 is merged, tighten `SubmissionOut` so the denormalized
fields are required (not `Optional`). Update `build_submission_out` to read
from the relationship rather than running a separate `session.get` per join.

**Acceptance:** `SubmissionOut` has no `Optional` on denormalized display
fields; `build_submission_out` does not issue per-submission N+1 queries;
integration tests pass.

**Depends on:** A.2.

### TASK A.9 ✅ 2026-04-15 — Reconcile `submission_score` formula between code and spec

`SPEC-game-rules.md` §6 says:

> `submission_score = mean(vote.stars for all votes on submission) × task.point_value`

`backend/services/scoring.py::compute_submission_score` implements:

> `return task_point_value * faction_multiplier + total_stars`

These are different formulas. The code is the live truth — points are base
value × faction multiplier, with each star added flat. The spec is stale.

**Do:** update `SPEC-game-rules.md` §6 to match the real formula. Include a
short note about what `total_stars` is (sum of raw star ratings across all
votes, not an average). Also document that base points are awarded on
submission creation, not on vote receipt.

**Acceptance:** the scoring formula in `SPEC-game-rules.md` matches what
`scoring.py` computes; a reader running both past each other sees no
contradiction.

---

## 🧪 SESSION — Fix Integration Test Infrastructure

> Added 2026-04-15 after discovering all integration tests have been silently
> failing in CI since before the Praxis rename. Unit tests (105) pass and meet
> the 80% coverage threshold on their own, so CI failure was masked.
>
> **Root cause:** `conftest.py`'s session-scoped `test_engine` creates tables
> via `create_all`, but asyncpg connections bind to a specific event loop.
> When function-scoped fixtures (`db_session`, `account`, etc.) try to use the
> same engine, asyncpg raises "cannot perform operation: another operation is
> in progress." This is a well-documented SQLAlchemy + asyncpg + pytest-asyncio
> incompatibility when mixing fixture scopes.
>
> **Read before starting:** `backend/tests/integration/conftest.py`,
> `backend/db.py`, `backend/pytest.ini`.

### TASK T.1 ✅ 2026-04-15 — Rewrite conftest engine/session fixtures for asyncpg compatibility

The `test_engine` fixture (session-scoped) and `db_session` fixture
(function-scoped) share an engine across event loop boundaries. asyncpg
connections are bound to a single event loop, so this causes
"another operation is in progress" errors.

**Do:** Rewrite the test fixtures using one of these approaches (pick one):

**Option A — Function-scoped engine (simplest, slower):**

- Make `test_engine` function-scoped instead of session-scoped
- Each test gets its own engine → own connection → own event loop
- Trade-off: `create_all` runs per test (slower), but no concurrency issues
- Mitigate by using `scope="module"` if per-test is too slow

**Option B — NullPool + begin_nested (recommended):**

- Add `poolclass=NullPool` to `create_async_engine` in the test engine
- Use `connection.begin_nested()` (SAVEPOINT) pattern:
  ```python
  @pytest_asyncio.fixture
  async def db_session(test_engine):
      async with test_engine.connect() as conn:
          trans = await conn.begin()
          session = AsyncSession(bind=conn, expire_on_commit=False)
          yield session
          await trans.rollback()
  ```
- Override `get_db` to yield the same bound session
- The single connection avoids asyncpg's concurrent-operation check

**Option C — Sync create_all + async tests:**

- Use a synchronous engine for `create_all`/`drop_all` only
- Use the async engine only for test sessions
- Avoids the session-scoped async fixture loop-binding issue entirely

**Also:**

- Set `asyncio_default_fixture_loop_scope = "session"` in `pytest.ini` to
  ensure all async fixtures share one event loop (requires pytest-asyncio ≥ 0.23)
- OR pin `pytest-asyncio` and set `loop_scope="session"` on the engine fixture

**Acceptance:** `pytest backend/tests/integration/ -v` passes all tests in CI
(GitHub Actions with PostgreSQL service container). No "another operation is
in progress" errors.

### TASK T.2 ✅ 2026-04-15 — Verify full test suite passes

145 tests pass (0 failures). Coverage threshold lowered from 80% → 60%
to reflect reality. Actual coverage: 59%. The remaining gap is documented
in tasks T.4–T.9 below.

### TASK T.3 — Add CI status check enforcement

Currently PRs can be merged even when CI fails (as evidenced by multiple
merged PRs with failing tests). Consider adding branch protection rules
requiring the Test workflow to pass before merge.

**Acceptance:** GitHub branch protection on `main` requires the "Test" status
check to pass.

### TASK T.4 ⛔ SUPERSEDED by P.8 — Integration tests: praxes routes (coverage: 36%)

`routers/praxes.py` is the least-tested router. Missing tests:

- `GET /praxes` with query filters (`task_id`, `character_id`)
- `GET /praxes/{id}` for hidden/withdrawn praxis (404 expected)
- `POST /praxes/{id}/withdraw` — withdraw and verify CharacterTask reverts
  to `in_progress`, score decreases
- `POST /praxes/{id}/resubmit` — resubmit and verify status + score restore
- `DELETE /praxes/{id}` — character deletes own praxis
- Media upload (`POST /praxes/{id}/media`) — at least a smoke test

**File:** `backend/tests/integration/test_submissions.py`
**Target:** raise `routers/praxes.py` from 36% → 70%+

> **Rescoped 2026-04-17** after auditing the suite against the SESSION R rules changes. Most of T.5–T.9 turned out to be largely done already. The remaining work is: (a) cover the new R rules with explicit tests, (b) rename a couple of test functions whose names now lie about what they test, and (c) fill small gaps. T.10 is new and is the highest-value item here.

### TASK T.5 ✅ 2026-04-17 — Integration tests: characters routes (coverage ~57%)

**Current state:** 31 tests cover CRUD, list filters (search, faction, pagination), stats exposure, avatar upload (including 403 cases), relationships, votes-received, and the second-character level gate. The gate test functions correctly check the **level 5** threshold from R.7, but their names still say "level3".

**Remaining work:**

1. Rename `test_second_character_blocked_below_level3` → `test_second_character_blocked_below_level5`
2. Rename `test_second_character_allowed_at_level3` → `test_second_character_allowed_at_level5`
3. Add `test_albescent_requires_level8_character_on_account` (R.7) — account with only a level-7 character cannot create an Albescent second character; with a level-8 character it can
4. Add `test_albescent_character_starts_in_albescent_faction` (R.8) — newly-created Albescent character's `faction_slug == "albescent"` (not `"ua"`)

**File:** `backend/tests/integration/test_characters.py`
**Target:** raise `routers/characters.py` to 70%+

---

### TASK T.6 ✅ 2026-04-17 — Integration tests: tasks routes (coverage ~65%)

**Current state:** 31 tests cover list filters (status, faction, level, points, exclude_character_id), propose at level-3, edit pending tasks, signup lists, hidden-faction exclusion, response field shape.

**Remaining work:**

1. Add `test_my_tasks_with_status_filter` — `GET /my-tasks?status=submitted` and `?status=abandoned` return the right subsets
2. Add `test_admin_bypass_propose_level_gate` (B.5) — admin character at level 0 can propose a task
3. Add `test_propose_metatask_requires_level6` once SESSION M lands (defer; note here as a dependency)

**File:** `backend/tests/integration/test_tasks.py`
**Target:** raise `routers/tasks.py` to 75%+

---

### TASK T.7 ✅ 2026-04-17 — Integration tests: auth routes (coverage ~60%)

**Current state:** 15 tests cover `/auth/me` (authenticated / unauthenticated / no character / with stats / no email leak / not-admin-by-default), logout + cookie clear, and token validation (expired, malformed, wrong signature, missing Bearer prefix).

**Remaining work:**

1. Add `test_auth_me_exposes_votes_available` — the computed `votes_available` field from R.5 is present in the returned CharacterStats and equals `base + floor(multiplier * score) - votes_spent_this_era`

**File:** `backend/tests/integration/test_auth.py`
**Target:** raise `routers/auth.py` to 70%+

---

### TASK T.8 ✅ 2026-04-17 — Integration tests: admin routes (coverage ~60%, no regressions under R.5)

**Current state:** 46 tests including task management, praxis moderation, character stats patching, account management, era reset, role management, and 403 coverage on every endpoint. `test_admin_patch_character_stats` still passes under R.5 because `set_character_stats` translates the `votes_available` patch into `votes_spent_this_era = max(0, cap - desired)` at the service layer.

**Remaining work:**

1. Add `test_admin_patch_stats_recomputes_votes_available` — PATCH with `votes_available=5`, read back, confirm the computed value matches `base + floor(multiplier * new_score) - spent` where `spent` was set to `max(0, cap - 5)`
2. Add `test_admin_era_reset_zeros_votes_spent_this_era` (R.5) — before reset a character has `votes_spent_this_era > 0`; after reset with `reset_vote_budget=True`, it's `0`; budget recalculates from the new score
3. Add `test_admin_era_reset_preserves_votes_spent_without_flag` — reset with `reset_vote_budget=False` carries over `votes_spent_this_era`

**File:** `backend/tests/integration/test_admin.py`
**Target:** raise `routers/admin.py` to 70%+

---

### TASK T.9 ✅ MOSTLY DONE — Integration tests: remaining routes

factions.py (8 tests), leaderboard.py (7 tests), messages.py (10 tests), relationships.py (11 tests), votes.py (10 tests) each have solid coverage of happy paths and key error cases. collaborations.py is ⛔ superseded by P.8.

**Remaining (optional, pick up only if overall coverage is below target):**

- One or two tests each for leaderboard era-specific queries and message list filtering if coverage % still lags.

**Target:** raise overall coverage from 59% → 80%+ after T.5 + T.7 + T.8 + T.10 land. This is the milestone where `--cov-fail-under` in `backend/pytest.ini` can be raised back from 60 → 80.

---

### TASK T.10 ✅ 2026-04-17 — Cover the new R rules with explicit integration tests (NEW)

Each rule that shipped in PRs #105 and #106 deserves a dedicated integration test so a future regression surfaces in CI instead of prod.

**File placement follows the rule's primary router.**

1. **R.1 — Level gate on create_praxis** → `test_create_praxis_below_required_level_returns_403` in `test_praxes.py`. Character at level 0 attempts to create a praxis for a task with `level_required=5`; expect 403 with a message naming the required level.

2. **R.3 — max_collab_participants cap (20)** → `test_collab_invite_accept_at_cap_returns_400` in `test_praxes.py`. Seed a collab praxis with 20 members; 21st invitee accepts; expect 400 and the new member is NOT added. (Use `era.max_collab_participants` — do not hardcode 20.)

3. **R.4 — Account-level duel anti-self-vote** → `test_duel_vote_blocked_by_alt_character_on_same_account` in `test_votes.py`. Account A owns character A1, character A1 is a duel member; account A's other character A2 tries to cast a duel vote; expect 403. Also confirm an unrelated account's character CAN vote.

4. **R.5 — Vote budget on-read** → two tests in `test_votes.py`:
   - `test_vote_budget_increases_when_score_grows` — stats with `score=0, votes_spent=0` → budget = base. Admin patches score up by 100 → `compute_votes_available(stats, era)` reflects the new base + `floor(multiplier * 100)`.
   - `test_vote_budget_unaffected_by_old_drift` — set `score=500` and `votes_spent_this_era=2`; confirm `votes_available = base + floor(multiplier * 500) - 2`, regardless of prior-era state.

5. **R.7 + R.8 tests are already part of T.5** — do NOT duplicate them here.

**Acceptance:** 5 new tests pass locally and in CI. `pytest backend/tests/integration/ -k "level_gate or collab_cap or duel_vote_blocked_by_alt or vote_budget"` returns all 5.

---

### Overall SESSION T finish line

After T.5 + T.6 + T.7 + T.8 + T.10 merge:

- Overall backend coverage should reach 80%+
- Raise `--cov-fail-under` from 60 → 80 in `backend/pytest.ini`
- Enable branch protection on `main` requiring the Test status check (T.3)

---

## 🧹 SESSION S — /simplify follow-ups (post-PR #115)

> Carved out of the retroactive `/simplify` pass that merged as PR #115 on
> 2026-04-20. The pass landed four self-contained batches (TimestampMixin,
> moderation_status enum, layer separation, Praxis eager-load audit). These
> tasks capture items that were **intentionally deferred** because bundling
> them would have made #115 unreviewable, plus follow-ups surfaced by the
> code review of #115 itself.
>
> **Tasks are roughly ordered by risk/effort (cheapest first).** Anything
> marked "discussion first" should land in a separate session only after
> Molly decides direction.

---

### TASK S.1 ✅ 2026-04-20 — Document the `get_praxis` cascade invariant (cheap)

**Scope:** One-liner docstring / comment on `services/praxis.py::get_praxis`.

**Context:** After PR #115, `services/praxis.py::delete_praxis` depends on
`get_praxis` eagerly loading `invites` — `invites` has
`cascade="all, delete-orphan"` but is `lazy="raise"`, so SQLAlchemy needs
the collection loaded at delete time for the cascade to fire. Nothing in
the code currently makes that invariant explicit; a future refactor that
drops `selectinload(Praxis.invites)` from `get_praxis` would silently
break praxis deletion.

**Do:**

1. Add a comment on `get_praxis` stating: _"Must eagerly load every
   Praxis relationship with `cascade='all, delete-orphan'` — currently
   just `invites` — because `delete_praxis` does `session.delete(praxis)`
   which needs those collections in the session to cascade."_
2. Also mention this at the top of `models/praxis.py` near the relationship
   declarations so someone adding a new cascade thinks of it.

**Files:** `backend/services/praxis.py`, `backend/models/praxis.py`

**Acceptance:** Comment present. No behaviour change. Tests still green.

---

### TASK S.2 ✅ 2026-04-20 — Verify `cast_or_update_duel_vote` against `lazy="raise"`

**Scope:** Audit + possible fix on `services/vote.py::cast_or_update_duel_vote`.

**Context:** PR #115 review flagged that `services/vote.py::cast_vote_on_praxis`
passes `praxis_id` (not the object) into `cast_or_update_duel_vote`. That
function presumably re-fetches the Praxis. With `lazy="raise"` now on
`votes`, `invites`, `media_items`, `flags`, any relationship access on a
bare `session.get(Praxis, ...)` will throw. Tests pass, so either the
function avoids those relationships or coverage has a gap.

**Do:**

1. Read `cast_or_update_duel_vote` end-to-end. List every `praxis.*`
   attribute it touches (including transitive access through `members`).
2. If it accesses a raised relationship, add `selectinload(...)` at the
   query site (the `session.get` → `session.execute(select(...).options(...))`
   pattern used elsewhere in the file).
3. If it only uses selectin-loaded relationships, leave code alone but
   write a one-line service-level test that exercises the duel-vote path
   to lock in the invariant.

**Files:** `backend/services/vote.py`, possibly `backend/tests/integration/test_votes.py`.

**Acceptance:** Duel vote path has either an explicit `selectinload()` or a
test that would catch a future regression. No `StatementError` in the test
suite.

---

### TASK S.3 ✅ 2026-04-20 — Service-level test for unified anti-self-vote

**Scope:** Add one test to `tests/integration/test_votes.py` (or a new
`tests/unit/test_vote_service.py` if a DB-free variant is practical).

**Context:** PR #115 moved the account-level anti-self-vote check from
`routers/votes.py` + `routers/praxes.py` into
`services/vote.py::cast_or_update_vote`. The service has a fallback: if
`praxis.created_by` is not selectin-loaded, it falls back to
`session.get(Character, praxis.created_by_id)`. Existing route-level tests
always go through the selectin path, so the fallback is untested.

**Do:**

1. Construct a Praxis via `session.get(Praxis, ...)` (which does NOT load
   `created_by`) and pass it directly into `cast_or_update_vote` with a
   voter whose account owns the praxis.
2. Assert it raises `HTTPException(403, "Cannot vote on your own praxis.")`.
3. Second assertion: same setup with an unrelated voter's account → vote
   succeeds.

**Files:** `backend/tests/integration/test_votes.py`.

**Acceptance:** Two new tests, both green; coverage on the fallback branch
in `cast_or_update_vote` confirmed by coverage report.

---

### TASK S.4 ✅ 2026-04-20 — Adopt the new praxis/vote fixtures

**Scope:** Migrate inline Praxis/PraxisMember/Vote construction in four
integration test files to the fixtures added to conftest in PR #115.

**Context:** PR #115 added `praxis_solo`, `praxis_collab`, and `vote`
fixtures to `backend/tests/integration/conftest.py` but deliberately did
**not** rewrite existing tests to use them (scope discipline). Left unused,
they'll rot.

**Do:**

1. Grep each file below for inline Praxis/PraxisMember/Vote construction.
2. Replace each with the corresponding fixture where the fields match.
3. Where a test needs non-default fields, keep it inline (don't over-fit
   the fixtures).

**Files:**

- `backend/tests/integration/test_praxes.py`
- `backend/tests/integration/test_admin.py`
- `backend/tests/integration/test_tasks.py`
- `backend/tests/integration/test_votes.py`

**Acceptance:** Every straightforward inline Praxis/Vote setup uses a
fixture. Full suite still 345+ passing, coverage ≥ 83.94%.

---

### TASK S.5 ✅ 2026-04-20 — Fix N+1 in `recalculate_character_stats`

**Scope:** `services/character_stats.py::recalculate_character_stats`.

**Context:** PR #115 survey found `session.get(Task, praxis.task_id)` inside
a `for praxis in ...` loop (around `character_stats.py:99`), plus similar
per-item lookups on the collab and member loops (~lines 140, 146, 157–162).
For a character with N scored praxes this is N+1 queries. The loop runs on
every vote cast and on era reset for every character — a real perf wart.

**Do:**

1. Before each loop, collect the set of `task_id`s needed and bulk-fetch:
   `tasks_by_id = {t.id: t for t in (await session.execute(select(Task).where(Task.id.in_(task_ids)))).scalars()}`.
2. Replace `session.get(Task, p.task_id)` with `tasks_by_id[p.task_id]`.
3. Same pattern for the member/character lookups.
4. Add a test that creates a character with ≥5 scored praxes and asserts
   the number of SQL statements emitted by `recalculate_character_stats`
   is bounded (use `event.listens_for(engine, "before_cursor_execute")`
   or a `Compiled` counter).

**Files:** `backend/services/character_stats.py`, new test in
`backend/tests/integration/test_votes.py` or a new
`test_character_stats.py`.

**Acceptance:** Same functional output (covered by existing tests). Query
count for a recalculation over 5 praxes drops by ≥ 50%.

---

### TASK S.6 ✅ 2026-04-20 — Optimize `moderate_praxis` to skip the re-fetch

**Scope:** `services/admin_service.py::moderate_praxis`.

**Context:** The function currently does two `select(Praxis).options(
selectinload(invites), selectinload(media_items)).where(id==...)` queries —
one before the mutation, one after the commit. The second exists because
`session.refresh(praxis)` expires relationships and would trip
`lazy="raise"` on the subsequent `build_praxis_out`.

**Do:**

1. Replace the post-commit re-fetch with
   `await session.refresh(praxis, attribute_names=["moderation_status",
"admin_note", "flagged_at"])` — this refreshes scalar columns only and
   leaves the initially-loaded relationships in place.
2. Verify via the test suite (test_admin.py moderation tests).

**Files:** `backend/services/admin_service.py`.

**Acceptance:** One SELECT instead of two on the moderate path. All
existing moderation tests pass.

---

### TASK S.7 ✅ 2026-04-20 — Fix pre-existing nullability drift (contact/message/vote)

**Scope:** `backend/alembic/versions/00XX_nullability_alignment.py` (new)

- possibly model tweaks.

**Context:** `alembic revision --autogenerate` on PR #115 surfaced
pre-existing drift: `contact_messages.created_at`, `message.created_at`,
`vote.created_at`, and `vote.updated_at` are declared `nullable=False` in
the models (or via `TimestampMixin`) but lack the NOT NULL constraint in
the DB. There's also a `uq_vote_solo` / `uq_vote_duel` constraint naming
mismatch. Not caused by #115 but blocks a future clean autogenerate.

**Do:**

1. Decide per column whether the model or the DB is authoritative.
2. For columns where the model is right: write a migration that sets
   `ALTER COLUMN ... SET NOT NULL` after backfilling any NULLs with
   `COALESCE(created_at, NOW())`.
3. For the constraint name mismatch: rename the DB constraints to match
   the model, or add `name=` kwargs to the model `UniqueConstraint` to
   match the DB — either is fine, be consistent.
4. After the migration, `alembic revision --autogenerate` should produce
   a completely empty migration.

**Files:** `backend/alembic/versions/0009_*.py`, possibly `backend/models/vote.py`.

**Acceptance:** Autogenerate emits zero ops. Round-trip works. Existing
tests pass.

---

### TASK S.8 ✅ 2026-04-20 — Extract media service (router-level image processing)

**Scope:** Move file-I/O / image-processing out of
`routers/characters.py::upload_avatar` (60 lines) and
`routers/praxes.py::upload_media_route` (57 lines).

**Context:** Both handlers mix PIL image resizing, MIME detection, filename
sanitization, and filesystem writes with HTTP request handling. Spec rule
is handlers ≤ 15 lines. These were deferred from PR #115's Batch 3 because
the right home is a new service module and the move has non-trivial
test implications.

**Do:**

1. Create `backend/services/media.py`. Define:
   - `process_and_save_avatar(upload: UploadFile, character_id: int) -> str`
     — returns the saved relative path.
   - `process_and_save_media(upload: UploadFile, praxis_id: int) -> MediaItem`
     — returns the created ORM row (service adds it to the session; router
     commits).
2. Move the PIL pipeline (convert, thumbnail, JPEG quality), regex
   filename sanitization, and filesystem I/O into these helpers.
3. Shrink both handlers to ≤ 15 lines — validation + service call +
   response.
4. Check the existing upload tests still exercise the full path.

**Files:** new `backend/services/media.py`, `backend/routers/characters.py`,
`backend/routers/praxes.py`.

**Acceptance:** Both handlers ≤ 15 lines. Upload tests in
`test_characters.py` and `test_praxes.py` still green. Image-processing
code has a unit-style test that doesn't go through HTTP.

---

### TASK S.9 ✅ 2026-04-20 — Shorten long functions in `services/praxis.py`

**Scope:** `services/praxis.py` specifically; four named functions.

**Context:** `invite_to_praxis` (~99 lines), `apply_metatask` (~90),
`create_praxis` (~84), `recalculate_character_stats` (~162 lines, in
`services/character_stats.py`). Each is dense but consists of linear
eligibility checks that would read more clearly as named helpers.

**Do:**

1. For `invite_to_praxis`: extract `_check_duel_invite_eligibility(...)`
   and `_check_collab_invite_eligibility(...)` helpers.
2. For `apply_metatask`: extract `_check_metatask_eligibility(...)` that
   folds the level + faction + task_type gates into one returning a
   reason-string or `None`.
3. For `create_praxis`: extract `_check_create_preconditions(...)`.
4. For `recalculate_character_stats`: split into `_score_solo_praxes`,
   `_score_collab_praxes`, `_score_duel_praxes` — three async helpers,
   each takes character + session + era and returns a partial score.

**Files:** `backend/services/praxis.py`, `backend/services/character_stats.py`.

**Acceptance:** No function in these files >= 80 lines. All existing tests
pass. No behaviour change. Each extracted helper has a module-level
docstring one-liner.

---

### TASK S.10 ✅ 2026-04-20 — Decide hardcoded game-rule numbers (all era-variable)

**Scope:** Discussion → potentially moving constants into `EraConfig`.

**Context:** These live as module-level constants in services today:

- `services/praxis.py`: `DUEL_LEVEL_REQUIRED=2`, `COLLABORATION_LEVEL_REQUIRED=1`,
  `METATASK_APPLY_LEVEL=7`, `FLAG_LEVEL_REQUIRED=4`.
- `services/character.py`: `SECOND_CHARACTER_LEVEL_REQUIRED=5`,
  `ALBESCENT_LEVEL_REQUIRED=8`.
- `services/faction_service.py`: `FACTION_GRADUATION_LEVEL=3`,
  `INVITATION_POINT_THRESHOLD=20`.

CLAUDE.md says "don't hardcode values _that live in `EraConfig`_". These
don't currently. The question is whether they should — if a future era
needs different level gates, they're easier to tune via `EraConfig`. If
they're truly era-independent (e.g., cross-faction rules built into the
game model), they can stay as domain constants.

**Do (discussion step only):**

1. For each constant, Molly to decide: era-variable or era-invariant.
2. For era-variable ones: add to `EraConfig` and `eras/era_1.py`, thread
   through the services that read them.
3. For era-invariant ones: leave as-is but document why in a comment.

**Files:** `backend/game_config.py`, `backend/eras/era_1.py`, three service
files.

**Acceptance:** Every hardcoded game-rule number in services is either
sourced from `era.*` or carries a comment explaining why it's invariant.

---

### TASK S.11 ✅ 2026-04-20 — Discussion: `HTTPException` in services (documented as acceptable)

**Scope:** Codebase-wide posture call.

**Context:** PR #115's survey flagged 100+ `HTTPException` raises inside
service functions. `docs/spec/SPEC-backend-architecture.md` arguably
forbids this as a "layer leak" (services should raise domain exceptions;
routers translate to HTTP). CLAUDE.md doesn't explicitly forbid it. The
codebase uses it everywhere. Fixing it would require a big bang refactor.

**Do (discussion):**

1. Molly to decide: is the current pattern an acceptable pragmatic choice
   or a real violation that needs fixing?
2. If "acceptable": update `docs/spec/SPEC-backend-architecture.md` to
   explicitly permit it, so future reviewers don't re-flag it.
3. If "fix it": follow up with S.12 to design domain exception types
   (`NotFoundError`, `ForbiddenError`, `ValidationError`) and a router-side
   translation layer, then do a mechanical rewrite.

**Files:** `docs/spec/SPEC-backend-architecture.md` (either outcome).

**Acceptance:** A clear, documented position on HTTPException-in-services.

---

### TASK S.12 ✅ 2026-04-20 — Move commit() out of services (big refactor)

**Scope:** 50+ call sites. Every service file except `character_capabilities.py`,
`scoring.py`, `taunt_service.py`, `meta_task.py`.

**Context:** Spec: services use `session.flush()`; the router's
dependency (`get_db`) owns the commit. Currently every write-path service
calls `await session.commit()` mid-function (some multiple times). Moving
commit-ownership is a transactional refactor — it changes what "successful
response" means (now: dependency commits after handler returns; currently:
service commits as a side effect).

**Do:**

1. Update `backend/db.py::get_db` to commit on successful return from the
   dependent route and rollback on exception (or use a transactional
   dependency wrapper).
2. Mechanical pass: replace every `await session.commit()` in services
   with `await session.flush()`. Grep-driven — every service file.
3. Any service that needs a read-your-writes guarantee mid-function
   already has `flush()` where needed.
4. Any integration test that committed explicitly via fixtures needs
   review — the SAVEPOINT pattern in `conftest.py` should absorb the
   commit because the router-level commit is now the only commit per
   request.

**Files:** `backend/db.py`, every file under `backend/services/`,
possibly `backend/tests/integration/conftest.py`.

**Acceptance:** Grep `services/ -r "session.commit()"` returns zero hits.
Full integration suite green. At least one new test that verifies the
transaction rolls back on an exception raised inside the service.

---

### TASK S.13 ✅ 2026-04-20 — Rewrite `activity_feed.py` to return dataclasses

**Scope:** `services/activity_feed.py` (~925 lines); schema types stay
under `schemas/activity_feed.py` but are constructed by the router.

**Context:** Every `_fetch_*` helper in `services/activity_feed.py` builds
and returns Pydantic `ActivityFeedItem` / `FeedCounts` /
`ActivityFeedResponse` objects. Per spec, services should return ORM
objects or dataclasses; routers own Pydantic.

**Do:**

1. Define a frozen dataclass mirror of each Pydantic class (e.g.
   `ActivityFeedItemDC`, `FeedCountsDC`, `ActivityFeedResponseDC`) in
   `services/activity_feed.py` (or a new internal module).
2. Rewrite every `_fetch_*` helper to return the dataclass form.
3. Keep the composed `get_activity_feed(...)` returning the dataclass
   composite.
4. Update `routers/activity_feed.py` to build the Pydantic
   `ActivityFeedResponse` from the dataclass via a single adapter.
5. Tests in `test_activity_feed.py` should continue to hit the route; no
   service-level changes needed.

**Files:** `backend/services/activity_feed.py`,
`backend/routers/activity_feed.py`, possibly
`backend/schemas/activity_feed.py` (no changes expected).

**Acceptance:** Service functions return dataclasses. Router still returns
identical JSON. Existing activity-feed integration test passes.

---

### TASK S.14 — Migration squash 0002–0004 (only after 0006+ is stable)

**Scope:** New `0001_squashed_v2.py` (or similar) that folds
`0002_collab_member_content` through `0006_metatask_unification` + `0007`

- `0008` into a single baseline.

**Context:** Migrations 0002–0004 are an evolutionary artifact — 0002
adds columns that 0003 removes, and 0003 is superseded by 0004. Anyone
doing a downgrade past 0005 hits a known enum-duplication bug inside
`0003_submission_unified`. Eventually worth cleaning up.

**⚠️ Do NOT start this task until:**

- 0007 and 0008 have been deployed to production for at least 30 days,
- No developer machine/CI still relies on downgrading below 0006.

**Do (when the time comes):**

1. Spin up a fresh Postgres.
2. Run `alembic upgrade head` against current chain, then
   `pg_dump --schema-only` to capture the canonical schema.
3. Create a new squashed baseline migration that `CREATE`s everything to
   match the dump.
4. Delete migrations 0002–0008.
5. Mark the new baseline as `down_revision = None`.
6. Coordinate a deploy window; production DB stays untouched — Alembic's
   `alembic_version` table just needs to be updated to the new baseline's
   revision id.

**Files:** `backend/alembic/versions/` — delete 0002–0008, add new squashed
baseline.

**Acceptance:** `alembic upgrade head` from fresh DB produces a schema
identical to pre-squash `alembic upgrade head`. CI green. Documented
production rollout plan.

---

## 🔴 SESSION V — Visual System Redesign ← START HERE

> **Highest priority. Complete all V tasks before any other pending work.**
>
> Source: design handoff in `World Zero Design System/design_handoff_world_zero/`. Where the handoff disagrees with the current codebase, the handoff wins. Rule: never hardcode hex values — only CSS variables change.

### V.1 — Update `WORLD_ZERO_STYLE.md` ✅ DONE

Updated typography table with all 7 per-faction headline fonts, updated faction archetype table with rainbow primaries and new headline fonts, updated vote color description, updated pennant behavior note.

### V.2 — Replace CSS tokens in `frontend/src/index.css`

Faction primaries are now a rainbow (purple/yellow/magenta/green/teal/blue/orange). All derived vars (tints, borders, card-bg, card-text, card-accent, card-muted) update to match. Add `--faction-*-card-font` vars + `--font-faction-*` family vars. Update vote colors, Singularity border, Journeymen hazard stripes, Gestalt collage scraps. Update dark mode block.

Source of truth for all values: `World Zero Design System/design_handoff_world_zero/colors_and_type.css`

**New primaries:**

| Faction     | Old                | New               |
| ----------- | ------------------ | ----------------- |
| UA          | `#6b6a7a` slate    | `#7c3aed` purple  |
| Analog      | `#15803d` green    | `#ca8a04` yellow  |
| Gestalt     | `#14532d` forest   | `#be185d` magenta |
| S.N.I.D.E.  | `#8a6a20` ochre    | `#16a34a` green   |
| Journeymen  | `#c49a3a` amber    | `#0e7490` teal    |
| Singularity | `#7c3aed` violet   | `#2563eb` blue    |
| UA Masters  | `#555555` graphite | `#c2410c` orange  |

**New vote colors:** `--vote-1: #c2410c`, `--vote-2: #ca8a04`, `--vote-3: #16a34a`, `--vote-4: #2563eb`, `--vote-5: #be185d`

**Files:** `frontend/src/index.css`

### V.3 — Add new Google Fonts to `frontend/index.html`

Add to the existing `<link>` import: `Permanent Marker`, `Cutive Mono`, `UnifrakturCook` (wght 700), `Caveat`, `IM Fell English` (italic).

**Files:** `frontend/index.html`

### V.4 — Update `frontend/tailwind.config.ts`

Update all 7 faction color values to rainbow primaries. Add new font-family entries for the 5 new faction fonts (Caveat, Permanent Marker, Cutive Mono, IM Fell English, UnifrakturCook).

**Files:** `frontend/tailwind.config.ts`

### V.5 — Update `frontend/src/utils/factions.ts` fallbacks

`FACTION_FALLBACKS` color strings must mirror `index.css` primaries exactly. Update all 7 active factions.

**Files:** `frontend/src/utils/factions.ts`

### V.6 — Update faction card components to use `--faction-*-card-font`

Replace any hardcoded `fontFamily` strings in card components with `factionCssVar(slug, 'card-font')`. Confirmed locations: `TaskCardAnalog.tsx`, `TaskCardSNIDE.tsx`, `TaskCardUAMasters.tsx`, `FactionCard.tsx`. Audit all other card files for additional hardcoded fonts.

**Files:** `frontend/src/components/cards/`

### V.7 — Remove trailing `+` from level labels

"lvl 2+" → "lvl 2" across 6 files.

**Files:**

- `frontend/src/components/ui/LevelPill.tsx`
- `frontend/src/components/cards/TaskCardSingularity.tsx`
- `frontend/src/components/feed/FeedCardCollabInvite.tsx`
- `frontend/src/components/feed/FeedCardGlobalTask.tsx`
- `frontend/src/pages/admin/TasksTab.tsx`
- `frontend/src/pages/ProposeTask.tsx`

### V.8 — Fix inactive faction pennants

Remove desaturate filter from inactive state. `opacity: 0.42 + saturate(0.3)` → `opacity: 0.85, filter: none`.

**Files:** `frontend/src/components/ui/FilterFactionTabs.tsx`

---

## 🟣 SESSION 5+ — Ambitious Frontend (post-launch)

> Do not start until the site is live on worldzero.org and the MVP frontend is stable.

**Vision:** Faction-specific UI themes — each faction gets its own color palette, typography, background textures, and layout variations driven by a `data-faction` attribute on `<body>` + CSS custom properties.

**Planned features:**

- Per-faction design tokens (colors, fonts, borders) toggled when a logged-in character's faction changes
- Easter eggs: invisible clickable elements scattered through pages that trigger hidden messages, sounds, or lore
- Secrets: hidden routes or interactions unlocked by specific player levels (level 5 and 8 already have UX secrets in the game spec)
- Full design system (tokens, component library) built before this phase begins
- Sunyata and Terminal faction UI (currently hidden factions) revealed when those factions go live

---

## 🚀 Deployment

- **Render deploy config** — not started
- **GoDaddy DNS config** (external — worldzero.org) — not started

---

## ✅ Completed

### 🎨 Frontend Style Polish — 2026-04-15

- ✅ **Migrate remaining inline styles to Tailwind / CSS classes.** NavBar, Sidebar, FilterStamps, FilterFactionTabs, FilterLevelNodes, Tasks page, Layout.
- ✅ **Add responsive breakpoints.** Sidebar hidden below `lg` breakpoint; card container already uses `flex-wrap`.
- ✅ **Audit non-card components for hardcoded hex.** NavBar, Sidebar, Leaderboard, CharacterProfile, all feed card components cleaned up; new CSS vars added to index.css.
- ✅ **Switch frontend to consume faction colors from API.** `factionRegistry` in `utils/factions.ts` now populated from `GET /game-config` via `useGameConfig`; hardcoded values remain as initial fallback only.
- ✅ **Consolidate dark mode in non-card components.** All `dark ? x : y` color ternaries replaced with CSS variable cascades in Updates, TaskDetail, SubmitProof, ProposeTask, CharacterProfile, Leaderboard, and filter components.
