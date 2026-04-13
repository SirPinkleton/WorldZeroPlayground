import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'

/**
 * UA — Sticky Note card (Style Guide §6.1).
 * Pastel yellow/pink, push pin at top, clipped corner, slight rotation.
 */

const COLORS = ['#fef9c3', '#fce7f3'] // yellow, pink
const PIN_COLORS = ['#fbbf24', '#f472b6']
const ROTATIONS = [-2, 1.5, -1, 2.5]

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

export default function TaskCardUA({ task, onSignup }: Props) {
  const variant = task.id % 2
  const rotation = ROTATIONS[task.id % ROTATIONS.length]

  return (
    <div
      style={{
        width: 125,
        background: COLORS[variant],
        clipPath: 'polygon(0 0, 100% 0, 100% 88%, 88% 100%, 0 100%)',
        transform: `rotate(${rotation}deg)`,
        position: 'relative',
        padding: '24px 12px 14px',
        fontFamily: "'Courier Prime', monospace",
        color: '#1a1209',
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
          background: PIN_COLORS[variant],
          border: '2px solid rgba(0,0,0,0.25)',
        }}
      />

      {/* Faction + points */}
      <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6a7a', marginBottom: 6 }}>
        UA · {task.point_value} pts
      </div>

      {/* Title */}
      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          {task.title}
        </div>
      </Link>

      {/* Description */}
      {task.description && (
        <div style={{ fontSize: 8, color: '#444', lineHeight: 1.4, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {task.description}
        </div>
      )}

      {/* Sign up */}
      {onSignup && (
        <button onClick={() => onSignup(task.id)} className="btn-primary" style={{ fontSize: 7, padding: '2px 8px', marginBottom: 6 }}>
          sign up
        </button>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(0,0,0,0.15)', paddingTop: 6, marginTop: 'auto' }}>
        <LevelPill level={task.level_required} />
        <span style={{ fontSize: 10, fontWeight: 700 }}>{task.point_value}</span>
      </div>
    </div>
  )
}
