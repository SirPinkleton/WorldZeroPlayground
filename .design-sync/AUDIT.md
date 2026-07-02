# Design-fidelity audit — cloud "World Zero Design System" vs repo

**Goal:** for every faction × surface, compare the hand-built Claude Design template against the repo implementation. File a `ready-for-agent` GitHub issue for each real drift. Record status here after **each** cell so this is resumable.

> **DIRECTION OF TRUTH (Molly, 2026-07-02): the cloud DESIGN is correct; where the repo diverges, the REPO is out of date and gets fixed to match the design.** This applies to copy/vocabulary too, not just layout. Consequence: earlier ✅ marks were judged on STRUCTURAL fidelity only — cells with matching structure but divergent word-level copy vs the design are drift and need a closer copy pass (flagged per-cell below).

## How to resume (read this first if you're a fresh session)
1. Cloud project = **"World Zero Design System"**, projectId `019e221c-7853-7530-a934-7d3b2b7c8b43`. Read designs with `DesignSync(get_file, projectId, path)`. Needs design auth (`/design-login` if headless-blocked).
2. Repo components live under `frontend/src/`. Faction dispatch via `utils/factionDispatch.ts` `pickVariant`; `albescent`→`ua` alias in `utils/factions.ts:68`.
3. Find the **first ⬜ pending** cell in the matrix below and continue. Read the cloud template + the repo file, compare signature elements (layout, type faces, motifs/SVG, color tokens, key copy), decide match vs drift.
4. On drift: `gh issue create --label ready-for-agent`, one focused issue (reuse existing repo atoms where possible — cite them). Then mark the cell `⚠️→#NNN` and write a one-line finding under the matrix.
5. On match: mark `✅`. On not-applicable (no cloud design / no repo surface): `⏭️` with a note.
6. Commit `.design-sync/AUDIT.md` after each row (or small batch). Issues already filed are the durable record; this file tracks coverage.

**Legend:** ⬜ pending · ✅ match (fully verified: read repo + cloud, or architecture confirmed) · ✅¢ structural match but word-level copy drift vs design (see note) · ▸ triaged (repo signature present via grep/read, cloud-compare deferred — low drift risk) · ⚠️→#N drift filed · ⏭️ n/a · 🔁 albescent (aliased→ua; drift = #232 scope, don't double-file)

