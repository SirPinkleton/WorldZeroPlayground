/* ════════════════════════════════════════════════════════════════
   THE EPHEMERISTS — Task Card + shared codex atoms
   The chosen artifact: THE DISCORDANT MAP. One place, three
   irreconcilable addresses — cartesian, polar and perspective grids
   all claim the same sheet and disagree about where the point is.
   House-of-Leaves apparatus crawls the margins: a struck measurement
   that corrects itself in blue, a note climbing the gutter, a
   self-referential footnote, and one word always pulled into the lapis.
   Uses only DS tokens + ephemerists.css. Atoms exposed on window for
   the rest of the faction's surfaces.
   ════════════════════════════════════════════════════════════════ */

const ROMAN = [["M",1000],["CM",900],["D",500],["CD",400],["C",100],["XC",90],["L",50],["XL",40],["X",10],["IX",9],["V",5],["IV",4],["I",1]];
function toRoman(n){ let s=""; for(const [g,v] of ROMAN){ while(n>=v){ s+=g; n-=v; } } return s; }

/* faction sigil — the watching wanderer: an eye on an orbital ring */
function EphMark({ size = 22, color = "currentColor", stroke = 1.4 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} style={{ display: "block" }}>
      <ellipse cx="12" cy="12" rx="11" ry="4.4" transform="rotate(-24 12 12)" />
      <path d="M4 12 C7.5 8.2 16.5 8.2 20 12 C16.5 15.8 7.5 15.8 4 12 Z" />
      <circle cx="12" cy="12" r="2.7" />
      <circle cx="12" cy="12" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

/* small mystical glyph set — alchemical / planetary, monoline */
function Glyph({ name, size = 14, color = "var(--eph-ink)", stroke = 1.2 }) {
  const p = { fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const map = {
    fire:  <path d="M8 13 L2 13 L8 3 Z" {...p} />,
    water: <path d="M2 3 L14 3 L8 13 Z" {...p} />,
    air:   <g {...p}><path d="M8 3 L2 13 L14 13 Z" /><line x1="4.6" y1="9.2" x2="11.4" y2="9.2" /></g>,
    earth: <g {...p}><path d="M2 3 L14 3 L8 13 Z" /><line x1="4.6" y1="6.8" x2="11.4" y2="6.8" /></g>,
    sun:   <g {...p}><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="0.7" fill={color} /></g>,
    moon:  <path d="M11 2.5 A6 6 0 1 0 11 13.5 A4.6 4.6 0 1 1 11 2.5 Z" fill={color} stroke="none" />,
    salt:  <g {...p}><circle cx="8" cy="8" r="5.5" /><line x1="2.5" y1="8" x2="13.5" y2="8" /></g>,
    quint: <g {...p}><circle cx="8" cy="8" r="5.5" /><circle cx="8" cy="8" r="2" /></g>,
    star:  <path d="M8 1 L9.2 6.2 L14.5 5 L10.3 8 L14.5 11 L9.2 9.8 L8 15 L6.8 9.8 L1.5 11 L5.7 8 L1.5 5 L6.8 6.2 Z" fill={color} stroke="none" />,
  };
  return <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "block" }}>{map[name] || map.sun}</svg>;
}

/* ── SACRED GEOMETRY — compass-and-straightedge rosettes built only
   from circle primitives on a triangular lattice (the same family as
   the card's astrolabe grids). rings=1 → Seed of Life (7 circles),
   rings=2 → Flower of Life (19), rings=3 → the full bloom. A clip ring
   gives the clean illuminated edge; an optional vesica/spoke overlay
   reads as an astrolabe. Faint, theme-aware, decorative only. */
function SacredGeometry({ size = 200, color = "var(--eph-lapis)", stroke = 0.8, rings = 2, ring = true, spokes = 0, style }) {
  const R = size / (2 * (rings + 1));
  const c = size / 2;
  const pts = [];
  for (let i = -rings - 1; i <= rings + 1; i++) {
    for (let j = -rings - 1; j <= rings + 1; j++) {
      const hd = (Math.abs(i) + Math.abs(j) + Math.abs(i + j)) / 2;
      if (hd > rings) continue;
      pts.push([c + R * (i + j / 2), c + R * (j * Math.sqrt(3) / 2)]);
    }
  }
  const id = "sg" + Math.round(size) + "_" + rings + "_" + Math.round(R);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" stroke={color} strokeWidth={stroke} style={{ display: "block", ...style }}>
      <defs><clipPath id={id}><circle cx={c} cy={c} r={size / 2 - stroke} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        {pts.map(([x, y], k) => <circle key={k} cx={x} cy={y} r={R} />)}
        {spokes > 0 && Array.from({ length: spokes }).map((_, k) => {
          const a = (k * 2 * Math.PI) / spokes;
          return <line key={"s" + k} x1={c} y1={c} x2={c + (size / 2) * Math.cos(a)} y2={c + (size / 2) * Math.sin(a)} strokeWidth={stroke * 0.8} />;
        })}
      </g>
      {ring && <circle cx={c} cy={c} r={size / 2 - stroke} strokeWidth={stroke * 1.5} />}
    </svg>
  );
}

