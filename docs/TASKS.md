# World Zero — Claude Code Task Queue

> This file is the handoff from Cowork planning sessions to Claude Code execution sessions.
> Molly and her Cowork assistant maintain this file during the day.
> Claude Code agents read it at the start of every session and work through tasks in order.
>
> **Always read CLAUDE.md and docs/BUILD_STATE.md before starting.**
> **Always read docs/SPEC.md before implementing any feature.**
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

## 🟢 SESSION 4+ — Frontend

> Do not start until Session 3 is complete and backend is deployed or at minimum running locally end-to-end.

Frontend is a separate React app. Scaffold with Vite + React. Details TBD — Molly will define in a Cowork session before this session begins.

Pages needed: see docs/BUILD_STATE.md and SPEC.md Section 10.

---

## Completed Sessions

- **Session 1** — Schemas + Services + Unit Tests ✅ 2026-04-01
- **Session 2** — Routers + main.py + Integration Tests ✅ 2026-04-02
- **Session 3** — Alembic Migration + CI ✅ 2026-04-02
