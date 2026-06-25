# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase. **This repo is multi-context** (a backend context and a frontend context).

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root if it exists — it points at one `CONTEXT.md` per context. Read each one relevant to the topic.
- **The per-context `CONTEXT.md`** (`backend/CONTEXT.md`, `frontend/CONTEXT.md`) for the area you're working in.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. Also check `backend/docs/adr/` and `frontend/docs/adr/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill creates them lazily when terms or decisions actually get resolved.

## Where the domain knowledge lives today

`CONTEXT.md` / `CONTEXT-MAP.md` / `docs/adr/` do not exist yet (they get created lazily). Until they do, the authoritative domain documentation is the **"Where to look for X" routing table in `CLAUDE.md`** (the single source — don't duplicate it here) plus the `docs/spec/*` files and `WORLD_ZERO_STYLE.md` it points at.

When `/domain-modeling` starts resolving terms, capture the glossary into `backend/CONTEXT.md` / `frontend/CONTEXT.md` and add a root `CONTEXT-MAP.md` pointing at them.

## File structure (target)

```
/
├── CONTEXT-MAP.md                     ← points to per-context CONTEXT.md files
├── docs/adr/                          ← system-wide decisions
├── backend/
│   ├── CONTEXT.md
│   └── docs/adr/                      ← backend-specific decisions
└── frontend/
    ├── CONTEXT.md
    └── docs/adr/                      ← frontend-specific decisions
```

## Use the glossary's vocabulary

When your output names a domain concept (an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md` (or, until those exist, the spec files above). The canonical noun for a completed-task artifact is **Praxis** ("submit" is the verb). Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 — but worth reopening because…_
