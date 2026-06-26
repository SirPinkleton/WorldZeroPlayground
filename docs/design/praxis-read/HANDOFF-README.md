# Handoff: Faction Praxis Read Pages (World Zero)

## Overview
This bundle is seven "completed praxis" **read pages** for World Zero — a real-world quest game — one per faction. A *praxis* is a filed, completed piece of work that members review by awarding **points** and casting a **1–5 vote**; each page also shows a **backer ledger** (who staked/voted, per ADR-0005). Every page wears its faction's own physical archetype (sticky note, terminal printout, ransom dispatch, illuminated codex, union poster, desktop window, vellum letter), but they all express the same underlying data model.

An index page (`All Faction Praxis Pages.dc.html`) links to all seven in rainbow order.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing the intended look and behavior, **not production code to copy directly**. The task is to **recreate these designs in the target codebase's existing environment** (React, Vue, SwiftUI, native, etc.) using its established patterns, component library, and styling conventions. If no environment exists yet, choose the most appropriate framework for the project and implement the designs there.

These prototypes are authored as "Design Components" (`.dc.html` / `.jsx` mounted through a small runtime in `support.js`). That runtime is a *prototyping* harness — **do not port it**. Read the markup and styles for intent; rebuild with your own components.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, layout, and interactions are all intended as drawn. Recreate the UI faithfully, mapping exact token values (below) onto your codebase's design-token system. The one liberty: per-faction display fonts are loaded from the design system — substitute equivalents only if a font is unavailable.

## The data model (shared across all seven pages)
Every praxis page renders the same conceptual record; only the skin changes.

- **Praxis** — title, body/description, author, faction, status (here: completed / sealed / filed), timestamp.
- **Points** — a numeric score the praxis has earned.
- **Vote (1–5)** — an aggregate rating, displayed as 5 stamps/rungs. Each faction *reframes the label* of the scale (e.g. Singularity = consensus signal, S.N.I.D.E. = "marked by the mob", Albescent = "bear witness", UA = a 1–5 critique) but the underlying value is always an integer 1–5.
- **Backer ledger (ADR-0005)** — a list of members who backed/voted on the praxis: name, the points/stake they put up, and their individual vote. Rendered as a small feed/table styled per faction.
- **Comments/thread** — faction-styled discussion posts with @mentions.

When implementing, model this once (a `Praxis` entity + `Vote` + `Backer` + `Comment`) and theme the presentation per faction — do **not** build seven unrelated data models.

## Screens / Views
All seven share the structure: **masthead/header → praxis body → points & vote rating → backer ledger → comment thread**, restyled per faction. Faction primary hex values are in Design Tokens below.

1. **The Everymen** — `factions/everymen/Everymen Praxis.html` (red `#c1272d`). Union / victory-poster "work report". Bebas Neue display. Also includes an **edit** variant: `Everymen Edit Praxis.html`.
2. **UA · University of Asthmatics** — `factions/ua/UA Praxis - Read.dc.html` (burnt-orange `#c2541f`). Gilt art-salon "exhibited acquisition"; IM Fell English. Rating is a 1–5 *Critique*.
3. **The Ephemerists** — `factions/ephemerists/Ephemerists Completed Praxis.html` (teal `#1d6e72`, gold leaf `#d8c187`). Illuminated codex / vellum "sealed ephemeris leaf"; Cinzel.
4. **S.N.I.D.E.** — `factions/snide/SNIDE Praxis Detail.html` (green `#16a34a`, always-dark dispatch). Ransom / photocopier cut-out "confession marked by the mob"; Anton + cut-letter treatment.
5. **Singularity** — `factions/singularity/Singularity Completed Praxis.html` (blue `#2563eb`, **always dark**, phosphor green text `#4ade80` on `#050f08`). Terminal printout "sealed praxis log"; Share Tech Mono. Includes a Cast-Signal consensus vote.
6. **Warriors of Whimsy** — `factions/wow/Warriors of Whimsy Praxis.html` (magenta `#be185d`). whimsy.exe pink desktop window; Caveat. Rating uses hearts.
7. **Albescent** — `factions/albescent/Albescent Completed Praxis.html` (near-black ink `#1c1c1a`, **always light**). Vellum correspondence; Cormorant Garamond italic. Rating is "bear witness". Sits outside the rainbow (unranked secret society).

### Layout specifics (index page)
`All Faction Praxis Pages.dc.html`: centered column, `max-width:820px`, `padding:60px 28px 90px`. Eyebrow row of 7 color chips (14×5px) + "World Zero · Praxis Review" (9px, `letter-spacing:0.26em`, uppercase). H1 "Faction Praxis Pages" in the display face, italic 600, 42px. A 160×4px rainbow gradient rule. Then a vertical stack (`gap:12px`) of faction link rows: each is a flex row with a 6px faction-color spine, title (21px/700), one-line description (11px), and an "Open →" affordance; hover translates the row 3px right and drops a 4px hard offset shadow in the faction color.

## Interactions & Behavior
- **Vote stamps (1–5):** the filled count reflects the aggregate; per-faction visual treatment (ink stamps, terminal blocks, hearts, witness marks). If interactive, hovering a rung previews that score; clicking sets the viewer's vote.
- **Backer ledger:** static list/feed in the prototypes; in production, populate from the praxis's backer records.
- **Index hover:** row shifts `translateX(3px)` + hard offset box-shadow in faction color; `transition: transform/box-shadow/border-color 120ms`.
- **Theme:** the design system supports light + dark via `[data-theme="dark"]`. Singularity is always-dark and Albescent is always-light regardless of theme; the other five follow the theme.

