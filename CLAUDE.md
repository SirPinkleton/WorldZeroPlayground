# World Zero — Agent Instructions

## Project
A community game built with FastAPI (Python) + React. Players create Characters (public personas),
complete real-world tasks, post proof ("praxis"), and earn points through community star-rating votes.

## Identity Model (critical)
- Account = private login identity (Google OAuth). Never exposed publicly.
- Character = public game persona. Multiple per Account (level-gated at level 3).
- All game logic uses Character IDs. Votes enforce account-level anti-self-voting.
- Never expose account_id or email in public API responses.

## Config Architecture (critical)
- game_config.py is the single source of truth for all game rules.
- EraConfig defines mechanics for one era: task limits, vote budget formula, level thresholds,
  faction rules, and reset behaviour.
- CURRENT_ERA is the one variable that controls live game mechanics.
- The DB Era table stores config_key to record which era was active — it does not own rules.
- All service functions accept `era: EraConfig = CURRENT_ERA` for testability.

## Stack
- Backend: FastAPI, SQLAlchemy (async), Alembic, PostgreSQL
- Frontend: React, React Router, Axios
- Auth: Google OAuth2 via Authlib → JWT (provider-agnostic)
- Media: Local filesystem (v1), relative paths only
- Testing: pytest + pytest-cov, GitHub Actions CI

## Python conventions
- async/await throughout all FastAPI routes
- Pydantic schemas for all request/response bodies
- SQLAlchemy models in models/, business logic in services/
- Never put business logic in route handlers
- Services accept EraConfig parameter; never import CURRENT_ERA inside a service function body
- Prefer frozen dataclasses over tuples or plain dicts as data containers; only use mutable dataclasses when mutation is truly needed
- Use ALL_CAPS for every module-level constant or singleton (e.g. `_BEARER`, `CURRENT_ERA`)
- Use full human-readable names — no abbreviations (`index` not `idx`, `task` not `t`, `media_item` not `m`, etc.)
- Type-annotate every function: all parameters and the return type
- Never compare against bare string literals for domain values; define a module-level constant or use an Enum instead

## Key business rules (all driven by CURRENT_ERA / EraConfig)
- Max task signups: era.max_task_signups (default 20)
- Task level gate: character.level >= task.level_required to sign up
- Submission level gap: can submit up to era.task_submit_level_gap levels above own level
- Vote budget: era.vote_budget_base + floor(era.vote_budget_multiplier × score)
- First vote cast costs 1 from votes_available; updates are free
- Cannot vote if voter_account_id == submission author's account_id
- Character creation beyond first requires level >= 3

## Testing
- Unit tests: no DB required, test services directly with EraConfig instances
- Integration tests: use test DB via conftest.py fixtures
- Tests assert against config values, not hardcoded magic numbers
- Run: pytest --cov=. --cov-fail-under=80 from /backend

## Database
- PostgreSQL via docker-compose
- All migrations via Alembic only
- Run: alembic upgrade head after pulling

## Running locally
- Backend: uvicorn main:app --reload from /backend
- Frontend: npm start from /frontend
- DB: docker-compose up -d
- Tests: pytest from /backend

## Do NOT
- Put secrets or game rules in the same file (config.py = secrets, game_config.py = rules)
- Hardcode magic numbers from EraConfig in service logic
- Write sync SQLAlchemy in async routes
- Store absolute media paths
- Expose account_id or email in public API responses
- Put business logic in route handlers

## Frontend conventions
- `WORLD_ZERO_STYLE.md` is the single source of truth for all visual decisions — read it before any UI work
- All colors must use CSS custom properties defined in `:root` / `[data-theme="dark"]` — never hardcode hex values in components
- Base UI font is `Courier Prime`; display/titles use `Lora` italic; factions have specific fonts (see style guide Section 3)
- Each faction has a unique card archetype (sticky note, field journal, collage, etc.) — do not unify card designs
- Task cards use `flex-wrap`, not CSS grid — varied heights and slight rotations are intentional
- Filter controls have specific visual treatments (rubber stamps, diagonal pennants, connected nodes) — do not use standard `<select>` or checkbox elements
- Dark mode uses `data-theme="dark"` on the root element with per-component dark variants — do not auto-invert colors
- See style guide Section 10 ("What NOT To Do") for a full list of anti-patterns
- See `docs/STYLE_MIGRATION_NOTES.md` for Phase 2+ remaining work

## Key documents (read before starting any session)
- `WORLD_ZERO_STYLE.md` — Visual style guide. Source of truth for colors, typography, layout, card archetypes, and dark mode. Read before any frontend/UI work.
- `docs/STYLE_MIGRATION_NOTES.md` — Remaining style migration tasks (Phase 2+). Read before doing UI work.
- `docs/BUILD_STATE.md` — What has been built vs. what's missing. Read to understand current state.
- `docs/TASKS.md` — Structured task queue. Read to find what to work on in this session.

## Spec (read the relevant section only — do not load all sections)
The spec has been split into focused files in `docs/spec/`:
- `SPEC-architecture.md` — Project overview, stack, identity model (Account vs Character), EraConfig design, project structure. Read for any architectural decision.
- `SPEC-data-models.md` — All DB models and their fields. Read when writing models, schemas, or migrations.
- `SPEC-game-rules.md` — Scoring, vote budget, level privileges, factions, era reset logic. Read when working on game logic or services.
- `SPEC-api.md` — All API endpoint definitions. Read when adding or modifying routes.
- `SPEC-frontend.md` — Pages, navigation, and UI spec. Read when working on React.
- `SPEC-testing.md` — Testing philosophy, file structure, examples, CI config. Read when writing or debugging tests.
- `SPEC-deployment.md` — Media handling, build order, out-of-scope items, Render deployment, production checklist. Read when touching infra or deployment.

## Multi-agent workflow
This project uses git worktrees for parallel agent sessions. Each agent works on its own branch.
- Check docs/TASKS.md for which session/tasks are assigned to your role
- Do not modify files outside the scope defined in your task
- Do not start a higher-numbered session until lower-numbered sessions are complete
- Update docs/BUILD_STATE.md when you finish a task: mark it ✅ with the completion date