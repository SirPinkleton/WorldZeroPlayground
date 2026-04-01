# World Zero — Build State

> Last updated: 2026-03-30
> Updated by: Cowork session with Molly

This file is the source of truth for what has been built, what is in progress, and what hasn't been started yet. Claude Code agents should read this before beginning any session and update it when tasks are complete.

---

## What Exists (✅ Done)

### Foundation
- `backend/models/` — All SQLAlchemy models defined and reviewed
  - `account.py` — Account (private login identity)
  - `character.py` — Character (public game persona), with level, score, faction, votes_available
  - `era.py` — Era DB record (stores config_key, not rules)
  - `faction.py` — Faction (FK reference table; rules live in game_config.py)
  - `task.py` — Task, TaskFaction (join), CharacterTask (signup tracking)
  - `submission.py` — Submission (praxis) + MediaItem
  - `vote.py` — Vote with voter_account_id for anti-self-vote
  - `relationship.py` — friend/foe/rival relationships
  - `message.py` — direct messages between characters
  - `flag.py` — submission flags
  - `meta_task.py` — meta tasks (stretch goal)
  - `roles.py` — Role + AccountRole for admin
- `backend/game_config.py` — Complete. EraConfig, FactionConfig, ERA_1 (all 9 factions), CURRENT_ERA
- `backend/db.py` — Async SQLAlchemy engine + session
- `backend/config.py` — Settings via env vars
- `backend/alembic/` — Migration scaffolding initialized (no migration files yet)
- `backend/requirements.txt`
- `backend/Dockerfile`
- `docker-compose.yml`
- `docs/SPEC.md` — Full v3 spec (canonical reference for all features)
- `docs/WorldZero_Spec_v3.md` — Same file (original name, kept for reference)
- `CLAUDE.md` — Agent instructions
- `worldzero-mvp/` — Simpler working MVP (SQLite, sync SQLAlchemy). Use as reference only — do NOT port code directly. Architecture is intentionally different.

---

## What's Missing (❌ Not Started)

### Backend — Layer 2: Schemas ✅ 2026-04-01
`backend/schemas/` created.

- `schemas/__init__.py` ✅
- `schemas/character.py` — CharacterOut, CharacterCreate, CharacterUpdate ✅
- `schemas/task.py` — TaskOut, TaskCreate, CharacterTaskOut ✅
- `schemas/submission.py` — SubmissionOut, SubmissionCreate, MediaItemOut ✅
- `schemas/vote.py` — VoteIn, VoteOut, VoteSummary ✅
- `schemas/relationship.py` — RelationshipOut, RelationshipCreate ✅
- `schemas/message.py` — MessageOut, MessageCreate ✅
- `schemas/auth.py` — TokenResponse, CurrentUser ✅

### Backend — Layer 3: Services (Business Logic)
`backend/services/` created.

- `services/__init__.py` ✅
- `services/scoring.py` — compute_vote_budget, compute_level, compute_submission_score ✅ 2026-04-01
- `services/auth.py` — create_jwt, decode_jwt, get_current_account, create_or_get_account ✅ 2026-04-01
- `services/character.py` — create_character (level gate), update_character, soft_delete_character, handle_faction_assignment
- `services/task.py` — signup_for_task (cap + level gate), drop_task, propose_task, approve_task
- `services/submission.py` — create_submission, edit_submission, flag_submission, compute_submission_score_from_db
- `services/vote.py` — cast_vote (budget deduction, anti-self-vote, update-is-free logic)
- `services/era.py` — apply_era_reset (driven by EraConfig flags)

### Backend — Layer 4: Routers
`backend/routers/` does not exist yet.

- `routers/__init__.py`
- `routers/auth.py` — GET /auth/google, GET /auth/google/callback, GET /auth/me, POST /auth/logout
- `routers/characters.py` — GET /characters, GET /characters/{id}, POST /characters, PUT /characters/{id}, DELETE /characters/{id}
- `routers/tasks.py` — GET /tasks, GET /tasks/{id}, POST /tasks, PUT /tasks/{id}, POST /tasks/{id}/signup, DELETE /tasks/{id}/signup
- `routers/submissions.py` — GET /submissions, GET /submissions/{id}, POST /submissions, PUT /submissions/{id}, POST /submissions/{id}/media, POST /submissions/{id}/flag
- `routers/votes.py` — POST /submissions/{id}/vote, GET /submissions/{id}/votes
- `routers/relationships.py` — POST /relationships, PUT /relationships/{id}, DELETE /relationships/{id}
- `routers/messages.py` — GET /messages, POST /messages, GET /messages/{id}
- `routers/admin.py` — task approval, flagged submissions, era reset
- `routers/leaderboard.py` — GET /leaderboard

### Backend — App Entry Point
- `backend/main.py` — FastAPI app, CORS config, router registration, static file mount for media

### Backend — Database Migrations
- `backend/alembic/versions/0001_initial.py` — First migration (all tables). Must be generated AFTER models are stable.

### Backend — Tests
`backend/tests/` does not exist yet.

- `tests/conftest.py` — test DB fixture, async test client, seeded characters
- `tests/unit/test_scoring.py`
- `tests/unit/test_era_config.py`
- `tests/unit/test_level_thresholds.py`
- `tests/unit/test_era_reset.py`
- `tests/integration/test_auth.py`
- `tests/integration/test_characters.py`
- `tests/integration/test_tasks.py`
- `tests/integration/test_submissions.py`
- `tests/integration/test_votes.py`
- `tests/integration/test_admin.py`

### Frontend
`frontend/` does not exist yet. React app with React Router, Axios, mobile-first CSS.

Pages needed (see SPEC.md Section 10 for full detail):
- Home (`/`) — activity feed / about
- Tasks (`/tasks`) — browse + filter
- Task Detail (`/tasks/:id`)
- Submit Proof (`/tasks/:id/submit`)
- Submission Detail (`/submissions/:id`)
- Character Profile (`/characters/:id`)
- Leaderboard (`/leaderboard`)
- Groups (`/groups`)
- Updates (`/updates`)
- Admin (`/admin`)

### Deployment
- `backend/alembic/versions/` — migration files
- Render deploy config
- GitHub Actions CI workflow (`.github/workflows/test.yml`)
- GoDaddy DNS config (external — worldzero.org)

---

## Recommended Build Order

1. **schemas/** → pure Pydantic, no DB dependency
2. **services/** → pure Python logic, EraConfig-driven, testable without DB
3. **tests/unit/** → validate services immediately
4. **main.py + routers/** → wire everything together
5. **tests/integration/** → end-to-end API tests
6. **alembic migration** → generate once models are locked
7. **frontend/** → React app against working API
8. **deployment** → Render + CI

---

## Key Invariants (do not break these)

- `account_id` and `email` must NEVER appear in public API responses
- All game rules live in `game_config.py` — never hardcode EraConfig values in services
- Services must accept `era: EraConfig = CURRENT_ERA` for testability
- Anti-self-vote checks at the account level, not character level
- All migrations via Alembic only — never modify schema directly
- Media paths stored as relative paths only (for future S3 swap)
