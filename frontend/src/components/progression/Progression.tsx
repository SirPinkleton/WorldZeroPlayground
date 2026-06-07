import type { ComponentType } from 'react'
import { pickVariant } from '../../utils/factionDispatch'
import LevelPill from '../ui/LevelPill'
import EverymenProgression from './EverymenProgression'
import GestaltProgression from './GestaltProgression'
import SnideProgression from './SnideProgression'
import EphemeristsProgression from './EphemeristsProgression'

/**
 * Per-faction progression / level indicator dispatcher (Tier-3 surface).
 * Faction variants (e.g. Gestalt's moon-phase track, Everymen's stamped pill)
 * register in Sessions 3-4. Default is the global LevelPill, which already
 * tints itself from the faction accent. See SPEC-faction-ui-profile.md §1-2.
 */
export interface ProgressionProps {
  level: number
  factionSlug?: string | null
}

const FACTION_PROGRESSION: Record<string, ComponentType<ProgressionProps>> = {
  analog: EverymenProgression,
  gestalt: GestaltProgression,
  snide: SnideProgression,
  journeymen: EphemeristsProgression,
}

export default function Progression({ level, factionSlug }: ProgressionProps) {
  const Variant = pickVariant(FACTION_PROGRESSION, factionSlug, LevelPill)
  return <Variant level={level} factionSlug={factionSlug ?? undefined} />
}
