import { useEffect, useState } from 'react'
import { listPraxes } from '../api/praxis'
import type { PraxisOut } from '../api/praxis'
import PraxisCard from '../components/PraxisCard'
import PageTitle from '../components/ui/PageTitle'
import { extractError } from '../utils/errors'

export default function Praxes() {
  const [praxes, setPraxes] = useState<PraxisOut[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    listPraxes()
      .then(setPraxes)
      .catch((err) => setFetchError(extractError(err, "Couldn't load praxes.")))
      .finally(() => setLoading(false))
  }, [])

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
      ) : praxes.length === 0 ? (
        <p className="font-body text-muted">No praxes yet. Be the first.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {praxes.map((p) => (
            <PraxisCard key={p.id} praxis={p} />
          ))}
        </div>
      )}
    </div>
  )
}
