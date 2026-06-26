/**
 * World Zero's rating control — five rectangular rubber stamps (1–5) with word
 * labels and value-specific colors, replacing star ratings. This is the generic
 * default; each faction kit reskins the same 1–5 model in its own voice.
 */
export interface FactionVoteStampsProps {
  /** Faction slug — reframes the five rungs in that faction's voice + tint. Omit for the generic ramp; `ua` gives the burnt-amber Critique. */
  faction?: "ua" | "gestalt" | "snide" | "ephemerists" | "singularity" | "everymen" | "albescent";
  /** Currently-selected rating (0 = none). */
  value?: number;
  /** Average rating to show in the summary line. */
  average?: number;
  /** Total vote count for the summary line. */
  totalVotes?: number;
  /** Called with the chosen 1–5 value. */
  onVote?: (stars: number) => void;
}

export function FactionVoteStamps(props: FactionVoteStampsProps): JSX.Element;