**Resume note:** ▸ cells are the cheapest to finish — repo signature already confirmed present; just need a cloud-design read to promote to ✅ or catch a subtle drift. ⬜ cells need both sides read.

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
| Task Card      | ⚠️→#372 | ✅* | ✅ | ✅ | ✅ | ✅ | 🔁 |
| Task Detail    | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Faction Page   | ✅ | ▸ | ▸ | ▸ | ▸ | ▸ | 🔁 |
| Praxis (read)  | ✅¢ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Praxis Card    | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Edit Praxis    | ⚠️→#373 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Comment Box    | ⏭️ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Updates/Feed   | ⏭️ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Vote           | ⚠️→#374 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁(#232) |
| Avatar         | ⚠️→#200 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁(#232) |
| Backdrop       | ✅ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁(#232) |

## Findings log
- **Task Card / ua → #372**: repo `TaskCardUA` has gilt-salon palette+frame but DROPPED the locked crest/masthead/motto-ribbon/Matriculate button in `templates/ua/UA Task Card.dc.html`. Crest exists in-repo (`UAFactionHero.UACrest`) → extract+reuse. `ready-for-agent`.
- **Avatar / ua → #200**: no `components/avatar/UAAvatar.tsx`; FactionAvatar falls through for ua. Narrowed #200 to this.
- **Task Card / snide ✅**: `TaskCardSNIDE` = full ransom-dispatch (per-char cut-out ransom letters, halftone, SnideMasthead, tape, "I'M IN"). Matches cloud "Ransom Dispatch" (option A, the picked winner). Faithful.
- **Task Card / ephemerists ✅**: `TaskCardEphemerists` = full discordant-map (cartesian+perspective+polar grids, disputed point, 3 disagreeing coord labels, marginal apparatus, LapisLastWord, self-ref footnote, "pvncta"). Matches cloud `DiscordantMap`. Faithful.
- **Task Card / everymen ✅**: `TaskCardEverymen` = Rally Bill (cog-sigil red masthead, sunburst+halftone, RuleDiamond, rubber-stamp PointsSeal, "Report for duty"). Faithful.
- **Task Card / singularity ✅**: `TaskCardSingularity` = terminal printout (corner brackets, sprocket holes ×2, scanlines, blinking cursor, `> title`, PTS/LVL). Faithful. (Compact + 0 SVG is correct — terminal is CSS/text.)
- **Task Card / wow ✅\***: `TaskCardWow` = wow.exe window (title-bar dots + sparkle + "wow.exe" + ▭✕, dotted grid, notepad, Caveat headline). Signature faithful. **Minor nit** (not filed): sign-up button is the generic `btn-primary` 7px "sign up" — snide/eph/everymen use faction-flavored button copy; UA's is #372. Low-priority polish; fold into a "flavored button copy" sweep if desired. Same nit applies to UA (already in #372).
- **Task Card ROW COMPLETE**: only UA drifted (#372). The 5 established faction cards are faithful — they predate UA's gilt-salon re-skin (PR #361), which is where the regression entered.

### UA column (2026-07-02)
- **Task Detail / ua ✅**: `TaskDetailUA` has crest SVG + "Matriculate" + ua-gilt (8 crest/svg hits). Faithful.
- **Faction Page / ua ✅**: page is composed in `FactionDetail.tsx` as `FACTION_HEROES[ua]=UAFactionHero` (full crest, "Ars Longa" motto, 9 hits) ABOVE `UaFactionBody` (sections ②–⑥). Crest lives in the hero by design — body correctly has none. Architecture confirmed.
- **Backdrop / ua ✅**: `UABackdrop` = gilt-salon parchment wall + gilt corner glow + ledger dot-grid, all `--ua-*` tokens (always-light). Matches the task-card design's ground recipe. Read in full.
- **Praxis-read / ua ▸**: `UAPraxisDetail` has Playfair+Marcellus+ua-gilt, no crest (a ledger sheet — crest not expected). Purpose-built as "The Standing" gilt ledger in #358, so likely faithful; cloud-compare `templates/ua/UA Praxis - Read.dc.html` to confirm.
- **Praxis-card / ua ▸**: UA branch of `PraxisCard.tsx` has crest hits (3) + Playfair+Marcellus+ua-gilt. Signature present; cloud-compare pending.
- **Edit-praxis / ua ▸**: `EditPraxisUA` has Playfair+Marcellus+ua-gilt ×2, no crest (a form). #361 port; cloud-compare `templates/ua/UA Edit Praxis.dc.html` pending.
- **KEY TAKEAWAY**: #372 (task card) is an ISOLATED miss within UA's #361 re-skin, NOT systemic — task-detail/faction-page/backdrop all got the full gilt-salon treatment. UA vote still ⬜ (needs cloud vote design). Comment/Updates ⏭️ (no UA cloud design exists).

### UA praxis + vote confirmed via cloud read (2026-07-02)
- **Praxis-read / ua ✅**: cloud `UA Praxis - Read.dc.html` = "The Acquisition Sheet" (gilt-framed plate, "The Process" blob-bullet list, "The Critique" sidebar w/ standing meter + named rungs). Repo `UAPraxisDetail` (442 ln) carries Acquisition/Exhibited/Plate/"The Process"/"The Standing" + gilt plate + brushes sigil (6 hits). Faithful (repo names the standing section "The Standing" vs cloud "The Critique" — synonym, fine).
- **Praxis-card / ua ✅**: UA branch of `PraxisCard.tsx` has crest(3)+Playfair+Marcellus+ua-gilt. No separate cloud praxis-card design (card = faction-page recentPraxis treatment); signature consistent with the read sheet. Faithful.
- **Vote / ua ⚠️→#374 (RESOLVED direction: repo out of date)**: `UAVote` structure faithful, but rung WORDS out of date vs design. **cloud** = rough sketch/study/accomplished/distinguished/masterwork; **repo** (`voteReframes.ts ua.tiers`) = Noted/Sketch/Hung/Commended/Acquired. Molly confirmed design is canonical → filed #374 to update repo. (Earlier I wrongly assumed repo was canonical.)
- **Edit-praxis / ua ⚠️→#373**: cloud "Submit to the Salon" has the crest ×2 (masthead ribbon + commission slip) + design copy (Alone/Atelier/Salon Duel, "Hang it in the Salon"). Repo `EditPraxisUA` ("The Atelier") is structurally close (gilt Plates, RegaliaLabel, shared ModePicker) but **drops the crest** (0 SVG — same as #372) and diverges on copy (Sole/Joint/Contested, "File the acquisition"). Filed #373 (reuse UACrest, align copy).
- **Praxis-read / ua ✅¢ (copy caveat under new principle)**: structure faithful (see above) BUT word-level copy drift vs design: repo names the standing section **"The Standing"**, design calls it **"The Critique"** / "Sit the Critique"; the standing/distribution rung words are the same out-of-date set covered by #374 (shared `voteReframes` source). If a full copy-alignment is wanted, add "The Standing"→"The Critique" to #374's scope or a copy-sweep issue.
- **MINOR code-doc drift (not filed)**: `pages/praxisDetail/archetypes/UAPraxisDetail.tsx:13-14` comment says "no bespoke UA vote component exists" — FALSE; `UAVote` exists and is dispatched (`VoteUI.tsx:31`). Stale since UAVote landed. Trivial 2-line doc cleanup; note only.

> **COPY-PASS CAVEAT (applies to all prior ✅):** ✅ marks above were STRUCTURAL. Under the design-is-canonical directive, cells like Task Detail/ua (✅) and Faction Page/ua (✅) have NOT been word-level copy-checked vs their cloud designs — a copy-diff pass may surface more #374-style label drift. Task Card/ua (#372) and Edit Praxis/ua (#373) are the confirmed structural+copy drifts so far.

### Faction Page row — heroes triaged (2026-07-02)
- All 6 heroes registered in `FactionDetail.FACTION_HEROES` and substantial (lines / visual-hits): UA 277/7, Wow 236/5, Snide 285/1 (photocopy archetype = few gradients, expected), Ephemerists 176/5, Singularity 303/4, Everymen 235/2. None are stubs. Marked ▸ (wow/snide/eph/sing/everymen) pending a cloud-compare vs `templates/<faction>/... Faction Page.dc.html`. UA ✅ (architecture confirmed above).

### STRATEGIC PATTERN (drives remaining audit)
Across 2 full rows (Task Card, Faction Page heroes): **the 5 established factions are faithful; drift concentrates in RECENTLY-REWORKED surfaces.** The only confirmed drift (#372) came from PR #361's UA re-skin. Highest-yield remaining audit targets = surfaces changed by recent PRs, not a blind sweep:
- **PR #361** (UA task card/praxis/edit-praxis → gilt salon): task card drifted (#372); UA praxis/edit-praxis still ▸ to confirm.
- **PR #359** (all faction pages standardized): heroes triaged ▸ above.
- **PR #358** (UA praxis-read "The Standing").
- Recommend: cloud-compare the ▸ cells (cheap — repo signature already confirmed), then spot-check the remaining ⬜ rows (praxis-card, edit-praxis, vote, avatar, backdrop, comment, feed) for the non-UA factions, prioritizing any surface touched by a recent PR. A blind full-depth sweep of all ~48 remaining cells is low-yield given the pattern.

- **Albescent (all 🔁)**: aliased→ua; every albescent variant is missing by design. Tracked wholesale by #232 (cloud kit now supplies the designs). Do NOT file per-surface albescent drift issues — fold into #232.
