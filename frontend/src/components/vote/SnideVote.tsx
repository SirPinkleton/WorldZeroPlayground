import type { VoteUIProps } from './VoteUI'
import { useVote } from './useVote'
import { VoteLoginGate, VoteSummary } from './VoteShell'

/**
 * S.N.I.D.E. faction vote UI — the 1-5 rating rendered as a junk-drawer of
 * mismatched rubber stamps climbing from a dismissive "meh" to a black ANARCHY
 * seal. Mixed faces, sizes, and tilts; colours are theme-aware tokens so the
 * stamps read on both the xerox-paper and concrete-night surfaces. Same 1-5
 * data model as every other faction — purely a visual reskin.
 *
 * Plugs into the vote dispatcher via the shared {@link useVote} hook so the
 * cast/refetch logic lives in exactly one place.
 */

interface StampConfig {
  value: number
  label: string
  /** Border + idle text colour (theme-aware token). */
  color: string
  font: string
  /** Corner rounding — square, seal, or full circle. */
  radius: number | string
  rot: number
  fontSize: number
}

const STAMPS: StampConfig[] = [
  { value: 1, label: 'meh', color: 'var(--color-text-tertiary)', font: 'var(--font-body)', radius: 2, rot: -3, fontSize: 10 },
  { value: 2, label: 'not bad', color: '#b59a3a', font: 'var(--font-body)', radius: 2, rot: 2, fontSize: 10 },
  { value: 3, label: 'rad', color: 'var(--faction-snide)', font: 'var(--faction-snide-font-cond)', radius: '50%', rot: -2, fontSize: 13 },
  { value: 4, label: 'sick', color: 'var(--faction-snide-pink)', font: 'var(--faction-snide-font-black)', radius: 3, rot: 3, fontSize: 12 },
  { value: 5, label: 'ANARCHY', color: 'var(--color-text-primary)', font: 'var(--faction-snide-font-black)', radius: 4, rot: -4, fontSize: 12 },
]

export default function SnideVote({ praxisId, currentStars, averageStars, totalVotes }: VoteUIProps) {
  const { user, selected, saving, error, vote } = useVote(praxisId, currentStars)

  if (!user) {
    return <VoteLoginGate />
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center' }}>
        {STAMPS.map((stamp) => {
          const active = selected === stamp.value
          const reached = selected >= stamp.value
          return (
            <button
              key={stamp.value}
              disabled={saving}
              onClick={() => void vote(stamp.value)}
              aria-label={`Rate ${stamp.value} — ${stamp.label}`}
              style={{
                minWidth: 46,
                height: 40,
                padding: '0 10px',
                cursor: saving ? 'default' : 'pointer',
                border: `2.5px ${stamp.value === 5 ? 'double' : 'solid'} ${stamp.color}`,
                borderRadius: stamp.radius,
                background: active
                  ? stamp.color
                  : reached
                    ? `color-mix(in srgb, ${stamp.color} 16%, transparent)`
                    : 'transparent',
                color: active ? '#fff' : stamp.color,
                fontFamily: stamp.font,
                fontSize: stamp.fontSize,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                transform: `rotate(${stamp.rot}deg) scale(${active ? 1.08 : 1})`,
                boxShadow: active ? '2px 3px 0 rgba(0,0,0,0.35)' : 'none',
                transition: 'all 120ms',
              }}
            >
              {stamp.label}
            </button>
          )
        })}
      </div>

      <VoteSummary
        selected={selected}
        averageStars={averageStars}
        totalVotes={totalVotes}
        error={error}
        theme={{
          muted: 'var(--color-text-secondary)',
          accent: 'var(--faction-snide)',
          accentFont: 'var(--faction-snide-font-impact)',
          avgFontSize: 18,
          errorColor: 'var(--color-danger)',
        }}
      />
    </div>
  )
}
