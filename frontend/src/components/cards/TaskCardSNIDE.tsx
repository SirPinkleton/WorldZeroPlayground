import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'
import LevelPill from '../ui/LevelPill'
import { factionCssVar } from '../../utils/factions'

/**
 * S.N.I.D.E. — Newspaper Clipping.
 * Aged newsprint, torn top/bottom edges, masthead, two-column body, cutout ransom letters.
 */

const TORN_CLIP = 'polygon(0% 0%, 4% 100%, 8% 20%, 12% 90%, 16% 10%, 20% 80%, 24% 0%, 28% 100%, 32% 15%, 36% 85%, 40% 5%, 44% 95%, 48% 20%, 52% 80%, 56% 0%, 60% 100%, 64% 15%, 68% 90%, 72% 5%, 76% 85%, 80% 0%, 84% 100%, 88% 20%, 92% 80%, 96% 10%, 100% 0%)'

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

function CutoutLetters({ text }: { text: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {text.split('').map((char, index) =>
        char === '.' ? (
          <span key={index} style={{ fontSize: 'var(--text-sm)', fontFamily: "'Courier Prime', monospace", color: factionCssVar('snide', 'card-accent') }}>.</span>
        ) : (
          <span key={index} style={{ background: factionCssVar('snide', 'card-accent'), color: factionCssVar('snide', 'card-bg'), fontFamily: "'Courier Prime', monospace", fontSize: 'var(--text-sm)', padding: '0 2px', lineHeight: 1.4 }}>
            {char}
          </span>
        )
      )}
    </span>
  )
}

export default function TaskCardSNIDE({ task, onSignup }: Props) {
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
        background: factionCssVar('snide', 'card-bg'),
        position: 'relative',
        padding: '10px 10px 12px',
        fontFamily: "'Special Elite', serif",
        color: factionCssVar('snide', 'card-text'),
        transition: 'background 150ms, color 150ms',
      }}
    >
      <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 6, background: 'var(--color-bg-page)', clipPath: TORN_CLIP }} />
      <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 6, background: 'var(--color-bg-page)', clipPath: TORN_CLIP }} />

      <div style={{ fontSize: 6, textTransform: 'uppercase', letterSpacing: '0.25em', color: factionCssVar('snide', 'card-muted'), borderBottom: `1.5px solid ${factionCssVar('snide', 'card-accent')}`, paddingBottom: 3, marginBottom: 5 }}>
        The Daily Snide Gazette
      </div>

      <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2, marginBottom: 4, overflowWrap: 'anywhere' }}>{task.title}</div>
      </Link>

      <div style={{ marginBottom: 6 }}>
        <CutoutLetters text="S.N.I.D.E." />
        <span style={{ fontSize: 'var(--text-xs)', color: factionCssVar('snide', 'card-accent'), marginLeft: 4 }}>{task.point_value} pts</span>
      </div>

      {task.description && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 4, marginBottom: 8 }}>
          <div style={{ fontSize: 7.5, color: factionCssVar('snide', 'card-muted'), lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{col1}</div>
          <div style={{ background: 'var(--color-border)' }} />
          <div style={{ fontSize: 7.5, color: factionCssVar('snide', 'card-muted'), lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{col2}</div>
        </div>
      )}

      {onSignup && (
        <button onClick={() => onSignup(task.id)} className="btn-primary" style={{ fontSize: 7, padding: '2px 8px', marginBottom: 6 }}>sign up</button>
      )}

      <div className="card-footer">
        <span style={{ fontSize: 'var(--text-xs)', color: factionCssVar('snide', 'card-accent'), fontFamily: "'Courier Prime', monospace" }}>{task.point_value} pts</span>
        <LevelPill level={task.level_required} factionSlug="snide" />
      </div>
    </div>
  )
}
