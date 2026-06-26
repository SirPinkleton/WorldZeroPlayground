/* ════════════════════════════════════════════════════════════════
   THE EPHEMERISTS — faction-aware surfaces
   Sigil seal · nav badge · faction pennant · concordance stamps
   (approval) · stat block · faction-page hero. All reuse
   ephemerists.css tokens and the codex atoms exposed by
   ephemerists-cards.jsx (EPH_EphMark / EPH_Glyph). Theme-aware.
   ════════════════════════════════════════════════════════════════ */

/* ── sigil seal: the eye in a ringed gold roundel ──────────────────── */
function EphSeal({ size = 112, color = "var(--eph-gold)", eye = "var(--eph-lapis)", bg = "var(--eph-vellum)" }) {
  const { EPH_EphMark } = window;
  return (
    <div style={{
      position: "relative", width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: bg, boxShadow: `0 0 0 2px ${color}, 0 0 0 5px var(--eph-ink), inset 0 0 0 4px color-mix(in srgb, ${color} 55%, transparent)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* radiating ticks */}
      {Array.from({ length: 36 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", top: "50%", left: "50%", width: 1, height: size * 0.5,
          transformOrigin: "top center", transform: `translate(-50%,0) rotate(${i * 10}deg)`,
          height: i % 3 ? size * 0.04 : size * 0.07, background: `color-mix(in srgb, ${color} ${i % 3 ? 35 : 65}%, transparent)` }} />
      ))}
      <EphMarkLocal size={size * 0.46} color={eye} />
    </div>
  );
}
function EphMarkLocal(props) { const { EPH_EphMark } = window; return <EPH_EphMark {...props} stroke={1.2} />; }

/* ── nav faction badge ─────────────────────────────────────────────── */
function EphNavBadge({ name = "Ephemerists" }) {
  const { EPH_EphMark } = window;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, background: "var(--eph-lapis)",
      color: "var(--eph-parchment)", padding: "5px 10px", fontFamily: "var(--eph-display)", fontWeight: 600,
      fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", boxShadow: "inset 0 0 0 1px var(--eph-gold)",
    }}>
      <EPH_EphMark size={13} color="var(--eph-gold-light)" />
      {name}
    </span>
  );
}

/* ── faction pennant (filter tab) ──────────────────────────────────── */
/* Identical shape to the other six so the row aligns; only color shifts. */
function Pennant({ color = "var(--faction-ephemerists)", name, active = false, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: color, color: "#fff", fontFamily: "var(--eph-serif)", fontSize: 9.5,
      fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", padding: "5px 14px",
      cursor: "pointer", border: "none", borderRadius: 0, textShadow: "0 1px 2px rgba(0,0,0,0.35)",
      opacity: active ? 1 : 0.78, clipPath: "polygon(0 0, 100% 0, 94% 100%, 6% 100%)",
      transform: active ? "translateY(-2px)" : "none", transition: "all 120ms",
      filter: active ? "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" : "none",
    }}>
      {name}
    </button>
  );
}

/* ── concordance stamps — "how well does the filed truth hold up?" ──── */
/* Wax-seal ramp: doubt (gold) → verdigris → lapis → rubric → the
   authoritative ink seal at V. Reframes World Zero's 1–5 approval vote. */
const CONCORD = [
  { v: 1, label: "apocryphal",   fill: "var(--eph-gold)",     ink: "var(--eph-ink)" },
  { v: 2, label: "disputed",     fill: "var(--eph-verdigris)", ink: "var(--eph-parchment)" },
  { v: 3, label: "plausible",    fill: "var(--eph-lapis)",     ink: "var(--eph-parchment)" },
  { v: 4, label: "corroborated", fill: "var(--eph-rubric)",    ink: "var(--eph-parchment)" },
  { v: 5, label: "canonical",    fill: "var(--eph-ink)",       ink: "var(--eph-gold-light)" },
];
function EphConcordance({ value = 0, average, totalVotes, size = 42 }) {
  const { EPH_toRoman, EPH_EphMark } = window;
  const [sel, setSel] = React.useState(value);
  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        {CONCORD.map((s) => {
          const on = sel >= s.v;
          return (
            <div key={s.v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <button onClick={() => setSel(s.v)} style={{
                position: "relative", width: size, height: size, cursor: "pointer", padding: 0, borderRadius: "50%",
                border: "2px solid var(--eph-ink)",
                background: on ? s.fill : "var(--eph-vellum)", color: on ? s.ink : "var(--eph-muted)",
                fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: size * 0.34, lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: sel === s.v ? "rotate(-5deg) scale(1.09)" : "none", transition: "all 110ms",
                boxShadow: on ? "inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.18)" : "none",
              }}>
                <span style={{ position: "absolute", inset: 3, borderRadius: "50%", border: `1px dashed ${on ? "color-mix(in srgb, #fff 40%, transparent)" : "color-mix(in srgb, var(--eph-vellum-text) 28%, transparent)"}`, pointerEvents: "none" }} />
                {EPH_toRoman(s.v)}
              </button>
              <span style={{ fontFamily: "var(--eph-serif)", fontSize: 8, fontStyle: "italic",
                letterSpacing: "0.02em", color: sel === s.v ? "var(--eph-rubric)" : "var(--eph-muted)",
                maxWidth: size + 12, textAlign: "center", lineHeight: 1.2 }}>{s.label}</span>
            </div>
          );
        })}
      </div>
      {average !== undefined && (
        <p style={{ fontFamily: "var(--eph-serif)", fontSize: 11, color: "var(--eph-muted)", margin: "13px 0 0", letterSpacing: "0.02em" }}>
          <b style={{ color: "var(--eph-rubric)", fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 15 }}>{average.toFixed(1)}</b> concordance · {totalVotes ?? 0} marks filed
        </p>
      )}
    </div>
  );
}

/* ── stat block (hero) ─────────────────────────────────────────────── */
function EphStat({ value, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "0 24px" }}>
      <span style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 34, lineHeight: 0.85, color: "var(--eph-gold-light)" }}>{value}</span>
      <span style={{ fontFamily: "var(--eph-serif)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--eph-parchment)", opacity: 0.82 }}>{label}</span>
    </div>
  );
}

/* faint three-grid texture, echoing the Discordant Map, for the hero */
function HeroGrids() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.14, backgroundImage: "repeating-linear-gradient(0deg, var(--eph-parchment) 0 1px, transparent 1px 26px), repeating-linear-gradient(90deg, var(--eph-parchment) 0 1px, transparent 1px 26px)" }} />
      <svg viewBox="0 0 1000 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.16 }}>
        <g stroke="var(--eph-gold-light)" strokeWidth="0.6" fill="none">
          {Array.from({ length: 21 }).map((_, i) => <line key={i} x1={i * 50} y1="320" x2="820" y2="20" />)}
        </g>
      </svg>
      <svg viewBox="0 0 1000 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }}>
        <g stroke="var(--eph-gold-light)" strokeWidth="0.7" fill="none">
          {[60, 130, 210, 300].map((r, i) => <circle key={i} cx="820" cy="150" r={r} />)}
        </g>
      </svg>
    </div>
  );
}

/* ── faction-page hero — a codex frontispiece ──────────────────────── */
function EphHero({ name, motto, blurb, stats, kicker = "World Zero · Faction №5 — the road's keepers" }) {
  return (
    <header style={{ position: "relative", overflow: "hidden", border: "2px solid var(--eph-gold)",
      background: "radial-gradient(120% 140% at 82% 0%, var(--eph-lapis), var(--eph-field-deep) 60%, #05131c 100%)",
      color: "var(--eph-parchment)", boxShadow: "0 0 0 3px var(--eph-vellum), 0 0 0 4px var(--eph-ink)" }}>
      <HeroGrids />
      <div style={{ height: 5, background: "var(--eph-gold)", position: "relative", zIndex: 2 }} />
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 32, padding: "30px 38px 28px" }}>
        <EphSeal size={118} bg="var(--eph-vellum)" eye="var(--eph-lapis)" />
        <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <div style={{ fontFamily: "var(--eph-serif)", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--eph-gold-light)", marginBottom: 6 }}>{kicker}</div>
          <h1 style={{ fontFamily: "var(--eph-display)", fontWeight: 800, fontSize: 64, lineHeight: 0.86, letterSpacing: "0.02em", margin: 0,
            color: "var(--eph-parchment)", textShadow: "2px 2px 0 var(--eph-field-deep)" }}>{name}</h1>
          <div style={{ display: "inline-block", marginTop: 13, background: "var(--eph-ink)", color: "var(--eph-gold-light)",
            fontFamily: "var(--eph-display)", fontWeight: 600, fontSize: 15, letterSpacing: "0.26em", padding: "5px 16px", whiteSpace: "nowrap", border: "1px solid var(--eph-gold-deep)" }}>{motto}</div>
          <p style={{ fontFamily: "var(--eph-serif)", fontSize: 13.5, lineHeight: 1.6, maxWidth: 580, margin: "14px 0 0", color: "color-mix(in srgb, var(--eph-parchment) 92%, transparent)" }}>
            {blurb}
            <span style={{ display: "block", fontFamily: "var(--eph-script)", fontStyle: "italic", fontSize: 11.5, color: "color-mix(in srgb, var(--eph-parchment) 62%, transparent)", marginTop: 8 }}>† nothing keeps. we keep the record anyway — <span style={{ color: "var(--eph-gold-light)" }}>see †</span></span>
          </p>
        </div>
        <div style={{ position: "absolute", top: 14, right: 16, fontFamily: "var(--eph-serif)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "color-mix(in srgb, var(--eph-gold-light) 70%, transparent)", transform: "rotate(0deg)", zIndex: 3 }}>Exhibit A · fol. ∞</div>
      </div>
      {/* stat band */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", background: "var(--eph-field-deep)",
        borderTop: "2px solid var(--eph-gold)", padding: "15px 38px" }}>
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <div style={{ width: 1, alignSelf: "stretch", background: "color-mix(in srgb, var(--eph-gold) 40%, transparent)" }} />}
            <EphStat value={s.value} label={s.label} />
          </React.Fragment>
        ))}
      </div>
    </header>
  );
}

Object.assign(window, { EphSeal, EphNavBadge, Pennant, EphConcordance, EphStat, EphHero });
