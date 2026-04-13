import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'
import { useTheme } from '../../hooks/useTheme'

/**
 * S.N.I.D.E. — Newspaper Clipping (Style Guide §6.4).
 * Aged newsprint, torn top/bottom edges, masthead, two-column body, cutout ransom letters.
 */

const TORN_CLIP = 'polygon(0% 0%, 4% 100%, 8% 20%, 12% 90%, 16% 10%, 20% 80%, 24% 0%, 28% 100%, 32% 15%, 36% 85%, 40% 5%, 44% 95%, 48% 20%, 52% 80%, 56% 0%, 60% 100%, 64% 15%, 68% 90%, 72% 5%, 76% 85%, 80% 0%, 84% 100%, 88% 20%, 92% 80%, 96% 10%, 100% 0%)'

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

function CutoutLetters({ text, dark }: { text: string; dark: boolean }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {text.split('').map((char, index) =>
        char === '.' ? (
          <span key={index} style={{ fontSize: 9, fontFamily: "'Courier Prime', monospace", color: dark ? '#c49a3a' : '#8a6a20' }}>.</span>
        ) : (
          <span key={index} style={{ background: dark ? '#c49a3a' : '#1a1209', color: dark ? '#1a1710' : 'white', fontFamily: "'Courier Prime', monospace", fontSize: 9, padding: '0 2px', lineHeight: 1.4 }}>
            {char}
          </span>
        )
      )}
    </span>
  )
}

export default function TaskCardSNIDE({ task, onSignup }: Props) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const words = (task.description ?? '').split(' ')
  const mid = Math.ceil(words.length / 2)
  const col1 = words.slice(0, mid).join(' ')
  const col2 = words.slice(mid).join(' ')
  const pageBg = dark ? '#13121a' : 'var(--color-bg-page)'

  return (
    <div
      style={{
        width: 148,
        background: dark ? '#1a1710' : '#f0e8d0',
        position: 'relative',
        padding: '10px 10px 12px',
        fontFamily: "'Special Elite', serif",
        color: dark ? '#f0e6d0' : '#1a1209',
        transition: 'background 150ms, color 150ms',
      }}
    >
      <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 6, background: pageBg, clipPath: TORN_CLIP }} />
      <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 6, background: pageBg, clipPath: TORN_CLIP }} />

      <div style={{ fontSize: 6, textTransform: 'uppercase', letterSpacing: '0.25em', color: dark ? '#7a6a50' : '#666', borderBottom: `1.5px solid ${dark ? '#c49a3a' : '#1a1209'}`, paddingBottom: 3, marginBottom: 5 }}>
        The Daily Snide Gazette
      </div>

      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ fontSize: 12, lineHeight: 1.2, marginBottom: 4 }}>{task.title}</div>
      </Link>

      <div style={{ marginBottom: 6 }}>
        <CutoutLetters text="S.N.I.D.E." dark={dark} />
        <span style={{ fontSize: 8, color: dark ? '#c49a3a' : '#8a6a20', marginLeft: 4 }}>{task.point_value} pts</span>
      </div>

      {task.description && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 4, marginBottom: 8 }}>
          <div style={{ fontSize: 7.5, color: dark ? '#7a6a50' : '#444', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{col1}</div>
          <div style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)' }} />
          <div style={{ fontSize: 7.5, color: dark ? '#7a6a50' : '#444', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{col2}</div>
        </div>
      )}

      {onSignup && (
        <button onClick={() => onSignup(task.id)} className="btn-primary" style={{ fontSize: 7, padding: '2px 8px', marginBottom: 6 }}>sign up</button>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.15)'}`, paddingTop: 5 }}>
        <span style={{ fontSize: 8, color: dark ? '#c49a3a' : '#8a6a20', fontFamily: "'Courier Prime', monospace" }}>{task.point_value} pts</span>
        <LevelPill level={task.level_required} factionColor={dark ? '#c49a3a' : undefined} />
      </div>
    </div>
  )
}