## State Management
- `praxis` record (title, body, author, status, points, voteAverage, voteCount).
- `backers[]` (name, stake/points, vote).
- `comments[]` (author, body with @mentions, timestamp).
- Viewer's own vote (optional, if voting is interactive) and points staked.
- Active theme (light/dark) — except the two fixed-theme factions.

## Design Tokens
All values come from the **World Zero Design System** (`_ds/world-zero-design-system-019e221c-7853-7530-a934-7d3b2b7c8b43/`). The real source of truth is `tokens/colors.css`, `tokens/typography.css`, `tokens/fonts.css`, `tokens/spacing.css`, `tokens/patterns.css`. Map these into your own token system.

### Faction primary colors (light → dark)
- UA (purple): `#7c3aed` → `#a78bfa`
- Warriors of Whimsy / `gestalt` (magenta): `#be185d` → `#f472b6`
- S.N.I.D.E. (green): `#16a34a` → `#4ade80`
- Ephemerists (teal): `#1d6e72` → `#3aa0a4`  (gold leaf accent `#d8c187`)
- Singularity (blue): `#2563eb` → `#60a5fa`
- Everymen (red): `#c1272d` → `#ef5350`
- Albescent (ink): `#1c1c1a` (both themes)
- UA salon orange used on the index/UA skin: `#c2541f`

Each faction also has `-light` (8–10% tint), `-border` (~0.3 alpha), and a `--faction-<slug>-card-{bg,text,accent,muted,font}` contract — see `tokens/colors.css` (lines ~50–210 light, ~288–390 dark). Note the registry slug for Warriors of Whimsy is **`gestalt`** in CSS variables.

### Card surface highlights
- Singularity card: bg `#050f08`, text/accent `#4ade80`, chrome blue `#60a5fa`.
- S.N.I.D.E. card: dark ink bg (`--snide-ink`), paper text (`--snide-paper`), acid accent (`--snide-acid`).
- Ephemerists card: vellum bg (`--eph-vellum`), rubric accent (`--eph-rubric`).
- Everymen card: paper bg (`--everymen-paper`), red accent (`--everymen-red`).
- UA card: faded lavender `#f3eefc`, text `#1a1209`, accent `#7c3aed`.
- Albescent card: white surface (`--al-surface`) in both themes, ink text/accent.

### Typography (per-faction display faces)
IM Fell English (UA), Caveat (WoW), Anton (S.N.I.D.E.), Cinzel (Ephemerists), Share Tech Mono (Singularity), Bebas Neue (Everymen), Cormorant Garamond (Albescent). Body/app type and the type scale are in `tokens/typography.css`. Working type sizes are small by design (8–14px field-journal scale); the index uses 9–42px.

### Spacing / radius / shadow
Use `tokens/spacing.css`. Hard offset shadows (e.g. `-4px 4px 0 <faction-color>`) and 1px strong borders are the dominant card treatment; corners are mostly square. Don't introduce soft drop shadows or large radii unless the faction skin already uses them.

## Design System Components
The prototypes compose these shared components (source in `_ds/.../components/`, also mirrored in the full DS project). Recreate equivalents in your codebase:
- **FactionPraxisCard** — the filed-praxis card (one archetype per faction).
- **FactionTaskCard** — the signature task card (seven archetypes).
- **FactionVoteStamps** — the 1–5 stamp rating; `faction` prop reframes the rung labels.
- **FactionCommentBox** — one thread-post style per faction, auto-styles @mentions.
- **FactionPennant** / **FilterStamp** / **LevelNodes** — filters/banners.
- **Button**, **LevelPill**, **PageTitle**, **WatercolorBackground** — core chrome.
- **factions.js** registry — `FACTIONS`, `FACTION_ORDER`, `factionCssVar(slug, key)`, `SLUG_ALIAS` (`journeymen → ephemerists`, etc.). Use this as the canonical faction list.

## Assets
- All fonts load from the design system's `tokens/fonts.css` (Google Fonts families listed above). No bespoke image assets are required by the praxis pages themselves; faction textures are CSS/`tokens/patterns.css`.
- `uploads/pasted-1782403867955-0.png` is a reference screenshot only, not a shipped asset.

## Files
Index: `All Faction Praxis Pages.dc.html`
Shared prototype logic: `factions/praxis-core.jsx`, `support.js`
Per faction (under `factions/<slug>/`):
- everymen: `Everymen Praxis.html`, `Everymen Edit Praxis.html`, `everymen-cards.jsx`, `everymen-praxis.jsx`, `everymen.css`
- ua: `UA Praxis - Read.dc.html`, `image-slot.js`, `support.js`
- ephemerists: `Ephemerists Completed Praxis.html`, `ephemerists-cards.jsx`, `ephemerists-praxis-read.jsx`, `ephemerists-updates.jsx`, `ephemerists.css`
- snide: `SNIDE Praxis Detail.html`, `snide-cards.jsx`, `snide-faction.jsx`, `snide-praxis-detail.jsx`, `snide.css`
- singularity: `Singularity Completed Praxis.html`, `singularity-cards.jsx`, `singularity-praxis.jsx`, `singularity.css`
- wow: `Warriors of Whimsy Praxis.html`, `whimsy-exe.jsx`, `whimsy-kit.jsx`
- albescent: `Albescent Completed Praxis.html`, `albescent-cards.jsx`, `albescent-faction.jsx`, `albescent-praxis.jsx`, `albescent.css`

Design system (tokens + components): `_ds/world-zero-design-system-019e221c-7853-7530-a934-7d3b2b7c8b43/`

> Note: to open these prototypes in a browser locally, serve the project root with a static server (e.g. `npx serve`) so the relative `_ds/` and `support.js` paths resolve. The `.dc.html` files require `support.js` to be present at the project root.
