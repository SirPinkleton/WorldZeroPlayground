# World Zero — Faction Task Detail pages (React)

Seven task-detail page components, one per faction. Each wears that faction's
physical archetype (gilt salon, whimsy.exe window, ransom dossier, discordant
map, terminal printout, union poster, vellum letter) and shares one anatomy:

```
hero  →  CTA bar  →  task body (proposer's copy)  →  praxis completions  →  discussion
```

The highest-rated praxis on each page is flagged with a fleur-de-lis (⚜) badge.

## Files

| File | Faction | Archetype |
|---|---|---|
| `UATaskDetail.tsx` | UA | Gilt salon |
| `WhimsyTaskDetail.tsx` | Warriors of Whimsy | whimsy.exe desktop |
| `SnideTaskDetail.tsx` | S.N.I.D.E. | Ransom dispatch |
| `EphemeristsTaskDetail.tsx` | The Ephemerists | Discordant map |
| `SingularityTaskDetail.tsx` | Singularity | Terminal printout |
| `EverymenTaskDetail.tsx` | The Everymen | Union poster |
| `AlbescentTaskDetail.tsx` | Albescent | Vellum correspondence |

`types.ts` holds the shared prop types; `index.ts` re-exports everything.

## Dependencies

These components compose the World Zero **design system** faction components:

```ts
import {
  FactionTaskCard,
  FactionPraxisCard,
  FactionVoteStamps,
  FactionCommentBox,
} from "@world-zero/design-system";
```

Adjust that import specifier to wherever the design system lives in your repo
(in the source project they sit at `components/cards/…` and `components/feedback/…`).
The design-system **tokens + fonts** stylesheet must be loaded once at the app
root (it defines every `--faction-*`, `--eph-*`, `--snide-*`, … custom property
and the Google-font `@import`s these pages reference):

```ts
import "@world-zero/design-system/styles.css";
```

## Usage

Every page ships with built-in demo content, so it renders standalone:

```tsx
import { UATaskDetail } from "./react";

<UATaskDetail />
```

…or drive it from your own data — all content is overridable via props:

```tsx
<UATaskDetail
  task={{ title: "Paint the Quad at Golden Hour", no: "0317", points: 40, level: 3 }}
  praxis={myPraxisEntries}
  comments={myComments}
  onSignUp={() => attemptTask(taskId)}
/>
```

## Notes

- Styling is inline (`style={{…}}`) to match the design-system convention, plus a
  small co-located `<style>` block per page for the few rules inline styles can't
  express (`:hover`, prose `p`/`ul` inside the body box). Move those into a CSS
  module if your codebase prefers.
- `SingularityTaskDetail` forces `data-theme="dark"` on mount (the terminal
  archetype is always-dark); it restores the prior value on unmount.
- Avatars are generated as inline SVG data-URIs so the demo has no image deps.
  Pass real `avatar` URLs through the `comments` prop in production.