/* faint age-foxing stains */
function Foxing({ opacity = 0.5 }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", opacity, zIndex: 1, mixBlendMode: "multiply",
      backgroundImage: `
        radial-gradient(8px 6px at 18% 24%, color-mix(in srgb, var(--eph-ink) 14%, transparent), transparent 70%),
        radial-gradient(5px 5px at 78% 16%, color-mix(in srgb, var(--eph-gold-deep) 16%, transparent), transparent 70%),
        radial-gradient(10px 7px at 64% 82%, color-mix(in srgb, var(--eph-ink) 10%, transparent), transparent 70%),
        radial-gradient(4px 4px at 30% 70%, color-mix(in srgb, var(--eph-rubric) 12%, transparent), transparent 70%)`,
    }} />
  );
}

/* header lockup — sigil + name + a motto / running gloss */
function Eyebrow({ color = "var(--eph-gold-light)", motto, dark, size = 8.5 }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, color }}>
        <EphMark size={11} color={color} />
        <span style={{ fontFamily: "var(--eph-display)", fontWeight: 600, fontSize: size, letterSpacing: "0.24em" }}>THE EPHEMERISTS</span>
      </div>
      {motto && <div style={{ fontFamily: "var(--eph-script)", fontStyle: "italic", fontSize: 8.5, color: dark ? "var(--eph-muted)" : "color-mix(in srgb, var(--eph-parchment) 65%, transparent)", marginTop: 1 }}>{motto}</div>}
    </div>
  );
}

function SignBtn({ onSignup, label, light }) {
  if (!onSignup) return null;
  return (
    <button onClick={onSignup} style={{
      fontFamily: "var(--eph-serif)", fontSize: 9, letterSpacing: "0.12em", fontStyle: "italic",
      padding: "7px 10px", border: "none", cursor: "pointer", width: "100%",
      background: light ? "var(--eph-gold)" : "var(--eph-ink)",
      color: light ? "var(--eph-ink)" : "var(--eph-parchment)", position: "relative", zIndex: 6,
    }}>{label}</button>
  );
}

/* ════════════════════════════════════════════════════════════════
   THE DISCORDANT MAP — the Ephemerist task card
   ════════════════════════════════════════════════════════════════ */
