import type { ProgressionProps } from './Progression'

/**
 * Gestalt progression indicator — a compact moon-phase pill.
 * A short row of small moons whose lit fraction waxes with the level,
 * trailed by a Caveat "lvl {level}" label. Sized to sit inline in a
 * card footer beside a points value (replaces the global LevelPill).
 *
 * Derived from the redesign kit's MoonNode / GLevelTrack, simplified to
 * an inline form (see gestalt-kit.jsx).
 */

const MOON_COUNT = 5

/** Diameter of a single moon glyph, in px. */
const MOON_SIZE = 12

interface MoonNodeProps {
  /** Lit fraction of this moon, 0 (new) → 1 (full). */
  phase: number
  /** Whether this is the current level's leading moon. */
  active: boolean
  /** Stable, document-unique clip-path id for this glyph. */
  clipId: string
}

/**
 * A single waxing-moon glyph: a lit disc with a shadow disc slid across
 * it under a circular clip, so `phase` reads as the visible lit area.
 */
function MoonNode({ phase, active, clipId }: MoonNodeProps) {
  const radius = 5
  const center = MOON_SIZE / 2
  const shadowOffset = -(2 * radius) * phase
  const stroke = active
    ? 'var(--faction-gestalt-card-accent)'
    : 'var(--faction-gestalt-ivy)'
  const strokeWidth = active ? 1.5 : 1

  return (
    <svg width={MOON_SIZE} height={MOON_SIZE} viewBox={`0 0 ${MOON_SIZE} ${MOON_SIZE}`}>
      <clipPath id={clipId}>
        <circle cx={center} cy={center} r={radius} />
      </clipPath>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="var(--faction-gestalt)"
      />
      <g clipPath={`url(#${clipId})`}>
        <circle
          cx={center + shadowOffset}
          cy={center}
          r={radius}
          fill="var(--faction-gestalt-card-bg)"
        />
      </g>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

export default function GestaltProgression({ level }: ProgressionProps) {
  // Map the level onto MOON_COUNT moons: each successive moon waxes a step
  // further. The moon aligned to the current level reads as "active".
  const activeIndex = ((level - 1) % MOON_COUNT + MOON_COUNT) % MOON_COUNT

  const wrapperStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '2px 8px',
    borderRadius: 20,
    background: 'var(--faction-gestalt-light)',
    border: '1px solid var(--faction-gestalt-border)',
    fontFamily: 'var(--font-body)',
  } as React.CSSProperties

  const moonRowStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    lineHeight: 0,
  } as React.CSSProperties

  const labelStyle = {
    fontFamily: 'var(--faction-gestalt-card-font)',
    fontSize: 14,
    lineHeight: 1,
    color: 'var(--faction-gestalt-card-accent)',
    whiteSpace: 'nowrap',
  } as React.CSSProperties

  return (
    <span style={wrapperStyle}>
      <span style={moonRowStyle}>
        {Array.from({ length: MOON_COUNT }, (_unused, index) => (
          <MoonNode
            key={index}
            phase={(index + 1) / MOON_COUNT}
            active={index === activeIndex}
            clipId={`gestalt-moon-${level}-${index}`}
          />
        ))}
      </span>
      <span style={labelStyle}>lvl {level}</span>
    </span>
  )
}
