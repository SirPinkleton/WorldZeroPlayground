import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'
import { factionCssVar } from '../../utils/factions'

/**
 * UA — Sticky Note card.
 * Pastel yellow/pink, push pin at top, clipped corner, slight rotation.
 */

const ROTATIONS = [-2, 1.5, -1, 2.5]

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

export default function TaskCardUA({ task, onSignup }: Props) {
  const rotation = ROTATIONS[task.id % ROTATIONS.length]

  return (
    <div
      style={{
        minWidth: 115,
        maxWidth: 140,
        flex: '0 1 125px',
        background: factionCssVar('ua', 'card-bg'),
        clipPath: 'polygon(0 0, 100% 0, 100% 88%, 88% 100%, 0 100%)',
        transform: `rotate(${rotation}deg)`,
        position: 'relative',
        padding: '24px 12px 14px',
        fontFamily: "'Courier Prime', monospace",
        color: factionCssVar('ua', 'card-text'),
        transition: 'background 150ms, color 150ms',
      }}
    >
      {/* Push pin */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: factionCssVar('ua', 'card-accent'),
          border: '2px solid rgba(0,0,0,0.25)',
        }}
      />

      <div className="card-meta" style={{ color: factionCssVar('ua', 'card-accent') }}>
        UA · {task.point_value} pts
      </div>

      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          {task.title}
        </div>
      </Link>

      {task.description && (
        <div className="card-description" style={{ color: factionCssVar('ua', 'card-muted') }}>
          {task.description}
        </div>
      )}

      {onSignup && (
        <button onClick={() => onSignup(task.id)} className="btn-primary" style={{ fontSize: 7, padding: '2px 8px', marginBottom: 6 }}>
          sign up
        </button>
      )}

      <div className="card-footer">
        <LevelPill level={task.level_required} factionSlug="ua" />
        <span style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{task.point_value}</span>
      </div>
    </div>
  )
}
