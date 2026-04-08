import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from config import settings
from routers import admin, auth, characters, leaderboard, messages, relationships, submissions, tasks, votes
from routers import contact


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure media directory exists
    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
    yield


app = FastAPI(title="World Zero", version="1.0.0", lifespan=lifespan)

# Session middleware is required by Authlib for OAuth state management
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# CORS — allow frontend origin; configured via env in production
_cors_origins = os.environ.get(
    "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Static file serving for local media uploads
app.mount("/media", StaticFiles(directory=settings.MEDIA_ROOT, check_dir=False), name="media")

# Routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(characters.router, prefix="/characters", tags=["characters"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
app.include_router(votes.router, tags=["votes"])  # prefix embedded in routes (/submissions/{id}/vote)
app.include_router(relationships.router, prefix="/relationships", tags=["relationships"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(contact.router, prefix="/contact", tags=["contact"])


@app.get("/health")
async def health():
    return {"status": "ok"}
