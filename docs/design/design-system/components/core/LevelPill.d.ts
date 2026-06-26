/**
 * The small dark capsule showing a task's level requirement; shared by every
 * faction card.
 */
export interface LevelPillProps {
  /** Level number (0–8). */
  level: number;
  /** Faction slug to tint the pill with that faction's card accent. */
  factionSlug?: string;
}

export function LevelPill(props: LevelPillProps): JSX.Element;
