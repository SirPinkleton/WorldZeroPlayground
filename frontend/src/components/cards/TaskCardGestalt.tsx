import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'
import { factionCssVar } from '../../utils/factions'

/**
 * Gestalt — Collage / Layered Scraps.
 * Three stacked paper scraps at different rotations + scotch tape strip.
 */

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

export default function TaskCardGestalt({ task, onSignup }: Props) {
  return (
    <div style={{ position: 'relative', minWidth: 126, maxWidth: 152, flex: '0 1 138px', height: 'auto', minHeight: 128 }}>
      {/* Back scrap 2 (deepest) */}
      <div style={{ position: 'absolute', top: 10, left: -4, right: -4, height: 20, background: 'var(--faction-gestalt-scrap-deep)', border: '1.5px solid rgba(0,0,0,0.12)', transform: 'rotate(-4deg)', borderRadius: 1 }} />
      {/* Back scrap 1 */}
      <div style={{ position: 'absolute', top: 4, left: -2, right: -2, height: 30, background: 'var(--faction-gestalt-scrap-mid)', border: '1.5px solid rgba(0,0,0,0.12)', transform: 'rotate(3deg)', borderRadius: 1 }} />

      {/* Front scrap (main content) */}
      <div
        style={{
          position: 'relative',
          background: factionCssVar('gestalt', 'card-bg'),
          border: '1.5px solid rgba(0,0,0,0.12)',
          transform: 'rotate(-2deg)',
          padding: '18px 10px 12px',
          fontFamily: "'Courier Prime', monospace",
          color: factionCssVar('gestalt', 'card-text'),
          zIndex: 2,
          transition: 'background 150ms, color 150ms',
        }}
      >
        {/* Scotch tape strip */}
        <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%) rotate(-1deg)', width: 40, height: 12, background: 'var(--faction-gestalt-tape)', borderRadius: 1 }} />

        <div className="card-meta" style={{ color: factionCssVar('gestalt', 'card-accent') }}>
          Gestalt · {task.point_value} pts
        </div>

        <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>{task.title}</div>
        </Link>

        {task.description && (
          <div className="card-description" style={{ color: factionCssVar('gestalt', 'card-muted') }}>
            {task.description}
          </div>
        )}

        {onSignup && (
          <button onClick={() => onSignup(task.id)} className="btn-primary" style={{ fontSize: 7, padding: '2px 8px', marginBottom: 6 }}>sign up</button>
        )}

        <div className="card-footer">
          <LevelPill level={task.level_required} factionSlug="gestalt" />
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{task.point_value}</span>
        </div>
      </div>
    </div>
  )
}
