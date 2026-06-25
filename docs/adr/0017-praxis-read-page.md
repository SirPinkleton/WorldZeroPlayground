# The praxis read page is a per-faction archetype surface with an interactive vote caster

ADR-0005 enriched the praxis **card** (the register-row, list view) and explicitly
deferred the **Praxis Read** page — `/praxes/:id`, one sealed praxis in full: account
body, evidence specimens, the **interactive** vote caster, and the full slot set. This
ADR settles that page.

The scaffolding already exists: `pages/PraxisDetail.tsx` is a hook + dispatcher +
`DefaultPraxisDetail` surface (mirrors TaskDetail / EditPraxis, per ADR-0002).
`ARCHETYPE_BY_SLUG` is empty, so every faction currently renders the Default layout.

## Decisions

### 1. Per-faction archetype seam — explicit, separate, generic-until-designed

The read page is a task-scoped surface (it themes to `praxis.task_faction_slug`), so it
gets a bespoke archetype per faction like every other surface. Rather than build all of
them at once, the seam is set up so each faction can be swapped in independently with a
one-line change:

- **`EphemeristsPraxisDetail` is built for real** — it is the only faction with a
  complete, pixel-level read-page canon (`ephemerists-praxis-read.jsx`). Registered in
  `ARCHETYPE_BY_SLUG['ephemerists']`.
- **Every other faction points at `DefaultPraxisDetail` (the generic page)** until its
  own read-page design lands. Swapping one in = add an archetype file + one map row.
- **A design-status table tracks the gap** (below) so it is always visible which factions
  still need a designed read page + a built archetype. SNIDE and Singularity have
  *Completed-Praxis card* kits but not full read-page designs yet — they are gaps, not
  builds.

This is the same staged move ADR-0005 made for the card (one shared enriched body now,
bespoke per-faction designs tracked as follow-ups).

## Design / build status (the gap tracker)

| Faction | Read-page design exists? | Archetype built? | Notes |
|---|---|---|---|
| ephemerists | ✅ `ephemerists-praxis-read.jsx` | ▶ this issue | the reference build |
| snide | ⚠ card kit only | ❌ → Default | needs full read-page design |
| singularity | ⚠ card kit only | ❌ → Default | needs full read-page design; no `VoteUI` variant yet either |
| everymen | ❌ | ❌ → Default | extrapolate from slot model |
| wow | ❌ | ❌ → Default | extrapolate from slot model |
| ua (+ albescent/aged_out aliases) | ❌ | ❌ → Default | extrapolate from slot model |

### 2. A shared slot module owns the behavior slots; archetypes own presentation

Mirror the card: `pages/praxisDetail/shared.tsx` holds the faction-agnostic,
behavior-bearing slots that every archetype MUST render identically and may never
re-implement per faction:

- admin moderation bar
- withdrawn / failed banners
- owner actions (edit / withdraw / resubmit)
- flag block

