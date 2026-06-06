import type { ComponentType } from 'react'
import WatercolorBackground from '../layout/WatercolorBackground'
import EverymenBackdrop from './EverymenBackdrop'
import GestaltBackdrop from './GestaltBackdrop'
import EphemeristsBackdrop from './EphemeristsBackdrop'
import { useBackdropSlug } from './BackdropContext'

/**
 * Per-faction full-page backdrop dispatcher (Tier-3 surface).
 * Faction variants register here in Sessions 3-4. While the map is empty —
 * and for any null / unknown / mixed-page slug — it falls back to the global
 * rainbow watercolor. Render once, fixed behind page content at z-index 0.
 */
const FACTION_BACKDROPS: Record<string, ComponentType> = {
  analog: EverymenBackdrop,
  gestalt: GestaltBackdrop,
  journeymen: EphemeristsBackdrop,
}

export default function FactionBackdrop() {
  const slug = useBackdropSlug()
  const Backdrop = (slug && FACTION_BACKDROPS[slug]) || WatercolorBackground
  return <Backdrop />
}
