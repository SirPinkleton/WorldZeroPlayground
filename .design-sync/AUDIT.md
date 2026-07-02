# Design-fidelity audit — cloud "World Zero Design System" vs repo

**Goal:** for every faction × surface, compare the hand-built Claude Design template against the repo implementation. File a `ready-for-agent` GitHub issue for each real drift. Record status here after **each** cell so this is resumable.

## How to resume (read this first if you're a fresh session)
1. Cloud project = **"World Zero Design System"**, projectId `019e221c-7853-7530-a934-7d3b2b7c8b43`. Read designs with `DesignSync(get_file, projectId, path)`. Needs design auth (`/design-login` if headless-blocked).
2. Repo components live under `frontend/src/`. Faction dispatch via `utils/factionDispatch.ts` `pickVariant`; `albescent`→`ua` alias in `utils/factions.ts:68`.
3. Find the **first ⬜ pending** cell in the matrix below and continue. Read the cloud template + the repo file, compare signature elements (layout, type faces, motifs/SVG, color tokens, key copy), decide match vs drift.
4. On drift: `gh issue create --label ready-for-agent`, one focused issue (reuse existing repo atoms where possible — cite them). Then mark the cell `⚠️→#NNN` and write a one-line finding under the matrix.
5. On match: mark `✅`. On not-applicable (no cloud design / no repo surface): `⏭️` with a note.
6. Commit `.design-sync/AUDIT.md` after each row (or small batch). Issues already filed are the durable record; this file tracks coverage.

**Legend:** ⬜ pending · ✅ match · ⚠️→#N drift filed · ⏭️ n/a · 🔁 albescent (aliased→ua; drift = #232 scope, note don't double-file)

## Cloud template map (reference files, per faction)
- **ua**: `templates/ua/UA Task Card.dc.html`, `UA Task Detail.dc.html`, `UA Faction Page.dc.html`, `UA Praxis - Read.dc.html`, `UA Edit Praxis.dc.html` (no comment/updates design)
- **wow**: `templates/wow/Warriors of Whimsy EXE.html` (task surface), `Warriors of Whimsy Page.html`, `... Task Detail.dc.html`, `... Praxis.html`, `... Edit Praxis.dc.html`, `... Comment Box.html`, `... Updates.html`
- **snide**: `templates/snide/SNIDE Task Card.html` (+ `v2`), `SNIDE Task Detail.dc.html`, `SNIDE Faction Page.dc.html`/`Dispatch Board.html`, `SNIDE Praxis Detail.html`/`Completed Praxis.html`, `SNIDE Edit Praxis.html`, `SNIDE Comment Box.html`, (updates?)
- **ephemerists**: `templates/ephemerists/Ephemerists Task Card - Light + Dark.html`, `... Task Detail.dc.html`, `... Faction Page.dc.html`, `... Completed Praxis.html`/`Praxis Index.html`, `... Edit Praxis.html`, `... Comment Box.html`, `... Updates Page.html`
- **singularity**: `templates/singularity/Singularity Faction Page.dc.html`, `... Task Detail.dc.html`, `... Completed Praxis.html`/`Praxis Index.html`, `... Edit Praxis.dc.html`, `... Comment Box.html`, `... Updates Page.html` (task card within faction page)
- **everymen**: `templates/everymen/Everymen Task Card - 5 Takes.html`/`Mobilize - Light + Dark.html`, `... Task Detail.dc.html`, `... Faction Page.dc.html`, `... Praxis.html`, `... Edit Praxis.html`, `... Comment Box.html`, `... Updates Page.html`, `Everymen Join Screen.html`
- **albescent**: `templates/albescent/Albescent Task Card Explorations.html`, `... Task Detail.dc.html`, `... Faction Page.dc.html`, `... Completed Praxis.html`, `... Edit Praxis.dc.html`, `... Comment Box.html`, `... Updates.html`

## Matrix

| Surface \ Faction | ua | wow | snide | ephemerists | singularity | everymen | albescent |
|---|---|---|---|---|---|---|---|
| Task Card      | ⚠️→#372 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Task Detail    | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Faction Page   | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Praxis (read)  | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Praxis Card    | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Edit Praxis    | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Comment Box    | ⏭️ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Updates/Feed   | ⏭️ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Vote           | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁(#232) |
| Avatar         | ⚠️→#200 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁(#232) |
| Backdrop       | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁(#232) |

## Findings log
- **Task Card / ua → #372**: repo `TaskCardUA` has gilt-salon palette+frame but DROPPED the locked crest/masthead/motto-ribbon/Matriculate button in `templates/ua/UA Task Card.dc.html`. Crest exists in-repo (`UAFactionHero.UACrest`) → extract+reuse. `ready-for-agent`.
- **Avatar / ua → #200**: no `components/avatar/UAAvatar.tsx`; FactionAvatar falls through for ua. Narrowed #200 to this.
- **Albescent (all 🔁)**: aliased→ua; every albescent variant is missing by design. Tracked wholesale by #232 (cloud kit now supplies the designs). Do NOT file per-surface albescent drift issues — fold into #232.
