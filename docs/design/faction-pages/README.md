# Handoff: World Zero — Faction Pages

> **Status — already implemented.** This bundle was built into the app and merged in
> **PR #359** (six faction skins via `FACTION_BODIES`). It is vendored here as the
> design source of record, not as pending work.
>
> **Exception — Albescent.** The Albescent skin is *not* live yet: it waits on the
> `albescent → ua` alias removal (`pickVariant` resolves the alias to UA before any
> Albescent-specific frame can be reached). Until that alias drops, the Albescent
> `html_reference/Albescent Faction Page.html` and `react/src/factions/AlbescentFactionPage.tsx`
> here are its **future spec**, not a shipped surface.

## Overview

Seven **faction pages** for World Zero (the real-world quest game). Each faction — UA, Warriors of Whimsy, S.N.I.D.E., The Ephemerists, Singularity, The Everymen, and Albescent — has its own page, but they are **not seven different screens**. They are **one screen rendered seven ways**.

The whole point of this project ("faction page standardization") is the architecture:

> **One faction-agnostic data contract → seven visual "skins".**

The backend returns the same JSON shape for every faction. A single `slug` field selects which skin renders it. Every skin lays out the same six sections, in the same order. Only the *costume* changes — gilt frames, a terminal, a union poster, an illuminated codex, a cork memo board, a ransom note, a sheet of vellum.

## About the design files

This bundle contains **two representations of the same designs**:

1. **`react/`** — a real, typed **React + TypeScript** implementation you can build on. This is the primary handoff.
2. **`html_reference/`** — the original **HTML design prototypes** (one self-contained file per faction). These are the **pixel source of truth**. They are *design references*, not production code — use them to check exact spacing, colour, and treatment.

The task is to bring these designs into your target codebase using its own conventions (component library, styling system, routing, data layer). The React files are structured to make that straightforward, but they are a **reference implementation** — you are expected to adapt them (see "Styling" below), not necessarily ship them verbatim.

## Fidelity

**High-fidelity.** These are final visual designs — real colours, type, spacing, and interactions. Recreate them precisely. Where the React and the HTML disagree, **the HTML in `html_reference/` wins** (it was authored first, by hand, at full fidelity).

---

## Architecture — the one thing to understand

```
          ┌─────────────────────────────┐
          │  FactionContract (one shape) │   ← backend returns this, per faction
          └──────────────┬──────────────┘
                         │ data.slug
          ┌──────────────▼──────────────┐
          │        <FactionPage>         │   ← switch on slug
          └──────────────┬──────────────┘
   ┌─────────┬─────────┬─┴───────┬─────────┬──────────┬──────────┐
  UA        Whimsy    SNIDE   Ephemerists Singularity Everymen  Albescent
 (skins — same data in, same six sections out, totally different costume)
```

Every skin renders the **same six sections in the same locked order**:

1. **Hero + stats** — identity (name, motto, blurb) and the four canonical stats
2. **About** — the manifesto paragraphs
3. **Join / eligibility** — the viewer block (member / join / gate)
4. **Tasks** — open-task cards (the section is always titled **"Tasks"**)
5. **Praxis** — recent completed-work feed (always titled **"Praxis"**)
6. **Members** — one spotlight member + the roster

### Conventions locked during standardization (apply to *every* faction)

- **Section names are always "Tasks" and "Praxis"** — the shared site vocabulary. Flavor kickers ("Now mobilizing", "From the Salon") may sit *above* the heading, but the heading word itself is fixed.
- **Stats live on the side** of the hero (a side column / ledger panel), never as a full-width band.
- **The join gate is soft.** When a prospective viewer isn't eligible, the page shows an *encouraging* "keep doing tasks" message — **no exact join formula, no progress bar**. (`requirement.have/needed/unit` remain in the contract for factions that want a quantified gate, but the standardized pages ignore them.)
- **One sigil per hero** — no faded watermark crest *behind* a framed crest, etc.
- **The FDL (Faction Distinction Laurel)** is the single cross-faction high-score mark: a rainbow conic-gradient medallion on the **top-scoring praxis only**. Every faction uses the same laurel, recoloured to sit on its own paper (Albescent renders it monochrome — the order refuses colour).

