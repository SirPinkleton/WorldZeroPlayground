import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'
import { useTheme } from '../../hooks/useTheme'

/**
 * Analog — Torn Field Journal Page (Style Guide §6.2).
 * Yellowed paper, red margin rule on left, horizontal ruled lines, torn bottom edge.
 */

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

export default function TaskCardAnalog({ task, onSignup }: Props) {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  return (
    <div
      style={{
        width: 136,
        background: dark ? '#1e1a10' : '#fffef5',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
        clipPath: 'polygon(0 0, 100% 0, 100% 90%, 92% 100%, 80% 95%, 68% 100%, 56% 93%, 44% 100%, 32% 94%, 20% 100%, 8% 94%, 0 100%)',
        position: 'relative',
        padding: '12px 12px 18px 24px',
        fontFamily: "'Special Elite', serif",
        color: dark ? '#e8dcc8' : '#1a1209',
        backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent 17px, rgba(100,140,200,${dark ? '0.05' : '0.1'}) 17px, rgba(100,140,200,${dark ? '0.05' : '0.1'}) 18px)`,
        transition: 'background 150ms, color 150ms',
      }}
    >
      <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 1, background: `rgba(220,80,80,${dark ? '0.16' : '0.25'})` }} />

      <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#15803d', marginBottom: 6, fontFamily: "'Courier Prime', monospace" }}>
        Analog · {task.point_value} pts
      </div>

      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.3, marginBottom: 6 }}>{task.title}</div>
      </Link>

      {task.description && (
        <div style={{ fontSize: 9, color: dark ? '#a89878' : '#555', lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {task.description}
        </div>
      )}

      {onSignup && (
        <button onClick={() => onSignup(task.id)} className="btn-primary" style={{ fontSize: 7, padding: '2px 8px', marginBottom: 6 }}>sign up</button>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(0,0,0,0.12)', paddingTop: 6 }}>
        <LevelPill level={task.level_required} factionColor={dark ? '#e8dcc8' : undefined} />
        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Courier Prime', monospace" }}>{task.point_value}</span>
      </div>
    </div>
  )
}
