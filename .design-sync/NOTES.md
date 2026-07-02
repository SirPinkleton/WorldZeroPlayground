# design-sync notes — World Zero

- 2026-07-02 first run: paused before project creation — DesignSync auth unavailable in headless session; Molly must run `/design-login` from an interactive `claude` terminal, then re-invoke `/design-sync`.
- Decided project name: **World Zero** (not yet created; no `projectId` pin — next run is still first-time).
- Shape: `package` (no Storybook anywhere, confirmed by Molly). npm lockfile, node 24, frontend package at `frontend/`.
- Scope: presentational layer only. Skip app-coupled pieces: `components/TaskCard.tsx` dispatcher (useAuth/admin API), `usePraxisCard.ts`, `useVote.ts`, `LevelUpWatcher`, `Layout`, `NavBar`. No frontend source edits during sync — any decoupling needs its own GitHub issue first (Molly's workflow).
- Pre-build issue breakdown filed per component group (Molly's choice: per-group issues, no epic/tracking issue). All blocked_by the `/design-login` auth issue.
- Fonts: 15 Google families loaded via `index.html`; tokens live in `frontend/src/index.css` CSS vars (faction palettes + `[data-theme="dark"]` cascade).
