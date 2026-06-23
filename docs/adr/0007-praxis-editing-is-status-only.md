# ADR-0007 — Praxis editing is status-only; retire `is_withdrawn`

**Status:** Accepted
**Date:** 2026-06-23

## Context

The praxis lifecycle had two parallel state dimensions: `status` (`in_progress | submitted`)
and `is_withdrawn` (boolean). This created invalid combinations (`submitted + is_withdrawn=True`)
and a broken round-trip: `resubmit_praxis` cleared `is_withdrawn` but left `status=in_progress`,
so the praxis never re-entered the scoring pool.

## Decision

Collapse to a single dimension: `status`.

- `in_progress` — being edited. Votes are preserved but do not count toward score.
- `submitted` — sealed. Votes count toward score.

`is_withdrawn` is dropped from the model, schemas, and all service queries.

The three operations `withdraw_praxis / reopen_praxis / resubmit_praxis` collapse into:

- **"Back to editing"** (`POST /praxes/{id}/withdraw`) — sets `status=in_progress`, resets
  member `has_submitted` flags, triggers score recalculation (pauses vote contribution).
- **Submit** (`POST /praxes/{id}/submit`) — existing operation, unchanged.

To abandon a task entirely, the character deletes the praxis.

The dup-submission check (`can_submit_praxis_for_task`) and invitee-eligibility check
(`_check_invitee_task_eligibility`) key on praxis *existence* for `(character, task)`, not
`is_withdrawn`. The Analog/Everymen Double Dipper carve-out is unchanged.

`recalculate_character_stats` counts only `status=submitted` praxes' votes.

## Consequences

- `submitted → in_progress → submitted` (edit cycle) correctly pauses and then restores
  the praxis's score contribution.
- One fewer state dimension to reason about; `in_progress` means exactly "being edited."
- API surface shrinks by one endpoint (`/resubmit` and `/reopen` removed).
- A forward Alembic migration drops the `is_withdrawn` column.
