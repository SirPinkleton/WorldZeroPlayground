# World Zero Design System — project memory

This project is the **World Zero design system**: tokens (`tokens/*.css`, `styles.css`),
shared components (`components/**`), and per-faction **kits** under `templates/<slug>/`.

The game repo is `pixieofhugs/WorldZeroPlayground`. The authoritative design contract is
`docs/spec/SPEC-faction-ui-profile.md` (per-faction vs. global surfaces + the §7 coverage
matrix of what each faction has wired today) and the ADRs in `docs/adr/`. When asked about
"which assets need design", that coverage matrix (⬜ = falls back to a generic default) and
the GitHub issues labelled **"needs design"** are the backlog.

## The seven factions

| slug | name | archetype | primary (light/dark) | headline font |
|---|---|---|---|---|
| `ua` | UA | **Gilt salon / art academy** (repainted from the sticky note) | `#c2541f` / `#c2541f` — burnt amber + antique gold on parchment; **always-light** (the salon never dims). Promoted into the global `--faction-ua-*` tokens + `--ua-*` extension palette | `--font-faction-gilt` (Playfair Display) + `--font-faction-engraved-caps` (Marcellus SC) |
| `wow` | Warriors of Whimsy | whimsy.exe desktop window (was Gestalt) | `#be185d` / `#f472b6` | `--font-faction-script` |
| `snide` | S.N.I.D.E. | ransom / xerox-punk dispatch (always-dark card) | `#16a34a` / `#4ade80` | `--font-faction-anton` |
| `ephemerists` | The Ephemerists | discordant-map illuminated codex | `#1d6e72` / `#3aa0a4` | `--font-faction-engraved` |
| `singularity` | Singularity | terminal printout (**always-dark**) | `#2563eb` / `#60a5fa` | `--font-faction-terminal` (Share Tech Mono) |
| `everymen` | The Everymen | union / victory poster | `#c1272d` / `#ef5350` | `--font-faction-poster` |
| `albescent` | Albescent | vellum correspondence / sacred secret society (**always-light**) | `#1c1c1a` / `#1c1c1a` (no hue — near-black ink on white) | `--al-font` (Cormorant Garamond italic) |

`ua_masters` is dormant (Era 2); `aged_out` is an alias slug that inherits `ua`. **`albescent`
used to alias `ua` but now ships its own distinct kit** (`templates/albescent/`). **Gestalt was
renamed the Warriors of Whimsy (slug `gestalt` → `wow`)**; `gestalt` is kept as a back-compat
alias (resolved via `SLUG_ALIAS` in `factions.js`) and the CSS prefix stays `--faction-gestalt-*`
/ `--gestalt-*` (tokens unchanged — only the slug + display name moved).

## Faction-kit conventions

A faction kit is a folder `templates/<slug>/` containing:
- `<Slug>.dc.html` — the `@template` **kit index** (written via `dc_write`, with the
  `<!-- @template name="…" description="…" -->` comment as the first line of the body).
  It lists every surface as a card and loads the DS via `<helmet><script src="./ds-base.js"></script></helmet>`.
- `ds-base.js` — loads the DS tokens + `_ds_bundle.js` (scaffolded by `dc_write`; base `'../..'`).
- `<slug>.css` — the faction's archetype primitives (local `--<abbr>-*` tokens, backdrop,
  textures, layout helpers). Mirrors/extends the global `--faction-<slug>-*` block in `tokens/colors.css`.
- Standalone surface pages as plain `.html` (NOT `.dc.html`), each linking
  `../../styles.css` + `<slug>.css`, then React/Babel CDN + the faction `.jsx` atoms.
- Optional `<slug>-*.jsx` — React atom/component files exposed on `window` (`Object.assign(window, {…})`).

Reference kits to copy structure from: `templates/snide/` and `templates/singularity/`
(both always-dark) and `templates/ephemerists/` / `templates/everymen/`.

## Intent: "make a faction kit" (new faction)

Build a full `templates/<slug>/` kit covering **all twelve per-faction surfaces** from
SPEC §1, in the World Zero token scheme (`--faction-<slug>-*`, **light + dark** values for
every color token — an always-dark faction gives identical light/dark):

