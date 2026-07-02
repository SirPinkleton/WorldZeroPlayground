# Design-fidelity audit — cloud "World Zero Design System" vs repo

**SESSION STATUS (banked 2026-07-02):** UA column fully audited → #372/#373/#374 (+#200 narrowed). Task Card row complete (UA sole drift). **Praxis Card row → #375** + **Updates/Feed row → #376** = SYSTEMIC drift, all factions (Molly-reported; faithful frames wrap neutral/placeholder content instead of per-faction archetypes). Comment Box flagged as next same-disease suspect. Faction-page heroes triaged ▸. Rest queued below for a later/overnight run — paste the RESUME PROMPT. Nothing in `frontend/src` was edited; all output is GitHub issues + this ledger.

**Goal:** for every faction × surface, compare the hand-built Claude Design template against the repo implementation. File a `ready-for-agent` GitHub issue for each real drift. Record status here after **each** cell so this is resumable.

> **DIRECTION OF TRUTH (Molly, 2026-07-02): the cloud DESIGN is correct; where the repo diverges, the REPO is out of date and gets fixed to match the design.** This applies to copy/vocabulary too, not just layout. Consequence: earlier ✅ marks were judged on STRUCTURAL fidelity only — cells with matching structure but divergent word-level copy vs the design are drift and need a closer copy pass (flagged per-cell below).

---

## ▶ RESUME PROMPT — paste this to continue (built to run overnight, autonomously)

```
Resume the World Zero design-fidelity audit. Read .design-sync/AUDIT.md first — it is the
ledger and holds all state, the direction-of-truth rule, the method, and the priority queue.

Then work the PRIORITY QUEUE top-down, autonomously, without stopping to ask me:
- For each cell, read the cloud design (DesignSync get_file, projectId 019e221c-7853-7530-a934-7d3b2b7c8b43)
  AND the repo file, and compare BOTH layout/structure AND copy/vocabulary.
- Rule: the cloud design is canonical. Any repo divergence (layout OR wording) = drift.
- On drift: `gh issue create --label ready-for-agent`, one focused issue per surface. Reuse
  existing repo atoms and cite them (e.g. UACrest in UAFactionHero). Do NOT edit frontend source.
- Do NOT double-file albescent (🔁) cells — those roll up into #232.
- After EACH cell: update the matrix + findings log in AUDIT.md and `git commit` it. Record as you go.
- Only stop to ask me if: DesignSync auth is unavailable (needs /design-login), or a finding is a
  genuine product/copy DECISION rather than a clear design↔repo mismatch. Otherwise keep going until
  the matrix has no ⬜/▸ left, then post a summary of every issue filed.

Work in this worktree/branch. Commit ledger updates as you go; do not touch frontend/src.
```

