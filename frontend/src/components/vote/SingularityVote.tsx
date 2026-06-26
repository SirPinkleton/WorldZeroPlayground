import type { VoteUIProps } from './VoteUI'
import { useVote } from './useVote'
import { VoteLoginGate, VoteSummary } from './VoteShell'

/**
 * Singularity faction vote UI — THE CONSENSUS ARRAY. The 1-5 rating is rendered
 * as a signal-strength ramp cast into the terminal: noise → weak → signal →
 * clear → verified, measuring how confidently a sealed output holds up to
 * scrutiny. Square mono "cast signal" keys glow when reached; the selected key
 * scales up. Singularity is ALWAYS-DARK — its tokens hold identical terminal
 * values in both themes, so this never touches data-theme.
 *
 * Same 1-5 data model as every other faction — a pure terminal reskin driven by
 * the shared {@link useVote} hook so cast/refetch logic lives in one place.
 */

interface SignalTier {
  value: number
  label: string
  /** Confidence ramp colour — token-derived, low (blue chrome) → high (green). */
  fill: string
}

/**
 * Signal ramp. The design ramp runs cool→warm→green; with the available always-
 * dark tokens we express the same "weak → verified" confidence climb by mixing
 * the terminal-green accent up from the blue brand chrome as confidence rises.
 */
export const SG_CONSENSUS: SignalTier[] = [
  { value: 1, label: 'NOISE', fill: 'var(--faction-singularity-card-muted)' },
  { value: 2, label: 'WEAK', fill: 'color-mix(in srgb, var(--faction-singularity-card-muted) 70%, var(--faction-singularity-card-accent))' },
  { value: 3, label: 'SIGNAL', fill: 'color-mix(in srgb, var(--faction-singularity-card-muted) 40%, var(--faction-singularity-card-accent))' },
  { value: 4, label: 'CLEAR', fill: 'color-mix(in srgb, var(--faction-singularity-card-accent) 75%, var(--faction-singularity-card-muted))' },
  { value: 5, label: 'VERIFIED', fill: 'var(--faction-singularity-card-accent)' },
]

const KEY_SIZE = 42

export default function SingularityVote({ praxisId, currentStars, averageStars, totalVotes, mode = 'caster' }: VoteUIProps) {
  const { user, selected, saving, error, vote } = useVote(praxisId, currentStars)

  if (mode === 'summary') {
    const tier = SG_CONSENSUS[Math.max(0, Math.round(averageStars ?? 0) - 1)] ?? SG_CONSENSUS[0]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            minWidth: 46,
            height: 30,
            padding: '0 9px',
            background: 'var(--faction-singularity-card-bg)',
            outline: `1px solid ${tier.fill}`,
            color: tier.fill,
            fontFamily: 'var(--font-faction-terminal)',
            fontSize: 9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 10px color-mix(in srgb, ${tier.fill} 33%, transparent)`,
          }}
        >
          {tier.label}
        </div>
        <span
          style={{
            fontFamily: 'var(--font-faction-terminal)',
            fontSize: 7,
            letterSpacing: '0.12em',
            color: 'color-mix(in srgb, var(--faction-singularity-card-muted) 55%, transparent)',
            textAlign: 'center',
          }}
        >
          {totalVotes ?? 0} signals
        </span>
      </div>
    )
  }

  if (!user) {
    return <VoteLoginGate />
  }

  return (
    <div style={{ fontFamily: 'var(--font-faction-terminal)' }}>
      <div
        style={{
          fontSize: 8,
          letterSpacing: '0.18em',
          color: 'color-mix(in srgb, var(--faction-singularity-card-muted) 75%, transparent)',
          textTransform: 'uppercase',
          marginBottom: 3,
        }}
      >
        Cast Signal
      </div>
      <div
        style={{
          fontSize: 7.5,
          fontStyle: 'italic',
          color: 'color-mix(in srgb, var(--faction-singularity-card-accent) 50%, transparent)',
          marginBottom: 12,
        }}
      >
        how confidently does this output hold?
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {SG_CONSENSUS.map((tier) => {
          const reached = selected >= tier.value
          const picked = selected === tier.value
          return (
            <div key={tier.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <button
                disabled={saving}
                onClick={() => void vote(tier.value)}
                aria-label={`Cast ${tier.value} — ${tier.label}`}
                style={{
                  position: 'relative',
                  width: KEY_SIZE,
                  height: KEY_SIZE,
                  cursor: saving ? 'default' : 'pointer',
                  padding: 0,
                  border: 'none',
                  background: reached ? tier.fill : 'var(--faction-singularity-light)',
                  color: reached ? 'var(--faction-singularity-card-bg)' : 'color-mix(in srgb, var(--faction-singularity-card-muted) 55%, transparent)',
                  fontFamily: 'var(--font-faction-terminal)',
                  fontWeight: 700,
                  fontSize: 13,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: picked ? 'scale(1.12)' : 'none',
                  transition: 'all 110ms',
                  outline: `1px solid ${reached ? tier.fill : 'var(--faction-singularity-border)'}`,
                  boxShadow: reached ? `0 0 12px color-mix(in srgb, ${tier.fill} 33%, transparent)` : 'none',
                }}
              >
                {tier.value}
              </button>
              <span
                style={{
                  fontSize: 6.5,
                  letterSpacing: '0.08em',
                  color: picked ? tier.fill : 'color-mix(in srgb, var(--faction-singularity-card-muted) 45%, transparent)',
                  maxWidth: KEY_SIZE + 8,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {tier.label}
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
          muted: 'color-mix(in srgb, var(--faction-singularity-card-muted) 60%, transparent)',
          accent: 'var(--faction-singularity-card-accent)',
          accentFont: 'var(--font-faction-terminal)',
          avgFontSize: 17,
          errorColor: 'var(--color-danger)',
          avgLetterSpacing: '0.08em',
        }}
      />
    </div>
  )
}
