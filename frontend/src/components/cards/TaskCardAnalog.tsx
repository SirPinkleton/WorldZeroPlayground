import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'

/**
 * Analog — Torn Field Journal Page (Style Guide §6.2).
 * Yellowed paper, red margin rule on left, horizontal ruled lines, torn bottom edge.
 */

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

export default function TaskCardAnalog({ task, onSignup }: Props) {
  return (
    <div
      style={{
        width: 136,
        background: '#fffef5',
        border: '1px solid rgba(0,0,0,0.08)',
        clipPath: 'polygon(0 0, 100% 0, 100% 90%, 92% 100%, 80% 95%, 68% 100%, 56% 93%, 44% 100%, 32% 94%, 20% 100%, 8% 94%, 0 100%)',
        position: 'relative',
        padding: '12px 12px 18px 24px',
        fontFamily: "'Special Elite', serif",
        color: '#1a1209',
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 17px, rgba(100,140,200,0.1) 17px, rgba(100,140,200,0.1) 18px)',
      }}
    >
      {/* Red margin rule */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 0,
          bottom: 0,
          width: 1,
          background: 'rgba(220,80,80,0.25)',
        }}
      />

      {/* Faction + points */}
      <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#15803d', marginBottom: 6, fontFamily: "'Courier Prime', monospace" }}>
        Analog · {task.point_value} pts
      </div>

      {/* Title */}
      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.3, marginBottom: 6 }}>
          {task.title}
        </div>
      </Link>

      {/* Description */}
      {task.description && (
        <div style={{ fontSize: 9, color: '#555', lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(0,0,0,0.12)', paddingTop: 6 }}>
        <LevelPill level={task.level_required} />
        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Courier Prime', monospace" }}>{task.point_value}</span>
      </div>
    </div>
  )
}
