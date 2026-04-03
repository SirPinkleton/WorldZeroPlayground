#!/bin/sh
# Render provides DATABASE_URL as postgresql://... but SQLAlchemy async needs postgresql+asyncpg://
export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's|postgresql://|postgresql+asyncpg://|')
alembic upgrade head
exec uvicorn main:app --host 0.0.0.0 --port 8000
