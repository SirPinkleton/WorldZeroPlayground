import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'

/**
 * Journeymen — Luggage Tag (Style Guide §6.5).
 * Hanging string + eyelet, hazard stripe at top, bordered tag body.
 */

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

export default function TaskCardJourneymen({ task, onSignup }: Props) {
  return (
    <div style={{ paddingTop: 26, position: 'relative', width: 118 }}>
      {/* Hanging string */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Dashed string */}
        <div style={{ width: 0, height: 14, borderLeft: '2px dashed #8a6a20' }} />
        {/* Eyelet hole */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            border: '2px solid #8a6a20',
            background: 'var(--color-bg-page)',
          }}
        />
      </div>

      {/* Tag body */}
      <div
        style={{
          border: '2px solid #8a6a20',
          background: '#fef9ee',
          fontFamily: "'Courier Prime', monospace",
          color: '#1a1209',
        }}
      >
        {/* Hazard stripe */}
        <div
          style={{
            height: 3,
            backgroundImage: 'repeating-linear-gradient(90deg, #c2410c 0, #c2410c 8px, #1a1209 8px, #1a1209 16px, #f59e0b 16px, #f59e0b 24px, #1a1209 24px, #1a1209 32px)',
          }}
        />

        <div style={{ padding: '8px 10px 10px' }}>
          {/* Faction + points */}
          <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8a6a20', marginBottom: 5 }}>
            Journeymen · {task.point_value} pts
          </div>

          {/* Title */}
          <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, marginBottom: 5 }}>
              {task.title}
            </div>
          </Link>

          {/* Description */}
          {task.description && (
            <div style={{ fontSize: 8, color: '#555', lineHeight: 1.4, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(0,0,0,0.15)', paddingTop: 5 }}>
            <LevelPill level={task.level_required} />
            <span style={{ fontSize: 10, fontWeight: 700 }}>{task.point_value}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
