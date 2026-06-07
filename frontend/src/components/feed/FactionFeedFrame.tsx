import type { ComponentType, ReactNode } from 'react'
import { pickVariant } from '../../utils/factionDispatch'
import EverymenFeedFrame from './factionFrames/EverymenFeedFrame'
import GestaltFeedFrame from './factionFrames/GestaltFeedFrame'
import SnideFeedFrame from './factionFrames/SnideFeedFrame'
import EphemeristsFeedFrame from './factionFrames/EphemeristsFeedFrame'

/**
 * Per-faction activity-feed framing dispatcher (Tier-3 surface). A faction
 * variant wraps/re-skins a feed row for its own context (e.g. Everymen dispatch
 * slip, Gestalt window row). Keyed by the relevant faction of the feed item
 * (task faction for tint, actor faction for treatment — caller decides).
 *
 * Today the map is empty, so this is a transparent passthrough: feed rows render
 * exactly as before. Type-cards under feed/ start wrapping their faction-tinted
 * regions in this frame as variants land in Sessions 3-4.
 */
export interface FactionFeedFrameProps {
  factionSlug?: string | null
  children: ReactNode
}

const FACTION_FEED_FRAMES: Record<string, ComponentType<FactionFeedFrameProps>> = {
  analog: EverymenFeedFrame,
  gestalt: GestaltFeedFrame,
  snide: SnideFeedFrame,
  journeymen: EphemeristsFeedFrame,
}

/** No registered frame → render the row untouched (transparent passthrough). */
function FeedFramePassthrough({ children }: FactionFeedFrameProps) {
  return <>{children}</>
}

export default function FactionFeedFrame({
  factionSlug,
  children,
}: FactionFeedFrameProps) {
  const Variant = pickVariant(FACTION_FEED_FRAMES, factionSlug, FeedFramePassthrough)
  return <Variant factionSlug={factionSlug}>{children}</Variant>
}