---

## The data contract

Full TypeScript in `react/src/types.ts`; canonical JSON in the project root at `faction-contract.json`. Shape:

```ts
interface FactionContract {
  slug: "ua" | "wow" | "snide" | "ephemerists" | "singularity" | "everymen" | "albescent";
  name: string;
  archetype: string;                 // one of the seven physical archetypes
  established: number;

  identity: { motto: string; blurb: string; about: string[] };

  stats: {                           // ① the four canonical hero stats
    memberCount: number;
    seasonRank: number | null;       // null = unranked (Albescent)
    praxisFiled: number;
    pointsAwarded: number;
  };

  viewer: {                          // ③ drives the join/leave/gate block
    state: "prospective" | "member";
    eligible: boolean;
    role: string | null;             // populated when state === "member"
    requirement: { summary: string; detail: string;
                   have?: number; needed?: number; unit?: string };
  };

  openTasks:    { id; title; description; level; points }[];         // ④
  recentPraxis: { id; author; taskTitle; finding; synopsis?;         // ⑤
                  points; endorsements; sealedAt }[];
  members:      { id; name; role; level; points; isSpotlight }[];    // ⑥
}
```

### How the join block resolves (identical for all seven)

| viewer.state | eligible | Renders |
|---|---|---|
| `member` | — | standing (`role`) + a Leave affordance |
| `prospective` | `true` | the prominent **Join** CTA |
| `prospective` | `false` | the soft `requirement` **gate** (encouraging copy only) |

This logic is the reusable core: `react/src/lib/useFactionMembership.ts`. `viewer.state` is the server truth; local Join/Leave clicks optimistically override it until the server value changes.

### Client-derived, never stored

Everything decorative is derived **client-side from `slug`** and is never in the payload: sigils/charms/stamps, fonts, colours, section chrome, the spotlight treatment, and small presentational sequences (SNIDE dispatch numbers, UA/Ephemerists Roman numerals, Singularity protocol IDs & sprockets, Albescent duty numerals, WoW pins/tapes/charms). The backend stays clean: same JSON for every faction, one skin per archetype.

---

## The React package (`react/`)

```
react/
  index.html                  demo entry (Vite)
  package.json                React 18 + Vite + TS
  tsconfig.json  vite.config.ts
  src/
    types.ts                  the FactionContract + supporting types
    FactionPage.tsx           slug → skin router (the entry point)
    index.ts                  public barrel export
    Demo.tsx / main.tsx       runnable harness: faction switcher + viewer-state toggles
    lib/
      css.ts                  css("padding:12px…") → React style object  (see "Styling")
      format.ts               fmt, kfmt, roman, splitLast, initialOf
      useFactionMembership.ts the join/leave/gate state machine (shared)
      useHead.ts              injects each skin's Google-font <link> + @keyframes
      FdlLaurel.tsx           the shared Faction Distinction Laurel + topPraxisIndex()
    data/
      ua.ts wow.ts snide.ts ephemerists.ts singularity.ts everymen.ts albescent.ts
      index.ts                ALL_FACTIONS, FACTION_ORDER
    factions/
      UaFactionPage.tsx  WowFactionPage.tsx  SnideFactionPage.tsx
      EphemeristsFactionPage.tsx  SingularityFactionPage.tsx
      EverymenFactionPage.tsx  AlbescentFactionPage.tsx
```

### Run it

```bash
cd react
npm install
npm run dev      # opens the demo: pick a faction + toggle gate / join / member
```

### Use it

```tsx
import { FactionPage } from "world-zero-faction-pages";

function Page({ data }) {        // data: FactionContract from your API
  return <FactionPage data={data} />;
}
```

