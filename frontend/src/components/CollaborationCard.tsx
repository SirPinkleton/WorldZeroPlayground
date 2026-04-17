import { Link } from 'react-router-dom'
import type { PraxisCardOut } from '../api/praxis'
import { factionCssVar } from '../utils/factions'

interface Props {
  collab: PraxisCardOut
}

export default function CollaborationCard({ collab }: Props) {
  const isDuel = collab.type === 'duel'

  return (
    <div
      className="card p-4 flex flex-col gap-2 transition-all duration-150"
      style={{
        background: factionCssVar(null, 'card-bg'),
        borderLeft: `4px solid ${factionCssVar(null, 'card-accent')}`,
        color: factionCssVar(null, 'card-text'),
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

      {/* Title or member count */}
      <Link to={`/praxes/${collab.id}`}>
        <h3 className="font-display text-lg font-semibold leading-tight hover:underline">
          {collab.title ?? `${collab.type === 'duel' ? 'Duel' : 'Collaboration'} · ${collab.member_count} players`}
        </h3>
      </Link>

      <div className="flex justify-between items-center pt-2 border-t border-dashed border-border/40 font-body text-xs text-muted mt-auto">
        <Link to={`/praxes/${collab.id}`} className="hover:underline">
          View {isDuel ? 'duel' : 'collaboration'}
        </Link>
        {collab.score !== null && collab.score > 0 && (
          <span className="font-display text-sm font-bold text-ink">
            ★ {collab.score.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  )
}
