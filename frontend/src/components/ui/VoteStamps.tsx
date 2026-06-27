import { useState } from 'react'
import { castVote } from '../../api/votes'
import { useAuth } from '../../auth/AuthContext'
import { extractError } from '../../utils/errors'

/**
 * Stamp-style vote buttons replacing star rating (Style Guide §13.1).
 * Five rectangular stamps numbered 1–5 with word labels and value-specific colors.
 */

interface StampConfig {
  value: number
  label: string
  color: string
}

const STAMPS: StampConfig[] = [
  { value: 1, label: 'a start', color: 'var(--vote-1)' },
  { value: 2, label: 'solid',   color: 'var(--vote-2)' },
  { value: 3, label: 'good',    color: 'var(--vote-3)' },
  { value: 4, label: 'excellent', color: 'var(--vote-4)' },
  { value: 5, label: 'legendary', color: 'var(--vote-5)' },
]

interface Props {
  praxisId: number
  currentValue?: number
  averageStars?: number | null
  totalVotes?: number
  mode?: 'caster' | 'summary'
}

export default function VoteStamps({ praxisId, currentValue, averageStars, totalVotes }: Props) {
  const { user, refetch } = useAuth()
  const [selected, setSelected] = useState(currentValue ?? 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleVote = async (stars: number) => {
    setSaving(true)
    setError('')
    try {
      await castVote(praxisId, stars)
      setSelected(stars)
      // Refresh sidebar character stats (score/level may have changed)
      void refetch()
    } catch (err) {
      setError(extractError(err, 'Could not save your vote. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Stamp buttons — hidden for logged-out users */}
      {!user ? (
        <p className="eyebrow">Log in to vote</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {STAMPS.map((stamp) => {
            const active = selected === stamp.value
            return (
              <div key={stamp.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <button
                  disabled={saving}
                  onClick={() => void handleVote(stamp.value)}
                  className={active ? 'vote-stamp vote-stamp-active' : 'vote-stamp'}
                  style={{ '--stamp-color': stamp.color } as React.CSSProperties}
                  aria-label={`Rate ${stamp.value} — ${stamp.label}`}
                >
                  {/* Inner dashed border on selected */}
                  {active && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: 2,
                        border: '1px dashed color-mix(in srgb, var(--color-text-on-accent) 25%, transparent)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  {stamp.value}
                </button>
                {/* Word label */}
                <span
                  style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 7,
                    textTransform: 'uppercase',
                    color: active ? stamp.color : 'var(--color-text-tertiary)',
                    maxWidth: 44,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {stamp.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Vote economy info */}
      {selected > 0 && (
        <p className="font-body" style={{ fontSize: 8, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>
          Voted {selected} pts
        </p>
      )}

      {/* Summary */}
      {averageStars != null && (
        <p className="font-body" style={{ fontSize: 9, color: 'var(--color-text-secondary)' }}>
          {averageStars.toFixed(1)} avg · {totalVotes ?? 0} votes
        </p>
      )}

      {error && <p className="font-body" style={{ fontSize: 9, color: 'var(--color-danger)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}
