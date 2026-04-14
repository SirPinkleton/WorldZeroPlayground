# World Zero — Frontend Pages

> Last synced with code: 2026-04-13

## 10. Frontend Pages

### Navigation — Top
1. Home (`/`) — About if logged out; activity feed if logged in
2. Updates (`/updates`) — Recent activity, friend/foe feed, votes on your submissions
3. Tasks (`/tasks`) — Browse, filter, sign up
4. Groups (`/groups`) — Faction pages
5. Players (`/leaderboard`) — Leaderboard
6. Praxis (`/submissions`) — Global submission feed
7. Login / Profile (state-dependent)

### Navigation — Bottom
About, Contact, Disclaimer, Attributions, Donate

---

### Pages

**Home (`/`)** — Activity feed when logged in. About content when logged out.

**Tasks (`/tasks`)** — Card grid with faction-specific card archetypes (sticky note, field journal, collage, etc.). Filters: status, faction, level, points. Each faction slug maps to a unique card component (TaskCardUA, TaskCardAnalog, TaskCardGestalt, TaskCardSNIDE, TaskCardJourneymen, TaskCardSingularity, TaskCardUAMasters). Uses `flex-wrap` layout, not CSS grid.

**Task Detail (`/tasks/:id`)** — Full description, submissions sorted by score, "Submit Proof" CTA, signup/drop controls.

**Submit Proof (`/tasks/:id/submit`)** — Auth-gated. Title, rich body, media upload, collaboration mode selector, partner picker for collab/duel.

**Edit Submission (`/submissions/:id/edit`)** — Edit existing submission. Media management (upload/delete/reorder).

**Submissions (`/submissions`)** — Grid of all visible submissions. Cards show title, author, score, media preview.

**Submission Detail (`/submissions/:id`)** — Full proof post, media gallery, star rating widget (1-5 stars), vote summary (total votes, average, total score), withdraw/resubmit controls (owner), flag button (level 4+). Moderation status badges for flagged/hidden/failed.

**Character Profile (`/characters/:id`)** — Avatar, display name, bio, level (with progress bar), faction, score, all-time score, submission grid, relationship controls (friend/foe/block). Level progress bar uses hardcoded thresholds: `[0, 10, 70, 170, 330, 610, 1090, 1840, 3040]`.

**Create Character (`/characters/create`)** — Auth-gated. Username, display name, bio, avatar, location fields.

**Edit Character (`/characters/:id/edit`)** — Edit existing character (owner only).

**Propose Task (`/tasks/propose`)** — Level 3+ can propose tasks. Title, description, point value, level requirement, faction selector.

**Leaderboard (`/leaderboard`)** — Ranked by era score or all-time score, with faction filter. Shows avatar, display name, level, score, faction badge.

**Groups / Factions (`/groups`, `/factions`)** — Faction list. Own faction featured after joining.

**Updates (`/updates`)** — Reverse chronological activity feed. Includes foe taunts.

**About (`/about`)** — Static about page.

**Contact (`/contact`)** — Public contact form (name, email, message). No auth required.

**Disclaimer (`/disclaimer`)** — Static legal content.

**Attributions (`/attributions`)** — Credits and attributions.

**Donate (`/donate`)** — Donation info.

---

### Admin (`/admin`) — tabbed interface, requires admin role

**Overview Tab** — Dashboard counters: accounts, characters, active tasks, submissions, votes, flagged count, suspended count.

**Tasks Tab** — Pending task approval queue + all tasks with inline status controls (approve, retire, reactivate). Admin can create tasks directly as active.

**Moderation Tab** — Flagged submissions with full details (media, score, task info). Inline moderation actions (approve → visible, hide, fail with admin note). Contact messages with archive toggle.

**Accounts Tab** — Account list with email filter. Expand to see characters. Suspend/unsuspend accounts, ban/unban characters, grant/revoke roles.

---

### Key Frontend Assumptions

- **Level thresholds** hardcoded in CharacterProfile.tsx — must match `game_config.py`
- **Faction slugs** map to specific card components and colors — unknown slugs fall back to UA
- **Enum values** checked by exact string match (case-sensitive): status, type, moderation_status
- **Media paths** resolved through `mediaUrl()` utility before display
- **No pagination** currently — all list endpoints return full results
- **Dark mode** via `data-theme="dark"` on root element with per-component variants
