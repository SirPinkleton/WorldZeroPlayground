/**
 * FactionCommentBox — a single comment / thread post, reskinned per faction.
 * Comments are the one surface where every faction speaks in the same thread,
 * so each gets an unmistakable bubble (gilt salon, whimsy.exe chat window,
 * ransom slip, vellum marginalia, terminal line, union entry, the register).
 * The data model is shared; only the frame, type and avatar treatment change.
 */
export interface FactionCommentBoxProps {
  /** Faction slug — picks the bubble treatment + avatar skin + mention tint. */
  faction?: "ua" | "wow" | "gestalt" | "snide" | "ephemerists" | "singularity" | "everymen" | "albescent";
  /** Author display name. */
  name?: string;
  /** Author handle (with or without a leading @). */
  handle?: string;
  /** Timestamp / context line (e.g. "2 days ago", "T-0420"). */
  meta?: string;
  /** Comment text. `@handle` runs are auto-styled in the faction's voice. */
  body?: string;
  /** Avatar image URL — receives the faction's frame/filter treatment. */
  avatar?: string;
}

export function FactionCommentBox(props: FactionCommentBoxProps): JSX.Element;
