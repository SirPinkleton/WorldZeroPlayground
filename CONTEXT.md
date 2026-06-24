# World Zero

A community game: players make Characters, complete real-world tasks, post proof
("praxis"), and earn points via star-rating votes. Each faction owns a distinct visual
identity that cascades across the UI. This glossary pins the vocabulary of the
**per-faction page architecture** — the dispatch machinery that renders a faction's
bespoke version of each surface.

## Language

**Surface**:
A distinct UI region that can vary per faction (task card, vote control, page backdrop,
faction detail page, …). The authoritative list lives in `SPEC-faction-ui-profile.md §1`.
_Avoid_: widget, element, component (a surface may be built from many components).

**Archetype**:
A faction's bespoke rendering of a surface — its whole shape, layout, ornament, and copy
voice (e.g. S.N.I.D.E.'s ransom-clipping task card). One faction, one surface, one archetype.
_Avoid_: variant (reserve "variant" for the `pickVariant` mechanism), skin, theme.

**Default archetype**:
The faction-agnostic fallback rendering of a surface, used when a faction registers no
archetype of its own. Named `DefaultXxx` (e.g. `DefaultFactionBody`).

**Dispatcher**:
The per-surface map (`Record<slug, Component>`) plus the `pickVariant` call that turns a
faction slug into its archetype, falling back to the default. One dispatcher per surface.

**Slug**:
The faction's stable identifier in the DB and code. Slugs **match faction identity** —
the rename `analog→everymen`, `gestalt→wow`, `journeymen→ephemerists` has been applied
(see ADR-0004), retiring the legacy-slug reuse trick.
_Avoid_: faction id, key (CSS uses a separate hyphenated "css key").

**Legacy slug** *(being retired — ADR-0004)*:
A slug kept after a rebrand to dodge DB/plumbing churn: `analog` shown as "Everymen",
`gestalt` as "Warriors of Whimsy", `journeymen` as "The Ephemerists". This trick was the
top source of doc/code drift and has been reversed (ADR-0004) — slugs renamed to match
identity even at the cost of breaking the (test-only) live site. Historical term; do not
introduce new legacy slugs.

**Alias slug**:
A slug that inherits another faction's archetype by design rather than rebrand:
`albescent` and `aged_out` both render as `ua`. Encoded in `SLUG_ALIASES` in
`utils/factionDispatch.ts`.

**Content slot**:
An invariant piece of data a surface always renders (a task card's title, description,
points). The slots are fixed across all factions; only their presentation varies by
archetype. The per-faction freedom is bounded to *how* slots are drawn, never *which*
slots exist.

**Contextual faction**:
The faction a given surface themes to. Resolved per-surface by a surface-specific rule —
*not* a single per-page value. A single page can show surfaces themed to several
factions at once. Resolution rules live in `SPEC-faction-ui-profile.md §2`.

**Task-scoped surface**:
A surface whose contextual faction is **the task's faction**: task card, praxis card,
edit-praxis, vote, and the task/praxis page frame + backdrop. A SNIDE task's whole page
reads SNIDE; a praxis of that task reads SNIDE.

**Praxis**:
The documented completion of a task — the proof Sally posts after doing "jump really
high". One task has many praxes (one per completion). A published praxis is **sealed** and
open to community voting.
_Avoid_: submission, proof, post, entry.

**Vote reframe**:
A faction's bespoke rendering of the shared 1–5 rating — Ephemerists' **Concordance**
(apocryphal → disputed → plausible → corroborated → canonical), Singularity's
NOISE → VERIFIED. The underlying value is always 1–5; only the vocabulary + visual ramp
change. This is per-faction surface #8; it is the **hero** of a praxis card and has both an
interactive *caster* form and a read-only *summary* form.

**Register row / Praxis Index**:
The faction's list view of sealed praxes; the praxis **card** lives here (compact, next to
task cards). Distinct from **Praxis Read** — the detail page showing one praxis in full
(account body, evidence, the voting control).

**Actor-scoped surface**:
A surface whose contextual faction is **the acting character's member faction**: the
avatar/badge, and (planned) the comment box. A SNIDE member's comment reads SNIDE even
on an Everyman task page; a praxis author's badge reads their own faction even when the
praxis card reads the task's faction.
