import type { ProgressionProps } from './Progression'

/**
 * S.N.I.D.E. progression — a stencil-cut level readout with spray-tally ticks.
 * Mirrors the other faction progression variants in completeness; registered in
 * the dispatcher but, like the Everymen/Gestalt variants, not yet adopted at a
 * call site (the global LevelPill still renders inside the cards).
 */
export default function SnideProgression({ level }: ProgressionProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--faction-snide-ink)',
        color: 'var(--faction-snide-acid)',
        padding: '3px 9px',
        border: '1.5px dashed var(--faction-snide-acid)',
        transform: 'rotate(-2deg)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--faction-snide-font-cond)',
          fontSize: 12,
          letterSpacing: '0.16em',
        }}
      >
        LVL {level}
      </span>
      <span style={{ display: 'inline-flex', gap: 2 }} aria-hidden="true">
        {Array.from({ length: Math.max(0, Math.min(level, 9)) }).map((_, index) => (
          <span
            key={index}
            style={{
              width: 2,
              height: 12,
              background: 'var(--faction-snide-acid)',
              transform: `rotate(${index % 2 ? 8 : -8}deg)`,
            }}
          />
        ))}
      </span>
    </span>
  )
}
