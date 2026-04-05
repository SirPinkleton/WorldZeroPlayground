# World Zero — Architecture & Stack

## 1. Project Overview

A community game where players create characters, complete real-world tasks, post proof of completion (text, images, video, audio), and earn points through community voting. Inspired by the original SF0 / SFZero alternate reality game.

The soul of the original — creativity, exploration, weirdness, and the artistry of the proof post — must survive in this version.

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Backend | FastAPI (Python) | Async-native, automatic API docs, Pydantic validation |
| Frontend | React | Mobile-first, media-rich social UIs |
| Database | PostgreSQL | Relational, handles voting/points/roles well |
| Auth | Google OAuth2 (via Authlib) | Frictionless now; designed to add providers later |
| Media Storage | Local filesystem (v1) | Simple to start; structured for S3/Cloudinary swap |
| ORM | SQLAlchemy (async) + Alembic | Async ORM with migration support |
| Testing | pytest + pytest-cov + GitHub Actions | Unit + integration coverage, enforced on every push |

### Auth Design Note
Google OAuth is the only provider in v1, but the auth layer must be implemented in a provider-agnostic way (OAuth2 abstraction, not Google-specific code). Adding GitHub, email/password, etc. later should require no schema changes — only a new OAuth handler and an additional row in `oauth_providers`.

---

## 3. Identity Model — Account vs. Character

This is the most important architectural distinction in the project.

### Two-layer identity

**Account** — private, secure, never shown publicly.
- Tied to Google (or future OAuth provider)
- Holds login credentials and email
- The anti-abuse anchor: all game actions trace back to an account for enforcement purposes

**Character** — the public in-game persona.
- Has a username (permanent, unique), display name (editable), bio, avatar, level, score, faction
- Multiple characters can belong to one account (subject to level gating — see game rules)
- Everything game-facing (submissions, votes, tasks, friendships, DMs) is tied to a Character, not an Account
- A character's Google identity is never exposed publicly

### Sock Puppet / Anti-Self-Voting Rule
Since one account can own multiple characters, vote fraud prevention must operate at the **account level**, not the character level. When a vote is cast, the system checks that the voter's `account_id` ≠ the submission author's `account_id`. This check is invisible to players but enforced at the API layer on every vote.

---

## 4. Era-as-Ruleset: Config Architecture

**The core insight:** Eras are not just resets — they are rule sets. Each Era defines the game mechanics that apply while it is active. Switching eras can mean different vote budgets, different task limits, different point structures. The config is the game design tool.

### Design Principles

- `game_config.py` is the **single source of truth** for all game rules
- The database stores **history** (when eras started, who started them) but never owns the rules
- All services accept an `EraConfig` parameter, defaulting to `CURRENT_ERA`
- Tests import specific `EraConfig` instances directly — no DB required for logic tests
- Changing `CURRENT_ERA = ERA_2` is the one lever that switches the live game's mechanics

### DB ↔ Config Link

The `Era` DB table stores `config_key` (e.g. `"era_1"`), which maps to the `EraConfig.config_key` in `game_config.py`. This creates a historical record of which ruleset was active during each era without the DB owning the rules themselves.

```
Era (DB table)
  id
  name             -- human-readable, from admin input
  config_key       -- matches EraConfig.config_key (e.g. "era_1")
  started_at
  started_by       -- FK → Account
  notes
```

---

## 14. Project Structure

```
/
├── backend/
│   ├── main.py
│   ├── game_config.py            # EraConfig, FactionConfig, all named eras, CURRENT_ERA
│   ├── models/                   # SQLAlchemy models
│   ├── routers/                  # auth, characters, tasks, submissions, votes,
│   │                             #   relationships, messages, admin
│   ├── schemas/                  # Pydantic request/response schemas
│   ├── services/                 # scoring, media, auth, level-up, era-reset, vote-budget
│   │                             # (all accept EraConfig param; default to CURRENT_ERA)
│   ├── db.py
│   ├── config.py                 # env vars, secrets, app settings (not game rules)
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── conftest.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/
│   │   └── auth/
│   └── public/
│
├── media/                        # gitignored
├── alembic/
├── .env                          # gitignored
├── .github/workflows/test.yml    # CI
├── CLAUDE.md
└── docker-compose.yml
```

Note: `config.py` holds environment variables and secrets (DB URL, OAuth credentials, JWT secret). `game_config.py` holds game rules. These are intentionally separate files.
