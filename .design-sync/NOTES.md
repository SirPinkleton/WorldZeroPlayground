# design-sync notes — World Zero

- 2026-07-02 first run: paused before project creation — DesignSync auth unavailable in headless session; Molly must run `/design-login` from an interactive `claude` terminal, then re-invoke `/design-sync`.
- Decided project name: **World Zero** (not yet created; no `projectId` pin — next run is still first-time).
- Shape: `package` (no Storybook anywhere, confirmed by Molly). npm lockfile, node 24, frontend package at `frontend/`.
- Scope: presentational layer only. Skip app-coupled pieces: `components/TaskCard.tsx` dispatcher (useAuth/admin API), `usePraxisCard.ts`, `useVote.ts`, `LevelUpWatcher`, `Layout`, `NavBar`. No frontend source edits during sync — any decoupling needs its own GitHub issue first (Molly's workflow).
- Pre-build issue breakdown filed per component group (Molly's choice: per-group issues, no epic/tracking issue). All blocked_by the `/design-login` auth issue.
- Fonts: 15 Google families loaded via `index.html`; tokens live in `frontend/src/index.css` CSS vars (faction palettes + `[data-theme="dark"]` cascade).

## Phase 1 — cloud→repo reconciliation (2026-07-02)

Reconciled the hand-built Claude Design project **"World Zero Design System"** (projectId `019e221c-7853-7530-a934-7d3b2b7c8b43`, ~200 files, per-faction `templates/`) against repo code. Repo is ~90% complete; net-new cloud designs land on 3 already-open issues (commented, no duplicates filed):
- **#232** albescent first-class — cloud `templates/albescent/` supplies the previously-missing kit (faction page, task card, task detail, edit praxis). Repo still aliases `albescent→ua` (`utils/factions.ts:68`). Repo already has albescent comment/feed-frame/read-page. Cloud does NOT cover albescent avatar/backdrop/vote — those still need design.
- **#136** task-detail specs — cloud has per-faction Task Detail templates (all 7); repo has 6 + Default (albescent missing).
- **#200** ua kit — only **UA avatar** left (no `components/avatar/UAAvatar.tsx`); UAVote/UABackdrop/UAFactionHero exist.
- Not gaps: Join = faction-page `viewer.state` block (Factions.tsx); Kit/Gold-Palettes = design scaffolding/guidelines; character-creation = #275 epic.

## Phase 2 — repo→cloud /design-sync (PENDING, user reviewing before start)

Create fresh project **"World Zero"** (NOT the hand-built "World Zero Design System" — leave that intact as the design source). Then package-shape build + verify + upload per issues #364–371. No `projectId` pinned yet for Phase 2 — next run still first-time for the fresh project.
