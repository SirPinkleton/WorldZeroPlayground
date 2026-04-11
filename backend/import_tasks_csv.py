"""
Import tasks from a CSV file into the World Zero database.

Usage:
    python import_tasks_csv.py                               # dev, default CSV path
    python import_tasks_csv.py path/to/tasks.csv            # dev, custom path
    python import_tasks_csv.py --env prod                   # prod, default CSV path
    python import_tasks_csv.py path/to/tasks.csv --env prod # prod, custom path
    add --dry-run to any of the above to preview without writing

CSV columns expected: Name, Faction, Description, Level, Points, ImagePath

Data corrections applied automatically:
  - Faction slug typos: anolog → analog, us_masters → ua_masters
  - "The Rotation Of Cubes In Your Mind": faction assigned to singularity
  - "One of many Cultural Bridges": level=4, point_value=40
"""

import argparse
import asyncio
import csv
import sys
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from models.account import Account, AccountStatus
from models.character import Character, CharacterStatus
from models.faction import Faction
from models.roles import AccountRole, Role
from models.task import Task, TaskStatus
from script_utils import add_env_argument, get_settings

# ---------------------------------------------------------------------------
# Corrections
# ---------------------------------------------------------------------------

DEFAULT_CSV_PATH = Path.home() / "Downloads" / "W0 tasks - Unsorted.csv"

# Faction slug typos in the CSV → correct slugs
FACTION_CORRECTIONS: dict[str, str] = {
    "anolog": "analog",
    "us_masters": "ua_masters",
}

