# World Zero — Build State

> Last updated: 2026-04-16
> Updated by: Claude Code — P.1 Migration 0004_praxis_unification validated

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
  - `praxis.py` — Praxis (submission artifact) + MediaItem + CollaborationMode + ModerationStatus (visible/flagged/hidden/failed) ✅ renamed from submission.py (TASK A.1 2026-04-15)
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
- `docs/spec/` — Canonical spec, split into 7 focused files (architecture, data-models, game-rules, api, frontend, testing, deployment). Routed to from `CLAUDE.md`.
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
- `services/submission.py` — create_submission, edit_submission, flag_submission, withdraw/resubmit, compute_submission_score_from_db, build_submission_out (shared helper) ✅ 2026-04-13
- `services/vote.py` — cast_or_update_vote (budget deduction, anti-self-vote, update-is-free logic) ✅ 2026-04-01
- `services/era.py` — apply_era_reset (driven by EraConfig flags), get_current_era_row, get_or_create_stats ✅
- `services/relationship_service.py` — create, block, list relationships with display_status computation ✅ 2026-04-13
- `services/taunt_service.py` — generate_taunt, get_taunts_for_character (enriched with display fields) ✅ 2026-04-14
- `services/activity_feed.py` — unified activity feed aggregation (8 activity types, cursor pagination, badge counts) ✅ 2026-04-14
- `services/admin_service.py` — game_overview, list_accounts, get_account_detail, list_characters, moderate_submission, suspend_account, assign_or_revoke_role, create_faction, admin_create_character, set_character_stats, reactivate_task, update_task_status ✅ 2026-04-13
- `services/character_stats.py` — recalculate_character_stats (era-aware scoring engine) ✅ 2026-04-13

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
- `routers/admin.py` — full admin panel: overview stats, accounts/characters management, task approval/retire/reactivate, submission moderation (flagged list + moderate action), contact messages, CLI token, faction creation ✅ 2026-04-13
- `routers/contact.py` — POST /contact (public contact form) ✅ 2026-04-13
- `routers/factions.py` — GET /factions, PUT /factions/{slug} ✅ 2026-04-13
- `routers/leaderboard.py` — GET /leaderboard ✅
- `routers/taunts.py` — GET /taunts (enriched taunt messages) ✅ 2026-04-14
- `routers/activity_feed.py` — GET /activity-feed (unified feed with filters + pagination) ✅ 2026-04-14
- `routers/characters.py` — added GET /characters/{id}/stats/votes-received ✅ 2026-04-14
- `routers/submissions.py` — added POST /submissions/{id}/accept-invite, POST /submissions/{id}/decline-invite ✅ 2026-04-14
- `backend/dependencies.py` — shared get_current_character + require_admin deps ✅

### Backend — App Entry Point ✅ 2026-04-02
- `backend/main.py` — FastAPI app, CORS config, SessionMiddleware, router registration, static file mount for media ✅
- Added `itsdangerous` and `python-multipart` to requirements.txt (required by SessionMiddleware and file upload) ✅

### Backend — Database Migrations ✅ 2026-04-13
- `a1b2c3d4e5f6` — Initial schema (17 tables + 6 enums) ✅
- `b2c3d4e5f6a7` — Add contact_messages table ✅
- `c3d4e5f6a7b8` — Seed factions ✅
- `d4e5f6a7b8c9` — Add is_hidden to faction ✅
- `e5f6a7b8c9d0` — Star schema modernization (CharacterStats, status enums, non-nullable columns) ✅ idempotent
- `f6a7b8c9d0e1` — Submission soft delete (is_deleted) ✅
- `g7h8i9j0k1l2` — Backend gaps (relationship status redesign, collaboration_mode, taunt_message) ✅ idempotent
- `h8i9j0k1l2m3` — Submission withdraw (is_withdrawn) ✅
- `i9j0k1l2m3n4` — Admin moderation (ModerationStatus enum replaces is_flagged/is_deleted, admin_note, contact is_archived) ✅ checkfirst