1. **Task card** (the archetype) — small format for the global list
2. **Praxis card** (mirrors the task-card archetype)
3. **Edit-praxis editor** (the archetype as a form)
4. **Faction-selection / join card**
5. **Headline-font usage**
6. **Full color token block** (add to `tokens/colors.css` `:root` + `[data-theme="dark"]`)
7. **Filter pennant** (primary-color fill)
8. **Vote / rating UI** (1–5, reframed in the faction's voice)
9. **Progression / level indicator** (token-tint only today — shared `LevelPill`)
10. **Page backdrop** (full-page bg when the faction is the page context; must also look
    right behind unrelated content — global rainbow watercolor is the fallback)
11. **Avatar + membership badge** (frame treatment + small faction sigil)
12. **Activity-feed card frame** (one frame reskins all event-type cards)

Do **not** redesign global chrome (nav/sidebar/modals/toasts, generic button/tab/chip/empty
states). Always add the new `--faction-<slug>-*` tokens to `tokens/colors.css` in **both**
`:root` and `[data-theme="dark"]`, plus a `CSS_KEY` + `FACTIONS` entry in
`components/core/factions.js`. After building, run `check_design_system`.

## Intent: "update the faction kit" (existing faction)

Add the **missing (⬜) surfaces** for that faction from SPEC §7.A coverage matrix to its
existing `templates/<slug>/` kit, following the same conventions. As of the 2026-06-24 audit
the thin factions / sparse surfaces were:

- **singularity** was the thinnest before its fill (cards only — no vote / backdrop / avatar). **ua** had no kit at all until the 2026-06-25 gilt-salon redesign.
- Sparsest surfaces across the board: **faction-hero** (snide + ephemerists + UA + albescent + singularity)
  and **join/select** (2 factions). The **task-detail page** row is now closed — all 7 factions ship a
  bespoke `<Faction> Task Detail.dc.html` (imported 2026-06-25).

Re-confirm against the live `SPEC-faction-ui-profile.md §7` matrix and the GitHub
"needs design" issues before starting — don't trust this list if it looks stale.

### Singularity kit (done 2026-06-24)
`templates/singularity/` was filled from a complete terminal-printout treatment: `.sg-backdrop`
(page backdrop ⬜→✅), `SgVoteWidget`/`SignalCaster` Cast-Signal consensus ramp
NOISE→WEAK→SIGNAL→CLEAR→VERIFIED (vote ⬜→✅), `SingularityMark` sigil + node avatar +
`SgNavBadge` (avatar+badge ⬜→✅), `SgHero` (faction-hero ⬜→✅), `SgActivityCard` (feed frame
⬜→✅). Surfaces: Faction Page, Praxis Index, Completed Praxis, Updates Page.

### Albescent kit (added 2026-06-24)
`templates/albescent/` — a distinct always-light "vellum correspondence" faction (sacred secret
society; refuses the rainbow palette, no faction hue, white card in both themes). Ships
`AlbescentCard` (task), `RegisterRow`/`RegisterIndex` (praxis card), `EntryRead` (praxis-detail),
`WitnessCaster`/`AlWitnessWidget` grayscale presence ramp UNSEEING→GLIMPSED→WITNESSED→VERIFIED→INSCRIBED
(vote), `AlbescentMark` surveyor's-cross sigil, `AlNavBadge`, `AlHero`, `AlActivityCard`, `.al-backdrop`.
Coverage **12/15** — still ⬜: join/select, filter pennant, stat block. (Task-detail filled
2026-06-25 via `Albescent Task Detail.dc.html`.)
Tokens live in the kit's `albescent.css` (`--al-*` + `--faction-albescent-card-*`); not yet promoted
into `tokens/colors.css` / `factions.js`.

### UA kit (gilt-salon redesign, added 2026-06-25)
`templates/ua/` — UA was **repainted from the purple sticky-note into a gilt art-academy** ("the
purple seat, repainted"): burnt-amber `#c2541f` + antique-gold gilt frames on parchment, a
heraldic crossed-brush **crest**, regal Playfair Display + Marcellus type, and university
enrollment voice (matriculate, commission, the Salon, the Critique). Surfaces (all `.dc.html`,
porting the locked Burnt-Amber direction): `UA Task Card` (crest-in-gilt-frame archetype),
`UA Task Card Explorations` (5 directions), `UA Gold Palettes` (color study), `UA Faction Page`
(Salon hero + commissions + placards), `UA Praxis - Read` (gilt-framed plate + 1–5 **Critique**
rough-sketch→masterwork), `UA Edit Praxis` (Salon submission form w/ image-slot plate). Local
tokens in `ua.css` (`--ua-*` + `.ua-backdrop` + `.ua-plate`); uses `image-slot.js`.
**Promoted into the global system (2026-06-25):** the burnt-amber/gold is now the global truth.
`tokens/colors.css` `--faction-ua-*` (light + dark — identical, always-light) resolves to parchment
`#fdf6ea`, ink `#3d2410`, accent `#c2541f`, and a `--ua-*` extension palette (`--ua-orange/gold/
ink/sub/paper/wall/line` + `--ua-gilt` frame gradient) sits alongside `--gestalt-*`/`--snide-*`/etc.
`factions.js` `color:#c2541f`. The signature shared components were repainted off the sticky note:
`FactionTaskCard` UA = crest-in-gilt-frame card, `FactionPraxisCard` UA = gilt placard with the
Critique diamonds, `FactionVoteStamps` UA = burnt-amber Critique ramp (rough sketch→masterwork; no
longer the generic fallback — omit `faction` for that). Type: `--font-faction-gilt` (Playfair Display,
was `--font-faction-old`/IM Fell, now removed) + `--font-faction-engraved-caps` (Marcellus SC). Still
⬜ for UA: join/select, filter pennant, avatar+badge, activity-feed frame.

### Task-detail pages (all 7, added 2026-06-25)
Every kit now ships a bespoke `<Faction> Task Detail.dc.html` (DC pages consuming the shared
bundle — `FactionPraxisCard`/`FactionCommentBox` via `<x-import component-from-global-scope>`).
These replaced the old plain-`.html` snide + everymen detail pages (and their `*-detail.jsx`).
The coverage chart task-detail row is now 7/7.

### Faction Pages section + comment boxes
`faction-pages/` holds three cross-faction review cards (`@dsCard group="Faction Pages"`):
**Faction Pages**, **Completed Praxis**, **Edit Praxis** — each links to every faction's kit
surface (gap rows shown dashed). Every kit index links back to these three under its footer
("Compare across the roster"). `components/feedback/FactionCommentBox` (shared, faction-switched)
+ `comments.card.html` cover the per-faction comment bubble; each kit also has a standalone
`<Faction> Comment Box.html` thread page.

### Faction component coverage
`components/cards/coverage.card.html` (Faction Components group) is the live 7-faction × 15-type
matrix of bespoke-vs-fallback. Update its `TIERS` data array (null = fallback) whenever a kit fills a surface.
