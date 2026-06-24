#!/bin/sh
# Reset a World Zero database after a migration squash (or when local DB is wedged).
#
#   local mode (default):  scripts/reset_db.sh
#       docker-compose down -v -> up -d -> wait -> alembic upgrade head -> seed
#       The "my local DB is wedged, start fresh" button.
#
#   prod/remote mode:      scripts/reset_db.sh --url <connection-string>
#       Drops the public schema on the target DB so the next deploy rebuilds.
#       Guarded by a typed confirmation (mirrors seed.py's prod gate).
#
# See docs/agents/db-migrations.md.
set -e

# Resolve paths so the script works from any cwd.
BACKEND_DIR=$(cd "$(dirname "$0")/.." && pwd)
ROOT_DIR=$(cd "$BACKEND_DIR/.." && pwd)

REMOTE_URL=""
if [ "$1" = "--url" ]; then
    REMOTE_URL="$2"
    [ -n "$REMOTE_URL" ] || { echo "--url requires a connection string."; exit 1; }
fi

if [ -n "$REMOTE_URL" ]; then
    # --- prod/remote mode: drop the public schema, nothing else ---
    DSN=$(echo "$REMOTE_URL" | sed 's|^postgresql+asyncpg://|postgresql://|; s|^postgres://|postgresql://|')
    TARGET=$(echo "$DSN" | sed 's|.*@||')
    echo "WARNING: this DROPs the public schema on a REMOTE database — all data is lost."
    echo "Target: $TARGET"
    printf "Type 'drop' to continue: "
    read answer
    [ "$answer" = "drop" ] || { echo "Aborted."; exit 0; }
    psql "$DSN" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    echo "Schema dropped. Redeploy to rebuild (start.sh runs alembic upgrade head + seed)."
    exit 0
fi

# --- local mode: full rebuild from scratch ---
echo "Resetting local DB (docker-compose down -v)..."
( cd "$ROOT_DIR" && docker-compose down -v && docker-compose up -d db )
echo "Waiting for database..."
until ( cd "$ROOT_DIR" && docker-compose exec -T db pg_isready -U worldzero -d worldzero ) >/dev/null 2>&1; do
    sleep 1
done
cd "$BACKEND_DIR"
alembic upgrade head
python seed.py
echo "Local DB reset complete."
