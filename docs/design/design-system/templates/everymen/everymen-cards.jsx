/* ════════════════════════════════════════════════════════════════
   THE EVERYMEN — Task Card · 5 takes
   Each take is a different read on the union / victory-poster archetype.
   All five honor the same World Zero card contract (faction name, title,
   description, level, points, sign-up) and use only DS tokens + the
   everymen.css palette. Headline face is Bebas Neue (--font-accent).
   Exposed on window for the gallery script.
   ════════════════════════════════════════════════════════════════ */

/* ── shared atoms ───────────────────────────────────────────────── */

// faint screen-print halftone wash
function Halftone({ color = "var(--everymen-ink)", opacity = 0.07, size = 4 }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", opacity,
      backgroundImage: `radial-gradient(${color} 0.6px, transparent 0.7px)`,
      backgroundSize: `${size}px ${size}px`, zIndex: 1,
    }} />
  );
}

// radiating poster rays from an origin point
function Sunburst({ color = "var(--everymen-red)", from = "50% 0%", opacity = 0.1, step = 7 }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", opacity, zIndex: 0,
      background: `repeating-conic-gradient(from 0deg at ${from}, ${color} 0deg ${step}deg, transparent ${step}deg ${step * 2}deg)`,
    }} />
  );
}

// little center ornament rule
function RuleDiamond({ color = "var(--everymen-red)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "center", margin: "7px 0" }}>
      <div style={{ height: 1.5, flex: 1, background: color }} />
      <div style={{ width: 5, height: 5, background: color, transform: "rotate(45deg)" }} />
      <div style={{ height: 1.5, flex: 1, background: color }} />
    </div>
  );
}

