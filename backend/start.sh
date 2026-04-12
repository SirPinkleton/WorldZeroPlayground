#!/bin/sh
set -e
# Render provides DATABASE_URL as postgres:// or postgresql:// — normalize to asyncpg driver
DATABASE_URL=$(echo "$DATABASE_URL" | sed 's|^postgres://|postgresql+asyncpg://|; s|^postgresql://|postgresql+asyncpg://|')
export DATABASE_URL
alembic upgrade head
python seed.py --yes
exec uvicorn main:app --host 0.0.0.0 --port 8000
