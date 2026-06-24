import type { VoteUIProps } from './VoteUI'
import { useVote } from './useVote'
import { VoteLoginGate, VoteSummary } from './VoteShell'

/**
 * Everymen faction vote UI — union "approval stamps" with an escalating
 * ink ramp (gold → red → the authoritative black seal at 5). Square stamp
 * buttons with a 2px border and a dashed inset on the active stamp, Bebas
 * Neue numerals, tiny uppercase labels, and an average display below.
 *
 * Plugs into the vote dispatcher via the shared {@link useVote} hook so the
 * cast/refetch logic lives in exactly one place.
 */

interface StampConfig {
  value: number
  label: string
  fill: string
  ink: string
}

const STAMP_SIZE = 40

export const STAMPS: StampConfig[] = [
  { value: 1, label: 'a start',   fill: 'var(--everymen-gold)',      ink: 'var(--everymen-ink)' },
  { value: 2, label: 'solid',     fill: 'var(--everymen-gold-deep)', ink: 'var(--everymen-cream)' },
  { value: 3, label: 'good',      fill: 'var(--everymen-red)',       ink: 'var(--everymen-cream)' },
  { value: 4, label: 'excellent', fill: 'var(--everymen-red-deep)',  ink: 'var(--everymen-cream)' },
  { value: 5, label: 'legendary', fill: 'var(--everymen-ink)',       ink: 'var(--everymen-gold)' },
]

export default function EverymenVote({ praxisId, currentStars, averageStars, totalVotes, mode = 'caster' }: VoteUIProps) {
  const { user, selected, saving, error, vote } = useVote(praxisId, currentStars)

  if (mode === 'summary') {
    const tier = STAMPS[Math.max(0, Math.round((averageStars ?? 0)) - 1)] ?? STAMPS[0]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            width: 34,
            height: 34,
            background: tier.fill,
            color: tier.ink,
            border: '2px solid var(--everymen-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--faction-everymen-card-font)',
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {tier.value}
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 7.5, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--everymen-muted)', textAlign: 'center' }}>
          {tier.label}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 7, color: 'var(--everymen-muted)', textAlign: 'center' }}>
          {totalVotes ?? 0} votes
        </span>
      </div>
    )
  }

  if (!user) {
    return <VoteLoginGate />
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 9 }}>
        {STAMPS.map((stamp) => {
          const filled = selected >= stamp.value
          const active = selected === stamp.value
          return (
            <div
              key={stamp.value}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            >
              <button
                disabled={saving}
                onClick={() => void vote(stamp.value)}
                aria-label={`Rate ${stamp.value} — ${stamp.label}`}
                style={{
                  position: 'relative',
                  width: STAMP_SIZE,
                  height: STAMP_SIZE,
                  cursor: saving ? 'default' : 'pointer',
                  padding: 0,
                  border: '2px solid var(--everymen-ink)',
                  borderRadius: 0,
                  background: filled ? stamp.fill : 'var(--everymen-paper)',
                  color: filled ? stamp.ink : 'var(--everymen-ink)',
                  fontFamily: 'var(--faction-everymen-card-font)',
                  fontSize: STAMP_SIZE * 0.5,
                  lineHeight: 1,
                  transform: active ? 'rotate(-4deg) scale(1.08)' : 'none',
                  transition: 'all 110ms',
                } as React.CSSProperties}
              >
                <span
                  style={{
                    position: 'absolute',
                    inset: 3,
                    border: `1px dashed ${
                      filled
                        ? 'rgba(255,255,255,0.4)'
                        : 'color-mix(in srgb, var(--everymen-ink) 30%, transparent)'
                    }`,
                    pointerEvents: 'none',
                  }}
                />
                {stamp.value}
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 7.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: active ? 'var(--everymen-red)' : 'var(--everymen-muted)',
                  maxWidth: STAMP_SIZE + 8,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {stamp.label}
              </span>
            </div>
          )
        })}
      </div>

      <VoteSummary
        selected={selected}
        averageStars={averageStars}
        totalVotes={totalVotes}
        error={error}
        theme={{
          muted: 'var(--everymen-muted)',
          accent: 'var(--everymen-red)',
          accentFont: 'var(--faction-everymen-card-font)',
          avgFontSize: 15,
          errorColor: 'var(--everymen-red)',
          avgLetterSpacing: '0.04em',
        }}
      />
    </div>
  )
}
