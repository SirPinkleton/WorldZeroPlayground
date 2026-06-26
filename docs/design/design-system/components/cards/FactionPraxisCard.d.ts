/**
 * FactionPraxisCard — the companion to FactionTaskCard. A *praxis* is a filed
 * submission for a task; the faction then votes on it. Each faction reframes
 * World Zero's 1–5 vote in its own vocabulary and renders the praxis in its own
 * physical language (gilt salon placard, praxis.exe window, closed-case file, sealed
 * ephemeris leaf, terminal log, union work report).
 */
export interface FactionPraxisCardProps {
  /** Which archetype to render. ("journeymen" is accepted as a legacy alias for "ephemerists".) */
  faction:
    | "ua"
    | "wow"
    | "gestalt"
    | "snide"
    | "ephemerists"
    | "singularity"
    | "everymen";
  /** The task this praxis answers (rendered as "re: …"). */
  task: string;
  /** The praxis headline / finding (in the faction's display font). */
  finding: string;
  /** Who filed it. */
  author?: string;
  /** Short account excerpt (clamped). */
  excerpt?: string;
  /** The faction's 1–5 vote average (drives the rating meter + standing label). */
  rating?: number;
  /** How many marks/votes were filed. */
  marks?: number;
  /** Point value of the underlying task. */
  points?: number;
  /** Level of the underlying task. */
  level?: number;
}

export function FactionPraxisCard(props: FactionPraxisCardProps): JSX.Element;
