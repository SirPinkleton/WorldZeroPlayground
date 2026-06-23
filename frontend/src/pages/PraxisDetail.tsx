/**
 * Praxis detail dispatcher.
 *
 * Loads praxis + votes once via `usePraxisDetail(id)` and selects the right
 * faction-archetype page based on `praxis.task_faction_slug`. Every archetype
 * consumes the same `PraxisDetailState`; only the visual treatment differs.
 * Mirrors the TaskDetail / EditPraxis dispatchers. The loading / error /
 * not-found guards live here so archetypes can assume a non-null praxis.
 */
import { useParams } from 'react-router-dom'
import { usePraxisDetail } from './praxisDetail/usePraxisDetail'
import DefaultPraxisDetail from './praxisDetail/archetypes/DefaultPraxisDetail'

// ponytail: no faction has a bespoke archetype yet — everyone renders
// DefaultPraxisDetail. Add a pickVariant dispatch here when one does.
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

  return <DefaultPraxisDetail state={state} />
}
