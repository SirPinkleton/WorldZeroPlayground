# World Zero — Frontend Pages

## 10. Frontend Pages

### Navigation — Top
1. Home (`/`) — About if logged out; activity feed if logged in
2. Updates (`/updates`) — Recent activity, friend/foe feed, votes on your submissions
3. Tasks (`/tasks`) — Browse, filter, sign up
4. Groups (`/groups`) — Faction pages
5. Players (`/players`) — Character directory
6. Praxis (`/submissions`) — Global submission feed
7. Login / Profile (state-dependent)

### Navigation — Bottom
About, Contact, Disclaimer, Attributions, Donate

### Pages (MVP)

**Home (`/`)** — Activity feed when logged in. About content when logged out.

**Task Feed (`/tasks`)** — Card grid. Filters: status, date, faction, level, points, completions, rating.

**Task Detail (`/tasks/:id`)** — Full description, praxis sorted by score, "Submit Proof" CTA.

**Task Edit/Add** — Rich text editor with preview.

**Submission Detail (`/submissions/:id`)** — Full proof post, media gallery, star rating widget, collaborators, flag button (level 4+).

**Submit Proof (`/tasks/:id/submit`)** — Auth-gated. Title, rich body, media upload, preview.

**Character Profile (`/characters/:id`)** — Avatar, display name, bio, level, faction, score, all-time score, submission grid, relationship controls.

**Leaderboard (`/leaderboard`)** — Ranked by score, paginated.

**Groups (`/groups`)** — Faction list before joining; own faction featured after.

**Updates (`/updates`)** — Reverse chronological activity. Foe-specific taunts included (catch up / watch your back).

**Admin (`/admin`)** — Task approval queue, flagged submissions, character management, meta task creation, Era reset with confirmation dialog.
