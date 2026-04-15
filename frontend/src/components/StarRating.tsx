import { useState } from 'react'
import { castVote } from '../api/votes'
import { useAuth } from '../auth/AuthContext'
import { extractError } from '../utils/errors'

interface Props {
  praxisId: number
  currentStars?: number
  averageStars?: number
  totalVotes?: number
}

export default function StarRating({ praxisId, currentStars, averageStars, totalVotes }: Props) {
  const { user } = useAuth()
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(currentStars ?? 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleVote = async (stars: number) => {
    setSaving(true)
    setError('')
    try {
      await castVote(praxisId, stars)
      setSelected(stars)
    } catch (err) {
      setError(extractError(err, 'Could not save your rating. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const display = hovered || selected

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={saving || !user}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => void handleVote(star)}
            className={`font-display text-2xl leading-none transition-colors disabled:cursor-default ${
              star <= display ? 'text-ink' : 'text-border/30'
            }`}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
        {averageStars !== undefined && (
          <span className="font-body text-xs text-muted ml-2">
            {averageStars.toFixed(1)} avg · {totalVotes ?? 0} votes
          </span>
        )}
      </div>
      {error && <p className="font-body text-xs text-red-600">{error}</p>}
      {!user && <p className="font-body text-xs text-muted">Log in to rate this praxis.</p>}
    </div>
  )
}
