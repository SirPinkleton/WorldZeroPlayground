import { useEffect, useState } from "react";
import type { FactionViewer } from "../types";

/* ────────────────────────────────────────────────────────────────
   useFactionMembership — the join/leave/gate state machine that EVERY
   faction page shares. This is the real reusable logic behind the
   "one contract, seven skins" architecture: the skins differ entirely
   in markup, but the block below resolves identically for all of them.

   Resolution (matches the standardization spec):
     • member                    → show standing (role) + a Leave affordance
     • prospective + eligible     → the prominent Join CTA
     • prospective + not eligible → the soft `requirement` gate
                                    (encouraging copy, NO exact formula,
                                     NO progress bar)

   `viewer.state` is the server truth; local Join/Leave clicks optimistically
   override it until the server value changes again.
   ──────────────────────────────────────────────────────────────── */

export interface Membership {
  isMember: boolean;
  showJoin: boolean;
  showGate: boolean;
  join: () => void;
  leave: () => void;
}

export function useFactionMembership(viewer: FactionViewer): Membership {
  // null = "defer to the server value"; a string = local optimistic override.
  const [override, setOverride] = useState<"member" | "prospective" | null>(null);

  // Reset the optimistic override whenever the server state changes.
  useEffect(() => {
    setOverride(null);
  }, [viewer.state]);

  const effective = override ?? viewer.state;
  const isMember = effective === "member";
  const showJoin = !isMember && viewer.eligible;
  const showGate = !isMember && !viewer.eligible;

  return {
    isMember,
    showJoin,
    showGate,
    join: () => setOverride("member"),
    leave: () => setOverride("prospective"),
  };
}
