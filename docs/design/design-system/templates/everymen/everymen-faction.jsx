/* ════════════════════════════════════════════════════════════════
   THE EVERYMEN — faction-aware surfaces
   Nav badge · faction pennant (filter tab) · vote stamps (approval) ·
   stat block · faction-page hero. All reuse everymen.css tokens and the
   poster atoms exposed by everymen-cards.jsx (EM_CogMark / EM_Sunburst /
   EM_Halftone). Theme-aware through the cascade.
   ════════════════════════════════════════════════════════════════ */

/* ── nav faction badge ─────────────────────────────────────────────── */
function EmNavBadge({ name = "Everymen" }) {
  const { EM_CogMark } = window;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, background: "var(--everymen-red)",
      color: "var(--everymen-cream)", padding: "5px 9px", fontFamily: "var(--font-body)",
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
    }}>
      <EM_CogMark size={13} color="var(--everymen-cream)" />
      {name}
    </span>
  );
}

/* ── faction pennant (filter tab) ──────────────────────────────────── */
/* Shape stays identical to the other seven so the filter row aligns;
   only the color changes. Inactive simply drops opacity. */
function Pennant({ color, name, active = false, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: color, color: "#fff", fontFamily: "var(--font-body)", fontSize: 9.5,
      fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "5px 14px",
      cursor: "pointer", border: "none", borderRadius: 0, textShadow: "0 1px 2px rgba(0,0,0,0.3)",
      opacity: active ? 1 : 0.8, clipPath: "polygon(0 0, 100% 0, 94% 100%, 6% 100%)",
      transform: active ? "translateY(-2px)" : "none", transition: "all 120ms",
      filter: active ? "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" : "none",
    }}>
      {name}
    </button>
  );
}

/* ── vote stamps — union "approval" rating ─────────────────────────── */
/* Escalating ink ramp: gold → red → the authoritative black seal at 5. */
const VOTE = [
  { v: 1, label: "a start",   fill: "var(--everymen-gold)",      ink: "var(--everymen-ink)" },
  { v: 2, label: "solid",     fill: "var(--everymen-gold-deep)", ink: "var(--everymen-cream)" },
  { v: 3, label: "good",      fill: "var(--everymen-red)",       ink: "var(--everymen-cream)" },
  { v: 4, label: "excellent", fill: "var(--everymen-red-deep)",  ink: "var(--everymen-cream)" },
  { v: 5, label: "legendary", fill: "var(--everymen-ink)",       ink: "var(--everymen-gold)" },
];
function EmVoteStamps({ value = 0, average, totalVotes, size = 40 }) {
  const [sel, setSel] = React.useState(value);
  return (
    <div>
      <div style={{ display: "flex", gap: 9 }}>
        {VOTE.map((s) => {
          const on = sel >= s.v;
          return (
            <div key={s.v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <button onClick={() => setSel(s.v)} style={{
                position: "relative", width: size, height: size, cursor: "pointer", padding: 0,
                border: "2px solid var(--everymen-ink)", borderRadius: 0,
                background: on ? s.fill : "var(--everymen-paper)",
                color: on ? s.ink : "var(--everymen-paper-text)",
                fontFamily: "var(--font-accent)", fontSize: size * 0.5, lineHeight: 1,
                transform: sel === s.v ? "rotate(-4deg) scale(1.08)" : "none", transition: "all 110ms",
              }}>
                <span style={{ position: "absolute", inset: 3, border: `1px dashed ${on ? "rgba(255,255,255,0.4)" : "color-mix(in srgb, var(--everymen-paper-text) 30%, transparent)"}`, pointerEvents: "none" }} />
                {s.v}
              </button>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 7.5, textTransform: "uppercase",
                letterSpacing: "0.04em", color: sel === s.v ? "var(--everymen-red)" : "var(--everymen-muted)",
                maxWidth: size + 8, textAlign: "center", lineHeight: 1.2 }}>{s.label}</span>
            </div>
          );
        })}
      </div>
      {average !== undefined && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "var(--everymen-muted)", margin: "11px 0 0", letterSpacing: "0.04em" }}>
          <b style={{ color: "var(--everymen-red)", fontFamily: "var(--font-accent)", fontSize: 15 }}>{average.toFixed(1)}</b> avg · {totalVotes ?? 0} votes
        </p>
      )}
    </div>
  );
}

/* ── stat block (hero) ─────────────────────────────────────────────── */
function EmStat({ value, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 22px" }}>
      <span style={{ fontFamily: "var(--font-accent)", fontSize: 38, lineHeight: 0.85, color: "var(--everymen-gold)" }}>{value}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--everymen-cream)", opacity: 0.85 }}>{label}</span>
    </div>
  );
}

/* ── faction-page hero (union masthead poster) ─────────────────────── */
function EmHero({ name, motto, blurb, stats }) {
  const { EM_CogMark, EM_Sunburst, EM_Halftone } = window;
  return (
    <header style={{ position: "relative", overflow: "hidden", border: "3px solid var(--everymen-ink)",
      background: "var(--everymen-field)", color: "var(--everymen-cream)" }}>
      <Em_Sunburst />
      <EM_Halftone color="var(--everymen-cream)" opacity={0.08} />
      {/* top hairline of gold */}
      <div style={{ height: 5, background: "var(--everymen-gold)", position: "relative", zIndex: 2 }} />
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 30, padding: "30px 38px 28px" }}>
        {/* sigil seal */}
        <div style={{ flexShrink: 0, width: 116, height: 116, borderRadius: "50%", background: "var(--everymen-cream)",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 4px var(--everymen-ink), inset 0 0 0 6px var(--everymen-red)" }}>
          <EM_CogMark size={58} color="var(--everymen-red)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--everymen-gold)", marginBottom: 5 }}>World Zero · Faction</div>
          <h1 style={{ fontFamily: "var(--font-accent)", fontSize: 76, lineHeight: 0.82, letterSpacing: "0.01em", margin: 0,
            color: "var(--everymen-cream)", textShadow: "3px 3px 0 var(--everymen-ink)" }}>{name}</h1>
          <div style={{ display: "inline-block", marginTop: 12, background: "var(--everymen-ink)", color: "var(--everymen-gold)",
            fontFamily: "var(--font-accent)", fontSize: 17, letterSpacing: "0.18em", padding: "4px 14px", whiteSpace: "nowrap" }}>{motto}</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.6, maxWidth: 560, margin: "13px 0 0", color: "var(--everymen-cream)" }}>{blurb}</p>
        </div>
      </div>
      {/* stat band */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", background: "var(--everymen-ink)",
        borderTop: "2px solid var(--everymen-gold)", padding: "14px 38px" }}>
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <div style={{ width: 1, alignSelf: "stretch", background: "color-mix(in srgb, var(--everymen-gold) 40%, transparent)" }} />}
            <EmStat value={s.value} label={s.label} />
          </React.Fragment>
        ))}
      </div>
    </header>
  );
}
function Em_Sunburst() {
  const { EM_Sunburst } = window;
  return <EM_Sunburst color="var(--everymen-field-deep)" from="20% 40%" opacity={0.5} step={8} />;
}

Object.assign(window, { EmNavBadge, Pennant, EmVoteStamps, EmStat, EmHero });
