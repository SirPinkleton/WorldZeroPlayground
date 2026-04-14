import { Link } from 'react-router-dom'
import type { SubmissionOut } from '../api/submissions'
import { useAuth } from '../auth/AuthContext'
import { useAdminMode } from '../auth/AdminModeContext'
import { moderateSubmission } from '../api/admin'
import { factionCssVar } from '../utils/factions'

interface Props {
  submission: SubmissionOut
  onModerated?: () => void
}

export default function SubmissionCard({ submission, onModerated }: Props) {
  const { user } = useAuth()
  const { adminMode } = useAdminMode()
  const showAdminControls = user?.is_admin && adminMode

  const handleHide = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await moderateSubmission(submission.id, 'hidden')
    onModerated?.()
  }

  return (
    <div
      className="card p-4 flex flex-col gap-2 transition-all duration-150 relative"
      style={{
        background: factionCssVar(submission.task_faction_slug, 'card-bg'),
        borderLeft: `4px solid ${factionCssVar(submission.task_faction_slug, 'card-accent')}`,
        color: factionCssVar(submission.task_faction_slug, 'card-text'),
      }}
    >
      {/* Moderation status badges */}
      {submission.moderation_status === 'flagged' && (
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
      {submission.moderation_status === 'failed' && (
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

      {/* Admin hide button */}
      {showAdminControls && submission.moderation_status === 'visible' && (
        <button
          onClick={(e) => void handleHide(e)}
          className="eyebrow"
          style={{
            position: 'absolute', top: 8, right: 8,
            fontSize: 7, padding: '1px 5px',
            border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626',
            background: 'rgba(220,38,38,0.05)',
            cursor: 'pointer',
          }}
        >
          hide
        </button>
      )}

      <Link to={`/submissions/${submission.id}`}>
        <h3 className="font-display text-xl font-semibold leading-tight hover:underline">
          {submission.title}
        </h3>
      </Link>

      {submission.body_text && (
        <p className="font-body text-sm text-muted leading-relaxed line-clamp-3">
          {submission.body_text}
        </p>
      )}

      <Link to={`/tasks/${submission.task_id}`} className="font-body text-xs text-muted hover:underline">
        {submission.task_title}
      </Link>

      <div className="flex justify-between items-center pt-2 border-t border-dashed border-border/40 font-body text-xs text-muted mt-auto">
        <Link to={`/characters/${submission.character_id}`} className="hover:underline">
          {submission.character_display_name || `#${submission.character_id}`}
        </Link>
        {submission.score !== null && (
          <span className="font-display text-sm font-bold text-ink">
            ★ {submission.score.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  )
}
