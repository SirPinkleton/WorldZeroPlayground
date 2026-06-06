# Implementation progress — Everymen + Gestalt redesign + Tier-3 per-faction

> **Resume note for a fresh session:** read this file first, then continue at the first
> unchecked session below. Branch: `claude/factions-everymen-gestalt-tier3` (work in the
> primary working dir — no separate worktree). Full plan: `~/.claude/plans/one-of-these-is-immutable-gem.md`.
> Per-faction contract: `docs/spec/SPEC-faction-ui-profile.md`.
> Design source kits: `~/Downloads/Everymen` and `~/Downloads/Gestalt redesin (1)`.

## Conventions / gotchas (carry across sessions)
- **node_modules is tracked** in this repo (pre-existing). NEVER `git add -A`. Stage only the
  specific source files you changed.
- No backend venv on this machine yet → can't run pytest. Validate era config with a stdlib
  `python -c "from eras.era_1 import ERA_1_FACTIONS"` import. Full pytest waits for Session 5 / a venv.
- `factionCssVar(slug, suffix)` silently falls back to the `ua` theme if the `CSS_KEY` entry is
  missing even when the CSS vars exist — always add both.
- Everymen gameplay modifiers in `era_1.py` are **flagged placeholders** (`TODO(everymen)`) — confirm before launch.
- Gestalt: only the *primary/tint/border/accent* tokens were flipped to pink in Session 1. The full
  window-chrome (`.exe`) token set + component re-skin lands in Session 4, together, so each checkpoint stays coherent.

## Sessions
- [x] **Session 1 — Foundation** (committed)
  - `backend/eras/era_1.py`: added `everymen` FactionConfig (red `#c1272d`, selectable, placeholder modifiers); fixed `gestalt` color `#14532d`→`#ec5f99`.
  - `backend/tests/unit/test_faction_config.py`: selectable count 6→7.
  - `backend/schemas/praxis.py` + `backend/services/praxis.py`: added `task_faction_slug` to **full** `PraxisOut` (card already had it) — needed for the per-faction vote dispatcher.
  - `frontend/src/api/praxis.ts`: mirrored `task_faction_slug` on the `PraxisOut` TS type.
  - `frontend/src/utils/factions.ts`: `FACTION_FALLBACKS.everymen` + `CSS_KEY.everymen`; `gestalt` fallback `#be185d`→`#ec5f99`.
  - `frontend/src/index.css`: full `--faction-everymen-*` + private `--everymen-*` token block (light `:root` + dark); Gestalt primary/tint/border/accent → pink.
  - `docs/spec/SPEC-faction-ui-profile.md`: the reusable per-faction profile (written during planning).
- [ ] **Session 2 — Tier-3 dispatcher scaffolding** (all default to current global components; zero visual change)
  - Create dispatchers mirroring `components/TaskCard.tsx` `CARD_COMPONENTS`: `components/vote/VoteUI.tsx`,
    `components/progression/Progression.tsx`, `components/backdrop/FactionBackdrop.tsx`, `components/avatar/FactionAvatar.tsx`,
    and a faction-aware layer in `components/feed/FeedCardRouter.tsx`.
  - Backdrop: `BackdropContext` + `useFactionBackdrop(slug)` in `components/Layout.tsx`; replace hardcoded
    `<WatercolorBackground/>` with `<FactionBackdrop/>` that falls back to watercolor for null/unknown/mixed pages.
  - Vote dispatcher keys on `praxis.task_faction_slug`; default = existing `components/ui/VoteStamps.tsx`.
  - Progression default = existing `components/ui/LevelPill.tsx`. Avatar first pass = inside `components/CharacterBadge.tsx` only.
- [ ] **Session 3 — Everymen components** (port `~/Downloads/Everymen/everymen/everymen-*.jsx`)
  - `TaskCardEverymen`, `EverymenCard` (faction-select), `EditPraxisEverymen`; everymen variants for the 5 Tier-3 dispatchers;
    port `.em-backdrop` CSS (everymen.css lines 72-103) into index.css. Register everymen in every dispatcher.
- [ ] **Session 4 — Gestalt redesign components** (port `~/Downloads/Gestalt redesin (1)/gestalt-cards/gestalt-*.jsx`)
  - Re-skin `GestaltCard`, `TaskCardGestalt`, the gestalt edit-praxis archetype to the lo-fi `.exe` window look;
    add the full window-chrome token set to index.css (title bar/notepad/ivy); gestalt variants for the 5 Tier-3 dispatchers
    (moon-phase progression, heart votes). Remove now-dead `--faction-gestalt-scrap-*`/`-tape` tokens once components stop referencing them.
- [ ] **Session 5 — Verification & polish**
  - `npm start` + preview workflow (quest board mixed→rainbow; single-faction profile→faction backdrop+avatar; praxis detail→per-faction votes;
    Factions grid: Everymen visible + Gestalt pink); toggle dark mode on each; screenshots light+dark. Backend `pytest` once a venv exists.
