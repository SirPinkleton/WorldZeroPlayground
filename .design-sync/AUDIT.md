# Design-fidelity audit — cloud "World Zero Design System" vs repo

**SESSION STATUS (banked 2026-07-02):** UA column fully audited → #372/#373/#374 (+#200 narrowed). Task Card row complete (UA sole drift). **Praxis Card row → #375** + **Updates/Feed row → #376** = SYSTEMIC drift, all factions (Molly-reported; faithful frames wrap neutral/placeholder content instead of per-faction archetypes). Comment Box + Task Detail + Vote rows DONE — all healthy systems (faction methods + per-voter breakdown built); drifts: UAComment #377 (ADR-0018 reversal), task-detail averages #378 (ADR-0014 violation), UA vote copy #374. ADR dimension added (Molly): reconcile findings vs `docs/adr/*`, file ADR breaks; DESIGN-vs-ADR override on averages (ADR wins). Faction-page heroes triaged ▸. Rest queued below for a later/overnight run — paste the RESUME PROMPT. Nothing in `frontend/src` was edited; all output is GitHub issues + this ledger.

**Goal:** for every faction × surface, compare the hand-built Claude Design template against the repo implementation. File a `ready-for-agent` GitHub issue for each real drift. Record status here after **each** cell so this is resumable.

> **DIRECTION OF TRUTH (Molly, 2026-07-02): the cloud DESIGN is correct; where the repo diverges, the REPO is out of date and gets fixed to match the design.** This applies to copy/vocabulary too, not just layout. Consequence: earlier ✅ marks were judged on STRUCTURAL fidelity only — cells with matching structure but divergent word-level copy vs the design are drift and need a closer copy pass (flagged per-cell below).

