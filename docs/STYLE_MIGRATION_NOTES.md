# Style Migration Notes — Phase 2+

Reference: `WORLD_ZERO_STYLE.md` (root of repo)

## What Phase 1 completed
- CSS custom properties for all colors (`:root` + `[data-theme="dark"]`)
- New fonts: Lora, Courier Prime, Special Elite, Share Tech Mono, Bebas Neue
- Tailwind config updated with CSS-variable-backed colors and faction palette
- Nav: frosted glass background, rainbow gradient wordmark underline, Courier Prime uppercase links
- PageTitle component: Lora italic 34px with per-letter colored underline bars
- Layout: grid with 1fr + 256px sidebar column
- WatercolorBackground: SVG blurred ellipses in four corners
- Sidebar shell: character card, active tasks placeholder, propose-a-task button
- Removed: graph-paper background, Caveat/Kalam fonts, sketch box-shadows

## What Phase 2 completed
- 7 unique faction card components in `frontend/src/components/cards/`
- TaskCard router selects card archetype by `primary_faction_slug`
- LevelPill shared component
- Flex-wrap container on Tasks page (not CSS grid)
- 3 custom filter components: FilterStamps, FilterFactionTabs, FilterLevelNodes

## ~~Phase 2: Faction Card Archetypes~~ DONE

Each faction needs a completely different card component. See style guide Section 6 for full specs.

- [x] **TaskCardUA** — Sticky note: push pin, clipped corner, pastel yellow/pink, slight rotation. Width ~122–130px. Font: Courier Prime. (§6.1)
- [x] **TaskCardAnalog** — Field journal page: yellowed paper, red margin rule on left, horizontal ruled lines, torn bottom edge via clip-path. Width ~132–140px. Font: Special Elite. (§6.2)
- [x] **TaskCardGestalt** — Collage / layered scraps: three stacked paper scraps at different rotations + scotch tape strip across top. Width ~138px. Font: Courier Prime. (§6.3)
- [x] **TaskCardSNIDE** — Newspaper clipping: aged newsprint, torn top/bottom edges via ::before/::after, masthead banner, two-column body, cutout ransom letters for faction name. Width ~148px. Font: Special Elite for card, Courier Prime for cutout letters. (§6.4)
- [x] **TaskCardJourneymen** — Luggage tag: dashed string + eyelet hole, hazard stripe at top, bordered tag body. Width ~118px. Font: Courier Prime. (§6.5)
- [x] **TaskCardSingularity** — Terminal printout: always dark background, green terminal text, corner bracket decorations, sprocket hole rows, scanline overlay, blinking cursor. Width ~140px. Font: Share Tech Mono. (§6.6)
- [x] **TaskCardUAMasters** — Gazette article: deckled corner-snipped edges, proper masthead, headline + dateline, two-column layout. Width ~148px. Font: Special Elite. (§6.7)
- [x] **TaskCard router** — `TaskCard.tsx` should select the correct card component based on `task.primary_faction_slug`
- [x] **Flex-wrap container** — Replace CSS grid on Tasks page with `display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start`. Cards are NOT on a strict grid — varying heights and slight rotations are intentional.
- [x] **LevelPill component** — Dark pill shared by all cards: `background: #1a1209; color: white; font-size: 7px; padding: 1px 6px; border-radius: 6px; text-transform: uppercase`. Dark mode: `background: var(--faction-color); color: dark-bg`.

## ~~Phase 3: Custom Filter Controls~~ DONE

Replace current chip-based filters with three distinct visual types. See style guide Section 5.3.

- [x] **FilterStamps** (status filter) — Rectangular rubber stamps, no border-radius. 2px solid border, inner dashed border inset. Active: `bg: #1a1209; color: #F7F4EE`. Font: Courier Prime 10px bold uppercase. (§5.3)
- [x] **FilterFactionTabs** (faction filter) — Diagonal banner/pennant shape via `clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%)`. Background: faction color. Inactive: `opacity: 0.42; filter: saturate(0.3)`. White text with text-shadow. Font: Courier Prime 9px bold uppercase. (§5.3)
- [x] **FilterLevelNodes** (level filter) — Connected circles (30px diameter) with horizontal connector bars. Active: scale(1.15), dark fill. Represents minimum level filter. (§5.3)

## Phase 4: Dark Mode

- [ ] **Theme toggle** — Add toggle in nav or settings. Store preference in `localStorage` key `wz-theme`. Default to system preference via `prefers-color-scheme`.
- [ ] **useTheme hook** — Returns `'light' | 'dark'`, manages `data-theme` attribute on `<html>`.
- [ ] **WatercolorBackground dark variant** — Lower opacity (0.11–0.18) and deep color variants per style guide §2.3.
- [ ] **Nav dark mode** — `background: rgba(19, 18, 26, 0.92); backdrop-filter: blur(8px)`.
- [ ] **Card dark variants** — Each faction card has a specifically designed dark variant. See §6.1–6.7 dark mode sections. Singularity card is always dark in both modes.
- [ ] **Button dark variants** — Propose a task: `background: #f0e6d0; color: #13121a`. Stamps/chips: `bg: #f0e6d0; color: #13121a`.
- [ ] **Body transition** — 150ms `transition: background-color, color` on body (already in index.css).

## Phase 5: Sidebar Data Wiring

- [ ] **Active tasks panel** — Fetch user's signed-up tasks, show with faction color left-border, task name, meta (faction · level · date), badge pill (Solo/Collab/Duel). Progress bar: `X / 20 slots` with indigo fill.
- [ ] **Recent activity panel** — Fetch 3 most recent events. Player names in faction color + bold. Timestamps in tertiary color. Separated by 1px dashed border.

## Phase 6: Per-Page Polish

- [ ] Apply PageTitle to remaining secondary pages (About, Contact, Disclaimer, Attributions, Donate, Admin, EditCharacter, EditSubmission, SubmitProof, TaskDetail, SubmissionDetail, CharacterProfile, Updates, Groups)
- [ ] Update SubmissionCard component to match new card aesthetic
- [ ] Update CharacterProfile page layout
- [ ] Update Leaderboard entry cards
- [ ] Update Factions page cards to use faction-specific styling
- [ ] Remove remaining `hover:-translate` sketch effects from all components
- [ ] Audit all hardcoded hex values in components and replace with CSS custom properties
