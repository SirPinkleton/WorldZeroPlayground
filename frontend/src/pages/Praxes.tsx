import { useEffect, useState } from 'react'
import { listPraxes } from '../api/praxis'
import type { PraxisOut } from '../api/praxis'
import { listPublishedCollaborations } from '../api/collaborations'
import type { CollaborationCardOut } from '../api/collaborations'
import PraxisCard from '../components/PraxisCard'
import CollaborationCard from '../components/CollaborationCard'
import PageTitle from '../components/ui/PageTitle'
import { extractError } from '../utils/errors'

export default function Praxes() {
  const [praxes, setPraxes] = useState<PraxisOut[]>([])
  const [collabs, setCollabs] = useState<CollaborationCardOut[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listPraxes(), listPublishedCollaborations()])
      .then(([praxData, collabData]) => {
        setPraxes(praxData)
        setCollabs(collabData)
      })
      .catch((err) => setFetchError(extractError(err, "Couldn't load praxes.")))
      .finally(() => setLoading(false))
  }, [])

  const isEmpty = praxes.length === 0 && collabs.length === 0

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
          {praxes.map((p) => (
            <PraxisCard key={`praxis-${p.id}`} praxis={p} />
          ))}
          {collabs.map((c) => (
            <CollaborationCard key={`collab-${c.id}`} collab={c} />
          ))}
        </div>
      )}
    </div>
  )
}
