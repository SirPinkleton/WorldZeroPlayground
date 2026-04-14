# Migration Squash Guide

How to collapse all Alembic migrations into a single clean initial migration.
This is safe **only when there is no production data to preserve** (pre-launch, or after
deliberately wiping the database).

## When to squash

- Migration count exceeds ~10 files
- Intermediate migrations undo or rework earlier ones (e.g., adding then removing columns)
- Recurring deployment failures from enum `CREATE TYPE` conflicts
- You are about to wipe the database anyway (pre-launch reset, staging rebuild)

## Prerequisites

1. All environments must be **at the same schema state** or you must be willing to
   wipe and recreate them.
2. You have read every model file in `backend/models/` to understand the final schema.

## Step-by-step procedure

### 1. Inventory all enums

Grep model files for Python `enum.Enum` subclasses:

```bash
grep -rn "class.*enum.Enum" backend/models/
```

For each enum, note the **lowercase type name** PostgreSQL will use
(e.g., `class AccountStatus` → `accountstatus`) and its values.

### 2. Determine table creation order

Draw the FK dependency graph. Tables with no foreign keys go first. Tables that
reference other tables go after their dependencies. Group into tiers:

- **Tier 0**: No FK deps (e.g., `faction`, `contact_messages`)
- **Tier 1**: Depends only on Tier 0 (e.g., `account`, `role`)
- **Tier 2+**: Each tier depends on prior tiers

### 3. Delete all existing migration files

```bash
rm backend/alembic/versions/*.py
```

Keep `__pycache__` cleanup optional — it will be regenerated.

### 4. Write the new migration file

Create `backend/alembic/versions/0001_squashed_initial.py` with this structure:

```
revision = "0001_squashed"
down_revision = None          # <-- this is the new root
```

**Section A — Create enum types** via `op.execute()`:
```python
def _enum_exists(name: str) -> bool:
    conn = op.get_bind()
    result = conn.execute(
        sa.text("SELECT 1 FROM pg_type WHERE typname = :name"),
        {"name": name},
    )
    return result.fetchone() is not None

if not _enum_exists("accountstatus"):
    op.execute("CREATE TYPE accountstatus AS ENUM ('active', 'suspended', 'deleted')")
```

**Section B — Create tables** using `op.create_table()` in FK-dependency order.
Every `sa.Enum()` call inside a column definition must use `create_type=False`.

**Section C — Seed reference data** (factions, roles, etc.) using parameterized SQL
with `ON CONFLICT DO NOTHING` for idempotency.

**Section D — downgrade()** drops tables in reverse order, then drops enum types
with `DROP TYPE IF EXISTS`.

### 5. Verify

```bash
# Fresh database
dropdb worldzero && createdb worldzero
cd backend && DATABASE_URL=postgresql://localhost/worldzero alembic upgrade head

# Check for model/migration drift
DATABASE_URL=postgresql://localhost/worldzero alembic check

# Round-trip test
DATABASE_URL=postgresql://localhost/worldzero alembic downgrade base
DATABASE_URL=postgresql://localhost/worldzero alembic upgrade head

# Spot-check seed data
psql worldzero -c "SELECT slug, name, status FROM faction ORDER BY slug;"
```

### 6. Stamp existing databases (if not wiping)

If a database already has the correct schema from the old migration chain, do NOT
run `alembic upgrade head` — it will try to re-create everything. Instead:

```bash
alembic stamp 0001_squashed
```

This writes the revision ID to the `alembic_version` table without executing any SQL.

## The `create_type=False` convention

PostgreSQL enum types are database-level objects created with `CREATE TYPE`.
SQLAlchemy will try to auto-create them when it sees `Enum()` in column definitions.
This causes "type already exists" errors when migrations have already created the type.

**Our convention:**
1. All model `Enum()` columns use `create_type=False`
2. `alembic/env.py` has a safety loop that forces `create_type=False` on all metadata enums
3. Migrations own all `CREATE TYPE` statements via explicit `op.execute()` calls

This three-layer defense prevents the recurring enum duplication bugs.

## Future squashes

When doing this again, update the revision ID (e.g., `0002_squashed`) and
set `down_revision = None`. The process is identical: inventory enums, order tables,
write one migration, seed data, verify.
