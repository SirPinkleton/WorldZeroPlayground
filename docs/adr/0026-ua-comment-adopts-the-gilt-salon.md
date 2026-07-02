# ADR-0026 — The UA comment adopts the gilt-salon identity

**Status:** Accepted
**Date:** 2026-07-02
**Supersedes:** the UA-palette clause of [ADR-0018](0018-comment-voice-reuses-task-card-atoms.md)
**Relates to:** ADR-0006 (comment system; still owns model/dispatch), the gilt-salon UA rebrand (PR #361), issue #377

## Context

[ADR-0018](0018-comment-voice-reuses-task-card-atoms.md) gave each faction's comment voice its
task-card skin. For UA it made one deliberate, scoped call: **"UA wears the new orange/gold look
here; the rebrand at large is out of scope."** `UAComment` was styled inline with seven hardcoded
hex values (ivory `#f9f2e2`, gold `#c9a23c` / `#ecd089`, orange `#c8601a`, bronze `#b07a3a`, ink
`#2a1a10`) because the `--faction-ua-card-*` tokens were then stale purple — so inlining hex was
correct at the time.

That premise is now false. The **gilt-salon UA rebrand landed globally (PR #361)**: task card,
task detail, praxis-read, edit-praxis, feed frame, and backdrop all render UA as the gilt salon on
`--ua-*` tokens. `UAComment` was the last surface still on the pre-rebrand orange letterhead, so in
a mixed thread the UA bubble read as the old look while the rest of the app was the salon.

This is exactly the **"separate follow-up"** ADR-0018 anticipated.

## Decision

- **Reskin `UAComment` to the gilt salon on `--ua-*` tokens only** — a `--ua-gilt` museum frame
  around a `--ua-paper` plate, `--ua-ink` text, `--ua-gold` rule, `--ua-orange` accent (eyebrow /
  mentions / composer button), timestamps in `--ua-sub`. Zero hex. Mirrors `UaFeedFrame` /
  `UAPraxisDetail` and the design's `FactionCommentBox` UA archetype.
- **Only ADR-0018's UA-palette / "rebrand out of scope" / inline-hex decision is reversed.**
  Everything else in ADR-0018 stands: the task-card fidelity bar, the seven archetypes (incl.
  Albescent), timestamp dialects, single-voice composer, mentions-as-plain-text, and
  `FactionAvatar` composition (ADR-0006). The invariant slots (author · body · timestamp+edited)
  and both read + composer modes are unchanged.

## Consequences

- UA reads consistently as the gilt salon across every surface, including mixed comment threads.
- Residual hardcoded hex remains in `WowComment` (3), `EphemeristsComment` (1), and
  `SingularityComment` (1) — a low-priority `var(--*)` sweep, out of scope here.
  `AlbescentComment`'s hex rolls into the `albescent → ua` alias removal (#232).
