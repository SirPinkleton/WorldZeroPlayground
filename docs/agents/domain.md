# Domain Docs

How the engineering skills consume this repo's domain knowledge. This repo is
multi-context: a `backend/` context and a `frontend/` context.

## Where the domain knowledge lives

The authoritative domain documentation is the **"Where to look for X" routing table in
`CLAUDE.md`** (the single source — don't duplicate it here), plus the `docs/spec/*` files
and `WORLD_ZERO_STYLE.md` it points at, plus `docs/adr/` for decisions touching your area.

`CONTEXT.md` / `CONTEXT-MAP.md` do not exist yet. `/domain-modeling` creates them lazily
when terms actually get resolved (per-context `backend/CONTEXT.md` / `frontend/CONTEXT.md`,
with a root `CONTEXT-MAP.md` pointing at them). If they're absent, **proceed silently** —
don't flag it, don't create them upfront.

## Use the project's vocabulary

When your output names a domain concept (an issue title, a hypothesis, a test name), use the
project's term. The canonical noun for a completed-task artifact is **Praxis** ("submit" is
the verb). Don't drift to synonyms. If the concept isn't in the specs yet, that's a signal:
either you're inventing language the project doesn't use (reconsider), or there's a real gap
(note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it — don't silently override:

> _Contradicts ADR-0007 — but worth reopening because…_