function DiscordantMap({ title, description, level, points, onSignup }) {
  const tw = title.trim().split(" ");
  const tlast = tw.pop(); // one word is always pulled into the blue
  return (
    <div style={{
      width: 214, minHeight: 300, position: "relative", overflow: "hidden",
      background: "var(--eph-vellum)", color: "var(--eph-vellum-text)",
      border: "1.5px solid var(--eph-ink)", fontFamily: "var(--eph-serif)", display: "flex", flexDirection: "column",
    }}>
      <div style={{ position: "relative", zIndex: 5, padding: "9px 0 4px" }}><Eyebrow motto="exhibit C · no single here" dark /></div>
      {/* the contested field */}
      <div style={{ position: "relative", flex: 1, minHeight: 188, margin: "2px 4px", border: "1px solid var(--eph-gold-deep)", overflow: "hidden" }}>
        {/* cartesian — keyed to vellum-text so it flips legible in dark */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "repeating-linear-gradient(0deg, color-mix(in srgb, var(--eph-vellum-text) 26%, transparent) 0 1px, transparent 1px 16px), repeating-linear-gradient(90deg, color-mix(in srgb, var(--eph-vellum-text) 26%, transparent) 0 1px, transparent 1px 16px)" }} />
        {/* perspective grid (no blend — multiply died on dark stock) */}
        <svg viewBox="0 0 200 188" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.7 }}>
          <g stroke="var(--eph-lapis)" strokeWidth="0.9" fill="none">
            {Array.from({ length: 11 }).map((_, i) => <line key={i} x1={i * 20} y1="188" x2="122" y2="40" />)}
            {[60, 96, 124, 146, 163, 176].map((y, i) => <line key={i} x1="0" y1={y} x2="200" y2={y} />)}
          </g>
        </svg>
        {/* polar */}
        <svg viewBox="0 0 200 188" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.72 }}>
          <g stroke="var(--eph-rubric)" strokeWidth="0.8" fill="none">
            {[16, 34, 54, 76].map((r, i) => <circle key={i} cx="122" cy="88" r={r} />)}
            {Array.from({ length: 12 }).map((_, i) => <line key={i} x1="122" y1="88" x2={122 + 80 * Math.cos(i * Math.PI / 6)} y2={88 + 80 * Math.sin(i * Math.PI / 6)} />)}
          </g>
        </svg>
        {/* the disputed point */}
        <div style={{ position: "absolute", left: "61%", top: "47%", transform: "translate(-50%,-50%)", zIndex: 4 }}>
          <div className="eph-twinkle" style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--eph-gold-light)", boxShadow: "0 0 10px 3px color-mix(in srgb, var(--eph-gold-light) 70%, transparent)" }} />
        </div>
        {/* three coordinate labels for one point — and none agree */}
        <div style={{ position: "absolute", top: "8%", left: "6%", fontFamily: "var(--eph-serif)", fontSize: 7.5, letterSpacing: "0.04em", color: "var(--eph-vellum-text)", background: "color-mix(in srgb, var(--eph-vellum) 82%, transparent)", padding: "1px 4px" }}>x 14 · y <span style={{ textDecoration: "line-through", opacity: 0.65 }}>8</span> <span style={{ color: "var(--eph-lapis)", fontStyle: "italic" }}>9</span></div>
        <div style={{ position: "absolute", top: "78%", left: "54%", fontFamily: "var(--eph-serif)", fontSize: 7.5, letterSpacing: "0.04em", color: "var(--eph-rubric)", background: "color-mix(in srgb, var(--eph-vellum) 82%, transparent)", padding: "1px 4px" }}>r 47 · θ 31°</div>
        <div style={{ position: "absolute", top: "6%", left: "68%", fontFamily: "var(--eph-serif)", fontSize: 7.5, letterSpacing: "0.04em", color: "var(--eph-lapis)", background: "color-mix(in srgb, var(--eph-vellum) 82%, transparent)", padding: "1px 4px" }}>∞ · vanishing</div>
        {/* marginal apparatus climbing the gutter */}
        <div style={{ position: "absolute", left: 2, bottom: 7, transformOrigin: "left bottom", transform: "rotate(-90deg)", whiteSpace: "nowrap", fontFamily: "var(--eph-serif)", fontSize: 6, letterSpacing: "0.05em", color: "var(--eph-muted)", opacity: 0.85 }}>¼″ wider within than without †</div>
      </div>
      {/* legend / title */}
      <div style={{ position: "relative", zIndex: 5, padding: "8px 14px 10px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 22, lineHeight: 0.94 }}>{tw.join(" ")}{tw.length ? " " : ""}<span style={{ color: "var(--eph-lapis)" }}>{tlast}</span><sup style={{ fontFamily: "var(--eph-serif)", fontSize: 9, color: "var(--eph-lapis)", fontWeight: 400 }}>†</sup></div>
        <div style={{ fontSize: 8.5, lineHeight: 1.45, fontStyle: "italic", color: "var(--eph-muted)", margin: "4px 0 6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 7.5 }}>
          <span style={{ color: "var(--eph-vellum-text)" }}>▦ grade {toRoman(level)}</span>
          <span style={{ color: "var(--eph-gold-deep)" }}>·</span>
          <span style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 13, color: "var(--eph-rubric)" }}>{points} pvncta</span>
        </div>
        <div style={{ fontFamily: "var(--eph-serif)", fontSize: 6.5, fontStyle: "italic", color: "var(--eph-muted)", marginTop: 6, lineHeight: 1.35 }}>† the road does not return you to where you began — <span style={{ color: "var(--eph-lapis)" }}>see †</span></div>
      </div>
      <SignBtn onSignup={onSignup} label="Triangulate the truth ▸" />
    </div>
  );
}

Object.assign(window, {
  DiscordantMap, EphTaskCard: DiscordantMap,
  EPH_toRoman: toRoman, EPH_EphMark: EphMark, EPH_Glyph: Glyph,
  EPH_Foxing: Foxing, EPH_Eyebrow: Eyebrow, EPH_SignBtn: SignBtn,
  EPH_SacredGeometry: SacredGeometry,
});