Or mount a single skin directly: `import { SingularityFactionPage } from "…"`.

### Styling — please read

The skins were transcribed from the HTML mocks using a small helper, **`css()`**, which turns the exact inline-style strings from the prototypes into React style objects (`style={css("padding:12px;color:#c2541f")}`). This was a deliberate **fidelity bridge**: it keeps the React output pixel-identical to the HTML source and easy to diff against it.

It is **not meant to be the final house style.** When you integrate, migrate these to whatever your codebase uses — CSS Modules, Tailwind, styled-components, vanilla-extract, etc. The values you need (hex, spacing, type) are all right there in the strings. `css()` is memoised, but inline styles won't get you pseudo-selectors or media queries — another reason to move them into your system.

Two things `css()` can't carry, handled explicitly:

- **Fonts + keyframes** are injected per-skin via `useHead()` (Google Fonts `<link>` + `@keyframes`). In your app, hoist the font loading into your document head / build pipeline.
- **`data-theme="dark"`** is set on the root of the two always-dark skins (Singularity, S.N.I.D.E.). The always-light skins (UA, Albescent) never dim.

---

## The seven skins — design tokens

Working type scale is small (8–14px body is normal for this product). Each skin's exact values live in its `.tsx` and its `html_reference/` file; the essentials:

### UA — gilt salon (always light)
- **Palette**: burnt amber `#c2541f`, gilt gradient `#eec06a→#9c6a1a→#f0c878→#dd9322`, parchment `#fdf6ea`/`#ece4d2`, ink `#3d2410`, gold line `#cdab63`.
- **Type**: Playfair Display (italic display), Marcellus SC (labels), EB Garamond (body), Courier Prime (meta).
- **Signature**: crossed-brushes heraldic crest; gilt-framed commission placards; Critique marks (accomplished/distinguished/masterwork); levels as `Anno {roman}`.