All migrations use `create_type=False` on `sa.Enum()` in `add_column`/`create_table` calls. Enum types created via explicit `op.execute("CREATE TYPE ...")` with idempotency guards.

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
- `npm run build` — zero TypeScript errors (excluding pre-existing Groups.tsx) ✅
- `frontend/src/pages/Updates.tsx` — Complete rewrite: unified activity feed with 6 filter tabs, mixed card types, date dividers, cursor pagination ✅ 2026-04-14
- `frontend/src/components/feed/` — 11 feed card components (FeedCardRouter, EraAnnouncement, VoteNotification, FoeTaunt, FriendActivity, CollabInvite, DuelChallenge, GlobalTask, FriendSignup, DateDivider, Badge) ✅ 2026-04-14
- `frontend/src/components/layout/Sidebar.tsx` — Updated: pending requests panel, votes stat, global activity ticker ✅ 2026-04-14
- `frontend/src/api/activityFeed.ts` — Activity feed API client ✅ 2026-04-14
- `frontend/src/api/taunts.ts` — Taunts API client ✅ 2026-04-14
- NavBar links verified (Tasks, Praxis /submissions, Players /leaderboard, Groups, Updates) ✅
- Dev server running on port 5173 (`npm run dev`) ✅
- **Collaboration & Duel feature ✅ 2026-04-15**
  - `backend/models/collaboration.py` — Collaboration, CollaborationMember, CollaborationInvite models ✅
  - `backend/models/praxis.py` — Removed legacy partner/invite collab fields ✅
  - `backend/models/vote.py` — praxis_id nullable, collaboration_id FK added, uq_vote_solo + uq_vote_duel constraints ✅
  - `backend/alembic/versions/0005_collaboration_and_duel.py` — Migration ✅
  - `backend/schemas/collaboration.py` — All collab/duel schemas ✅
  - `backend/schemas/praxis.py` — Removed legacy collab fields ✅
  - `backend/schemas/vote.py` — VoteOut updated for duel votes ✅
  - `backend/services/collaboration.py` — Full business logic (create, invite, respond, submit, reopen, kick, document, vote summary) ✅
  - `backend/services/scoring.py` — compute_duel_multiplier, meta_task_points in compute_praxis_score ✅
  - `backend/services/character_stats.py` — Scores both solo praxes and published collaborations/duels ✅
  - `backend/services/vote.py` — cast_or_update_duel_vote ✅
  - `backend/services/praxis.py` — Removed accept_invite/decline_invite ✅
  - `backend/services/activity_feed.py` — Updated to use CollaborationInvite ✅
  - `backend/routers/collaborations.py` — 10 endpoints ✅
  - `backend/routers/praxes.py` — Removed legacy invite routes ✅
  - `backend/routers/tasks.py` — Added POST /tasks/{id}/drop ✅
  - `backend/main.py` — Collaboration router registered ✅
  - `backend/eras/era_1.py` — Snide duel 2.0/0.0; standard factions 1.5/0.5; ua_masters 0.8/0.8 ✅
  - `frontend/src/api/collaborations.ts` — Full collaboration API client ✅
  - `frontend/src/api/votes.ts` — VoteOut updated for nullable praxis_id + collaboration fields ✅
  - `frontend/src/api/praxis.ts` — Removed legacy collab fields and invite functions ✅
  - `frontend/src/pages/CollaborationDetail.tsx` — Shared document, members, submit controls, duel vote widget ✅
  - `frontend/src/pages/SubmitProof.tsx` — Collab/duel mode creates Collaboration and redirects ✅
  - `frontend/src/components/feed/FeedCardCollabInvite.tsx` — Uses new collaboration API + task-list-full modal ✅
  - `frontend/src/components/feed/FeedCardDuelChallenge.tsx` — Uses new collaboration API + task-list-full modal ✅
  - `frontend/src/App.tsx` — /collaborations/:id route added ✅
  - Spec files updated (SPEC-backend-architecture.md, SPEC-deployment.md, SPEC-game-rules.md, SPEC-data-models.md, SPEC-api.md) ✅
  - 105 unit tests passing ✅
