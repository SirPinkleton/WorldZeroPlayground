import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'

/**
 * Gestalt — Collage / Layered Scraps (Style Guide §6.3).
 * Three stacked paper scraps at different rotations + scotch tape strip.
 */

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

export default function TaskCardGestalt({ task, onSignup }: Props) {
  return (
    <div style={{ position: 'relative', width: 138, height: 'auto', minHeight: 128 }}>
      {/* Back scrap 2 (deepest) */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: -4,
          right: -4,
          height: 20,
          background: '#bbf7d0',
          border: '1.5px solid rgba(0,0,0,0.12)',
          transform: 'rotate(-4deg)',
          borderRadius: 1,
        }}
      />

      {/* Back scrap 1 */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: -2,
          right: -2,
          height: 30,
          background: '#dcfce7',
          border: '1.5px solid rgba(0,0,0,0.12)',
          transform: 'rotate(3deg)',
          borderRadius: 1,
        }}
      />

      {/* Front scrap (main content) */}
      <div
        style={{
          position: 'relative',
          background: '#f0fdf4',
          border: '1.5px solid rgba(0,0,0,0.12)',
          transform: 'rotate(-2deg)',
          padding: '18px 10px 12px',
          fontFamily: "'Courier Prime', monospace",
          color: '#14532d',
          zIndex: 2,
        }}
      >
        {/* Scotch tape strip */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: '50%',
            transform: 'translateX(-50%) rotate(-1deg)',
            width: 40,
            height: 12,
            background: 'rgba(250,230,130,0.7)',
            borderRadius: 1,
          }}
        />

        {/* Faction + points */}
        <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#15803d', marginBottom: 6 }}>
          Gestalt · {task.point_value} pts
        </div>

        {/* Title */}
        <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
            {task.title}
          </div>
        </Link>

        {/* Description */}
        {task.description && (
          <div style={{ fontSize: 8, color: '#2d6a4f', lineHeight: 1.4, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
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
          <span style={{ fontSize: 10, fontWeight: 700 }}>{task.point_value}</span>
        </div>
      </div>
    </div>
  )
}
