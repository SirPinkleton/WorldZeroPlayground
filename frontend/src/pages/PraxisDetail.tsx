/**
 * Praxis detail dispatcher.
 *
 * Loads praxis + votes once via `usePraxisDetail(id)` and selects the right
 * faction-archetype page based on `praxis.task_faction_slug`. Every archetype
 * consumes the same `PraxisDetailState`; only the visual treatment differs.
 * Mirrors the TaskDetail / EditPraxis dispatchers. The loading / error /
 * not-found guards live here so archetypes can assume a non-null praxis.
 */
import type { ComponentType } from 'react'
import { useParams } from 'react-router-dom'
import { usePraxisDetail } from './praxisDetail/usePraxisDetail'
import type { PraxisDetailState } from './praxisDetail/usePraxisDetail'
import { pickVariant } from '../utils/factionDispatch'
import DefaultPraxisDetail from './praxisDetail/archetypes/DefaultPraxisDetail'
import EphemeristsPraxisDetail from './praxisDetail/archetypes/EphemeristsPraxisDetail'

/**
 * Per-faction praxis-read archetype map. Keyed by task faction slug.
 * Add one row per faction as its read-page design lands (ADR-0017, gap tracker).
 */
const ARCHETYPE_BY_SLUG: Record<string, ComponentType<{ state: PraxisDetailState }>> = {
  ephemerists: EphemeristsPraxisDetail,
}

export default function PraxisDetail() {
  const { id } = useParams<{ id: string }>()
  const state = usePraxisDetail(id)

  if (state.loading) return <div className="py-8 font-body text-muted">Loading...</div>
  if (state.fetchError) return (
    <div className="py-8">
      <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2">
        {state.fetchError}{' '}
        <button onClick={() => window.location.reload()} className="underline">Try refreshing.</button>
      </p>
    </div>
  )
  if (!state.praxis) return <div className="py-8 font-body text-muted">Not found.</div>

  const Archetype = pickVariant(ARCHETYPE_BY_SLUG, state.praxis.task_faction_slug, DefaultPraxisDetail)
  return <Archetype state={state} />
}
