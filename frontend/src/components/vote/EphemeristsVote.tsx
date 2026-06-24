import type { VoteUIProps } from "./VoteUI";
import { useVote } from "./useVote";
import { VoteLoginGate, VoteSummary } from "./VoteShell";
import { CONCORD, toRoman } from "../cards/ephemeristsAtoms";

/**
 * The Ephemerists vote UI — THE CONCORDANCE. The 1–5 approval becomes a
 * wax-seal ramp ("how well does the filed truth hold up?"): apocryphal → the
 * authoritative ink seal at V. Round seal buttons with a dashed inset, Cinzel
 * roman numerals, italic tier labels. Drives the shared useVote hook.
 */
const SEAL_SIZE = 42;

export default function EphemeristsVote({
  praxisId,
  currentStars,
  averageStars,
  totalVotes,
  mode = 'caster',
}: VoteUIProps) {
  const { user, selected, saving, error, vote } = useVote(praxisId, currentStars);

  if (mode === 'summary') {
    const tier = CONCORD[Math.max(0, Math.round((averageStars ?? 0)) - 1)] ?? CONCORD[0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: '2px solid var(--eph-ink)',
            background: tier.fill,
            color: tier.ink,
            fontFamily: 'var(--eph-display)',
            fontWeight: 700,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {toRoman(tier.v)}
        </div>
        <span style={{ fontFamily: 'var(--eph-serif)', fontSize: 8, fontStyle: 'italic', color: 'var(--eph-muted)', textAlign: 'center' }}>
          {tier.label}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 7, color: 'var(--eph-muted)', textAlign: 'center' }}>
          {totalVotes ?? 0} votes
        </span>
      </div>
    );
  }

  if (!user) {
    return <VoteLoginGate />;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {CONCORD.map((tier) => {
          const filled = selected >= tier.v;
          const active = selected === tier.v;
          return (
            <div key={tier.v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <button
                disabled={saving}
                onClick={() => void vote(tier.v)}
                aria-label={`Mark ${tier.v} — ${tier.label}`}
                style={{
                  position: "relative",
                  width: SEAL_SIZE,
                  height: SEAL_SIZE,
                  cursor: saving ? "default" : "pointer",
                  padding: 0,
                  borderRadius: "50%",
                  border: "2px solid var(--eph-ink)",
                  background: filled ? tier.fill : "var(--eph-vellum)",
                  color: filled ? tier.ink : "var(--eph-muted)",
                  fontFamily: "var(--eph-display)",
                  fontWeight: 700,
                  fontSize: SEAL_SIZE * 0.34,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: active ? "rotate(-5deg) scale(1.09)" : "none",
                  transition: "all 110ms",
                  boxShadow: filled
                    ? "inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.18)"
                    : "none",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    inset: 3,
                    borderRadius: "50%",
                    border: `1px dashed ${
                      filled
                        ? "color-mix(in srgb, #fff 40%, transparent)"
                        : "color-mix(in srgb, var(--eph-vellum-text) 28%, transparent)"
                    }`,
                    pointerEvents: "none",
                  }}
                />
                {toRoman(tier.v)}
              </button>
              <span
                style={{
                  fontFamily: "var(--eph-serif)",
                  fontSize: 8,
                  fontStyle: "italic",
                  letterSpacing: "0.02em",
                  color: active ? "var(--eph-rubric)" : "var(--eph-muted)",
                  maxWidth: SEAL_SIZE + 12,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {tier.label}
              </span>
            </div>
          );
        })}
      </div>

      <VoteSummary
        selected={selected}
        averageStars={averageStars}
        totalVotes={totalVotes}
        error={error}
        theme={{
          muted: "var(--eph-muted)",
          accent: "var(--eph-rubric)",
          accentFont: "var(--eph-display)",
          avgFontSize: 15,
          errorColor: "var(--eph-rubric)",
          avgLetterSpacing: "0.02em",
        }}
      />
    </div>
  );
}
