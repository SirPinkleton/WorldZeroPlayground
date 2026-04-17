"""
Reset the Render production database.

Drops and recreates the public schema (wipes all tables/data), then runs
alembic upgrade head to rebuild the schema from scratch.

Usage (from repo root):
    python scripts/reset_render_db.py

Requires RENDER_DATABASE_URL in backend/.env.
"""

import os
import subprocess
import sys
from pathlib import Path

# Load backend/.env
env_path = Path(__file__).resolve().parent.parent / "backend" / ".env"
if not env_path.exists():
    print(f"ERROR: .env not found at {env_path}")
    sys.exit(1)

for line in env_path.read_text().splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())

db_url = os.environ.get("RENDER_DATABASE_URL")
if not db_url:
    print("ERROR: RENDER_DATABASE_URL not set in backend/.env")
    sys.exit(1)

print("WARNING: This will wipe ALL data in the Render production database.")
confirm = input("Type 'yes' to continue: ").strip().lower()
if confirm != "yes":
    print("Aborted.")
    sys.exit(0)

# Drop and recreate the public schema using psycopg2 (sync driver)
try:
    import psycopg2
except ImportError:
    print("ERROR: psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

print("\n[1/2] Dropping and recreating public schema...")
conn = psycopg2.connect(db_url)
conn.autocommit = True
with conn.cursor() as cur:
    cur.execute("DROP SCHEMA public CASCADE;")
    cur.execute("CREATE SCHEMA public;")
conn.close()
print("      Done.")

# Run alembic upgrade head
print("\n[2/2] Running alembic upgrade head...")
backend_dir = Path(__file__).resolve().parent.parent / "backend"
result = subprocess.run(
    [sys.executable, "-m", "alembic", "upgrade", "head"],
    cwd=backend_dir,
    env={**os.environ, "DATABASE_URL": db_url},
)
if result.returncode != 0:
    print("\nERROR: alembic upgrade failed.")
    sys.exit(result.returncode)

print("\nDone. Database reset complete.")
