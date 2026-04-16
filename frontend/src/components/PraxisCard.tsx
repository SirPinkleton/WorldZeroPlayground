import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { PraxisOut } from '../api/praxis'
import { useAuth } from '../auth/AuthContext'
import { useAdminMode } from '../auth/AdminModeContext'
import { moderatePraxis } from '../api/admin'
import { factionCssVar } from '../utils/factions'
import { extractError } from '../utils/errors'

interface Props {
  praxis: PraxisOut
  onModerated?: () => void
}

export default function PraxisCard({ praxis, onModerated }: Props) {
  const { user } = useAuth()
  const { adminMode } = useAdminMode()
  const showAdminControls = user?.is_admin && adminMode
  const [localPraxis, setLocalPraxis] = useState(praxis)
  const [moderateError, setModerateError] = useState<string | null>(null)

  const handleHide = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setModerateError(null)
    try {
      const updated = await moderatePraxis(localPraxis.id, 'hidden')
      setLocalPraxis(updated)
      onModerated?.()
    } catch (err) {
      setModerateError(extractError(err, 'Failed to hide.'))
    }
  }

  const handleFail = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setModerateError(null)
    try {
      const updated = await moderatePraxis(localPraxis.id, 'failed')
      setLocalPraxis(updated)
      onModerated?.()
    } catch (err) {
      setModerateError(extractError(err, 'Failed to fail.'))
    }
  }

  return (
    <div
      className="card p-4 flex flex-col gap-2 transition-all duration-150 relative"
      style={{
        background: factionCssVar(localPraxis.task_faction_slug, 'card-bg'),
        borderLeft: `4px solid ${factionCssVar(localPraxis.task_faction_slug, 'card-accent')}`,
        color: factionCssVar(localPraxis.task_faction_slug, 'card-text'),
      }}
    >
      {/* Moderation status badges */}
      {localPraxis.moderation_status === 'flagged' && (
        <span
          className="eyebrow"
          style={{
            position: 'absolute', top: 8, right: 8,
            fontSize: 7, padding: '1px 5px',
            border: '1px solid rgba(220,38,38,0.4)', color: '#dc2626',
            background: 'rgba(220,38,38,0.05)',
          }}
        >
          under review
        </span>
      )}
      {localPraxis.moderation_status === 'failed' && (
        <span
          className="eyebrow"
          style={{
            position: 'absolute', top: 8, right: 8,
            fontSize: 7, padding: '1px 5px',
            border: '1px solid rgba(245,158,11,0.4)', color: '#d97706',
            background: 'rgba(245,158,11,0.05)',
          }}
        >
          failed
        </span>
      )}
      {localPraxis.moderation_status === 'hidden' && (
        <span
          className="eyebrow"
          style={{
            position: 'absolute', top: 8, right: 8,
            fontSize: 7, padding: '1px 5px',
            border: '1px solid rgba(107,114,128,0.4)', color: '#6b7280',
            background: 'rgba(107,114,128,0.05)',
          }}
        >
          hidden
        </span>
      )}

      {moderateError && (
        <p className="font-body text-xs" style={{ color: '#dc2626' }}>{moderateError}</p>
      )}

      {/* Admin action buttons */}
      {showAdminControls && localPraxis.moderation_status === 'visible' && (
        <div
          style={{
            position: 'absolute', top: 8, right: 8,
            display: 'flex', gap: 4,
          }}
        >
          <button
            onClick={(e) => void handleHide(e)}
            className="eyebrow"
            style={{
              fontSize: 7, padding: '1px 5px',
              border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626',
              background: 'rgba(220,38,38,0.05)',
              cursor: 'pointer',
            }}
          >
            hide
          </button>
          <button
            onClick={(e) => void handleFail(e)}
            className="eyebrow"
            style={{
              fontSize: 7, padding: '1px 5px',
              border: '1px solid rgba(245,158,11,0.3)', color: '#d97706',
              background: 'rgba(245,158,11,0.05)',
              cursor: 'pointer',
            }}
          >
            fail
          </button>
        </div>
      )}

      <Link to={`/praxes/${localPraxis.id}`}>
        <h3 className="font-display text-xl font-semibold leading-tight hover:underline">
          {localPraxis.title}
        </h3>
      </Link>

      {localPraxis.body_text && (
        <p className="font-body text-sm text-muted leading-relaxed line-clamp-3">
          {localPraxis.body_text}
        </p>
      )}

      <Link to={`/tasks/${localPraxis.task_id}`} className="font-body text-xs text-muted hover:underline">
        {localPraxis.task_title}
      </Link>

      <div className="flex justify-between items-center pt-2 border-t border-dashed border-border/40 font-body text-xs text-muted mt-auto">
        <Link to={`/characters/${localPraxis.character_id}`} className="hover:underline">
          {localPraxis.character_display_name || `#${localPraxis.character_id}`}
        </Link>
        {localPraxis.score !== null && (
          <span className="font-display text-sm font-bold text-ink">
            ★ {localPraxis.score.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  )
}
