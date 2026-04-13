import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'

/**
 * UA Masters — Newspaper / Gazette (Style Guide §6.7).
 * Full newspaper format, deckled corner-snipped edges, masthead, headline + dateline, two columns.
 */

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

export default function TaskCardUAMasters({ task, onSignup }: Props) {
  const words = (task.description ?? '').split(' ')
  const mid = Math.ceil(words.length / 2)
  const col1 = words.slice(0, mid).join(' ')
  const col2 = words.slice(mid).join(' ')

  return (
    <div
      style={{
        width: 148,
        background: '#f0ead8',
        border: '1px solid rgba(0,0,0,0.12)',
        clipPath: 'polygon(0 0, 98% 0, 100% 2%, 100% 98%, 98% 100%, 2% 100%, 0 98%, 0 2%)',
        padding: '10px 10px 12px',
        fontFamily: "'Special Elite', serif",
        color: '#1a1209',
      }}
    >
      {/* Masthead */}
      <div style={{ fontSize: 6, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#555', borderBottom: '2px solid #1a1209', paddingBottom: 3, marginBottom: 5 }}>
        The UA Masters Gazette
      </div>

      {/* Headline */}
      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ fontSize: 13, lineHeight: 1.2, marginBottom: 3 }}>
          {task.title}
        </div>
      </Link>

      {/* Dateline */}
      <div style={{ fontSize: 7, fontStyle: 'italic', color: '#777', marginBottom: 6 }}>
        UA Masters · {task.point_value} points
      </div>

      {/* Two-column body */}
      {task.description && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 4, marginBottom: 8 }}>
          <div style={{ fontSize: 7.5, color: '#333', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
            {col1}
          </div>
          <div style={{ background: 'rgba(0,0,0,0.12)' }} />
          <div style={{ fontSize: 7.5, color: '#333', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
            {col2}
          </div>
        </div>
      )}

      {/* Sign up */}
      {onSignup && (
        <button onClick={() => onSignup(task.id)} className="btn-primary" style={{ fontSize: 7, padding: '2px 8px', marginBottom: 6 }}>
          sign up
        </button>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.15)', paddingTop: 5 }}>
        <span style={{ fontSize: 8, color: '#555', fontFamily: "'Courier Prime', monospace" }}>{task.point_value} pts</span>
        <LevelPill level={task.level_required} />
      </div>
    </div>
  )
}
