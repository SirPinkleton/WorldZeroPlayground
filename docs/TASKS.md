# World Zero — Claude Code Task Queue

> This file is the handoff from Cowork planning sessions to Claude Code execution sessions.
> Molly and her Cowork assistant maintain this file during the day.
> Claude Code agents read it at the start of every session and work through tasks in order.
>
> **Always read CLAUDE.md and docs/BUILD_STATE.md before starting.**
> **Read the relevant file in `docs/spec/` before implementing any feature** (see the routing table in `CLAUDE.md`).
> **Mark tasks DONE (with date) when complete. Do not delete them.**

---

## ✅ SESSION 1 — Backend Layer 1: Schemas + Services + Unit Tests — COMPLETE 2026-04-01

**Goal:** Build the pure Python layer — Pydantic schemas, service functions, and unit tests.
No routes, no main.py yet. This layer has zero external dependencies beyond what's already in the repo.

**Done when:** `pytest backend/tests/unit/ -v` passes with 0 failures.

**Do NOT:**
- Create routers/ or main.py (that's Session 2)
- Run or modify alembic migrations
- Touch any existing files in backend/models/ or game_config.py
- Create a frontend

---

### TASK 1.1 — Create backend/schemas/

Create `backend/schemas/__init__.py` (empty) and the following schema files.

**Rules:**
- Use Pydantic v2 (`from pydantic import BaseModel, ConfigDict`)
- `model_config = ConfigDict(from_attributes=True)` on all ORM-facing schemas
- Never include `account_id` or `email` in any schema that will be returned publicly
- Use `Optional[X]` for nullable fields

**Files to create:**

`backend/schemas/auth.py`
```
TokenResponse: access_token: str, token_type: str = "bearer"
CurrentUser: account_id: int, character: Optional[CharacterOut]
```

`backend/schemas/character.py`
```
CharacterOut: id, username, display_name, bio, avatar_url, location, level, score, all_time_score, faction_slug, created_at
CharacterCreate: username (str, min 3 max 30), display_name (str), bio (Optional[str]), avatar_url (Optional[str]), location (Optional[str])
CharacterUpdate: display_name (Optional), bio (Optional), avatar_url (Optional), location (Optional)
```

`backend/schemas/task.py`
```
TaskOut: id, title, description, point_value, level_required, status, created_by (int), primary_faction_slug, is_task_vision_eligible, created_at
TaskCreate: title, description (Optional), point_value (int, > 0), level_required (int, >= 0), primary_faction_slug (Optional)
CharacterTaskOut: id, task: TaskOut, status, signed_up_at
```

`backend/schemas/submission.py`
```
MediaItemOut: id, type, file_path, display_order
SubmissionOut: id, task_id, character_id, title, body_text, is_flagged, created_at, updated_at, media: list[MediaItemOut], score: Optional[float] (computed, not stored)
SubmissionCreate: task_id (int), title (str), body_text (Optional[str])
```

`backend/schemas/vote.py`
```
VoteIn: stars (int, 1–5)
VoteOut: id, submission_id, voter_character_id, stars, created_at, updated_at
VoteSummary: submission_id, total_votes, average_stars (float), total_score (float)
```

`backend/schemas/relationship.py`
```
RelationshipOut: id, from_character_id, to_character_id, type, status, created_at
RelationshipCreate: to_character_id (int), type (enum: friend | foe)
```

`backend/schemas/message.py`
```
MessageOut: id, from_character_id, to_character_id, body, read_at, created_at
MessageCreate: to_character_id (int), body (str, min 1 max 2000)
```

---

### TASK 1.2 — Create backend/services/scoring.py

Pure functions. No DB. No FastAPI. All accept `era: EraConfig = CURRENT_ERA`.

```python
# All three functions below — implement exactly as specified in SPEC.md Section 6
compute_vote_budget(score: int, era: EraConfig = CURRENT_ERA) -> int
compute_level(score: int, era: EraConfig = CURRENT_ERA) -> int
compute_submission_score(avg_stars: float, task_point_value: int) -> float
```

---

### TASK 1.3 — Create backend/services/auth.py

JWT-based auth helpers. Use `python-jose` for JWT (already in requirements.txt).

```python
create_jwt(account_id: int) -> str
decode_jwt(token: str) -> dict  # raises HTTPException 401 if invalid
# get_current_account — FastAPI dependency (reads Authorization header or cookie)
# create_or_get_account(provider: str, provider_user_id: str, email: str, session: AsyncSession) -> Account
```

---

### TASK 1.4 — Create backend/services/character.py

```python
# get_character_by_id(character_id: int, session) -> Character | None
# create_character(account_id, data: CharacterCreate, session, era=CURRENT_ERA) -> Character
#   - Enforce: account can only have one character unless level >= 3
#   - New characters start in "ua" faction, votes_available = era.vote_budget_base
# update_character(character_id, data: CharacterUpdate, session) -> Character
# soft_delete_character(character_id, session) -> None  (sets is_active=False)
# check_faction_graduation(character: Character, era=CURRENT_ERA) -> str | None
#   - Returns new faction slug if character just hit level 3 while in "ua", else None
```

---

### TASK 1.5 — Create backend/services/task.py

```python
# signup_for_task(character: Character, task: Task, session, era=CURRENT_ERA) -> CharacterTask
#   - Enforce: count active CharacterTask rows <= era.max_task_signups
#   - Enforce: character.level >= task.level_required
# drop_task(character_task: CharacterTask, session) -> None  (sets status=abandoned)
# propose_task(character: Character, data: TaskCreate, session) -> Task
#   - Enforce: character.level >= 3 (can propose); admin only to create active directly
```

---

### TASK 1.6 — Create backend/services/submission.py

```python
# create_submission(character, task, data: SubmissionCreate, session) -> Submission
# edit_submission(submission, data, session) -> Submission  (only own submissions)
# flag_submission(submission, flagged_by: Character, reason: str, session) -> Submission
#   - Enforce: level >= 4 to flag; cannot flag own submission
# compute_submission_score_from_db(submission_id: int, task_point_value: int, session) -> float
#   - Queries Vote table, computes avg_stars, returns avg_stars * task_point_value
```

---

### TASK 1.7 — Create backend/services/vote.py

```python
# cast_or_update_vote(voter: Character, submission: Submission, stars: int, session, era=CURRENT_ERA) -> Vote
#   Enforce:
#     - voter.account_id != submission author's account_id (anti-self-vote at account level)
#     - If new vote: deduct 1 from voter.votes_available; raise HTTPException 403 if budget == 0
#     - If updating existing vote: no budget deduction, just update stars + updated_at
#     - stars must be 1–5
```

---

### TASK 1.8 — Create backend/tests/unit/

Create `backend/tests/__init__.py`, `backend/tests/unit/__init__.py`, and:

`backend/tests/unit/test_scoring.py` — Use the examples from SPEC.md Section 12 verbatim, plus additional edge cases.

`backend/tests/unit/test_era_config.py` — Validate ERA_1 internal consistency (multipliers in range, thresholds sorted, faction slugs match keys, etc.)

`backend/tests/unit/test_level_thresholds.py` — Test that level breakpoints fire at correct score boundaries for ERA_1.

`backend/tests/unit/test_era_reset.py` — Unit test the reset logic: given an EraConfig with various reset flags, assert the correct fields would be zeroed.

**All tests must pass with: `pytest backend/tests/unit/ -v --tb=short`**

---

## ✅ SESSION 2 — Backend Layer 2: Routers + main.py + Integration Tests — COMPLETE 2026-04-02

> Do not start this session until Session 1 is complete and unit tests pass.

**Goal:** Wire the services into FastAPI routes. Get the backend running end-to-end.

**Done when:**
- `uvicorn main:app --reload` starts without errors
- `pytest backend/tests/integration/ -v` passes (or list known failures with reasons)

**Do NOT:**
- Create the frontend
- Run alembic migrations (wait for explicit instruction)
- Change any model files

---

### TASK 2.1 — Create backend/main.py

```python
# FastAPI app with:
# - CORSMiddleware (origins from config, allow credentials=True)
# - Static file mount at /media for local media storage
# - All routers registered with appropriate prefixes
# - Lifespan: no-op for now (migrations run manually)
```

### TASK 2.2 — Create backend/routers/auth.py
Routes: GET /auth/google, GET /auth/google/callback, GET /auth/me, POST /auth/logout

Use Authlib for Google OAuth. On callback: create or get Account via services/auth.py, return JWT as httpOnly cookie. `/auth/me` returns CurrentUser schema.

### TASK 2.3 — Create backend/routers/characters.py
Routes from SPEC.md Section 9 (Characters block). Use services/character.py for all logic.

### TASK 2.4 — Create backend/routers/tasks.py
Routes from SPEC.md Section 9 (Tasks block). Filtering on GET /tasks: status, level, faction, points.

### TASK 2.5 — Create backend/routers/submissions.py
Routes from SPEC.md Section 9 (Submissions block). Media upload saves to `/media/{character_id}/{submission_id}/`.

### TASK 2.6 — Create backend/routers/votes.py
Routes from SPEC.md Section 9 (Votes block). All logic via services/vote.py.

### TASK 2.7 — Create backend/routers/relationships.py + messages.py + leaderboard.py
Routes from SPEC.md Section 9 (Relationships, Messages, Leaderboard blocks).

### TASK 2.8 — Create backend/routers/admin.py
Routes from SPEC.md Section 9 (Admin block). All endpoints require admin role (check AccountRole table).

### TASK 2.9 — Create backend/tests/conftest.py + integration tests
`conftest.py` must provide: async test DB (separate from dev DB), AsyncClient wrapping the app, helper fixtures to seed an Account + Character.

Integration tests: see SPEC.md Section 12 for required test files and what each covers.

---

## ✅ SESSION 3 — Alembic Migration + CI — COMPLETE 2026-04-02

> Do not start until Session 2 integration tests pass.

### TASK 3.1 — Generate initial Alembic migration
Run: `alembic revision --autogenerate -m "initial schema"` from /backend
Review the generated file — confirm all tables are present and no unexpected changes.
Run: `alembic upgrade head` against a fresh local Postgres container.

### TASK 3.2 — GitHub Actions CI
Create `.github/workflows/test.yml`:
- Trigger: push to any branch
- Steps: checkout, set up Python, pip install, spin up Postgres via service container, run `pytest --cov=. --cov-fail-under=80`

---

## ✅ SESSION 4 — Frontend MVP — COMPLETE 2026-04-03

> Do not start until Session 3 is complete and backend running locally end-to-end. ✅ Ready.

**Stack:** Vite + React + TypeScript, Tailwind CSS v3, React Router v6, Axios
**Aesthetic:** Graph paper background, Caveat (headings) + Kalam (body) fonts, hard offset shadows, faction color accents
**Done when:** `npm run build` has zero TS errors and `/tasks` renders cards against the live backend

### TASK 4.1 — Scaffold + config
- `npm create vite@latest frontend -- --template react-ts`
- Install: `tailwindcss`, `postcss`, `autoprefixer`, `react-router-dom`, `axios`
- Configure `tailwind.config.ts` with custom palette, shadows, and fonts
- Add Google Fonts (Caveat + Kalam) to `index.html`
- Set `VITE_API_URL=http://localhost:8000` in `frontend/.env.local`

### TASK 4.2 — API layer (`src/api/`)
- `axios.ts` — single Axios instance, baseURL from `VITE_API_URL`, `withCredentials: true`
- `auth.ts` — `getMe()`, `logout()`
- `characters.ts` — `getCharacter()`, `listCharacters()`, `createCharacter()`, `updateCharacter()`
- `tasks.ts` — `listTasks()`, `getTask()`, `signupTask()`, `dropTask()`, `proposeTask()`
- `submissions.ts` — `listSubmissions()`, `getSubmission()`, `createSubmission()`, `uploadMedia()`, `flagSubmission()`
- `votes.ts` — `castVote()`, `getVotes()`
- `leaderboard.ts` — `getLeaderboard()`
- `messages.ts` — `getMessages()`, `sendMessage()`, `getMessage()`
- `admin.ts` — `getPendingTasks()`, `approveTask()`, `retireTask()`, `deleteSubmission()`, `banCharacter()`

### TASK 4.3 — Auth (`src/auth/`)
- `AuthContext.tsx` — `AuthProvider`, `useAuth` hook; calls `GET /auth/me` on mount
- `ProtectedRoute.tsx` — redirects to `/` with `?login=required` if unauthenticated

### TASK 4.4 — Shared components (`src/components/`)
- `Layout.tsx` — top nav + bottom footer wrapper
- `NavBar.tsx` — links + login/profile toggle (state-aware)
- `TaskCard.tsx` — faction stripe, title, desc, sign-up button, footer stats
- `SubmissionCard.tsx` — character badge, title, score, preview
- `StarRating.tsx` — 1–5 interactive star widget (calls `castVote`)
- `CharacterBadge.tsx` — avatar + username chip
- `MediaGallery.tsx` — image/video/audio display from `MediaItem[]`

### TASK 4.5 — Pages (`src/pages/`)
- `Home.tsx` — About landing (logged out) / recent praxis feed (logged in)
- `Tasks.tsx` — card grid + status/faction/level filters
- `TaskDetail.tsx` — full task + submissions list sorted by score + "Submit Proof" CTA
- `SubmitProof.tsx` — auth-gated; title, body textarea, media upload, submit
- `SubmissionDetail.tsx` — full proof, MediaGallery, StarRating, flag button (lvl 4+)
- `CharacterProfile.tsx` — avatar, bio, level, faction badge, score, submission grid
- `Leaderboard.tsx` — ranked character list, paginated
- `Groups.tsx` — faction cards with colors, description, gameplay note (static data)
- `Updates.tsx` — auth-gated; recent activity feed (own submissions + messages)
- `Admin.tsx` — auth+admin-gated; pending tasks queue, flagged submissions

### TASK 4.6 — Wire routes + verify build
- `App.tsx` — all routes via React Router v6
- `npm run build` — zero TS errors
- `npm run dev` — `/tasks` renders cards from live backend

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

## 🎨 SESSION — Frontend Style Polish

> Migrated from `STYLE_MIGRATION_NOTES.md` (deleted 2026-04-14). The original style migration is
> structurally complete (CSS variables, faction archetypes, dark mode, custom fonts all shipped).
> These are the remaining polish items.
>
> **Read before starting:** `WORLD_ZERO_STYLE.md`, `frontend/src/index.css`, `frontend/src/utils/factions.ts`.

### High priority

- **Migrate remaining inline styles to Tailwind / CSS classes.** Components outside `cards/` still use extensive `style={{}}` objects. Priority order: `NavBar`, `Sidebar`, `FilterStamps`, `FilterFactionTabs`, `FilterLevelNodes`.
- **Add responsive breakpoints.** No media queries currently exist — mobile and tablet views are unhandled. Add Tailwind responsive classes for the layout grid, sidebar collapse, and card wrapping.
- **Audit non-card components for hardcoded hex.** `NavBar`, `Sidebar`, feed items, profile, leaderboard may still have hardcoded colors that should reference CSS variables.

### Medium priority

- **Switch frontend to consume faction colors from API.** Backend already returns colors via `GET /game-config`. `frontend/src/utils/factions.ts` still has hardcoded config — replace with API response.
- **Consolidate dark mode in non-card components.** Audit `NavBar`, `FilterStamps`, `FilterLevelNodes`, and page components for any remaining `dark ? x : y` ternaries — those should be CSS variable cascades instead.

### Low priority

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

### TASK A.1 — Rename `Submission` → `Praxis` across the codebase

The canonical noun is **Praxis** (the completed-task artifact). "Submit" is
the verb — a player *submits* a praxis. Today the code names the entity
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

### TASK A.2 — Declare SQLAlchemy `relationship()` on core models

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

### TASK A.3 — Fix `Submission.invite_status` type annotation

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

### TASK A.4 — Break the `era` ↔ `faction_service` import cycle

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

### TASK A.5 — Slim `routers/tasks.py::list_tasks`

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

### TASK A.6 — Audit `admin_service.py` for era parameterization

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

### TASK A.7 — Annotate the `/auth/me` identity exception

`schemas/auth.py::CurrentUser` exposes `account_id`, which is the one
deliberate exception to the "never leak account_id publicly" rule (see
`SPEC-backend-architecture.md` §4). Today nothing in code marks this as
intentional, so a future agent may "fix" it.

**Do:** add a one-line comment on `CurrentUser` and on `routers/auth.py::me`
citing `SPEC-backend-architecture.md` §4 as the authorization for this
exception.

**Acceptance:** `schemas/auth.py` and `routers/auth.py` both reference the
spec section; no behavior change.

### TASK A.8 — Tighten `build_submission_out` / `build_praxis_out` after A.2 lands

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

### TASK A.9 — Reconcile `submission_score` formula between code and spec

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

## Completed Sessions

- **Session 1** — Schemas + Services + Unit Tests ✅ 2026-04-01
- **Session 2** — Routers + main.py + Integration Tests ✅ 2026-04-02
- **Session 3** — Alembic Migration + CI ✅ 2026-04-02
- **Session 4** — Frontend MVP ✅ 2026-04-03
