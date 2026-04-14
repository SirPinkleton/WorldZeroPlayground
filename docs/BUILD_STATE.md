# World Zero — Build State

> Last updated: 2026-04-13
> Updated by: Claude Code — Backend Gaps session complete

This file is the source of truth for what has been built, what is in progress, and what hasn't been started yet. Claude Code agents should read this before beginning any session and update it when tasks are complete.

---

## What Exists (✅ Done)

### Foundation
- `backend/models/` — All SQLAlchemy models defined and reviewed
  - `account.py` — Account (private login identity) with AccountStatus enum (active/suspended/deleted)
  - `character.py` — Character (public game persona) with CharacterStatus enum; stats moved to CharacterStats
  - `character_stats.py` — CharacterStats (per-era volatile stats: score, level, votes_available, all_time_score) ✅ star schema split
  - `era.py` — Era DB record (stores config_key, not rules)
  - `faction.py` — Faction with FactionStatus enum (visible/hidden/deprecated; rules live in game_config.py)
  - `task.py` — Task, TaskFaction (join), CharacterTask (signup tracking)
  - `submission.py` — Submission (praxis) + MediaItem + CollaborationMode + ModerationStatus (visible/flagged/hidden/failed)
  - `contact.py` — ContactMessage (public contact form submissions) ✅
  - `vote.py` — Vote with voter_account_id for anti-self-vote
  - `relationship.py` — friend/foe relationships (instant declarations, active/blocked status) ✅ redesigned 2026-04-13
  - `message.py` — direct messages between characters
  - `taunt_message.py` — foe taunt messages with trigger types ✅ 2026-04-13
  - `flag.py` — submission flags
  - `meta_task.py` — meta tasks (stretch goal)
  - `roles.py` — Role + AccountRole for admin
- `backend/game_config.py` — Complete. EraConfig, FactionConfig (with color), ERA_1 (all 10 factions), CURRENT_ERA, TAUNT_TEMPLATES
- `backend/db.py` — Async SQLAlchemy engine + session
- `backend/config.py` — Settings via env vars
- `backend/alembic/` — Migration scaffolding + initial schema migration applied ✅
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

### Backend — Layer 3: Services (Business Logic) ✅ 2026-04-01
`backend/services/` created.

- `services/__init__.py` ✅
- `services/scoring.py` — compute_vote_budget, compute_level, compute_submission_score ✅ 2026-04-01
- `services/auth.py` — create_jwt, decode_jwt, get_current_account, create_or_get_account ✅ 2026-04-01
- `services/character.py` — create_character (level gate), update_character, soft_delete_character, check_faction_graduation ✅ 2026-04-01
- `services/task.py` — signup_for_task (cap + level gate), drop_task, propose_task ✅ 2026-04-01
- `services/submission.py` — create_submission, edit_submission, flag_submission, compute_submission_score_from_db ✅ 2026-04-01
- `services/vote.py` — cast_or_update_vote (budget deduction, anti-self-vote, update-is-free logic) ✅ 2026-04-01
- `services/era.py` — apply_era_reset (driven by EraConfig flags) — reset logic unit-tested via test_era_reset.py; DB service deferred to Session 2
- `services/relationship_service.py` — create, block, list relationships with display_status computation ✅ 2026-04-13
- `services/taunt_service.py` — generate_taunt, get_taunts_for_character ✅ 2026-04-13

### Backend — Layer 4: Routers ✅ 2026-04-02
`backend/routers/` created. All 40 routes registered and importing cleanly.

- `routers/__init__.py` ✅
- `routers/auth.py` — GET /auth/google, GET /auth/google/callback, GET /auth/me, POST /auth/logout ✅
- `routers/characters.py` — GET /characters, GET /characters/{id}, POST /characters, PUT /characters/{id}, DELETE /characters/{id}, GET /characters/{id}/submissions, GET /characters/{id}/relationships ✅
- `routers/tasks.py` — GET /tasks, GET /tasks/{id}, GET /tasks/{id}/signups, POST /tasks, PUT /tasks/{id}, POST /tasks/{id}/signup, DELETE /tasks/{id}/signup ✅
- `routers/submissions.py` — GET /submissions, GET /submissions/{id}, POST /submissions, PUT /submissions/{id}, POST /submissions/{id}/media, POST /submissions/{id}/flag ✅
- `routers/votes.py` — POST /submissions/{id}/vote, GET /submissions/{id}/votes, GET /submissions/{id}/voters ✅
- `routers/relationships.py` — GET /relationships, POST /relationships, PUT /relationships/{id} (block), DELETE /relationships/{id} ✅ (redesigned: instant declarations, display status)
- `routers/game_config.py` — GET /game-config (era config, faction colors, level thresholds) ✅ 2026-04-13
- `routers/meta_tasks.py` — GET /meta-tasks?task_id=X (applicable meta tasks per task) ✅ 2026-04-13
- `routers/messages.py` — GET /messages, POST /messages, GET /messages/{id} ✅
- `routers/admin.py` — task approval/retire, submission delete, character ban, admin task create ✅
- `routers/leaderboard.py` — GET /leaderboard ✅
- `backend/dependencies.py` — shared get_current_character + require_admin deps ✅

