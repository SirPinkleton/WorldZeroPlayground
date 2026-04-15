# World Zero — Agent Instructions

## Project
FastAPI (Python) + React community game. Players make Characters, complete
real-world tasks, post proof ("praxis"), earn points via star-rating votes.

## Stack
FastAPI · SQLAlchemy (async) · Alembic · PostgreSQL · React · Axios ·
Google OAuth2 → JWT · local-fs media (relative paths) · pytest + GitHub Actions.
Deeper notes: `docs/spec/SPEC-architecture.md`.

## Where to look for X

| Need... | Go to |
|---|---|
| Architecture, identity model, EraConfig design | `docs/spec/SPEC-architecture.md` |
| DB schema | `docs/spec/SPEC-data-models.md` |
| Scoring, vote budget, level perks, era reset | `docs/spec/SPEC-game-rules.md` |
| API contracts | `docs/spec/SPEC-api.md` |
| Pages, routing, UX | `docs/spec/SPEC-frontend.md` |
| Testing approach | `docs/spec/SPEC-testing.md` |
| Deployment, media, Render | `docs/spec/SPEC-deployment.md` |
| Design intent, UX, faction archetypes | `WORLD_ZERO_STYLE.md` |
| CSS variables (colors, type, themes) | `frontend/src/index.css` |
| JS faction config | `frontend/src/factions.ts` |
| Built vs. missing | `docs/BUILD_STATE.md` |
| Task queue | `docs/TASKS.md` |

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
- Dark mode via the `[data-theme="dark"]` cascade — no `dark ? '#a' : '#b'` ternaries
- Hide unusable controls; don't show them disabled

## Do NOT
- Mix secrets and rules (`config.py` = secrets; `game_config.py` + `eras/` = rules)
- Hardcode values that live in `EraConfig`. Read `era.*`.
- Write sync SQLAlchemy in async routes
- Store absolute media paths
- Expose `account_id` or `email` publicly
- Put business logic in route handlers

## Running locally
- Backend: `uvicorn main:app --reload` from `/backend`
- Frontend: `npm start` from `/frontend`
- DB: `docker-compose up -d`; `alembic upgrade head` after pulling
- Tests: `pytest --cov=. --cov-fail-under=80` from `/backend`

## Multi-agent workflow
This project uses a subagent system defined in `.claude/agents/`.
See `.claude/agents/README.md` for the agent graph and responsibilities.
