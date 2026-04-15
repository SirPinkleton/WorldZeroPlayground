# World Zero — Agent Instructions

A pointer document. It tells you *where* the rules live, not what they are.
Keep it thin so it can't drift.

## Project
FastAPI (Python) + React community game. Players make Characters, complete
real-world tasks, post proof ("praxis"), earn points via star-rating votes.

## Stack
FastAPI · SQLAlchemy (async) · Alembic · PostgreSQL · React · Axios ·
Google OAuth2 → JWT · local-fs media (relative paths) · pytest + GitHub Actions.
Deeper notes: `docs/spec/SPEC-architecture.md`.

---

## Where to look for X

| Need... | Go to |
|---|---|
| Active rule values (signup cap, vote budget, level thresholds, resets) | `backend/eras/era_1.py` (live `ERA_1`; `CURRENT_ERA` resolves here) |
| Factions, tasks, taunts for the live era | `backend/eras/era_1.py` |
| Era config *shape* (dataclass fields) | `backend/game_config.py` |
| Building a new era | `backend/eras/_template.py` |
| Account vs. Character, anti-self-voting | `docs/spec/SPEC-architecture.md` §3 |
| DB schema | `docs/spec/SPEC-data-models.md` |
| Scoring, level perks, era reset semantics | `docs/spec/SPEC-game-rules.md` |
| API contracts | `docs/spec/SPEC-api.md` |
| Pages, routing, UX | `docs/spec/SPEC-frontend.md` |
| Testing approach | `docs/spec/SPEC-testing.md` |
| Deployment, media, Render | `docs/spec/SPEC-deployment.md` |
| Design intent, UX, faction archetypes | `WORLD_ZERO_STYLE.md` |
| CSS variables (colors, type, themes) | `frontend/src/index.css` |
| JS faction config | `frontend/src/factions.ts` |
| Built vs. missing | `docs/BUILD_STATE.md` |
| Task queue | `docs/TASKS.md` |

Read only what your task needs.

---

## Config architecture
- `game_config.py` = dataclass shape. `eras/era_N.py` = values. `CURRENT_ERA` = active era.
- DB `Era.config_key` records which era was active; it does not own rules.
- Services take `era: EraConfig = CURRENT_ERA`. Never import `CURRENT_ERA`
  inside a service body.
- Never hardcode a value that lives in `EraConfig`. Read `era.*`.

## Python conventions
- async/await throughout FastAPI routes; Pydantic for request/response bodies
- Models in `models/`, business logic in `services/`. Routes stay thin.
- Frozen dataclasses over tuples/dicts unless mutation is required
- ALL_CAPS for module-level constants/singletons
- Full names, no abbreviations (`task` not `t`, `index` not `idx`)
- Type-annotate every parameter and return
- No bare string literals for domain values — use a constant or Enum

## Frontend conventions
- Read `WORLD_ZERO_STYLE.md` before any UI work
- Color values live only in `index.css` (CSS vars). Never hardcode hex.
- Faction config: `factions.ts`. Use `factionCssVar()` for styles.
- Dark mode via the `[data-theme="dark"]` cascade — no `dark ? '#a' : '#b'` ternaries
- Each faction has its own card archetype; don't unify
- Reuse `.card-footer`, `.card-meta`, `.card-description` for repeated patterns
- Hide unusable controls; don't show them disabled

## Do NOT
- Duplicate game rules into this file, services, tests, or docs — read `era.*` or cite the spec
- Mix secrets and rules (`config.py` = secrets; `game_config.py` + `eras/` = rules)
- Hardcode values that live in `EraConfig`
- Write sync SQLAlchemy in async routes
- Store absolute media paths
- Expose `account_id` or `email` publicly
- Put business logic in route handlers

---

## Running locally
- Backend: `uvicorn main:app --reload` from `/backend`
- Frontend: `npm start` from `/frontend`
- DB: `docker-compose up -d`; `alembic upgrade head` after pulling
- Tests: `pytest --cov=. --cov-fail-under=80` from `/backend`

## Multi-agent workflow
Worktrees, one branch per agent.
- Pick work from `docs/TASKS.md` matching your role
- Stay inside your task's file scope
- Don't start a higher session number until lower ones are done
- Mark finished tasks ✅ with date in `docs/BUILD_STATE.md`

## Keeping this file thin
Before adding a section: does it belong in a spec file, `game_config.py`, or
an era file? Usually yes. This file holds only conventions, pointers, and the
`Do NOT` list.
