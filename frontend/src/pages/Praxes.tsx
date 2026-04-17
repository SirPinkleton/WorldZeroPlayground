import { useEffect, useState } from 'react'
import { listPraxes, type PraxisCardOut } from '../api/praxis'
import PraxisCard from '../components/PraxisCard'
import CollaborationCard from '../components/CollaborationCard'
import PageTitle from '../components/ui/PageTitle'
import { extractError } from '../utils/errors'

export default function Praxes() {
  const [soloItems, setSoloItems] = useState<PraxisCardOut[]>([])
  const [collabItems, setCollabItems] = useState<PraxisCardOut[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      listPraxes({ type: 'solo' }),
      listPraxes({ type: 'collab' }),
      listPraxes({ type: 'duel' }),
    ])
      .then(([solo, collab, duel]) => {
        setSoloItems(solo)
        setCollabItems([...collab, ...duel])
      })
      .catch((err) => setFetchError(extractError(err, "Couldn't load praxes.")))
      .finally(() => setLoading(false))
  }, [])

  const isEmpty = soloItems.length === 0 && collabItems.length === 0

  return (
    <div className="py-8">
      <PageTitle title="Praxis" />
      <p className="font-body text-sm text-muted mb-6">
        Proof of action. All praxes from across World Zero.
      </p>

      {loading ? (
        <p className="font-body text-muted">Loading praxis...</p>
      ) : fetchError ? (
        <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2">
          {fetchError}{' '}
          <button onClick={() => window.location.reload()} className="underline">Try refreshing.</button>
        </p>
      ) : isEmpty ? (
        <p className="font-body text-muted">No praxes yet. Be the first.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {soloItems.map((p) => (
            <PraxisCard key={`praxis-${p.id}`} praxis={p} />
          ))}
          {collabItems.map((c) => (
            <CollaborationCard key={`collab-${c.id}`} collab={c} />
          ))}
        </div>
      )}
    </div>
  )
}
