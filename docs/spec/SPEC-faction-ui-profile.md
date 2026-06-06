# SPEC — Per-Faction UI Profile

**What this is.** The definitive list of which UI/UX surfaces vary *per faction* and which stay *global*. Feed this to a designer (human or Claude design) at the start of any new-faction or faction-redesign brief so the deliverable covers exactly the right surfaces — no more, no less.

**Status.** Reflects the **Tier 3** scope adopted 2026-06-05 (cards + voting + progression + page backdrop + avatars + activity-feed cards are per-faction; generic controls stay global). Earlier the only per-faction surface was the card archetype; Tier 3 widened the boundary.

**Source of truth.** This doc describes *intent and the contract*. Exact values live in `frontend/src/index.css` (CSS vars), `frontend/src/utils/factions.ts` (registry), and `backend/eras/era_1.py` (gameplay). If they disagree, the code wins — fix this doc or the code, don't let them drift. Companion: `WORLD_ZERO_STYLE.md` (§6 "faction identity cascades from the card archetype").

---

## 1. The per-faction boundary (Tier 3)

### Per-faction — a faction owns its own version of each of these

| # | Surface | What varies | Existing example |
|---|---|---|---|
| 1 | **Task card** | Whole archetype (shape, layout, ornament, copy voice) | Analog field-journal, S.N.I.D.E. ransom clipping |
| 2 | **Praxis card** | Mirrors the task-card archetype — **⚠ currently reads flat next to the task cards; flagged for a visual rework (pending design)** | per faction |
| 3 | **Edit-praxis editor** | Mirrors the archetype, as a form | sticky-note / terminal / gazette |
| 4 | **Faction-selection card** | Bespoke "join me" card | per faction |
| 5 | **Headline font** | One display face per faction | Bebas Neue (Everymen), Caveat (Gestalt) |
| 6 | **Color set** | Full `--faction-{slug}-*` token block, light + dark | see §3 |
| 7 | **Filter pennant** | Tab uses the faction primary color at full saturation | global pennant shape, per-faction fill |
| 8 | **Vote / rating UI** *(Tier 3 new)* | The 1–5 rating control's visual metaphor | Everymen ink-ramp stamps; Gestalt heart ramp |
| 9 | **Progression / level indicator** *(Tier 3 new)* | How level/progress is drawn | Everymen numeric pill; Gestalt moon-phase track |
| 10 | **Page backdrop** *(Tier 3 new, optional)* | Full-page background **when a faction is the page's context**; falls back to the global rainbow watercolor otherwise | Everymen poster wall; Gestalt lo-fi desktop |
| 11 | **Avatar + membership badge** *(Tier 3 new)* | Avatar frame treatment + a small faction sigil badge | Everymen cog badge; Gestalt moon badge |
| 12 | **Activity-feed card** *(Tier 3 new)* | The feed row/card styling for that faction's context | Everymen dispatch slip; Gestalt window row |
| 13 | **Faction detail page** *(new)* | The per-faction page at `/factions/:slug`: faction description + members + tasks + recently-completed praxis. The page backdrop (#10) themes it to the faction. | shell shipped with placeholder styling; per-faction visual design pending |

### Global — one shared version for the whole app, regardless of faction

- **Generic buttons, tabs, chips, empty states** — shared classes/components. A faction kit *may* ship styled versions, but they are NOT wired into per-faction dispatch; the app uses the global ones. (If a faction's archetype needs a bespoke button *inside its own card*, that lives inside the card component, not as a global control swap.)
- **Navigation chrome / sidebar / layout shell**, modals, toasts, form validation states.
- **Vote data model** — always a 1–5 rating; only the *rendering* is per-faction.
- **Level thresholds & gameplay rules** — global/era config, never per-faction visual logic.
- **Typography scale, spacing, radii, shadows** — shared design-system tokens (`--space-*`, `--radius-*`). A faction picks a *headline font*, not a new scale.

> **Rule of thumb for the designer:** a faction owns everything that represents *its own content or members*. It does not own neutral app chrome or controls that appear across all factions at once.

---

## 2. Whose faction themes each surface? (contextual-faction resolution)

A per-faction surface needs to know *which* faction to render as. Use these rules — they are not all the same.

| Surface | Contextual faction = | Mixed / neutral page → |
|---|---|---|
| Task card, Praxis card, Edit-praxis, Vote UI | the **task's** primary faction | n/a (a task always has one) |
| Faction-selection card, Filter pennant | the faction **being rendered** | n/a |
| Progression / level | the **member's** faction in profile/sidebar; the **card's** faction inside a card | global pill |
| Avatar + badge | the **character's member** faction | generic avatar |
| Activity-feed card | the **task's** faction for task tint; the **actor's member** faction for actor treatment | faction-tinted-neutral row |
| **Page backdrop** | the page's single contextual faction (faction detail page, a single-faction character profile) | **global rainbow watercolor** |

**Backdrop is the one that must degrade gracefully.** On any page that mixes factions (the global quest board, the join/recruit grid) or has no faction (settings), render the global watercolor. Never theme a mixed page to one faction.

---

## 3. The token contract a new faction must satisfy

Every faction supplies one CSS-variable block in `frontend/src/index.css`, defined in **both** `:root` (light) and `[data-theme="dark"]`. Naming is `--faction-{cssKey}-{suffix}`. `factionCssVar(slug, suffix)` reads these; a missing `CSS_KEY` entry silently falls back to the `ua` theme.

Required suffixes (consumed by the dispatchers / `factionCssVar`):

| Token | Role |
|---|---|
| `--faction-{key}` | primary color (brand) |
| `--faction-{key}-light` | faint tint background |
| `--faction-{key}-border` | rgba border |
| `--faction-{key}-card-bg` | card surface |
| `--faction-{key}-card-text` | card body text |
| `--faction-{key}-card-accent` | metadata / decorative accent |
| `--faction-{key}-card-muted` | secondary text |
| `--faction-{key}-card-font` | headline font (points at a `--font-*` face) |

Plus any **archetype-private primitives** (e.g. Everymen's `--everymen-cream/-gold/-ink/-paper/-field`, Gestalt's window-chrome tokens). These are referenced only inside that faction's own components, not through `factionCssVar`, and are ported verbatim from the design kit.

**Dark mode is automatic via the cascade** — supply a `[data-theme="dark"]` value for every token; no `dark ? a : b` ternaries in components. A faction may opt to be always-dark (Singularity) by giving identical light/dark values.

**Fonts** must already be loaded in `index.html` / `index.css`. Bebas Neue (`--font-accent`) and Caveat (`--font-faction-script`) are present. A genuinely new face is a separate, explicit step.

---

## 4. New-faction registration checklist

Hand this to whoever wires the faction after design is delivered. (Designer only needs §1–§3; this section is the engineering contract.)

**Backend (`backend/`)**
1. `eras/era_1.py` → add a `FactionConfig` to `ERA_1_FACTIONS` with **all 12 fields** (`game_config.py` dataclass): `slug, name, description, color, is_selectable, can_always_rejoin, own_task_modifier, other_task_modifier, collab_own_modifier, collab_other_modifier, duel_win_modifier, duel_loss_modifier`.
2. `eras/era_1.py` → optional taunt block in `ERA_1_TAUNT_TEMPLATES` (else `"default"` applies).
3. Visibility: add the slug to `seed.py` `HIDDEN_FACTION_SLUGS` only if it should be hidden; otherwise it defaults to `visible`.
4. Seeding: a fresh DB seeds from config automatically; an **already-seeded DB needs a one-off `Faction` row upsert** (no alembic migration — the table is a thin display mirror).
5. `/game-config` exposure is automatic.

**Frontend theme**
6. `index.css` → the `--faction-{key}-*` block in `:root` AND `[data-theme="dark"]` (§3).
7. `utils/factions.ts` → a `FACTION_FALLBACKS` entry **and** a `CSS_KEY` entry (underscore-slug → hyphen-css-key). Keep the fallback `color` equal to the light primary so JS and CSS agree on first paint before the API hydrates.
8. Fonts: only if the archetype needs a face not already loaded.

**Frontend dispatch — register the faction in each dispatcher**
9. `components/TaskCard.tsx` → `CARD_COMPONENTS`.
10. `components/cards/FactionCard.tsx` → the `switch`.
11. `pages/EditPraxis.tsx` → `ARCHETYPE_BY_SLUG`.
12. The five Tier-3 dispatchers: **vote**, **progression**, **backdrop**, **avatar**, **activity-feed** (each a `Record<slug, Component>` + global default, mirroring `CARD_COMPONENTS`). Omit a faction from any of these to inherit the global default for that surface.
13. Leave the slug out of the `Factions.tsx` hidden list unless it should be hidden.

---

## 5. Designer brief template (copy/paste for the next faction)

> **Faction:** `<name>` (`<slug>`). **Archetype metaphor:** `<one line>`. **Primary color:** `<hex light>` / `<hex dark>`. **Headline font:** `<face>`.
>
> Deliver, in the World Zero token scheme (`--faction-<slug>-*`, light + dark), styled designs for **all twelve per-faction surfaces** in `SPEC-faction-ui-profile.md §1`:
> 1. Task card  2. Praxis card  3. Edit-praxis editor  4. Faction-selection card  5. Headline-font usage  6. Full color token block  7. Filter pennant  8. Vote/rating UI (1–5)  9. Progression/level indicator  10. Page backdrop (must also look right *behind* unrelated content; remember the global fallback)  11. Avatar + membership badge  12. Activity-feed card.
>
> Do **not** redesign global chrome: nav/sidebar/modals/toasts, or the generic button/tab/chip/empty-state controls. If your kit includes those, mark them "reference only — not wired."
>
> Reuse the shared design-system tokens (`--space-*`, `--radius-*`, type scale). Supply a `[data-theme="dark"]` value for every color token. No hardcoded hex in component markup — everything via CSS vars.

---

## 6. Change log

- **2026-06-06** — Rebranded the **Journeymen → The Ephemerists** (slug kept as
  `journeymen`; no DB migration). New archetype: the *Discordant Map* illuminated codex
  (lapis-verdigris `#1d6e72`/`#3aa0a4`, Cinzel/EB Garamond/Cormorant, vellum + gold-leaf +
  rubric). Added `--eph-*` pigments + `.eph-backdrop` to `index.css` and registered the
  faction in all five Tier-3 dispatchers (vote = the wax-seal *Concordance* ramp,
  progression = roman-numeral grade, backdrop, avatar, feed frame), which it previously
  inherited as global defaults.
- **2026-06-06** — Added surface **#13 Faction detail page** (`/factions/:slug`):
  description + members + tasks + recent praxis, backdrop-themed. Shell shipped with
  placeholder styling; per-faction visual design pending. Flagged the **praxis card**
  (#2) for a visual rework — technically per-faction but reads flat next to task cards.
- **2026-06-05** — Created. Adopted **Tier 3** boundary. Added surfaces 8–12 (vote, progression, backdrop, avatar, feed card) as per-faction; kept generic controls global. Drafted to support the **Everymen** (new, red, Bebas Neue, union-poster) and **Gestalt redesign** (pink `#ec5f99`/`#f472b6`, Caveat, lo-fi `.exe` desktop) work.
