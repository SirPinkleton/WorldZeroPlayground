# World Zero — API Endpoints

## 9. API Endpoints

### Auth
```
GET  /auth/google              → redirect to Google OAuth
GET  /auth/google/callback     → exchange code, create/login account, return JWT
GET  /auth/me                  → return current account + active character
POST /auth/logout
```

### Characters
```
GET    /characters             → list/search all characters (public)
GET    /characters/{id}        → public character profile
POST   /characters             → create character (level-gated beyond first)
PUT    /characters/{id}        → edit own character
DELETE /characters/{id}        → soft-delete own character
GET    /characters/{id}/submissions
GET    /characters/{id}/relationships
```

### Tasks
```
GET    /tasks                  → paginated list (filter: status, level, faction, points, date)
GET    /tasks/{id}             → task detail + submissions
POST   /tasks                  → propose task (level 3+) or create active task (admin)
PUT    /tasks/{id}             → edit (admin for active; proposer for pending)
POST   /tasks/{id}/signup      → sign up for task
DELETE /tasks/{id}/signup      → drop task
```

### Submissions (Praxis)
```
GET    /submissions            → feed (paginated; recent | top-rated)
GET    /submissions/{id}       → submission detail
POST   /submissions            → create submission
PUT    /submissions/{id}       → edit own submission
POST   /submissions/{id}/media → upload media file(s)
POST   /submissions/{id}/flag  → flag (level 4+)
GET    /submissions/{id}/collaborators
POST   /submissions/{id}/collaborators → add collaborator
```

### Votes
```
POST /submissions/{id}/vote    → cast or update vote
GET  /submissions/{id}/votes   → vote summary
```

### Relationships
```
POST   /relationships          → send friend or foe request
PUT    /relationships/{id}     → accept / decline
DELETE /relationships/{id}     → remove
```

### Messages
```
GET  /messages                 → inbox
POST /messages                 → send DM
GET  /messages/{id}            → read message (marks read)
```

### Admin
```
GET    /admin/tasks/pending         → pending task queue
PUT    /admin/tasks/{id}/approve    → approve → active
PUT    /admin/tasks/{id}/retire     → retire active task
DELETE /admin/submissions/{id}      → delete flagged submission
POST   /admin/characters/{id}/ban   → ban/unban character
POST   /admin/meta-tasks            → create meta task
POST   /admin/eras                  → start Era reset (requires confirmation payload)
```

### Account (private)
```
GET    /account                → current account info
DELETE /account                → delete account + all characters
```

### Leaderboard
```
GET /leaderboard               → top characters by score, paginated
```
