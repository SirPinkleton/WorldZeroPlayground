# World Zero — API Endpoints

> Last synced with code: 2026-04-16

## 9. API Endpoints

All routes return JSON. Auth routes set/clear httpOnly JWT cookies.
Snake_case field names throughout. ISO 8601 timestamps.

---

### Auth (`/auth`)
```
GET  /auth/google              → redirect to Google OAuth
GET  /auth/google/callback     → exchange code, create/login account, set JWT cookie
GET  /auth/me                  → CurrentUser { account_id, character?, is_admin }
POST /auth/logout              → clear JWT cookie
POST /auth/dev-login           → dev-only test login (disabled in production)
```

### Characters (`/characters`)
```
GET    /characters                       → list/search (query: search, faction, limit, offset)
GET    /characters/{id}                  → CharacterOut (public profile)
POST   /characters                       → CharacterCreate → CharacterOut (level-gated beyond first)
PUT    /characters/{id}                  → CharacterUpdate → CharacterOut (owner only)
DELETE /characters/{id}                  → soft-delete (owner only)
GET    /characters/{id}/praxes           → list[PraxisOut] (query: limit, offset)
GET    /characters/{id}/relationships    → list[RelationshipOut]
POST   /characters/{id}/avatar           → multipart file upload → CharacterOut
```

### Tasks (`/tasks`)
```
GET    /tasks                  → list (query: status, level, faction, min_points, max_points, exclude_character_id, limit, offset)
GET    /tasks/{id}             → TaskOut
GET    /tasks/{id}/signups     → list[TaskSignupOut] (characters with active praxes for this task)
POST   /tasks                  → TaskCreate → TaskOut (level 3+ or admin)
PUT    /tasks/{id}             → TaskCreate → TaskOut (proposer or admin, pending tasks only)
```

### Praxes (`/praxes`)
All praxis types (solo, collab, duel) are served from a single unified router.

```
GET    /praxes                               → list (query: type, task_id, character_id, status, moderation_status, sort, limit, offset)
GET    /praxes/{id}                          → PraxisOut (invites included for members)
POST   /praxes                               → PraxisCreate { task_id, type, title?, body_text? } → PraxisOut — auth required
PUT    /praxes/{id}                          → PraxisUpdate { title?, body_text? } → PraxisOut (creator only)
DELETE /praxes/{id}                          → 204 (creator only; must be in_progress or withdrawn)

-- Lifecycle
POST   /praxes/{id}/submit                   → PraxisOut — marks caller's has_submitted; status→submitted when all members done
POST   /praxes/{id}/withdraw                 → PraxisOut (creator only; sets is_withdrawn=true)
POST   /praxes/{id}/resubmit                 → PraxisOut (creator only; un-withdraws)
POST   /praxes/{id}/reopen                   → PraxisOut (creator only; resets all submit states → in_progress)

-- Media (auth required; creator only)
POST   /praxes/{id}/media                    → multipart file + display_order → MediaItemOut (201)
DELETE /praxes/{id}/media/{media_id}         → 204

-- Collaboration / duel invite flow (auth required)
POST   /praxes/{id}/invite                   → PraxisInviteCreate { invitee_id } → PraxisInviteOut
POST   /praxes/{id}/invite/{invite_id}/respond → InviteResponse { accept: bool } → PraxisOut (invitee only)
POST   /praxes/{id}/kick/{member_id}         → PraxisOut (creator only; removes member)

-- Moderation
POST   /praxes/{id}/flag                     → PraxisOut (query: reason) — level 4+ required, not self

-- Voting
POST   /praxes/{id}/vote                     → PraxisVoteIn { stars, praxis_member_id? } → VoteOut — auth required
GET    /praxes/{id}/votes                    → list[DuelVoteSummary] (per-member tally for duels; empty for solo/collab)
```

**type filter values:**
- `solo` → solo praxes only
- `collab` → collaborations only
- `duel` → duels only
- *(omitted)* → all non-hidden praxes

**Type rules:**
- Solo: any character meeting task level requirement and bank cap
- Collab: requires level ≥ 1 (COLLABORATION_LEVEL_REQUIRED)
- Duel: requires level ≥ 2 (DUEL_LEVEL_REQUIRED)
- Bank cap: at most `EraConfig.max_task_signups` in-progress praxes per character

### Votes (embedded in `/praxes` paths — see above)
*For duel votes, praxis_member_id is required. Solo/collab votes use praxis-wide voting.*
*Anti-self-vote: solo/collab uses account_id equality; duel uses membership check.*

### Relationships (`/relationships`)
```
GET    /relationships          → list[RelationshipListItem] (query: type, status) — auth required
POST   /relationships          → { to_character_id, type } → RelationshipOut — auth required
PUT    /relationships/{id}     → block relationship → RelationshipOut
DELETE /relationships/{id}     → remove relationship (declaring party only)
```
*Relationships are instant declarations (no pending state). Status: active | blocked.*

