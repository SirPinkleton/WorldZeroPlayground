import { useEffect, useState } from 'react'
import { getFactions } from '../api/factions'
import type { FactionOut } from '../api/factions'
import PageTitle from '../components/ui/PageTitle'
import { extractError } from '../utils/errors'

export default function Factions() {
  const [factions, setFactions] = useState<FactionOut[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getFactions()
      .then(setFactions)
      .catch((err) => setError(extractError(err, 'Could not load factions.')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-8 font-body text-muted">Loading...</div>

  return (
    <div className="py-8">
      <PageTitle title="Factions" />
      <p className="font-body text-sm text-muted mb-6">
        Factions are chosen at level 3. Until then, you start in UA.
      </p>

      {error && (
        <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2 mb-4">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {factions.map((f) => (
          <div
            key={f.slug}
            className="card p-5 flex flex-col gap-2 relative overflow-hidden transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-faction-${f.slug}`} />
            <div className="pl-2">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 bg-faction-${f.slug}`} />
                <h2 className="font-display text-xl font-bold">{f.name}</h2>
              </div>
              {f.description && (
                <p className="font-body text-sm text-ink leading-relaxed">{f.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
