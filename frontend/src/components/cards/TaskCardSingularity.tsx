import { Link } from 'react-router-dom'
import type { TaskOut } from '../../api/tasks'

/**
 * Singularity — Terminal Printout (Style Guide §6.6).
 * Always dark background, green terminal text, corner brackets, sprocket holes,
 * scanline overlay, blinking cursor. Same in light and dark mode.
 */

interface Props {
  task: TaskOut
  onSignup?: (id: number) => void
}

/** Row of sprocket holes */
function SprocketHoles() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '4px 0' }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            width: 6,
            height: 4,
            background: 'rgba(10,26,14)',
            border: '1px solid #1a3a22',
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  )
}

export default function TaskCardSingularity({ task, onSignup }: Props) {
  return (
    <div
      style={{
        width: 140,
        background: '#050f08',
        border: '1px solid #1a3a22',
        position: 'relative',
        fontFamily: "'Share Tech Mono', monospace",
        color: '#4ade80',
        overflow: 'hidden',
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(74,222,128,0.015) 2px, rgba(74,222,128,0.015) 4px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Corner brackets */}
      {/* Top-left */}
      <div style={{ position: 'absolute', top: 3, left: 3, width: 10, height: 10, borderTop: '1px solid #4ade80', borderLeft: '1px solid #4ade80' }} />
      {/* Top-right */}
      <div style={{ position: 'absolute', top: 3, right: 3, width: 10, height: 10, borderTop: '1px solid #4ade80', borderRight: '1px solid #4ade80' }} />
      {/* Bottom-left */}
      <div style={{ position: 'absolute', bottom: 3, left: 3, width: 10, height: 10, borderBottom: '1px solid #4ade80', borderLeft: '1px solid #4ade80' }} />
      {/* Bottom-right */}
      <div style={{ position: 'absolute', bottom: 3, right: 3, width: 10, height: 10, borderBottom: '1px solid #4ade80', borderRight: '1px solid #4ade80' }} />

      {/* Sprocket holes top */}
      <SprocketHoles />

      <div style={{ padding: '4px 12px 8px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ fontSize: 7, color: '#1f6b34', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
          singularity protocol
          {/* Blinking cursor */}
          <span
            style={{
              display: 'inline-block',
              width: 5,
              height: 9,
              background: '#4ade80',
              marginLeft: 3,
              verticalAlign: 'middle',
              animation: 'blink 1s step-end infinite',
            }}
          />
        </div>

        {/* Task name with > prefix */}
        <Link to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: 9, marginBottom: 6, lineHeight: 1.3 }}>
            {'> '}{task.title}
          </div>
        </Link>

        {/* Data lines */}
        <div style={{ fontSize: 8, color: '#1f6b34', lineHeight: 1.6, marginBottom: 6 }}>
          <div>PTS: <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 700 }}>{task.point_value}</span></div>
          <div>LVL: {task.level_required}+</div>
        </div>

        {/* Description */}
        {task.description && (
          <div style={{ fontSize: 7, color: '#1f6b34', lineHeight: 1.4, marginBottom: 6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {task.description}
          </div>
        )}

        {/* Sign up */}
        {onSignup && (
          <button
            onClick={() => onSignup(task.id)}
            style={{
              background: 'transparent',
              color: '#4ade80',
              border: '1px solid #4ade80',
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 7,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '2px 8px',
              cursor: 'pointer',
              marginBottom: 4,
            }}
          >
            {'>'} sign up
          </button>
        )}

        {/* Level pill — outline style for Singularity */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #1a3a22', paddingTop: 5 }}>
          <span style={{ border: '1px solid #4ade80', color: '#4ade80', fontSize: 7, padding: '1px 6px', borderRadius: 6, textTransform: 'uppercase' }}>
            lvl {task.level_required}+
          </span>
        </div>
      </div>

      {/* Sprocket holes bottom */}
      <SprocketHoles />

      {/* Blink keyframe */}
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  )
}