### Backend — App Entry Point ✅ 2026-04-02
- `backend/main.py` — FastAPI app, CORS config, SessionMiddleware, router registration, static file mount for media ✅
- Added `itsdangerous` and `python-multipart` to requirements.txt (required by SessionMiddleware and file upload) ✅

### Backend — Database Migrations ✅ 2026-04-02
- `backend/alembic/versions/a1b2c3d4e5f6_initial_schema.py` — Initial migration (all 17 tables + enums). Applied and verified drift-free via `alembic check`. ✅

### Backend — Tests ✅ (unit + integration scaffold) 2026-04-02
`backend/tests/` created.

- `tests/conftest.py` — minimal (unit tests need no env vars) ✅
- `tests/unit/test_scoring.py` ✅ 2026-04-01
- `tests/unit/test_era_config.py` ✅ 2026-04-01
- `tests/unit/test_level_thresholds.py` ✅ 2026-04-01
- `tests/unit/test_era_reset.py` ✅ 2026-04-01 — 60/60 passing
- `tests/integration/conftest.py` — async test DB, AsyncClient, seeded Account/Character fixtures ✅ 2026-04-02
- `tests/integration/test_auth.py` ✅ 2026-04-02
- `tests/integration/test_characters.py` ✅ 2026-04-02
- `tests/integration/test_tasks.py` ✅ 2026-04-02
- `tests/integration/test_submissions.py` ✅ 2026-04-02
- `tests/integration/test_votes.py` ✅ 2026-04-02
- `tests/integration/test_admin.py` ✅ 2026-04-02
- Integration tests require TEST_DATABASE_URL env var pointing to a `worldzero_test` Postgres DB

### Frontend ✅ Session 4 — 2026-04-03
`frontend/` scaffolded with Vite + React + TypeScript + Tailwind CSS v3, React Router v6, Axios.

- `frontend/src/api/` — axios.ts, auth.ts, characters.ts, tasks.ts, submissions.ts, votes.ts, leaderboard.ts, messages.ts, admin.ts ✅
- `frontend/src/auth/` — AuthContext.tsx, ProtectedRoute.tsx ✅
- `frontend/src/components/` — Layout.tsx, NavBar.tsx, TaskCard.tsx, SubmissionCard.tsx, StarRating.tsx, CharacterBadge.tsx, MediaGallery.tsx ✅
- `frontend/src/pages/` — Home, Tasks, TaskDetail, SubmitProof, SubmissionDetail, CharacterProfile, Leaderboard, Groups, Updates, Admin, Submissions ✅
- `frontend/src/App.tsx` — all routes wired ✅
- `frontend/src/vite-env.d.ts` — Vite client types for `import.meta.env` ✅
- `frontend/tailwind.config.ts` — custom palette, shadows, fonts (Caveat + Kalam) ✅
- `npm run build` — zero TypeScript errors ✅
- NavBar links verified (Tasks, Praxis /submissions, Players /leaderboard, Groups, Updates) ✅
- Dev server running on port 5173 (`npm run dev`) ✅

Seed data:
- `backend/seed.py` — 9 factions, 8 accounts/characters, 14 tasks, 24 submissions, ~101 votes ✅
- Character scores/levels verified against ERA_1 math (corvus_king L5, sable_ink L4, pixel_drift/terra_nova L3, etc.) ✅

### Deployment
- `.github/workflows/test.yml` — GitHub Actions CI: push/PR triggers, Postgres service, pip install, alembic upgrade, pytest --cov ✅ 2026-04-02
- `backend/pytest.ini` — asyncio_mode = auto ✅ 2026-04-02
- Render deploy config — ❌ not started
- GoDaddy DNS config (external — worldzero.org) — ❌ not started

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
