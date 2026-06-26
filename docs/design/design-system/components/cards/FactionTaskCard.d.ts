/**
 * World Zero's signature component — one card, six completely different
 * physical archetypes. The faction determines the card's entire visual
 * language (gilt salon, gestalt.exe window, ransom dispatch, discordant
 * map, terminal printout, union poster). The card type IS the faction
 * identity.
 */
export interface FactionTaskCardProps {
  /** Which archetype to render. ("journeymen" is accepted as a legacy alias for "ephemerists".) */
  faction:
    | "ua"
    | "wow"
    | "gestalt"
    | "snide"
    | "ephemerists"
    | "singularity"
    | "everymen";
  /** Task title (rendered in the faction's headline font). */
  title: string;
  /** Task description (clamped; some archetypes restyle or split it). */
  description?: string;
  /** Level requirement shown in the LevelPill. */
  level?: number;
  /** Point value (already faction-adjusted by the caller). */
  points?: number;
  /** Sign-up handler. Omit to hide the sign-up button (permission-gated). */
  onSignup?: () => void;
}

export function FactionTaskCard(props: FactionTaskCardProps): JSX.Element;
