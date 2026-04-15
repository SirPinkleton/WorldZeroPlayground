import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'
import { factionCssVar } from '../../utils/factions'

/**
 * UA Masters — Newspaper / Gazette.
 * Full newspaper format, deckled corner-snipped edges, masthead, headline + dateline, two columns.
 */

interface Props {
  task: TaskOut
  displayPoints: number
  onSignup?: (id: number) => void
}

export default function TaskCardUAMasters({ task, displayPoints, onSignup }: Props) {
  const words = (task.description ?? '').split(' ')
  const mid = Math.ceil(words.length / 2)
  const col1 = words.slice(0, mid).join(' ')
  const col2 = words.slice(mid).join(' ')

  return (
    <div
      style={{
        minWidth: 136,
        maxWidth: 164,
        flex: '0 1 148px',
        background: factionCssVar('ua_masters', 'card-bg'),
        border: '1px solid var(--color-border)',
        clipPath: 'polygon(0 0, 98% 0, 100% 2%, 100% 98%, 98% 100%, 2% 100%, 0 98%, 0 2%)',
        padding: '10px 10px 12px',
        fontFamily: "'Special Elite', serif",
        color: factionCssVar('ua_masters', 'card-text'),
        transition: 'background 150ms, color 150ms',
      }}
    >
      <div style={{ fontSize: 6, textTransform: 'uppercase', letterSpacing: '0.2em', color: factionCssVar('ua_masters', 'card-muted'), borderBottom: `2px solid ${factionCssVar('ua_masters', 'card-accent')}`, paddingBottom: 3, marginBottom: 5 }}>
        The UA Masters Gazette
      </div>

      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ fontSize: 13, lineHeight: 1.2, marginBottom: 3, overflowWrap: 'anywhere' }}>{task.title}</div>
      </Link>

      <div style={{ fontSize: 7, fontStyle: 'italic', color: factionCssVar('ua_masters', 'card-muted'), marginBottom: 6 }}>
        UA Masters · {displayPoints} points
      </div>

      {task.description && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 4, marginBottom: 8 }}>
          <div style={{ fontSize: 7.5, color: factionCssVar('ua_masters', 'card-muted'), lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{col1}</div>
          <div style={{ background: 'var(--color-border)' }} />
          <div style={{ fontSize: 7.5, color: factionCssVar('ua_masters', 'card-muted'), lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{col2}</div>
        </div>
      )}

      {onSignup && (
        <button onClick={() => onSignup(task.id)} className="btn-primary" style={{ fontSize: 7, padding: '2px 8px', marginBottom: 6 }}>sign up</button>
      )}

      <div className="card-footer">
        <span style={{ fontSize: 'var(--text-xs)', color: factionCssVar('ua_masters', 'card-accent'), fontFamily: "'Courier Prime', monospace" }}>{displayPoints} pts</span>
        <LevelPill level={task.level_required} factionSlug="ua_masters" />
      </div>
    </div>
  )
}
