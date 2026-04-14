# Style Migration Notes

## Architecture (current state)

The styling system uses two parallel sources of truth, kept in sync:

1. **`frontend/src/index.css`** — CSS custom properties for all colors, faction card themes (bg, text, accent, muted), type scale, shared tokens. Dark mode overrides via `[data-theme="dark"]`.
2. **`frontend/src/utils/factions.ts`** — JS-side faction config. `factionCssVar(slug, suffix)` returns CSS variable references for inline styles. `factionColor(slug)` returns raw hex for JS-only contexts (canvas, SVG generation).

Faction card components use CSS variables via `factionCssVar()` — no hardcoded hex values or dark/light ternaries. Shared patterns (`.card-footer`, `.card-meta`, `.card-description`) are defined in `index.css`.

## Completed

- [x] CSS custom properties for all colors, faction cards, type scale
- [x] Faction card components use CSS variables (no useTheme for colors)
- [x] 7 unique faction card archetypes in `components/cards/`
- [x] TaskCard router selects archetype by faction slug
- [x] LevelPill uses `factionSlug` prop + CSS variables
- [x] Responsive card widths (min/max/flex instead of fixed px)
- [x] Shared CSS classes for repeated card patterns
- [x] Custom filter components (FilterStamps, FilterFactionTabs, FilterLevelNodes)
- [x] Dark mode via data-theme attribute + CSS variable cascade
- [x] Custom fonts (Lora, Courier Prime, Special Elite, Share Tech Mono, Bebas Neue)
- [x] Watercolor background component
- [x] Nav frosted glass, PageTitle component, Layout grid
- [x] All page implementations (Tasks, Task Detail, Praxis, Profile, Players, Updates, Submit Proof, Propose Task)

## Remaining work (Phase 2+)

### High priority
- [ ] **Migrate remaining inline styles to Tailwind/CSS classes** — Components outside of `cards/` still use extensive `style={{}}` objects. Priority: NavBar, Sidebar, FilterStamps, FilterFactionTabs, FilterLevelNodes.
- [ ] **Responsive breakpoints** — No media queries exist. Mobile/tablet views are unhandled. Add Tailwind responsive classes for layout grid, sidebar collapse, card wrapping.
- [ ] **Audit remaining components for hardcoded hex** — Non-card components (NavBar, Sidebar, feed items, profile, leaderboard) may still have hardcoded colors that should use CSS variables.

### Medium priority
- [ ] **Backend faction colors via API** — `factions.ts` has a TODO to replace hardcoded config with API response from GET /factions. Backend `Faction` model needs `color`, `bg_color_light`, `bg_color_dark` fields.
- [ ] **Consolidate dark mode in non-card components** — After CSS variable expansion, audit NavBar, FilterStamps, FilterLevelNodes, and page components for remaining `dark ? x : y` patterns.

### Low priority
- [ ] **Inline style to Tailwind migration (full)** — Convert all remaining `style={{}}` to Tailwind utilities where practical. Large effort, low urgency.
- [ ] **Archive old style guide content** — The 1,700-line original style guide was trimmed to ~160 lines. Per-page pixel specs now exist only in the component code.