## Priority queue (work top-down — highest drift-risk first)
1. **Faction-page heroes** (▸): cloud-compare wow/snide/ephemerists/singularity/everymen heroes vs `templates/<faction>/... Faction Page.dc.html`. The #359 standardization zone — next most-likely drift after UA.
2. **Task Detail** row, non-UA (⬜): vs `templates/<faction>/... Task Detail.dc.html`. (#136 tracks task-detail spec-match generally — cross-link, don't duplicate.)
3. **Edit Praxis** row, non-UA (⬜): vs `... Edit Praxis`. Check the crest-drop / copy pattern that hit UA (#373).
4. **Vote** row, non-UA (⬜): vs each faction's praxis-read vote widget. Copy-level (rung words) now counts — see #374.
5. **Praxis (read)** row, non-UA (⬜): vs `... Completed Praxis`/`Praxis Index`. (Praxis **Card** row DONE → #375 systemic.)
6. **Comment Box** row (⬜) — **HIGH PRIORITY, same-disease suspect** (after #375 praxis + #376 feed): check if `components/comments/voices/*` are per-faction archetypes or neutral content in faction chrome. Design: `FactionCommentBox` (gilt salon / whimsy.exe / ransom slip / vellum marginalia / terminal line / union entry / the register). NOTE: no `templates/<f>/*Comment*` files but the DS `FactionCommentBox` component covers all 7 — design exists.
7. **Updates/Feed** row (⬜): vs `... Updates`. Repo: `components/feed/*FeedFrame` + `FeedCard*`.
8. **Avatar** + **Backdrop** rows, non-UA (⬜): repo `components/avatar/*` + `components/backdrop/*`.
9. **Albescent (🔁)**: skip per-cell; ensure #232 references the cloud `templates/albescent/` kit.

## Issues filed so far (this audit)
- **#372** UA task card — dropped crest/masthead/motto/Matriculate. `ready-for-agent`.
- **#373** UA edit-praxis — dropped crest (ribbon+slip) + copy divergence. `ready-for-agent`.
- **#374** UA vote rungs — copy out of date vs design critique vocabulary. `ready-for-agent`.
- **#375** Praxis cards (ALL factions) — placeholder body/seal instead of the design's per-faction vote-reframe hero. `ready-for-agent`. Systemic; frames are fine, hero is missing.
- **#376** Activity feed (ALL factions) — faction frames wrap NEUTRAL event-card content; design wants per-faction `FactionActivityCard` rows (slot-driven, no event switching). `ready-for-agent`. Systemic; flags full-adopt vs hybrid arch decision.
- **#200** (narrowed) UA avatar missing. **#232** (albescent kit unblocked). **#136** (task-detail spec ref). **#363–#371** = the separate repo→cloud sync run (Phase 2), not this audit.
- Minor, unfiled: stale comment `UAPraxisDetail.tsx:13-14`; wow task-card generic sign-up button (flavored-copy nit).

## How to resume (read this first if you're a fresh session)
1. Cloud project = **"World Zero Design System"**, projectId `019e221c-7853-7530-a934-7d3b2b7c8b43`. Read designs with `DesignSync(get_file, projectId, path)`. Needs design auth (`/design-login` if headless-blocked).
2. Repo components live under `frontend/src/`. Faction dispatch via `utils/factionDispatch.ts` `pickVariant`; `albescent`→`ua` alias in `utils/factions.ts:68`.
3. Work the **Priority queue** (above) top-down — not raw matrix order. Read the cloud template + the repo file, compare BOTH structure AND copy (design is canonical), decide match vs drift.
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
| Praxis Card    | ⚠️→#375 | ⚠️→#375 | ⚠️→#375 | ⚠️→#375 | ⚠️→#375 | ⚠️→#375 | 🔁 |
| Edit Praxis    | ⚠️→#373 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Comment Box    | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Updates/Feed   | ⚠️→#376 | ⚠️→#376 | ⚠️→#376 | ⚠️→#376 | ⚠️→#376 | ⚠️→#376 | 🔁 |
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

### Updates/Feed row — SYSTEMIC drift, ALL factions → #376 (2026-07-02, Molly: "check feed for the same thing")
- **Same disease as #375, confirmed.** Repo `*FeedFrame` = chrome-only wrapper (UaFeedFrame: *"must NOT reimplement the card internals"*); the 11 `FeedCard*` event cards render NEUTRAL content (generic `--color-text-*` tokens, generic avatar/layout, faction only via `factionColor()` accent). Design `FactionActivityCard` wants each faction to OWN the whole row (7 archetypes, slot-driven, no event-type switching: actor/action/headline/meta).
- **Architectural inversion**: repo = event-type-primary (`FeedCardRouter` by `item.type`) + faction frame; design = faction-archetype-primary + event-slots. #376 flags the (a) full-adopt vs (b) hybrid decision (some events — era_announcement/invitation_letter/duel_challenge — carry bespoke chrome). Factionless companions in design: ActivityDispatchCard/JoinCard/DuelCard.
- **CORRECTION**: I earlier marked Updates/Feed **ua = ⏭️** ("no UA cloud updates design") — WRONG. `FactionActivityCard` (DS component, not a per-faction template file) covers ua (gilt-salon plate). Same mistake on **Comment Box ua ⏭️→⬜**: `FactionCommentBox` DS component covers all 7 factions (readme: "gilt salon, whimsy.exe window, ransom slip, vellum marginalia, terminal line, union entry, the register") — no `templates/ua/*Comment*` file ≠ no design.
- **HIGH-PRIORITY SUSPECT**: Comment Box (`components/comments/voices/*`) is the next likely same-disease surface — check whether the voices are per-faction archetypes or neutral content in faction chrome. Moved up the queue.

### Praxis Card row — SYSTEMIC drift, ALL factions → #375 (2026-07-02, reported by Molly)
- **CORRECTION**: I earlier marked Praxis-card/ua ✅ on a weak grep signal (gilt tokens present). Molly flagged the cards don't match design for ANY group — **confirmed and correct**. My ✅ was wrong; this is the existence≠fidelity trap again, and it applies to the whole row.
- **Root cause (single)**: every faction praxis card in `PraxisCard.tsx` has a faithful bespoke FRAME but renders the shared `PlaceholderPraxisBody` → generic rotated score-number `PraxisSeal`. The design's per-faction **vote-reframe hero** (ua Critique / wow heart marks / snide stamped marks / ephemerists Concordance / singularity ascii bar / everymen star marks) was never built. Self-documented placeholder (`PraxisCard.tsx:42-46`, `shared.tsx:108`, ADR-0005).
- **Now buildable**: the deferred API fields exist (`PraxisCardOut.score`/`voter_count`/`task_level_required`/`submitted_at`); tier vocab in `voteReframes.ts`. Filed #375 `ready-for-agent` (one systemic issue, 6 archetypes + default). Flags the #264 tier-vs-average decision + missing excerpt field.
- **AUDIT LESSON (reinforced)**: do NOT mark a cell ✅ from a token/grep signal — read the actual render vs the cloud design. Re-examine any remaining ✅ that wasn't a full read (esp. Task Detail/ua, which was crest+Matriculate grep, not a full body/copy read).

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
