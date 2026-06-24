# DB migrations: squash policy, reset, deploy safety

How World Zero keeps its Alembic chain short and recovers when a squash
invalidates an existing DB. Read this before squashing migrations or resetting a DB.

## Why this exists

A squash collapses `versions/*.py` into one revision. Every DB that was stamped
at an *old* revision now points at a revision that no longer exists, so
`alembic upgrade head` dies with `Can't locate revision identified by '0010_...'`
(exit 255). This happened in prod once. The pieces below make recovery a
one-command, no-mystery operation.

## Squash policy

Squash the `versions/` chain when **either**:
- it exceeds ~10 files, **or**
- opportunistically, before a known prod wipe, while we're still pre-launch.

## Strategy A — current (disposable-DB)

World Zero is **pre-launch**: production data is disposable today.

A squash = **rebuild the schema from the models** via `Base.metadata.create_all`
(that's all `0001_squashed.py` does). This requires **wiping every existing DB** —
prod *and* every local/worktree DB — because their old stamps are now dangling.

This strategy is only valid while data is disposable. The moment real user data
exists, switch to Strategy B.

## Strategy B — launch-time switch ⚠️ (warning stub, not yet built)

**⚠️ Before launch, switch to this.** When squashing a DB that holds real data,
you must NOT wipe it. The schema already matches the squashed revision, so:

1. Squash the chain as usual (new `0001_*` built from models).
2. On each live DB, `alembic stamp <new_head>` — moves the pointer, runs **no DDL**.
3. Verify `alembic current` == head; no `upgrade` needed.
4. Never drop/recreate a live DB to squash.

Flesh this out when actually needed — do not build or test the full stamp dance now.

## Blast radius of a squash

A squash invalidates the Alembic stamp in **every existing DB**.
- **Local / worktree:** run `backend/scripts/reset_db.sh` (does `docker-compose down -v`
  then rebuild + seed).
- **Prod / remote:** `backend/scripts/reset_db.sh --url <connection-string>` drops the
  public schema; the next deploy rebuilds. Typed-confirmation gated.

## CI is never affected

Tests do **not** use migrations. `tests/integration/conftest.py` builds the schema
with `Base.metadata.create_all` and drops it after. So squashing can never break CI.

## Deploy safety (`start.sh`)

Before `alembic upgrade head`, `start.sh` runs `scripts/check_db_stamp.py`. It
compares the DB's stamped revision against the revisions in `versions/`. If the
stamp is unknown (chain was squashed), it **exits non-zero** with the fix and
stops the deploy.

It will **never** auto-drop, auto-stamp, or self-heal — a deploy must never
destroy data on its own (catastrophic under Strategy B). Recovery is always a
human running `reset_db.sh`.