### Warriors of Whimsy — whimsy.exe (light)
- **Palette**: magenta `#a83a6e`/`#ec5f99`/`#d23b7e`, cork pink `#eeb4ce`, charm accents gold `#f6c75e` / mint `#86cfa6` / lilac `#b79ad8`, paper `#fffdfa`.
- **Type**: Caveat (script — stands in for the brand's Caveat/hand face), Quicksand (rounded body).
- **Signature**: cork memo board; pinned `.exe` windows; taped index cards & polaroids; sticker charms (heart/star/mushroom/rainbow/sparkle/app); pushpins & washi tape.

### S.N.I.D.E. — ransom dispatch (always dark)
- **Palette**: acid green `#b6ff2e`, hot pink `#ff2d8b`, photocopier ink `#14110b`, newsprint `#f4f1e8`, tape `rgba(228,214,120,.62)`.
- **Type**: Anton, Bebas Neue, Archivo Black, Permanent Marker, Special Elite, Courier Prime.
- **Signature**: cut-out **ransom-letter** task titles (mixed fonts/rotations/highlights per glyph — see `RansomText`); sprayed "S✗" sigil; halftone dots; "WANTED" spotlight; dashed "rap sheet".

### The Ephemerists — the discordant map (light)
- **Palette**: lapis `#1d4f6e`/`#143b54`, gold leaf `#b0863a`/`#d4ab55`, rubric red `#9c3622`, vellum `#efe4c8`/`#e4d8ba`, iron-gall ink `#2a1d12`.
- **Type**: Cinzel (display), EB Garamond (body), Cormorant Garamond (italic asides).
- **Signature**: the "contested field" task card — three disagreeing coordinate grids (linear survey + red polar + gold rays) over one twinkling gold point; watching-eye seal; levels/points as Roman numerals ("pvncta"); concordance marks.

### Singularity — terminal printout (always dark)
- **Palette**: phosphor green `#4ade80`/`#86efac`, signal blue `#2563eb`/`#60a5fa`, amber `#fbbf24`, void `#07090c`/`#050f08`.
- **Type**: Share Tech Mono (everything), Lora italic (only the shared World Zero wordmark).
- **Signature**: boot-sequence hero; rotating node sigil; sprocketed "protocol" cards with a blinking cursor and blue last-word; scanlines + periodic scan sweep; oscilloscope waveform; sealed-output praxis with signal IDs.

### The Everymen — union / victory poster (light)
- **Palette**: propaganda red `#c1272d`/`#8d1c20`, gold `#d99a2b`, press ink `#221a12`, poster cream `#f4ecd6`/`#ece1c6`.
- **Type**: Bebas Neue (mastheads), Courier Prime (body), Lora italic (wordmark).
- **Signature**: hard-offset poster shadow `8px 10px 0`; cog sigil; sunburst screen-print (`repeating-conic-gradient`); LVL/PTS split bar; rubber-stamp point seal; side "ledger" stat panel; "standard-bearer" spotlight.

### Albescent — vellum correspondence (always light)
- **Palette**: **no colour** — pure white `#fff`, warm paper `#edece8`, near-black ink `#1c1c1a`, hairline `rgba(0,0,0,.09)`, muted inks via `rgba(28,28,26,…)`.
- **Type**: Cormorant Garamond (light italic display + body), Courier Prime (uppercase micro-labels).
- **Signature**: quiet correspondence; surveyor's cross-hair sigil (a gentle "breathe" pulse); hairline dividers; "acknowledge" text affordance instead of buttons; duty Roman numerals; witness marks (Witnessed/Verified/Inscribed); **the FDL rendered monochrome**; `seasonRank` shows `—` (unranked by design).

---

## Interactions & behavior

- **Viewer / membership** — three states as tabled above. Join/Leave optimistically flip local state (`useFactionMembership`). Wire these to your real join/leave mutations.
- **Task filter** — each Tasks section has an "All / Open to me" toggle (local `useState`). It's presentational scaffolding here; wire it to real task filtering.
- **FDL** — computed, not stored: `topPraxisIndex(points[])` returns the index of the single highest-scoring praxis; only that card gets the laurel.
- **Animations** (via `useHead` keyframes): Singularity — node spin (120s), sigil pulse, blinking cursor, scan sweep; Ephemerists — the gold point's `eph-twinkle`; Albescent — the sigil's `al-breathe`. All are ambient/decorative.
- **Hover/press states** were minimal in the mocks and were intentionally left for your styling system to own.
- **Responsive** — the mocks are desktop-first at ~1120–1160px content width with a `1fr / ~320px` two-column grid. Collapse to a single column on narrow viewports in your implementation.

## State management

Minimal and local by design:
- `useFactionMembership(viewer)` → `{ isMember, showJoin, showGate, join, leave }`.
- One `useState` per page for the task filter.
- No data fetching in the components — they are pure functions of the `FactionContract` prop. Fetch upstream and pass `data` down.

## Assets

No external image assets. Every mark (crest, cog, sigil, eye, cross-hair, charms, laurel) is **inline SVG** inside its component. Fonts are **Google Fonts**, loaded per-skin by `useHead`. If your build vendors fonts, replace those links.

## Files

- `react/src/**` — the TypeScript implementation (see tree above).
- `html_reference/*.html` — the seven original prototypes (self-contained; open directly in a browser):
  `UA Faction Page.html`, `Warriors of Whimsy Faction Page.html`, `SNIDE Faction Page.html`, `Ephemerists Faction Page.html`, `Singularity Faction Page.html`, `Everymen Faction Page.html`, `Albescent Faction Page.html`.
- `faction-contract.json` (project root) — the annotated canonical contract.

> Note on the HTML references: they were authored as "Design Components" and each also contains a small **schema / section-spine explainer panel** at the bottom. That panel is documentation scaffolding from the design phase — it is **not** part of the product UI and should not be recreated. The product surface is sections ①–⑥ only.