# Per-task field overrides keyed by exact task name
FIELD_OVERRIDES: dict[str, dict] = {
    "The Rotation Of Cubes In Your Mind": {"primary_faction_slug": "singularity"},
    "One of many Cultural Bridges":       {"level_required": 4, "point_value": 40},
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_csv(csv_path: Path) -> list[dict]:
    """Read CSV and return a list of raw row dicts."""
    with csv_path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def apply_corrections(rows: list[dict]) -> tuple[list[dict], list[str]]:
    """
    Normalise rows, apply faction corrections and field overrides.
    Returns (cleaned_rows, warnings).
    """
    cleaned = []
    warnings = []

    for raw in rows:
        name        = raw.get("Name", "").strip()
        faction     = raw.get("Faction", "").strip()
        description = raw.get("Description", "").strip() or None
        level_raw   = raw.get("Level", "").strip()
        points_raw  = raw.get("Points", "").strip()

        if not name:
            warnings.append("Skipped row with empty Name")
            continue

        # Apply faction slug corrections
        if faction in FACTION_CORRECTIONS:
            old = faction
            faction = FACTION_CORRECTIONS[faction]
            warnings.append(f"  [{name}] faction corrected: '{old}' → '{faction}'")

        faction = faction or None  # empty string → None

        # Parse level and points
        try:
            level = int(level_raw)
        except ValueError:
            level = None  # will be resolved by FIELD_OVERRIDES or flagged

        try:
            points = int(points_raw)
        except ValueError:
            points = None  # will be resolved by FIELD_OVERRIDES or flagged

        row = {
            "title":                name,
            "description":          description,
            "primary_faction_slug": faction,
            "level_required":       level,
            "point_value":          points,
        }

        # Apply per-task overrides
        if name in FIELD_OVERRIDES:
            overrides = FIELD_OVERRIDES[name]
            row.update(overrides)
            warnings.append(f"  [{name}] field overrides applied: {overrides}")

        # Final validation — skip if still missing required numeric fields
        if row["level_required"] is None or row["point_value"] is None:
            warnings.append(
                f"  SKIPPED [{name}]: missing level or points "
                f"(level={level_raw!r}, points={points_raw!r}) — add to FIELD_OVERRIDES to include"
            )
            continue

        cleaned.append(row)

    return cleaned, warnings


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def run(csv_path: Path, dry_run: bool, env: str) -> None:
    settings = get_settings(env)
    print(f"Environment : {env}")
    print(f"Database    : {settings.DATABASE_URL.split('@')[-1]}\n")  # host/db only, no creds

    rows = parse_csv(csv_path)
    print(f"Read {len(rows)} rows from {csv_path}\n")

    tasks_data, warnings = apply_corrections(rows)

    if warnings:
        print("── Corrections & warnings ──────────────────────────────")
        for w in warnings:
            print(w)
        print()

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:

        # Validate faction slugs against DB
        result = await session.execute(select(Faction.slug))
        valid_slugs: set[str] = {row[0] for row in result.all()}

        bad_slugs = {
            t["primary_faction_slug"]
            for t in tasks_data
            if t["primary_faction_slug"] and t["primary_faction_slug"] not in valid_slugs
        }
        if bad_slugs:
            print(f"ERROR: Unknown faction slug(s) after corrections: {bad_slugs}")
            print("Add them to FACTION_CORRECTIONS or fix the CSV before running again.")
            await engine.dispose()
            sys.exit(1)

        # Find admin character
        admin_result = await session.execute(
            select(Account)
            .join(AccountRole, AccountRole.account_id == Account.id)
            .join(Role, Role.id == AccountRole.role_id)
            .where(Role.name == "admin", Account.status == AccountStatus.active)
            .limit(1)
        )
        admin_account = admin_result.scalar_one_or_none()
        if not admin_account:
            print("ERROR: No active admin account found in the database.")
            await engine.dispose()
            sys.exit(1)

        char_result = await session.execute(
            select(Character)
            .where(
                Character.account_id == admin_account.id,
                Character.status == CharacterStatus.active,
            )
            .limit(1)
        )
        admin_character = char_result.scalar_one_or_none()
        if not admin_character:
            print(f"ERROR: Admin account (id={admin_account.id}) has no active character.")
            await engine.dispose()
            sys.exit(1)

        print(f"Creator: character '{admin_character.username}' (id={admin_character.id})\n")

        # Preview / insert
        print("── Tasks to import ─────────────────────────────────────")
        print(f"{'#':<4} {'Title':<45} {'Faction':<14} {'Lvl':>3} {'Pts':>5}")
        print("─" * 75)

        inserted = 0
        for i, t in enumerate(tasks_data, 1):
            faction_display = t["primary_faction_slug"] or "(none)"
            print(
                f"{i:<4} {t['title'][:44]:<45} {faction_display:<14} "
                f"{t['level_required']:>3} {t['point_value']:>5}"
            )

            if not dry_run:
                task = Task(
                    title=t["title"],
                    description=t["description"],
                    point_value=t["point_value"],
                    level_required=t["level_required"],
                    primary_faction_slug=t["primary_faction_slug"],
                    created_by=admin_character.id,
                    status=TaskStatus.active,
                    is_task_vision_eligible=False,
                )
                session.add(task)
                inserted += 1

        print("─" * 75)

        if dry_run:
            print(f"\nDRY RUN — {len(tasks_data)} tasks would be inserted. Nothing written.")
        else:
            await session.commit()
            print(f"\n✓ Inserted {inserted} tasks successfully.")

    await engine.dispose()


def main() -> None:
    parser = argparse.ArgumentParser(description="Import tasks from a CSV into World Zero.")
    parser.add_argument("csv_path", nargs="?", default=str(DEFAULT_CSV_PATH), help="Path to the CSV file")
    parser.add_argument("--dry-run", action="store_true", help="Preview without writing to the database")
    add_env_argument(parser)
    args = parser.parse_args()

    csv_path = Path(args.csv_path)
    if not csv_path.exists():
        print(f"ERROR: CSV file not found: {csv_path}")
        sys.exit(1)

    asyncio.run(run(csv_path, args.dry_run, args.env))


if __name__ == "__main__":
    main()
