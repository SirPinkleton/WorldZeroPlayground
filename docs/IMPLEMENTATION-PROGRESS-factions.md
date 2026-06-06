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
- [x] **Session 2 — Tier-3 dispatcher scaffolding** (committed; all default to current globals; zero visual change, zero new tsc errors)
  - Created dispatchers (empty faction maps → fall back to today's global components):
    `components/vote/VoteUI.tsx` (+ `vote/useVote.ts` shared hook), `components/progression/Progression.tsx`,
    `components/backdrop/FactionBackdrop.tsx` (+ `backdrop/BackdropContext.tsx` w/ `BackdropProvider`+`useFactionBackdrop`),
    `components/avatar/FactionAvatar.tsx`, `components/feed/FactionFeedFrame.tsx` (passthrough).
  - **Wired** (safe, behavior-identical): `Layout.tsx` (BackdropProvider + `<FactionBackdrop/>` replacing `<WatercolorBackground/>`);
    `PraxisDetail.tsx` (`<VoteUI factionSlug={praxis.task_faction_slug} …/>`); `CharacterBadge.tsx` (`<FactionAvatar/>`, DefaultAvatar = old markup).
  - **NOT yet wired** (wire when first faction variant lands in S3/S4): Progression has no prominent call-site swap yet (LevelPill
    callers still call LevelPill directly — fine, they pass factionSlug); FactionFeedFrame not yet wrapped around feed type-cards;
    pages don't call `useFactionBackdrop()` yet (so every page still shows watercolor — correct until a faction backdrop variant exists).
  - **Pre-existing tsc errors (NOT mine, verified via stash):** `EditPraxis.tsx:67` (`<Archetype>` dynamic-component typing) +
    unused-var warnings in `EditPraxisLuggageManifest.tsx`, `EditPraxisStickyNote.tsx`. Fix opportunistically in Session 3 (touches EditPraxis).
- [x] **Session 3 — Everymen components** (committed; `tsc --noEmit` EXIT 0 — whole frontend clean, incl. fixing the prior EditPraxis errors)
  - New variant files: `cards/TaskCardEverymen.tsx`, `cards/EverymenFactionCard.tsx` (faction-select), `pages/editPraxis/archetypes/EditPraxisEverymen.tsx`,
    `vote/EverymenVote.tsx`, `backdrop/EverymenBackdrop.tsx`, `progression/EverymenProgression.tsx`, `avatar/EverymenAvatar.tsx`, `feed/factionFrames/EverymenFeedFrame.tsx`.
  - `.em-backdrop` CSS ported into index.css. Registered `everymen` in ALL eight dispatchers (TaskCard, FactionCard switch, EditPraxis,
    FactionBackdrop, VoteUI, Progression, FactionAvatar, FactionFeedFrame).
  - Backdrop now wired live: `CharacterProfile.tsx` calls `useFactionBackdrop(character?.faction_slug)` → Everymen profiles show the poster wall; others fall back to watercolor.
  - Fixed pre-existing tsc errors: EditPraxis.tsx dynamic-archetype typing (`slug ? map[slug] : undefined`) + unused vars in StickyNote/LuggageManifest archetypes.
  - The 3 big components (task card, faction-select card, edit-praxis) were ported by parallel subagents; the 4 small dispatcher-tight variants authored directly.
- [ ] **Session 4 — Gestalt redesign components** (port `~/Downloads/Gestalt redesin (1)/gestalt-cards/gestalt-*.jsx`)
  - Re-skin `GestaltCard`, `TaskCardGestalt`, the gestalt edit-praxis archetype to the lo-fi `.exe` window look;
    add the full window-chrome token set to index.css (title bar/notepad/ivy); gestalt variants for the 5 Tier-3 dispatchers
    (moon-phase progression, heart votes). Remove now-dead `--faction-gestalt-scrap-*`/`-tape` tokens once components stop referencing them.
- [ ] **Session 5 — Verification & polish**
  - `npm start` + preview workflow (quest board mixed→rainbow; single-faction profile→faction backdrop+avatar; praxis detail→per-faction votes;
    Factions grid: Everymen visible + Gestalt pink); toggle dark mode on each; screenshots light+dark. Backend `pytest` once a venv exists.
