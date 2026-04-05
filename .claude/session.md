## Session Handoff — 2026-04-01

### What we did
- Split `docs/SPEC.md` (1146 lines) into 7 focused files in `docs/spec/`: architecture, data-models, game-rules, api, frontend, testing, deployment (~35–120 lines each)
- Updated `CLAUDE.md` with a per-domain spec routing table — agents now load only the relevant section per task type, reducing context load by ~85–97%
- Created `.claude/launch.json` with run configurations for backend (uvicorn), frontend (npm start), and DB (docker-compose)
- Created `session-handoff` Claude Code skill (SKILL.md in skills directory) — triggers on `/handoff`, "end of session", "wrap up", etc.
- Created `session-start` Claude Code skill (SKILL.md in skills directory) — triggers on `/morning`, "catch me up", "start session", etc.

### Current state
**Working:**
- All SQLAlchemy models (`backend/models/`) — complete and reviewed
- `game_config.py` — EraConfig, ERA_1 (all 9 factions), CURRENT_ERA — complete
- `backend/schemas/` — all 7 schema files complete (✅ 2026-04-01)
- `services/scoring.py` — compute_vote_budget, compute_level, compute_submission_score (✅ 2026-04-01)
- `services/auth.py` — create_jwt, decode_jwt, get_current_account, create_or_get_account (✅ 2026-04-01)
- `docs/spec/` — all 7 split spec files exist and are accurate
- `CLAUDE.md` — updated with spec routing table (uncommitted)

**In progress:**
- Session 1 from TASKS.md is partially complete: schemas ✅, scoring ✅, auth ✅ — but character/task/submission/vote services and all unit tests are still missing

**Broken / blocked:**
- Nothing broken. Alembic migration hasn't been run yet (intentional — waiting for services + routers to stabilize per build order)

### Key decisions
- **Spec split over single file** — Reason: loading the full 1146-line SPEC.md every session was burning significant context. Split allows targeted loading. The original `docs/SPEC.md` still exists as a reference but CLAUDE.md now routes to the split files.
- **session-start skill named separately from morning-briefing** — Reason: an existing `morning-briefing` skill already handles email/calendar for "good morning". Named the coding skill `session-start` with different triggers to avoid conflict.
- **session.md lives at `.claude/session.md`** — Reason: `.claude/` is gitignored-friendly and already used for launch.json and settings. Keeps session state out of `docs/`.
- **Build order: schemas → services → unit tests → routers → integration tests → migration** — Reason: pure Python layers first means tests work without a running DB, catching logic bugs early.

### Next steps
1. 🟢 **Complete remaining Session 1 services** — `services/character.py`, `services/task.py`, `services/submission.py`, `services/vote.py`. See TASKS.md tasks 1.4–1.7 for exact function signatures. Read `docs/spec/SPEC-game-rules.md` for business logic.
2. 🟢 **Create unit tests** — `backend/tests/unit/` (4 files). See TASKS.md task 1.8 and `docs/spec/SPEC-testing.md` for test structure and examples. Target: `pytest backend/tests/unit/ -v` passes clean.
3. 🟡 **Commit current work** — `CLAUDE.md`, `docs/spec/`, `.claude/launch.json` are all untracked/modified on branch `helloooooooooooooooooooo`. Confirm with Molly before committing — she may want to PR or rename the branch first.
4. 🟢 **Session 2 (after unit tests pass)** — routers + main.py + integration tests. See TASKS.md Session 2 block.
5. 🟢 **Alembic migration** — Session 3. Run after routers are wired and backend starts cleanly.

### Open questions
- Should the `docs/SPEC.md` (original monolith) be deleted now that `docs/spec/` exists, or kept as a fallback reference?
- Branch `helloooooooooooooooooooo` — is this a dev branch to keep, or should it be renamed before the next PR?

### Files changed this session
- `CLAUDE.md` (modified — spec routing table added)
- `docs/spec/SPEC-architecture.md` (new)
- `docs/spec/SPEC-data-models.md` (new)
- `docs/spec/SPEC-game-rules.md` (new)
- `docs/spec/SPEC-api.md` (new)
- `docs/spec/SPEC-frontend.md` (new)
- `docs/spec/SPEC-testing.md` (new)
- `docs/spec/SPEC-deployment.md` (new)
- `.claude/launch.json` (new)
- `.claude/session.md` (new — this file)

### Gotchas
- `docs/BUILD_STATE.md` shows schemas and scoring/auth services as ✅ but the unit tests that validate them haven't been written yet — Session 1 isn't done until `pytest backend/tests/unit/` passes.
- The original `docs/SPEC.md` is still on disk and will be loaded if any old instruction references it. The new CLAUDE.md routing table supersedes it but doesn't delete it.
- `services/auth.py` uses `python-jose` for JWT — already in `requirements.txt`, no install needed.
- Anti-self-vote is enforced at `account_id` level, not `character_id` — this is easy to get wrong. Check `services/vote.py` spec carefully (TASKS.md 1.7).
- Skills (session-handoff, session-start) are saved to the local-agent-mode-sessions skills path, not the general `$APPDATA/Claude/skills` path. They'll only appear in sessions using that plugin configuration.