The archetype owns only the **presentational** slots (masthead, finding headline,
account body, evidence, vote caster). The content-slot invariant (ADR-0002, guarded by
#151) extends to the read page.

**The invariant slot set** every read archetype surfaces, regardless of faction skin:

1. **Identity/status** — title/finding, task link ("re:"), grade/level, solo-vs-collab
   mode, sealed date, moderation status
2. **Author byline** — avatar + display name + link, themed to the *author's* faction
   (actor-scoped, per CONTEXT.md)
3. **Account body** — the full `body_text` (markdown)
4. **Evidence** — the media specimens
5. **Vote caster** — interactive `VoteUI` + rating summary/distribution
6. **Points earned** — vote-weighted score
7. **Behavior slots** (shared module) — admin bar, banners, owner actions, flag block

### 3. The score readout is the point economy, not a rating distribution

The voting section shows **task points + vote total**, not a per-tier rating histogram:

- **Points from the task** — `task_point_value` (the base the task is worth; already on `PraxisOut`).
- **Total from votes** — the vote contribution already surfaced today as the
  "points earned from votes" number (`votes.total_score`).
- These sum to the praxis `score`
  (`(task_point_value + meta) × multipliers + total_stars`, per `scoring.py`).

Explicitly rejected: a `star_distribution` / `ConcordMeter` histogram. It would need a new
backend aggregation and it is not the story this page tells — the page is about *points
earned*, not *how the rating is spread*. The faction reframe ramp still appears as the
**interactive caster** (`<VoteUI>` in cast mode); it just isn't rendered as a distribution.

**Backend impact: none for scoring** — both numbers already exist on `PraxisOut` /
`VoteSummary`.

### 4. Evidence reuses `MediaGallery`; archetype owns only the framing

The evidence slot wraps the existing shared `<MediaGallery>` — it already resolves
file paths and renders image / video / audio, and is never re-implemented per faction.
The archetype owns only the **framing** around it (the "The evidence · N specimens"
section header, faction ornament like the foxing border).

- The canon's `minmax(150px,1fr)` grid (vs MediaGallery's single column) is a layout
  nicety — add an optional `layout?: 'column' | 'grid'` prop to MediaGallery *only when
  the Ephemerists build needs it*, not pre-emptively.
- **Per-item captions deferred** — `media_items` has no caption column; the canon's
  specimen captions are design filler. Adding them is a schema change. Tracked as a gap,
  not built now.

### 5. Comments: reserve a marked slot only — designed and built separately

A comment system is a real, wanted feature but is **out of scope for this page** and is
being designed/built in a separate workstream. The read page only reserves the seam:

- A `{/* Comments slot — actor-scoped surface, see CONTEXT.md; built separately */}`
  marker at the bottom of the invariant layout, so comments drop into a known location
  with no re-layout.
- No comment model, endpoints, or UI are built here.

(Known direction for the separate workstream, from this session: comments will attach to
both **praxes and tasks**; the data-model choice — dual nullable FKs + CHECK vs polymorphic
target — is being settled there, not here.)

### 6. Data `PraxisOut` needs beyond the card

Scoring needs nothing new (decision 3). The remaining slots need three fields on
`PraxisOut`:

- **`task_level_required`** — grade/level slot. `praxis.task` is already joined in
  `build_praxis_out` (it already reads `praxis.task.point_value`), so this is trivial.
  Mirrors the field #159 adds to `PraxisCardOut`.
- **`submitted_at`** — sealed-date slot. The **column + transition** are added by #159
  (chosen over `created_at`/`updated_at`); this page just also exposes it on `PraxisOut`.
- **`created_by_faction_slug`** — the praxis author's *member* faction, for the
  **actor-scoped byline** (the byline themes to the author's own faction, not the task's).
  Net-new: needs an author-character → faction join in `build_praxis_out`. The Default
  page currently themes the byline generically (`factionCssVar(null, …)`); actor-scoped
  theming is what this adds.

Everything else the invariant set needs is already on `PraxisOut` (`type` for
solo-vs-collab, `body_text`, `media_items`, `moderation_status`, `is_withdrawn`,
`can_flag`, `task_title`/`task_id`, `created_by_*`).

## Status / tracking

- **Implementation:** GitHub #163.
- **Depends on #159** for the `submitted_at` column + transition and the `VoteUI`
  caster/summary refactor.
- **Comments** are a separate workstream (decision 5).
- **Read-page designs still missing** (gap tracker above): SNIDE, Singularity, Everymen,
  WoW, UA — each becomes its own archetype + issue when its design lands. Singularity also
  lacks a `VoteUI` variant.
- **MediaGallery `layout` prop** is added only if the Ephemerists build needs the grid.

## Refs

- Builds on ADR-0002 (page = composition of surfaces) and ADR-0005 (praxis card content model).
- Depends on GitHub #159 (vote-reframe caster/summary + `submitted_at` + grade data).
- Reference design: `ephemerists-praxis-read.jsx` (PraxisRead, ConcordMeter, MarkCaster, Specimen).