- **SESSION U.5 — Documentation updated for STI submission refactor ✅ 2026-04-15**
  - `docs/spec/SPEC-data-models.md` — Replaced Praxis + Collaboration + CollaborationMember + CollaborationInvite sections with unified Submission (STI), SubmissionMember, SubmissionInvite; updated Vote, Flag, MediaItem FKs; updated Enum Summary ✅
  - `docs/spec/SPEC-api.md` — Replaced /praxes + /collaborations sections with unified /submissions; documented all endpoints and ?type filter; updated response schemas ✅
  - `docs/spec/SPEC-backend-architecture.md` — Updated aggregate table, ubiquitous language, patterns, and §9 deferred features for STI model ✅
- **SESSION U.4 — Frontend migrated to /submissions ✅ 2026-04-15**
  - All frontend API calls now target `/submissions/*`; legacy shim routers preserved server-side ✅
- **SESSION U.3 — Unified /submissions router ✅ 2026-04-15**
  - `backend/routers/submissions.py` — New unified router under /submissions; merges all routes from praxes.py and collaborations.py; supports ?type=solo|collaboration|duel|published filter; media upload/delete; collab/duel operations (invite, respond, kick, document, my-content, submit, reopen); unified voting endpoint ✅
  - `backend/main.py` — /submissions router mounted alongside legacy /praxes and /collaborations (preserved for frontend compat until U.4) ✅
  - `backend/routers/votes.py` — Fixed: replaced Vote.praxis_id (removed column) with Vote.submission_id; switched Praxis lookups to Submission model; uses compute_submission_score ✅
  - `backend/routers/admin.py` — Fixed: replaced Praxis model with Submission model in flagged list + moderate + delete routes; uses build_submission_out and moderate_submission from admin_service ✅
  - `backend/models/praxis.py` — Fixed: removed stale Vote.praxis_id and Flag.praxis back_populates relationships (column removed in U.1); replaced media_items ORM relationship with a property returning [] ✅
  - `backend/schemas/vote.py` — Fixed VoteOut: praxis_id/collaboration_id replaced with submission_id to match updated Vote model ✅
  - `backend/schemas/submission.py` — SubmissionVoteIn.target_character_id made Optional (solo votes don't require it) ✅
  - `backend/services/praxis.py` — Fixed shim: removed praxis.votes access (relationship removed); score returns 0 for legacy Praxis rows ✅
  - 105 unit tests passing ✅
- **SESSION P.4 — Praxis service layer rewritten ✅ 2026-04-16**
  - `backend/services/praxis.py` — Full canonical service: create_praxis, get_praxis, list_praxes, update_praxis, withdraw_praxis, resubmit_praxis, delete_praxis, flag_praxis, invite_to_praxis, respond_to_invite, kick_member, submit_praxis, reopen_praxis, moderate_praxis, compute_praxis_score_from_db, build_praxis_out, build_praxis_card_out ✅
  - `backend/services/character_stats.py` — Updated to query Praxis + PraxisMember instead of Submission; duel totals now keyed by praxis_member_id ✅
  - `backend/services/vote.py` — Updated: praxis_id replaces submission_id; praxis_member_id replaces duel_vote_for; imports Praxis model ✅
  - `backend/services/admin_service.py` — Updated: game_overview counts Praxis rows; moderate_praxis operates on Praxis model directly ✅
  - `backend/services/activity_feed.py` — Updated: CollaborationInvite → PraxisInvite; collaboration_id → praxis_id; CollaborationMode → PraxisType ✅
  - `backend/services/submission.py` — Deleted (was broken since P.2; routers will be updated in U.3) ✅
  - `backend/services/collaboration.py` — Deleted (was broken since P.2) ✅
  - `backend/game_config.py` — Added max_duel_participants field to EraConfig ✅
  - `backend/eras/era_1.py` — Set max_duel_participants=2 on ERA_1 ✅
  - `backend/eras/_template.py` — Added max_duel_participants=2 to template ✅
  - `backend/tests/unit/test_scoring.py` — Fixed: added max_duel_participants to inline EraConfig construction ✅
  - 105 unit tests passing ✅
- **SESSION P — Praxis Unification ✅ 2026-04-16**
  - P.1: migration 0004_praxis_unification validated ✅
  - P.2: models rewritten (Praxis, PraxisMember, PraxisInvite) ✅
  - P.3: schemas rewritten ✅
  - P.4: services rewritten ✅
  - P.5: routes unified at /praxes ✅
  - P.6: frontend API client rewritten ✅
  - P.7: frontend pages updated ✅
  - P.8: integration tests + spec docs updated ✅
- **SESSION P.1 — Migration 0004_praxis_unification validated ✅ 2026-04-16**
  - `backend/alembic/versions/0004_praxis_unification.py` — upgrade (0001→0004) and downgrade (-1) both run cleanly against a fresh PostgreSQL DB; no changes to migration file required ✅
- **SESSION U.1 — Submission STI model + migration ✅ 2026-04-15**
  - `backend/models/submission.py` — New `Submission` STI table with `submission_type` discriminator (`solo | collaboration | duel`); `SubmissionMember`; `SubmissionInvite` ✅
  - `backend/alembic/versions/0003_submission_unified.py` — Creates `submission`, `submission_member`, `submission_invite` tables; migrates data from legacy `praxis` + `collaboration` tables ✅
  - Architecture: Submission STI model replaces Praxis + Collaboration; all child tables (Vote, Flag, MediaItem, PraxisMetaTask) now FK to `submission.id`
- **SESSION U.2 — Unified submission service layer ✅ 2026-04-15**
  - `backend/models/vote.py` — Changed from dual nullable FKs (praxis_id, collaboration_id) to single `submission_id` FK → submission.id; updated unique constraints; updated relationships ✅
  - `backend/models/praxis.py` — `MediaItem.praxis_id` → `MediaItem.submission_id` FK → submission.id; updated relationships ✅
  - `backend/models/flag.py` — `Flag.praxis_id` → `Flag.submission_id` FK → submission.id; updated relationships ✅
  - `backend/models/meta_task.py` — `PraxisMetaTask.praxis_id` → `PraxisMetaTask.submission_id` FK → submission.id ✅
  - `backend/schemas/submission.py` — New canonical schema file with SubmissionOut, SubmissionCreate, SubmissionUpdate, SubmissionMemberOut, SubmissionInviteOut, DuelVoteSummary, SubmissionVoteIn, SubmissionCardOut, MediaItemOut ✅
  - `backend/services/submission.py` — Unified service merging praxis.py + collaboration.py logic: all CRUD, invite, member, document, vote summary operations ✅
  - `backend/services/character_stats.py` — Updated to query Submission table instead of Praxis + Collaboration tables ✅
  - `backend/services/vote.py` — Updated to use submission_id on Vote model ✅
  - `backend/services/admin_service.py` — Added moderate_submission; updated game_overview to count Submission rows ✅
  - `backend/schemas/praxis.py` — Now a thin shim re-exporting from schemas/submission.py for router compat ✅
  - `backend/schemas/collaboration.py` — Now a thin shim re-exporting from schemas/submission.py for router compat ✅
  - `backend/services/praxis.py` — Now a thin shim; NotImplementedError stubs for deprecated functions; compute_praxis_score_from_db kept for router compat ✅
  - `backend/services/collaboration.py` — Now a thin shim re-exporting from services/submission.py ✅
  - 105 unit tests passing ✅
- **Style polish (SESSION Frontend) ✅ 2026-04-15**
  - Dark mode ternaries replaced with CSS vars across all non-card components (NavBar, Sidebar, FilterStamps, FilterLevelNodes, Leaderboard, Updates, TaskDetail, SubmitProof, ProposeTask, CharacterProfile, feed cards)
  - Inline layout styles → Tailwind classes (Sidebar, FilterFactionTabs, FilterStamps, FilterLevelNodes, Tasks page, Layout)
  - Responsive breakpoints added: sidebar collapses below `lg`, card wrap via `flex-wrap` already in place
  - Hardcoded hex audited and replaced with CSS vars in all targeted components; new vars added to index.css (rank, badge, level track, stamp dashed)
  - Faction colors wired to API: `factionRegistry` in `utils/factions.ts` populated from `GET /game-config` via `useGameConfig`; `getAllFactions()` exposed for component fallback use

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
