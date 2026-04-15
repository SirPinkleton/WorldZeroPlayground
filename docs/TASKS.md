# World Zero — Claude Code Task Queue

> This file is the handoff from Cowork planning sessions to Claude Code execution sessions.
> Molly and her Cowork assistant maintain this file during the day.
> Claude Code agents read it at the start of every session and work through tasks in order.
>
> **Always read CLAUDE.md and docs/BUILD_STATE.md before starting.**
> **Read the relevant file in `docs/spec/` before implementing any feature** (see the routing table in `CLAUDE.md`).
> **Mark tasks DONE (with date) when complete. Do not delete them.**

---

## 🎨 SESSION — Frontend Style Polish

> Migrated from `STYLE_MIGRATION_NOTES.md` (deleted 2026-04-14). The original style migration is
> structurally complete (CSS variables, faction archetypes, dark mode, custom fonts all shipped).
> These are the remaining polish items.
>
> **Read before starting:** `WORLD_ZERO_STYLE.md`, `frontend/src/index.css`, `frontend/src/utils/factions.ts`.

### High priority

- **Migrate remaining inline styles to Tailwind / CSS classes.** Components outside `cards/` still use extensive `style={{}}` objects. Priority order: `NavBar`, `Sidebar`, `FilterStamps`, `FilterFactionTabs`, `FilterLevelNodes`.
- **Add responsive breakpoints.** No media queries currently exist — mobile and tablet views are unhandled. Add Tailwind responsive classes for the layout grid, sidebar collapse, and card wrapping.
- **Audit non-card components for hardcoded hex.** `NavBar`, `Sidebar`, feed items, profile, leaderboard may still have hardcoded colors that should reference CSS variables.

### Medium priority

- **Switch frontend to consume faction colors from API.** Backend already returns colors via `GET /game-config`. `frontend/src/utils/factions.ts` still has hardcoded config — replace with API response.
- **Consolidate dark mode in non-card components.** Audit `NavBar`, `FilterStamps`, `FilterLevelNodes`, and page components for any remaining `dark ? x : y` ternaries — those should be CSS variable cascades instead.

### Low priority

- **Full inline-style → Tailwind migration.** Convert all remaining `style={{}}` to Tailwind utilities where practical. Large effort, low urgency.

---

## 🟣 SESSION 5+ — Ambitious Frontend (post-launch)

> Do not start until the site is live on worldzero.org and the MVP frontend is stable.

**Vision:** Faction-specific UI themes — each faction gets its own color palette, typography, background textures, and layout variations driven by a `data-faction` attribute on `<body>` + CSS custom properties.

**Planned features:**
- Per-faction design tokens (colors, fonts, borders) toggled when a logged-in character's faction changes
- Easter eggs: invisible clickable elements scattered through pages that trigger hidden messages, sounds, or lore
- Secrets: hidden routes or interactions unlocked by specific player levels (level 5 and 8 already have UX secrets in the game spec)
- Full design system (tokens, component library) built before this phase begins
- Sunyata and Terminal faction UI (currently hidden factions) revealed when those factions go live

---

## 🚀 Deployment

- **Render deploy config** — not started
- **GoDaddy DNS config** (external — worldzero.org) — not started
