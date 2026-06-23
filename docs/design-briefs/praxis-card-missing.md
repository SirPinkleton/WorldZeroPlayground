# Design brief — Praxis Card (the missing three)

**Status:** active — hand to Claude design, once per faction. Canonical praxis-card designs
already exist for **SNIDE, Singularity, Ephemerists** (in the `design/` kits); do **not**
redo those. The three below have only task-card designs, so their praxis cards are missing.

**Context:** see `docs/adr/0005-praxis-card-content-model.md` (the slot model + the vote-reframe
hero) and `docs/spec/SPEC-faction-ui-profile.md §1 #2` (the per-faction praxis-card surface).
Until these land, all six cards run a shared interim body (a generic score "seal" — see the
`ponytail:` note in `frontend/src/components/PraxisCard.tsx`).

---

## Shared brief

**Surface:** the **praxis card** — the compact list/register card for a *completed* praxis,
shown in a flex-wrap grid **next to task cards** (and on the faction page's "recent praxis"
strip). **Not** the praxis read/detail page, **not** the edit-praxis form.

**What a praxis is:** the documented completion of a task. One task → many praxes. A submitted
praxis is **sealed** and open to community voting.

**Core rule — sealed-state mirror:** the praxis card uses the **same materials, type, and
motifs as that faction's *task* card, but rendered in a "completed / sealed / filed" register**
rather than an open call-to-action. (Reference canon: SNIDE's "ransom dispatch / OPEN CASE"
task → the **evidence locker**; Ephemerists' codex-leaf task → a **sealed ephemeris entry**.)
No signup CTA — this is proof that already happened.

**Content slots — render every one (invariant across factions; only the look changes):**
1. **Finding / title** — the praxis title.
2. **"Re:" the task it completes** — the task title (links to the task).
3. **Grade / level** — the task's required level, in faction voice.
4. **Points earned** — the task point value, presented as *earned*.
5. **Vote-rating summary — THE HERO.** A **read-only** summary of the praxis's 1–5 community
   rating in *this faction's vote reframe* (see per-faction), showing the tier reached + the
   vote count. This is the focal element — make it the centerpiece "stamp/seal/grade".
6. **Author** — display name (links to character), with their member-faction treatment.
7. **Sealed date** — when it was submitted.
8. **Mode** — solo vs collaborative ("+N" when collaborative).
9. **Status** — a small "sealed" indicator.

**Constraints (World Zero design system):**
- All colors via the faction token block `--faction-<slug>-*` (+ private tokens), in **both**
  light and `[data-theme="dark"]`. **No hardcoded hex.**
- Reuse shared scale/spacing/radius tokens (`--space-*`, `--radius-*`); use the faction's
  existing headline font, don't introduce a new type scale.
- **Compact** — it sits in a 280px-min flex card row beside task cards; it must not tower over
  them or read emptier than them.
- Deliver light **and** dark.

**Out of scope:** the read/detail page, the edit form, global chrome (nav/sidebar/modals), and
any new data — render only the slots above.

---

## Per-faction fill-ins

**1. Everymen** (`everymen`, red `#c1272d`/`#ef5350`, Bebas Neue; 1950s labor-movement /
propaganda poster). Task card = union dispatch poster. **Sealed register:** a *filed/stamped*
dispatch — "completed, union-sealed." **Vote reframe (hero):** the Everymen **ink-ramp stamps**,
summary = ramp filled to the achieved tier + count. *(The current `analog` praxis card is a
stale field-journal skin — replace it.)*

**2. Warriors of Whimsy** (`wow`, pink `#ec5f99`/`#f472b6`, Caveat/script; pink computer-witch,
coven hopepunk). Task card = lo-fi `.exe` window. **Sealed register:** a *saved / archived*
window — "file saved," done-state chrome. **Vote reframe (hero):** the **heart ramp**, summary =
hearts filled to tier + count. *(The current `gestalt` praxis card is a stale scrap-collage skin
— replace it; scrub "Gestalt" from any visible label → "Warriors of Whimsy.")*

**3. UA** (`ua`, purple `#7c3aed`/`#a78bfa`; *House of Leaves*, the tutorial/on-ramp faction).
Task card = House-of-Leaves annotated page. **Sealed register:** a *completed annotation /
footnoted entry* — the page now bears its marginalia and a stamp. **Vote reframe (hero):** UA has
no bespoke reframe — it uses the **global rainbow vote stamps**; summary = the global stamp ramp
at the achieved tier + count.