> **ADR DIMENSION (Molly, 2026-07-02): read `docs/adr/*` for context as you audit; if the repo breaks an ADR, that's ALSO an issue.** And reconcile every finding against the ADRs before filing — a "repo out of date" call may (a) duplicate an existing tracking issue the ADR names (e.g. #375 ↔ #159), (b) need to adopt the ADR's mandated *mechanism* (e.g. ADR-0005 → compose `VoteUI` summary mode, not hand-roll), or (c) require explicitly REVERSING an ADR when the design supersedes it (Molly's call — see #377 reversing ADR-0018). ADR quick-map for audited surfaces: **0002** page=composition · **0005** praxis-card content model (#375) · **0006** comment system · **0010** copy catalog `copy/en.ts` via `t()` (#374 copy belongs here) · **0016** per-faction surfaces share ONE contract, archetypes own only presentation — *the law behind the frames-only disease* (#375/#376) · **0018** comment voice / UA-orange — *being reversed* (#377) · **0023** feed = read-time projection (#376).

---

## ▶ RESUME PROMPT — paste this to continue (built to run overnight, autonomously)

```
Resume the World Zero design-fidelity audit. Read .design-sync/AUDIT.md first — it is the
ledger and holds all state, the direction-of-truth rule, the method, and the priority queue.

Then work the PRIORITY QUEUE top-down, autonomously, without stopping to ask me:
- CANONICAL SOURCE = `components/factions/<faction>/…` + root `*-contract.json` (READ THE CONTRACT FIRST). `templates/…` is DEPRECATED/stale — do not audit against it (only for surfaces not yet migrated, and flag it). See "CANONICAL SOURCE MOVED" above.
- For each cell, read the cloud design (DesignSync get_file, projectId 019e221c-7853-7530-a934-7d3b2b7c8b43)
  AND the repo file, and compare BOTH layout/structure AND copy/vocabulary. Contracts define the required SLOTS — a repo surface missing a contract slot (e.g. `votePoints`) is drift.
- Rule: the cloud design is canonical. Any repo divergence (layout OR wording) = drift.
- ADR CHECK: skim docs/adr/* for the surface. If the repo breaks an ADR, that's also an issue.
  Before filing, reconcile: does an ADR already track this (search closed+open issues it names)?
  does the ADR mandate a specific mechanism to adopt? does the design supersede an ADR (flag a
  reversal for Molly)? Cite the ADR in the issue.
- VERIFY BEFORE FILING: confirm the repo really lacks it (grep the PAGE wrapper too, not just the
  archetype — e.g. TaskDetail.tsx renders CommentThread, not the archetype). Don't file phantoms.
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
2. **Task Detail** row — UA ✅ verified; other 5 ▸ signature-confirmed (content-first bespoke, NOT the disease). Optional: promote ▸→✅ via cloud-compare per faction. Low priority (healthy row). Comments confirmed present via `TaskDetail.tsx:71`.
3. **Edit Praxis** row, non-UA (⬜): vs `... Edit Praxis`. Check the crest-drop / copy pattern that hit UA (#373).
4. **Vote** row — DONE (2026-07-02): faction methods healthy; per-voter breakdown built; UA copy #374 + averages #378. See findings.
5. **Praxis (read)** row, non-UA (⬜): vs `... Completed Praxis`/`Praxis Index`. (Praxis **Card** row DONE → #375 systemic.)
6. **Comment Box** row — DONE (2026-07-02): healthy per-faction archetypes; only UAComment drifted → #377. See findings.
7. **Updates/Feed** row (⬜): vs `... Updates`. Repo: `components/feed/*FeedFrame` + `FeedCard*`.
8. **Avatar** + **Backdrop** rows, non-UA (⬜): repo `components/avatar/*` + `components/backdrop/*`.
9. **Albescent (🔁)**: skip per-cell; ensure #232 references the cloud `templates/albescent/` kit.

## Issues filed so far (this audit)
- **#372** UA task card — dropped crest/masthead/motto/Matriculate. `ready-for-agent`.
- **#373** UA edit-praxis — dropped crest (ribbon+slip) + copy divergence. `ready-for-agent`.
- **#374** UA vote rungs — copy out of date vs design critique vocabulary. `ready-for-agent`.
- **#375** Praxis cards (ALL factions) — placeholder body/seal instead of the design's per-faction vote-reframe hero. `ready-for-agent`. Systemic; frames are fine, hero is missing.
- **#376** Activity feed (ALL factions) — faction frames wrap NEUTRAL event-card content; design wants per-faction `FactionActivityCard` rows (slot-driven, no event switching). `ready-for-agent`. Systemic; flags full-adopt vs hybrid arch decision.
- **#377** **REVERSE ADR-0018's UA-comment decision** + reskin UAComment to gilt salon. `ready-for-agent`. (Molly's explicit ADR-reversal ask. Retitled from "UAComment out of date". Requires a superseding ADR.)
- **#378** Task-detail pages still show a vote AVERAGE — **ADR-0014 / #264 violation** (missed tail of #264). `ready-for-agent`. Carries the design-vs-ADR override rule (don't port design averages).

### DESIGN RESTRUCTURE discovered (2026-07-02) — connection freshness + new average conflict
- **Freshness canary (Molly)**: pulled `templates/ua/UA Praxis - Read.dc.html`, it lacked the task-desc/votePoints update → Molly flagged staleness. ROOT CAUSE: templates/ is the DEPRECATED copy; canonical moved to `components/factions/` + contract JSONs. Re-listed, confirmed fresh (contract shows `votePoints` "ADDED 2026-07-02"). Template map re-pointed (top of file).
- **New praxis-card contract** (`praxis-card-contract.json`, authoritative): uniform payload `{ task, finding, author?, excerpt?, rating, marks, votePoints, points, level }`. `task` = "re: …" reference on every card. **`votePoints` (points earned from votes) ADDED today** — ADR-0014/#264-aligned (surfaces points-from-votes). Feeds #375 (the vote-reframe hero now has a canonical shape + votePoints).
- **🚩 AVERAGE CONFLICT (needs Molly decision)**: the fresh contract defines `rating` = **"the community's 1–5 vote AVERAGE (float) … drives the rating meter and the faction standing label … shown to one decimal (Ephemerists, Singularity)."** This DIRECTLY conflicts with Molly's "no averages" (prev msg) + ADR-0014/#264 (#378). The same update added votePoints (good) but KEPT the average as the meter/label driver. Design-vs-directive conflict on a surface Molly JUST updated → asked her how to reconcile (update design to drop avg / accept avg on the card / tier-from-distribution). **Do not build #375's hero until resolved** — its meter/label source depends on this.
- **UA reframe words CHANGED**: new contract `voteReframing.ua` = rough sketch · study · **fair hand · fine work** · masterwork (was accomplished/distinguished). #374 target updated via comment. New albescent reframe: unseeing · glimpsed · witnessed · verified · inscribed.
- **RE-AUDIT NEEDED against new source**: TaskCard/PraxisCard/EditPraxis rows were audited vs the STALE templates/ — re-verify the migrated 3 surfaces against `components/factions/` + contracts. (Task cards were judged faithful, but against old designs; the contracts may have added slots like votePoints the repo lacks.)

### ADR reconciliation (2026-07-02, Molly: "read ADRs; ADR breaks are issues too")
- **#375 ↔ ADR-0005 + #159 (CLOSED)**: the praxis placeholder is ADR-0005-documented interim; #159 landed the DATA (score/voter_count/level/date) but NOT the hero. Mechanism per ADR-0005 = compose existing `VoteUI` in a new read-only **summary mode** (don't hand-roll). Commented on #375.
- **#376 ↔ ADR-0016 (the law) + 0010 + 0023**: ADR-0016 mandates archetypes own only presentation over one contract — the neutral-content feed violates it; `FactionActivityCard` is the compliant target. Faction words = catalog copy (ADR-0010 `copy/en.ts`). Feed stays read-time projection (ADR-0023). Commented on #376.
- **#377 ↔ ADR-0018 REVERSAL**: ADR-0018 deliberately froze UA comment on orange/hardcoded ("rebrand out of scope"). Rebrand landed (#361) → Molly wants ADR-0018's UA clause explicitly reversed via a superseding ADR. #377 rewritten to that.
- **#374 ↔ ADR-0010/0016**: vote-tier labels are catalog copy (ADR-0010) keyed by faction (ADR-0016 slot #4). CHECK on build: should UA rung words live in `copy/en.ts` (via `t()`) rather than hardcoded in `voteReframes.ts`? If voteReframes hardcodes faction copy, that may itself be an ADR-0010 gap — flag for a future cell.
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

## ⚠️ CANONICAL SOURCE MOVED (2026-07-02) — templates/ is DEPRECATED
Molly is converting the designs into uniformly-named TS packages. **The canonical design source is now:**
- **`components/factions/<faction>/<Faction>{TaskCard,PraxisCard,EditPraxis}.{jsx,d.ts}`** + preview `<faction>.{card,praxis,editpraxis}.card.html` — per-faction packages. (7 factions incl. albescent.)
- **Root CONTRACT JSONs** = the authoritative slot spec (READ THESE FIRST per surface): `task-card-contract.json`, `praxis-card-contract.json`, `edit-praxis-contract.json`, `faction-contract.json`. Also `guidelines/*-contract.html`.
- DS-level components: `components/cards/Faction{TaskCard,PraxisCard,EditPraxis}.{jsx,prompt.md}`, `components/feed/FactionActivityCard`, `components/feedback/FactionCommentBox`/`FactionVoteStamps`.
- **`templates/<faction>/…` = STALE COPIES.** Do NOT audit against them (they lag — e.g. `templates/ua/UA Praxis - Read.dc.html` is missing the 2026-07-02 `votePoints`/task-ref update). Only surfaces NOT yet migrated to `components/factions/` (faction page, task detail, comment box, updates/feed, praxis-READ page) may still need templates/ as the least-bad reference — flag when you do.
- Migrated so far: **TaskCard, PraxisCard, EditPraxis** (all 7 factions). NOT yet migrated: faction page, task detail, praxis-READ page, comment box, updates.

## Cloud template map (reference files, per faction) — LEGACY templates/ paths, deprecated (see above)
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
| Task Detail    | ✅ | ▸ | ▸ | ▸ | ▸ | ▸ | 🔁 |
| Faction Page   | ✅ | ▸ | ▸ | ▸ | ▸ | ▸ | 🔁 |
| Praxis (read)  | ✅¢ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Praxis Card    | ⚠️→#375 | ⚠️→#375 | ⚠️→#375 | ⚠️→#375 | ⚠️→#375 | ⚠️→#375 | 🔁 |
| Edit Praxis    | ⚠️→#373 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 🔁 |
| Comment Box    | ⚠️→#377 | ✅ | ✅ | ✅ | ✅ | ✅ | 🔁 |
| Updates/Feed   | ⚠️→#376 | ⚠️→#376 | ⚠️→#376 | ⚠️→#376 | ⚠️→#376 | ⚠️→#376 | 🔁 |
| Vote           | ⚠️→#374 | ✅ | ✅ | ✅ | ✅ | ✅ | 🔁(#232) |
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

### Vote row — HEALTHY system; UA copy #374 + task-detail averages #378 (2026-07-02, Molly: "no averages; who voted how many; faction-specific methods")
- **Faction-specific vote methods: HEALTHY ✅** — all 6 archetypes real (UAVote/WowVote/SnideVote/EphemeristsVote/SingularityVote/EverymenVote, 101–134 ln), wired via `VoteUI` `pickVariant` (ua/wow/snide/ephemerists/singularity/everymen → their component, VoteStamps default), single-sourced reframe registry `voteReframes.ts` (#194). Reframe words match the design's FactionPraxisCard prompt (eph apocryphal→canonical, wow a-start→legendary, etc.) — EXCEPT ua (Noted/Sketch/Hung/Commended/Acquired vs design rough-sketch→masterwork) → #374.
- **"Who voted how many points": ALREADY BUILT ✅** — `PraxisVoterBreakdown` (`praxisDetail/shared.tsx:171`) renders a "Who voted" list: each voter (linked) + their value via `reframeLabel(task_faction_slug, value)` + count, fed by `/praxes/{id}/voters` (`api/votes.ts getVoters`). Rendered in all praxis-detail archetypes. The backend chain #192 (vote_tally, ADR-0014) / #185 (duels) / #195 (this UI) all CLOSED+shipped. The "reserved (#195)" archetype comments are STALE — slot is filled. (Minor: shows the reframed LABEL, not the raw point number — matches ADR-0014's faction-vocabulary intent.)
- **Averages STILL shown → #378 (ADR-0014 / #264 violation)**: `useTaskDetail.ts:229` computes `avgVoteNumber` (mean of submission scores); task-detail archetypes render "Avg Vote"/"AVG"/"Average Critique"/"avg love". #264 removed the backend `average_value` but missed this client-side task-level mean. Filed #378.
- **⚠️ DESIGN-vs-ADR OVERRIDE (cross-cutting, recorded in #378)**: cloud designs SHOW averages (UA task-detail "4.1 avg critique", praxis-read "avg 4.0"). **Do NOT port them** — ADR-0014 + #264 + Molly forbid vote averages. Where a design shows an avg, substitute votes/points/who-voted. The ADR wins over the design here. Applies to all design-fidelity fixes (esp. anything touching UA task-detail / praxis-read).

### Task Detail row — HEALTHY (content-first bespoke, not the disease); UA verified (2026-07-02)
- **Structure**: `taskDetail/archetypes/shared.tsx` is 43 ln of helpers only (relationOf, ErrorBanner) — NOT a shared content body. Each archetype is 674–877 ln of bespoke per-faction code. Content-first, like comment boxes → NOT the frames-only disease.
- **UA ✅ VERIFIED (not grep-guessed this time)**: `TaskDetailUA` matches cloud `UA Task Detail.dc.html` — gilt-plate hero (crest + Playfair title + "Ars Longa" motto ribbon + ANNO/HONORARIA/STANDING stat plates), Matriculate CTA, all 3 sections (The Commission / The Salon Wall / The Critique) + FINEST HAND crown. Header notes "every raw hex from the kit is mapped" to tokens. Composes `PraxisCard` (inherits #375) — that's #375's problem, not task-detail's.
- **Other 5 ▸**: signature-confirmed via grep (SNIDE ransom/tape/acid; Wow wow.exe/notepad/sparkle; Eph vellum/lapis/map/concord; Singularity terminal/scanline/protocol; Everymen cog/sunburst/union/seal). Content-first bespoke; full cloud-compare deferred.
- **Comments: NOT a gap (verified).** Archetype "The Critique" = read-only vote AGGREGATE; the discussion thread is rendered by the PAGE wrapper `TaskDetail.tsx:71` `<CommentThread target="tasks" .../>` (faction-voiced via COMMENT_COMPONENTS). Design puts comments inside the archetype's Critique; repo composes them page-level (ADR-0002 arrangement) — both present. Backend supports task comments (`/tasks/{id}/comments`, `Comment.task_id`, ADR-0006/#167). **Almost filed a phantom issue here — TaskDetail.tsx:71 resolved it.**

### Comment Box row — HEALTHY (not the frames-only disease), UA-lag exception → #377 (2026-07-02)
- **NOT the same disease.** All 7 `components/comments/voices/*` are genuine per-faction archetypes: bespoke type/labels/body, dispatched via `pickVariant` (`CommentThread.tsx`), styled in read + composer modes. Content carries faction identity. Good — the frames-only pattern (#375/#376) does NOT extend here.
- **Hex/token survey**: UAComment 7 hex / 0 tokens (worst); Albescent 3/0 (🔁 #232); Wow 3/9; Eph 1/9; Singularity 1/11; Everymen 0/7; Snide 0/12.
- **UAComment ⚠️→#377**: pre-gilt-salon (ADR-0018 comment-scoped orange, flat gold border — NOT `--ua-gilt`), all hardcoded hex. Out of date vs the current UA gilt-salon identity + CLAUDE.md hex rule. Same UA-rebrand-lag as #372/#373/#374. Filed #377 (reskin to `--ua-*` gilt frame).
- **Minor (noted in #377, not filed separately)**: residual hex in Wow(3)/Eph(1)/Singularity(1) — small `var(--*)` sweep, low priority.
- **PATTERN REFINED**: the frames-only disease hit the two surfaces where content was deferred behind a "placeholder/neutral body" (praxis #375, feed #376). Comment boxes were built content-first per faction, so they're healthy. Lesson: the disease is specifically where a SHARED content layer exists (PlaceholderPraxisBody / neutral FeedCard*), not everywhere.

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
