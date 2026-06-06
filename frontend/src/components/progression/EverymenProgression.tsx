import type { ProgressionProps } from './Progression'

/**
 * Everymen progression indicator — a stamped enlistment chevron pill.
 * Bebas numeral on an ink field with a gold rank hairline.
 */
export default function EverymenProgression({ level }: ProgressionProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 4,
        background: 'var(--everymen-ink)',
        color: 'var(--everymen-cream)',
        padding: '2px 9px',
        borderTop: '2px solid var(--everymen-gold)',
        fontFamily: 'var(--font-body)',
        fontSize: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
      }}
    >
      Rank
      <span
        style={{
          fontFamily: 'var(--faction-everymen-card-font)',
          fontSize: 15,
          lineHeight: 1,
          color: 'var(--everymen-gold)',
        }}
      >
        {level}
      </span>
    </span>
  )
}
