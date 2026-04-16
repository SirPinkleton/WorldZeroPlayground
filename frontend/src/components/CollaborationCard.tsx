import { Link } from 'react-router-dom'
import type { CollaborationCardOut } from '../api/collaborations'
import { factionCssVar } from '../utils/factions'

interface Props {
  collab: CollaborationCardOut
}

export default function CollaborationCard({ collab }: Props) {
  const isDuel = collab.mode === 'duel'
  const separator = isDuel ? ' × ' : ', '
  const memberNames = collab.members.map((m) => m.display_name).join(separator)

  return (
    <div
      className="card p-4 flex flex-col gap-2 transition-all duration-150"
      style={{
        background: factionCssVar(collab.task_faction_slug, 'card-bg'),
        borderLeft: `4px solid ${factionCssVar(collab.task_faction_slug, 'card-accent')}`,
        color: factionCssVar(collab.task_faction_slug, 'card-text'),
      }}
    >
      {/* Mode label */}
      <span
        className="eyebrow self-start"
        style={{
          fontSize: 7, padding: '1px 6px',
          background: isDuel ? 'rgba(220,38,38,0.12)' : 'rgba(21,128,61,0.12)',
          color: isDuel ? '#dc2626' : '#15803d',
          border: `1px solid ${isDuel ? 'rgba(220,38,38,0.3)' : 'rgba(21,128,61,0.3)'}`,
        }}
      >
        {isDuel ? 'Duel' : 'Collaboration'}
      </span>

      {/* Task link */}
      <Link to={`/tasks/${collab.task_id}`} className="font-body text-xs text-muted hover:underline">
        {collab.task_title}
      </Link>

      {/* Members */}
      <Link to={`/collaborations/${collab.id}`}>
        <h3 className="font-display text-lg font-semibold leading-tight hover:underline">
          {memberNames}
        </h3>
      </Link>

      {/* Score row */}
      {collab.members.some((m) => m.score !== null) && (
        <div className="flex gap-3 font-body text-xs text-muted">
          {collab.members.map((m) => (
            <span key={m.character_id}>
              {m.display_name}: {m.score !== null ? `★ ${m.score.toFixed(1)}` : '—'}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-dashed border-border/40 font-body text-xs text-muted mt-auto">
        <Link to={`/collaborations/${collab.id}`} className="hover:underline">
          View {isDuel ? 'duel' : 'collaboration'}
        </Link>
      </div>
    </div>
  )
}
