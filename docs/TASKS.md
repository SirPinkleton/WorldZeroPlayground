# World Zero — Claude Code Task Queue

> This file is the handoff from Cowork planning sessions to Claude Code execution sessions.
> Molly and her Cowork assistant maintain this file during the day.
> Claude Code agents read it at the start of every session and work through tasks in order.
>
> **Always read CLAUDE.md and docs/BUILD_STATE.md before starting.**
> **Read the relevant file in `docs/spec/` before implementing any feature** (see the routing table in `CLAUDE.md`).
> **Mark tasks DONE (with date) when complete. Do not delete them.**

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

### TASK A.1 ✅ 2026-04-15 — Rename `Submission` → `Praxis` across the codebase

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

### TASK T.1 — Rewrite conftest engine/session fixtures for asyncpg compatibility

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

### TASK T.2 — Verify full test suite passes with coverage ≥ 80%

After T.1 is done, run the full suite:

```
pytest --cov=. --cov-report=term-missing --cov-fail-under=80
```

With integration tests now passing, coverage should increase from 52% (unit
only) well past the 80% threshold. If not, investigate which lines are still
uncovered and add targeted tests.

**Acceptance:** CI is green. Coverage ≥ 80%.

### TASK T.3 — Add CI status check enforcement

Currently PRs can be merged even when CI fails (as evidenced by multiple
merged PRs with failing tests). Consider adding branch protection rules
requiring the Test workflow to pass before merge.

**Acceptance:** GitHub branch protection on `main` requires the "Test" status
check to pass.

---

## 🟣 SESSION 5+ — Ambitious Frontend (post-launch)

## Completed Sessions

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
