/**
 * A diagonal pennant tab in a faction's full-saturation color, for faction
 * filters. Always full color; inactive drops to 0.85 opacity.
 */
export interface FactionPennantProps {
  /** Faction slug (ua, wow, snide, ephemerists, singularity, everymen, albescent). */
  slug: string;
  /** Display name shown on the pennant. */
  name: string;
  active?: boolean;
  onClick?: () => void;
}

export function FactionPennant(props: FactionPennantProps): JSX.Element;