// rubber-stamped circular points seal
function PointsSeal({ points, color = "var(--everymen-red)", rotate = -9, size = 52, blend = "multiply" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", border: `2px solid ${color}`,
      boxShadow: `inset 0 0 0 2px ${color}`, color, transform: `rotate(${rotate}deg)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      lineHeight: 1, opacity: 0.92, mixBlendMode: blend,
    }}>
      <span style={{ fontFamily: "var(--font-accent)", fontSize: size * 0.42 }}>{points}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 6, letterSpacing: "0.18em", marginTop: 1 }}>POINTS</span>
    </div>
  );
}

// worker cog / gear sigil — the faction mark.
function CogMark({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
      <g fill={color}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="11" y="0.5" width="2" height="5" rx="0.5"
            transform={`rotate(${i * 45} 12 12)`} />
        ))}
      </g>
      <circle cx="12" cy="12" r="6.5" fill="none" stroke={color} strokeWidth="2.4" />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  );
}

function LvlPill({ level, bg = "var(--everymen-ink)", fg = "var(--everymen-paper)" }) {
  return (
    <span style={{
      background: bg, color: fg, fontFamily: "var(--font-body)", fontSize: 7,
      padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.1em",
    }}>lvl {level}</span>
  );
}

function SignBtn({ onSignup, label = "Report for duty", style = {} }) {
  if (!onSignup) return null;
  return (
    <button onClick={onSignup} style={{
      fontFamily: "var(--font-body)", fontSize: 8, textTransform: "uppercase",
      letterSpacing: "0.14em", padding: "6px 10px", border: "none", cursor: "pointer",
      background: "var(--everymen-ink)", color: "var(--everymen-paper)", width: "100%",
      ...style,
    }}>{label}</button>
  );
}

/* ════════════════════════════════════════════════════════════════
   TAKE 1 — "The Rally Bill"   (the by-the-book reference)
   Red masthead + cream poster body, faint sunburst, stamped seal.
   ════════════════════════════════════════════════════════════════ */
function RallyBill({ title, description, level, points, onSignup }) {
  return (
    <div style={{
      width: 206, background: "var(--everymen-paper)", color: "var(--everymen-ink)",
      border: "1.5px solid var(--everymen-ink)", boxShadow: "0 0 0 3px var(--everymen-paper), 0 0 0 4px var(--everymen-ink)",
      position: "relative", fontFamily: "var(--font-body)",
    }}>
      {/* masthead */}
      <div style={{ background: "var(--everymen-red)", borderBottom: "2px solid var(--everymen-gold)", padding: "7px 8px 6px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, color: "var(--everymen-cream)", whiteSpace: "nowrap" }}>
          <CogMark size={11} color="var(--everymen-cream)" />
          <span style={{ fontFamily: "var(--font-accent)", fontSize: 14, letterSpacing: "0.07em" }}>THE EVERYMEN</span>
          <CogMark size={11} color="var(--everymen-cream)" />
        </div>
      </div>
      {/* body */}
      <div style={{ position: "relative", padding: "13px 14px 12px", overflow: "hidden" }}>
        <Sunburst opacity={0.08} step={6} />
        <Halftone />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: "var(--font-accent)", fontSize: 32, lineHeight: 0.98, textAlign: "center", letterSpacing: "0.01em" }}>{title}</div>
          <RuleDiamond />
          <div style={{ fontSize: 8, lineHeight: 1.55, textAlign: "center", color: "var(--everymen-muted)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</div>
        </div>
      </div>
      {/* dispatch strip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 14px 12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <LvlPill level={level} />
          <span style={{ fontFamily: "var(--font-accent)", fontSize: 13, color: "var(--everymen-red)" }}>{points} PTS</span>
        </div>
        <PointsSeal points={points} />
      </div>
      <SignBtn onSignup={onSignup} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TAKE 2 — "Mobilize"   (sunburst duotone, type-forward & loud)
   Full radiating burst, big knocked-out headline, star seal.
   ════════════════════════════════════════════════════════════════ */
function Mobilize({ title, description, level, points, onSignup }) {
  return (
    <div style={{
      width: 206, background: "var(--everymen-field)", color: "var(--everymen-cream)",
      border: "3px solid var(--everymen-ink)", position: "relative", overflow: "hidden",
      fontFamily: "var(--font-body)",
    }}>
      <Sunburst color="var(--everymen-field-deep)" from="50% 38%" opacity={0.55} step={7.5} />
      <Halftone color="var(--everymen-cream)" opacity={0.1} />
      {/* eyebrow ribbon */}
      <div style={{ position: "relative", zIndex: 2, background: "var(--everymen-ink)", color: "var(--everymen-gold)", textAlign: "center", padding: "5px 0", fontFamily: "var(--font-accent)", fontSize: 12, letterSpacing: "0.3em" }}>THE EVERYMEN</div>
      <div style={{ position: "relative", zIndex: 2, padding: "16px 14px 13px", textAlign: "center" }}>
        {/* star sigil */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--everymen-cream)", color: "var(--everymen-red)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 3px var(--everymen-ink)" }}>
            <CogMark size={24} color="var(--everymen-red)" />
          </div>
        </div>
        <div style={{ minHeight: 74, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "var(--font-accent)", fontSize: 34, lineHeight: 1.06, color: "var(--everymen-cream)", textShadow: "1.5px 1.5px 0 var(--everymen-ink)" }}>{title}</div>
        </div>
        <div style={{ height: 2, background: "var(--everymen-gold)", margin: "11px 22px 10px" }} />
        <div style={{ fontSize: 8, lineHeight: 1.5, color: "var(--everymen-cream)", opacity: 0.92, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</div>
      </div>
      {/* footer bar */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "stretch", borderTop: "3px solid var(--everymen-ink)" }}>
        <div style={{ flex: 1, background: "var(--everymen-ink)", color: "var(--everymen-gold)", textAlign: "center", padding: "6px 0", fontFamily: "var(--font-accent)", fontSize: 16 }}>LVL {level}</div>
        <div style={{ flex: 1, background: "var(--everymen-gold)", color: "var(--everymen-ink)", textAlign: "center", padding: "6px 0", fontFamily: "var(--font-accent)", fontSize: 16 }}>{points} PTS</div>
      </div>
      {onSignup && <SignBtn onSignup={onSignup} label="Mobilize ▸" style={{ background: "var(--everymen-cream)", color: "var(--everymen-ink)", position: "relative", zIndex: 2 }} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TAKE 3 — "Solidarity Block"   (woodcut knockout, heavy keyline)
   Solid red field, title reversed out, gold key word, black sub-bar.
   ════════════════════════════════════════════════════════════════ */
function SolidarityBlock({ title, description, level, points, onSignup }) {
  const words = title.split(" ");
  const last = words.pop();
  return (
    <div style={{
      width: 206, background: "var(--everymen-gold)", padding: 4, position: "relative",
      fontFamily: "var(--font-body)",
    }}>
      <div style={{ border: "3px solid var(--everymen-ink)", background: "var(--everymen-red)", color: "var(--everymen-cream)", position: "relative", overflow: "hidden" }}>
        <Halftone color="var(--everymen-ink)" opacity={0.12} />
        <div style={{ position: "relative", zIndex: 2, padding: "12px 14px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <CogMark size={15} color="var(--everymen-cream)" />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase" }}>The Everymen</span>
          </div>
          {/* knockout headline */}
          <div style={{ fontFamily: "var(--font-accent)", fontSize: 35, lineHeight: 1.0, marginBottom: 7 }}>
            {words.join(" ")}{words.length ? " " : ""}
            <span style={{ color: "var(--everymen-gold)" }}>{last}</span>
          </div>
          <div style={{ fontSize: 8, lineHeight: 1.5, opacity: 0.92, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</div>
        </div>
        {/* black sub-bar */}
        <div style={{ position: "relative", zIndex: 2, background: "var(--everymen-ink)", color: "var(--everymen-cream)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 14px" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 7.5, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>LEVEL {level} REQ'D</span>
          <span style={{ fontFamily: "var(--font-accent)", fontSize: 17, color: "var(--everymen-gold)", whiteSpace: "nowrap" }}>{points} PTS</span>
        </div>
      </div>
      {onSignup && <SignBtn onSignup={onSignup} label="Stand together ▸" style={{ background: "var(--everymen-ink)", color: "var(--everymen-gold)", marginTop: 4 }} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TAKE 4 — "Work Order"   (utilitarian job ticket — most down-to-earth)
   Manila ticket, perforated edge, ruled fields, diagonal ASSIGNED stamp.
   ════════════════════════════════════════════════════════════════ */
function WorkOrder({ title, description, level, points, onSignup }) {
  return (
    <div style={{
      width: 210, background: "var(--everymen-paper)", color: "var(--everymen-ink)",
      border: "1.5px solid var(--everymen-ink)", position: "relative", overflow: "hidden",
      fontFamily: "var(--font-body)", display: "flex",
    }}>
      {/* perforated stub */}
      <div style={{ width: 16, background: "var(--everymen-paper-deep)", borderRight: "1.5px dashed var(--everymen-ink)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", padding: "6px 0" }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--everymen-paper)", border: "1px solid var(--everymen-muted)" }} />
        ))}
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <Halftone opacity={0.05} />
        {/* header strip */}
        <div style={{ position: "relative", zIndex: 2, background: "var(--everymen-red)", color: "var(--everymen-cream)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px" }}>
          <span style={{ fontFamily: "var(--font-accent)", fontSize: 14, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>WORK ORDER</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 7 }}>No. 0427</span>
        </div>
        <div style={{ position: "relative", zIndex: 2, padding: "10px 12px 11px" }}>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 6.5, letterSpacing: "0.18em", color: "var(--everymen-muted)", marginBottom: 2 }}>ASSIGNMENT</div>
          <div style={{ fontFamily: "var(--font-accent)", fontSize: 26, lineHeight: 1.0, borderBottom: "1px solid var(--everymen-ink)", paddingBottom: 6, marginBottom: 7 }}>{title}</div>
          <div style={{ fontSize: 8, lineHeight: 1.5, color: "var(--everymen-ink)", marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</div>
          {/* stamped field boxes */}
          <div style={{ display: "flex", gap: 7 }}>
            <div style={{ flex: 1, border: "1.5px solid var(--everymen-ink)", padding: "3px 6px" }}>
              <div style={{ fontSize: 6, letterSpacing: "0.16em", color: "var(--everymen-muted)" }}>LEVEL</div>
              <div style={{ fontFamily: "var(--font-accent)", fontSize: 18 }}>{level}</div>
            </div>
            <div style={{ flex: 1, border: "1.5px solid var(--everymen-ink)", padding: "3px 6px" }}>
              <div style={{ fontSize: 6, letterSpacing: "0.16em", color: "var(--everymen-muted)" }}>POINTS</div>
              <div style={{ fontFamily: "var(--font-accent)", fontSize: 18, color: "var(--everymen-red)" }}>{points}</div>
            </div>
          </div>
        </div>
        {/* diagonal rubber stamp */}
        <div style={{ position: "absolute", right: -6, top: 64, zIndex: 3, transform: "rotate(-13deg)", border: "2px solid var(--everymen-red)", color: "var(--everymen-red)", padding: "1px 7px", fontFamily: "var(--font-accent)", fontSize: 13, letterSpacing: "0.12em", opacity: 0.85, mixBlendMode: "multiply", borderRadius: 2 }}>OPEN</div>
        {onSignup && <SignBtn onSignup={onSignup} label="Sign the ledger ▸" />}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TAKE 5 — "Victory Banner"   (ceremonial swallowtail pennant)
   Bunting stripe, arched motto, gold rosette seal, chevron tail.
   ════════════════════════════════════════════════════════════════ */
function VictoryBanner({ title, description, level, points, onSignup }) {
  const bunting = `repeating-linear-gradient(90deg, var(--everymen-red) 0 13px, var(--everymen-cream) 13px 20px, var(--everymen-gold) 20px 33px, var(--everymen-cream) 33px 40px)`;
  return (
    <div style={{ width: 200, position: "relative", fontFamily: "var(--font-body)", paddingTop: 12 }}>
      {/* hanging grommet + cord */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 9, height: 9, borderRadius: "50%", border: "2px solid var(--everymen-ink)", background: "var(--everymen-paper)", zIndex: 4 }} />
      <div style={{
        background: "var(--everymen-paper)", color: "var(--everymen-ink)", border: "2px solid var(--everymen-ink)",
        clipPath: "polygon(0 0, 100% 0, 100% 86%, 50% 100%, 0 86%)", position: "relative", overflow: "hidden",
        padding: "0 0 30px",
      }}>
        <Sunburst opacity={0.07} from="50% 30%" step={8} />
        <Halftone opacity={0.06} />
        <div style={{ height: 8, background: bunting }} />
        <div style={{ position: "relative", zIndex: 2, padding: "11px 16px 0", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-accent)", fontSize: 10, letterSpacing: "0.28em", color: "var(--everymen-red)" }}>UNITED · WE · STAND</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 6.5, letterSpacing: "0.2em", color: "var(--everymen-muted)", margin: "3px 0 9px" }}>THE EVERYMEN</div>
          <div style={{ fontFamily: "var(--font-accent)", fontSize: 30, lineHeight: 0.98 }}>{title}</div>
          {/* rosette */}
          <div style={{ display: "flex", justifyContent: "center", margin: "9px 0 7px" }}>
            <div style={{ position: "relative", width: 46, height: 46 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "var(--everymen-gold)", clipPath: "polygon(50% 0%,61% 8%,75% 4%,79% 19%,93% 22%,89% 37%,100% 50%,89% 63%,93% 78%,79% 81%,75% 96%,61% 92%,50% 100%,39% 92%,25% 96%,21% 81%,7% 78%,11% 63%,0% 50%,11% 37%,7% 22%,21% 19%,25% 4%,39% 8%)" }} />
              <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: "var(--everymen-red)", color: "var(--everymen-cream)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                <span style={{ fontFamily: "var(--font-accent)", fontSize: 17 }}>{points}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 5, letterSpacing: "0.14em" }}>PTS</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 7.5, lineHeight: 1.5, color: "var(--everymen-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 8 }}>{description}</div>
          <span style={{ display: "inline-block", background: "var(--everymen-ink)", color: "var(--everymen-paper)", fontFamily: "var(--font-body)", fontSize: 7, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>lvl {level}</span>
        </div>
      </div>
      {onSignup && (
        <div style={{ textAlign: "center", marginTop: -18, position: "relative", zIndex: 5 }}>
          <button onClick={onSignup} style={{ fontFamily: "var(--font-body)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.14em", padding: "5px 14px", border: "2px solid var(--everymen-ink)", cursor: "pointer", background: "var(--everymen-red)", color: "var(--everymen-cream)" }}>Enlist ▸</button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  RallyBill, Mobilize, SolidarityBlock, WorkOrder, VictoryBanner,
  /* shared poster atoms, reused by the updates feed */
  EM_Halftone: Halftone, EM_Sunburst: Sunburst, EM_PointsSeal: PointsSeal,
  EM_CogMark: CogMark, EM_RuleDiamond: RuleDiamond,
});
