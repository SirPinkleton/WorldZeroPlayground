import { useEffect, useState } from 'react'
import { getFactions } from '../api/factions'
import type { FactionOut } from '../api/factions'
import PageTitle from '../components/ui/PageTitle'
import { extractError } from '../utils/errors'

const FACTION_COLORS: Record<string, string> = {
  ua: '#6b6a7a',
  analog: '#15803d',
  gestalt: '#14532d',
  snide: '#8a6a20',
  journeymen: '#c49a3a',
  singularity: '#7c3aed',
  ua_masters: '#555555',
}

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
        {factions.map((f) => {
          const color = FACTION_COLORS[f.slug] ?? '#6b6a7a'
          return (
            <div
              key={f.slug}
              className="sidebar-card relative overflow-hidden"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <h2 className="font-display italic text-lg" style={{ color }}>
                  {f.name}
                </h2>
              </div>
              {f.description && (
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {f.description}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