### Messages (`/messages`)
```
GET  /messages       → list[MessageOut] — auth required
POST /messages       → MessageCreate { to_character_id, body } → MessageOut
GET  /messages/{id}  → MessageOut (marks as read if recipient)
```

### Leaderboard (`/leaderboard`)
```
GET /leaderboard     → list[CharacterOut] (query: faction, limit, offset) — sorted by score DESC
```

### Factions (`/factions`)
```
GET /factions        → list[FactionOut] (visible factions only)
PUT /factions/{slug} → FactionUpdate → FactionOut — admin only
```

### Game Config (`/game-config`)
```
GET /game-config     → GameConfigOut (era config, faction colors, level thresholds — static from game_config.py)
```

### Meta Tasks (`/meta-tasks`)
```
GET /meta-tasks      → list[MetaTaskOut] (query: task_id — required, filters by task's faction or generic)
```

### Contact (`/contact`)
```
POST /contact        → ContactMessageIn { name, email, message } → ContactMessageOut
```

### Health (`/health`)
```
GET /health          → { "status": "ok" }
```

---

### Admin (`/admin`) — requires admin role

#### Dashboard
```
GET /admin/overview                   → OverviewStats { accounts, characters, active_tasks, praxes, votes, flagged_praxes, suspended_accounts }
```

#### Accounts & Characters
```
GET    /admin/accounts                → list[AccountSummary] (query: email filter)
GET    /admin/accounts/{id}           → AccountDetail (with characters list)
POST   /admin/accounts/{id}/suspend   → SuspendAction { suspended: bool }
POST   /admin/accounts/{id}/role      → RoleAction { role, action: grant|revoke }
GET    /admin/characters              → list[CharacterSummary] (query: faction, status)
POST   /admin/characters              → AdminCharacterCreate → new character for any account
POST   /admin/characters/{id}/ban     → BanAction { banned: bool }
PATCH  /admin/characters/{id}/stats   → CharacterStatsPatch → CharacterStatsOut
POST   /admin/characters/backfill-stats → recalculate all character stats → { recalculated: int }
```

#### Tasks
```
GET  /admin/tasks/pending          → list[PendingTaskOut] (with created_by_name)
PUT  /admin/tasks/{id}/approve     → TaskOut (pending → active)
PUT  /admin/tasks/{id}/retire      → TaskOut (active → retired)
PUT  /admin/tasks/{id}/status      → TaskStatusAction → TaskOut
POST /admin/tasks                  → TaskCreate → TaskOut (admin can create active tasks directly)
POST /admin/tasks/{id}/reactivate  → TaskOut (retired → active)
```

#### Praxes & Moderation
```
GET    /admin/praxes/flagged         → list[PraxisOut] (full data with media, score, task info)
PATCH  /admin/praxes/{id}/moderate   → ModerationAction { status, admin_note } → PraxisOut
DELETE /admin/praxes/{id}            → hard delete praxis
```

#### Contact Messages
```
GET   /admin/messages               → list[ContactMessageOut] (query: archived)
PATCH /admin/messages/{id}/archive  → ContactMessageOut
```

#### Factions
```
POST /admin/factions               → FactionCreate → FactionOut
```

#### CLI Token
```
POST /admin/cli-token              → CliTokenResponse (header: X-Admin-Cli-Secret)
```

---

## Key Response Schemas

### CharacterOut
```
id, username, display_name, bio, avatar_url, location,
level, score, all_time_score,  ← from CharacterStats join
faction_slug, status, created_at
```

### PraxisOut (all types)
```
id, task_id, task_title, task_point_value, type, status,
title, body_text, is_withdrawn, moderation_status, admin_note,
flagged_at, created_by_id, created_by_display_name,
created_at, updated_at,
members: list[PraxisMemberOut],
invites: list[PraxisInviteOut],  ← only included when viewer is a member
media_items: list[MediaItemOut],
score,                           ← computed on-the-fly from votes
duel_vote_summary: list[DuelVoteSummary] | null  ← duels only
```

### PraxisMemberOut
```
id, praxis_id, character_id, character_display_name, has_submitted, joined_at
```

### PraxisInviteOut
```
id, praxis_id, inviter_id, inviter_display_name,
invitee_id, invitee_display_name, status, created_at
```

### PraxisCardOut (lightweight list-view)
```
id, task_id, task_title, task_point_value, type, status,
title, is_withdrawn, moderation_status,
created_by_id, created_by_display_name,
created_at, updated_at, member_count, score
```

### DuelVoteSummary
```
member_id, character_id, character_display_name, total_stars, vote_count
```

### TaskOut
```
id, title, description, point_value, level_required, status,
created_by, primary_faction_slug, is_task_vision_eligible, created_at
```

### VoteOut
```
id, praxis_id, praxis_member_id, voter_character_id, stars, created_at, updated_at
```

### RelationshipListItem (GET /relationships response)
```
id, from_character_id, to_character_id, type, status, created_at,
to_display_name, to_avatar_url, to_faction_slug, reverse_type, display_status
```
