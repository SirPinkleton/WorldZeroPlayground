/* ════════════════════════════════════════════════════════════════
   S.N.I.D.E. task-card redesign — five punk directions
   All attach to window for the canvas host to mount.
   ════════════════════════════════════════════════════════════════ */

/* shared sample task so options are directly comparable */
const TASK = {
  title: "DO A KICKFLIP",
  desc: "Do a kickflip. Bonus points if you don't use a skateboard. Double if nobody asked you to.",
  level: 2,
  points: 25,
};

/* a spread of real S.N.I.D.E. tasks — gleefully disruptive, harmless */
const TASKS = [
  TASK,
  { title: "FIX A SIGN", desc: "Borrow the letters off a public sign. Spell something kinder. Put it back by dawn.", level: 3, points: 40 },
  { title: "SPREAD A LIE", desc: "Start a flattering, false rumor about yourself. Tell exactly one person, then walk away.", level: 1, points: 10 },
  { title: "SILENT RIOT", desc: "Gather five accomplices. Be absolutely furious about something. Make no sound at all.", level: 4, points: 60 },
];

/* ── Grain speckle overlay (xerox grit) ── */
function Grain({ opacity = 0.5, blend = "multiply" }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      filter: "url(#snide-grain)", opacity, mixBlendMode: blend,
    }} />
  );
}

/* ── Ransom-note cut letters ── */
const RANSOM_STYLES = [
  { bg: "var(--paper)", col: "var(--ink)", font: "var(--f-anton)", rot: -5 },
  { bg: "var(--ink)", col: "var(--acid)", font: "var(--f-cond)", rot: 4 },
  { bg: "var(--pink)", col: "#fff", font: "var(--f-black)", rot: -3 },
  { bg: "var(--acid)", col: "var(--ink)", font: "var(--f-anton)", rot: 6 },
  { bg: "var(--paper)", col: "var(--ink)", font: "var(--f-serif)", rot: 2, italic: true },
  { bg: "var(--ink)", col: "#fff", font: "var(--f-cond)", rot: -6 },
];
function Ransom({ text, size = 30 }) {
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "5px 3px", alignItems: "center" }}>
      {[...text].map((ch, idx) => {
        if (ch === " ") return <span key={idx} style={{ width: size * 0.22 }} />;
        const s = RANSOM_STYLES[(ch.charCodeAt(0) + idx * 3) % RANSOM_STYLES.length];
        return (
          <span key={idx} style={{
            display: "inline-block", background: s.bg, color: s.col, fontFamily: s.font,
            fontStyle: s.italic ? "italic" : "normal", fontSize: size, lineHeight: 0.92,
            padding: "2px 6px 0", transform: `rotate(${s.rot}deg)`,
            boxShadow: "1.5px 2.5px 0 rgba(0,0,0,0.4)", textTransform: "uppercase",
          }}>{ch}</span>
        );
      })}
    </span>
  );
}

const TORN = "polygon(0 0,3% 100%,7% 30%,11% 90%,15% 20%,19% 80%,23% 10%,27% 95%,31% 25%,35% 85%,39% 5%,43% 90%,47% 30%,51% 80%,55% 0,59% 95%,63% 25%,67% 85%,71% 10%,75% 90%,79% 20%,83% 95%,87% 30%,91% 80%,95% 15%,100% 0)";

/* ════════════════════════════════════════════════════════════════
   OPTION A — RANSOM DISPATCH
   Photocopier-black demand note. Cut-out ransom title, acid spot,
   taped to the wall. "your assignment, should you ignore it."
   ════════════════════════════════════════════════════════════════ */
function CardRansom({ task = TASK, rot = -1 }) {
  return (
    <div style={{
      width: 304, position: "relative", background: "var(--ink)", color: "#fff",
      padding: "32px 22px 24px", fontFamily: "var(--f-body)", overflow: "hidden",
      boxShadow: "7px 9px 0 rgba(0,0,0,0.28)", transform: `rotate(${rot}deg)`,
    }}>
      <div className="ht-dots" style={{ position: "absolute", inset: 0, color: "rgba(182,255,46,0.09)", pointerEvents: "none" }} />
      <Grain opacity={0.35} blend="screen" />
      {/* masthead */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid var(--acid)", paddingBottom: 6, marginBottom: 14, position: "relative" }}>
        <span style={{ fontFamily: "var(--f-cond)", fontSize: 15, letterSpacing: "0.22em", color: "var(--acid)" }}>S.N.I.D.E.</span>
        <span style={{ fontSize: 8, letterSpacing: "0.16em", color: "#8f9183", textTransform: "uppercase" }}>dispatch №0666</span>
      </div>
      <div style={{ fontFamily: "var(--f-marker)", fontSize: 13, color: "var(--pink)", transform: "rotate(-1.5deg)", marginBottom: 6 }}>your assignment, should you ignore it —</div>
      <div style={{ margin: "10px 0 16px" }}><Ransom text={task.title} size={30} /></div>
      <p style={{ fontSize: 11, lineHeight: 1.55, color: "#d8d6c8", margin: "0 0 18px" }}>{task.desc}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
        {/* spray stencil points */}
        <div style={{ position: "relative", fontFamily: "var(--f-anton)", color: "var(--acid)", lineHeight: 0.8 }}>
          <span style={{ fontSize: 40 }}>{task.points}</span>
          <span style={{ fontSize: 11, letterSpacing: "0.1em", marginLeft: 3 }}>PTS</span>
          <svg viewBox="0 0 120 60" style={{ position: "absolute", inset: "-12px -10px", width: "calc(100% + 20px)", height: "calc(100% + 24px)" }}>
            <ellipse cx="60" cy="30" rx="54" ry="25" fill="none" stroke="var(--pink)" strokeWidth="2.5" filter="url(#snide-rough)" />
          </svg>
        </div>
        <span style={{ fontFamily: "var(--f-cond)", fontSize: 12, letterSpacing: "0.1em", border: "1.5px dashed #6b6d60", color: "#cfd1c4", padding: "3px 8px", transform: "rotate(2deg)" }}>LVL {task.level}</span>
        <span style={{ marginLeft: "auto", position: "relative", background: "var(--pink)", color: "#fff", fontFamily: "var(--f-black)", fontSize: 12, padding: "7px 12px", transform: "rotate(-3deg)", boxShadow: "2px 3px 0 rgba(0,0,0,0.4)" }}>I'M IN ↗</span>
      </div>
      {/* tape */}
      <div className="tape" style={{ top: -11, left: 34, transform: "rotate(-8deg)" }} />
      <div className="tape" style={{ top: -9, right: 26, transform: "rotate(7deg)" }} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   OPTION B — XEROX GIG FLYER
   Pinned to a telephone pole. High-contrast photocopy, sunburst,
   double-print pink ghost, and rip-off commitment tabs at the base.
   ════════════════════════════════════════════════════════════════ */
function CardFlyer() {
  const tabs = Array.from({ length: 7 });
  return (
    <div style={{ width: 286, position: "relative", transform: "rotate(1.2deg)", filter: "drop-shadow(5px 7px 0 rgba(0,0,0,0.22))" }}>
      <div className="xerox" style={{ position: "relative", border: "2px solid var(--ink)", padding: "16px 16px 8px", fontFamily: "var(--f-body)", color: "var(--ink)", overflow: "hidden" }}>
        <Grain opacity={0.6} />
        {/* sunburst header block */}
        <div style={{ position: "relative", height: 92, marginBottom: 12, overflow: "hidden", background: "var(--ink)" }}>
          <svg viewBox="0 0 200 92" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <defs>
              <radialGradient id="sb" cx="50%" cy="48%" r="60%">
                <stop offset="0%" stopColor="#ff2d8b" />
                <stop offset="100%" stopColor="#14110b" />
              </radialGradient>
            </defs>
            <rect width="200" height="92" fill="url(#sb)" />
            {Array.from({ length: 28 }).map((_, i) => {
              const a = (i / 28) * Math.PI * 2;
              return <line key={i} x1="100" y1="46" x2={100 + Math.cos(a) * 240} y2={46 + Math.sin(a) * 240} stroke="#14110b" strokeWidth={i % 2 ? 7 : 0} opacity="0.55" />;
            })}
          </svg>
          <div className="ht-dots-lg" style={{ position: "absolute", inset: 0, color: "rgba(0,0,0,0.5)", mixBlendMode: "multiply" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff" }}>
            <span style={{ fontFamily: "var(--f-marker)", fontSize: 13, color: "var(--acid)", transform: "rotate(-2deg)" }}>tonight only*</span>
            <span style={{ fontFamily: "var(--f-anton)", fontSize: 14, letterSpacing: "0.3em", marginTop: 2 }}>S.N.I.D.E.</span>
          </div>
        </div>
        {/* title double-print (offset pink mis-registration) */}
        <h2 style={{ margin: "0 0 8px", fontFamily: "var(--f-anton)", fontSize: 38, lineHeight: 0.86, letterSpacing: "0.01em", textTransform: "uppercase", color: "var(--ink)", transform: "skewX(-5deg)", textShadow: "2.5px 2.5px 0 var(--pink)" }}>{TASK.title}</h2>
        <p style={{ fontFamily: "var(--f-type)", fontSize: 11.5, lineHeight: 1.5, margin: "0 0 10px" }}>{TASK.desc}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--f-anton)", fontSize: 22, background: "var(--ink)", color: "var(--acid)", padding: "1px 8px" }}>{TASK.points} PTS</span>
          <span style={{ fontFamily: "var(--f-cond)", fontSize: 13, letterSpacing: "0.12em", border: "2px solid var(--ink)", padding: "2px 8px", transform: "rotate(-2deg)" }}>LVL {TASK.level}</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--f-marker)", fontSize: 12, color: "var(--pink-deep)" }}>no refunds</span>
        </div>
        {/* diagonal stamp */}
        <span style={{ position: "absolute", top: 108, right: -34, transform: "rotate(-38deg)", fontFamily: "var(--f-cond)", fontSize: 13, letterSpacing: "0.2em", color: "rgba(190,24,93,0.85)", border: "2px solid rgba(190,24,93,0.7)", padding: "2px 30px" }}>DISRUPT</span>
        {/* rip-off commitment tabs */}
        <div style={{ position: "relative", borderTop: "2px dashed var(--ink)", margin: "0 -16px" }}>
          <span style={{ position: "absolute", left: 10, top: -8, background: "var(--paper)", fontSize: 12, lineHeight: 1, padding: "0 3px", color: "var(--ink)" }}>✂</span>
        </div>
        <div style={{ display: "flex", margin: "0 -16px -8px" }}>
          {tabs.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 50, position: "relative", borderLeft: i ? "1px dashed rgba(20,17,11,0.45)" : "none", background: "var(--paper)" }}>
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: "var(--f-cond)", fontSize: 12, letterSpacing: "0.16em", color: "var(--ink)" }}>JOIN</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   OPTION C — SEWN PATCH
   Embroidered vest patch. Acid merrow stitch border, twill ground,
   chain-stitch title, safety pin. The silly-but-feral one.
   ════════════════════════════════════════════════════════════════ */
function CardPatch() {
  return (
    <div style={{ width: 290, position: "relative", padding: 14, transform: "rotate(-1.5deg)" }}>
      {/* safety pin */}
      <svg viewBox="0 0 120 40" style={{ position: "absolute", top: -8, left: 30, width: 130, height: 44, zIndex: 4, filter: "drop-shadow(1px 2px 1px rgba(0,0,0,0.4))" }}>
        <path d="M14 22 Q10 8 30 9 L96 13 Q112 14 110 26 Q108 34 96 30 L26 18" fill="none" stroke="#c7ccd1" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="14" cy="24" r="6.5" fill="none" stroke="#c7ccd1" strokeWidth="3.4" />
        <circle cx="14" cy="24" r="1.6" fill="#c7ccd1" />
      </svg>
      {/* merrow stitched border */}
      <div className="merrow" style={{ position: "relative", borderRadius: 16, padding: 7, boxShadow: "4px 6px 0 rgba(0,0,0,0.3)" }}>
        <div style={{
          position: "relative", borderRadius: 11, padding: "24px 20px 20px",
          background: "#15120c",
          backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 4px)",
          overflow: "hidden",
          boxShadow: "inset 0 0 0 2px rgba(182,255,46,0.5), inset 0 2px 14px rgba(0,0,0,0.6)",
          fontFamily: "var(--f-body)",
        }}>
          <Grain opacity={0.4} blend="overlay" />
          <div style={{ textAlign: "center", fontFamily: "var(--f-cond)", fontSize: 12, letterSpacing: "0.35em", color: "var(--acid)", marginBottom: 8 }}>★ EST. NEVER ★</div>
          {/* chain-stitch title */}
          <h2 style={{
            margin: "0 0 6px", textAlign: "center", fontFamily: "var(--f-marker)", fontSize: 30, lineHeight: 1,
            color: "var(--acid)", textTransform: "uppercase",
            textShadow: "0 0 1px var(--acid-deep), 1px 1px 0 #0a0a06, -1px 0 0 var(--acid-deep)",
          }}>{TASK.title}</h2>
          <div style={{ width: 70, height: 0, borderTop: "2.5px dotted var(--acid)", margin: "8px auto 12px", opacity: 0.8 }} />
          <p style={{ textAlign: "center", fontFamily: "var(--f-type)", fontSize: 11, lineHeight: 1.5, color: "#cdd6c4", margin: "0 0 16px" }}>{TASK.desc}</p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
            {/* stitched roundel */}
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--pink)", border: "2.5px dashed #fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "1px 2px 0 rgba(0,0,0,0.4)" }}>
              <span style={{ fontFamily: "var(--f-anton)", fontSize: 20, lineHeight: 0.8 }}>{TASK.points}</span>
              <span style={{ fontSize: 7, letterSpacing: "0.1em" }}>POINTS</span>
            </div>
            <span style={{ fontFamily: "var(--f-cond)", fontSize: 13, letterSpacing: "0.15em", color: "var(--acid)", border: "2px dashed var(--acid)", borderRadius: 20, padding: "4px 12px" }}>LVL {TASK.level}</span>
          </div>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <span style={{ display: "inline-block", fontFamily: "var(--f-black)", fontSize: 12, letterSpacing: "0.06em", background: "var(--acid)", color: "#15120c", borderRadius: 14, padding: "7px 18px", transform: "rotate(-1deg)" }}>SEW ME ON →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   OPTION D — SPRAY STENCIL
   Tagged on a concrete wall. Stencil-cut title, acid overspray,
   running drips, a circled-A'd SNIDE mark. "tag, you're it."
   ════════════════════════════════════════════════════════════════ */
function Drip({ x, h, w = 3 }) {
  return (
    <g>
      <rect x={x} y="0" width={w} height={h} fill="var(--acid)" opacity="0.85" />
      <circle cx={x + w / 2} cy={h} r={w * 0.9} fill="var(--acid)" opacity="0.85" />
    </g>
  );
}
function CardSpray() {
  return (
    <div style={{
      width: 300, position: "relative", padding: "26px 22px 22px",
      background: "#3a3a37",
      backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.22) 1px, transparent 1px)",
      backgroundSize: "3px 3px, 5px 5px", backgroundPosition: "0 0, 2px 2px",
      fontFamily: "var(--f-body)", color: "#e7e4da", overflow: "hidden",
      boxShadow: "6px 8px 0 rgba(0,0,0,0.3)", transform: "rotate(0.6deg)",
    }}>
      <Grain opacity={0.5} blend="multiply" />
      {/* concrete cracks */}
      <svg viewBox="0 0 300 220" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25, pointerEvents: "none" }}>
        <path d="M0 40 L60 70 L80 50 L160 90" stroke="#000" strokeWidth="0.8" fill="none" />
        <path d="M300 150 L240 160 L210 140 L120 180" stroke="#000" strokeWidth="0.8" fill="none" />
      </svg>
      {/* circled-A SNIDE mark */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <svg viewBox="0 0 48 48" style={{ width: 40, height: 40 }} filter="url(#snide-spray)">
          <circle cx="24" cy="24" r="19" fill="none" stroke="var(--acid)" strokeWidth="3" />
          <path d="M14 34 L24 12 L34 34 M18 27 H30" fill="none" stroke="var(--acid)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div>
          <div style={{ fontFamily: "var(--f-cond)", fontSize: 15, letterSpacing: "0.22em", color: "var(--acid)" }}>S.N.I.D.E.</div>
          <div style={{ fontSize: 8, letterSpacing: "0.14em", color: "#a7a49a", textTransform: "uppercase" }}>property of nobody</div>
        </div>
        <span style={{ marginLeft: "auto", fontFamily: "var(--f-marker)", fontSize: 13, color: "var(--pink)", transform: "rotate(-4deg)" }}>tag, you're it</span>
      </div>
      {/* sprayed stencil title */}
      <div style={{ position: "relative", marginBottom: 6 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--f-cond)", fontSize: 50, lineHeight: 0.84, letterSpacing: "0.02em", color: "var(--acid)", textTransform: "uppercase", filter: "url(#snide-spray)", textShadow: "0 0 7px rgba(182,255,46,0.45)" }}>{TASK.title}</h2>
        {/* drips under the title */}
        <svg viewBox="0 0 300 46" style={{ position: "absolute", left: 0, bottom: -16, width: "100%", height: 46, pointerEvents: "none" }} filter="url(#snide-spray)">
          <Drip x={36} h={34} /><Drip x={120} h={22} w={2.4} /><Drip x={188} h={40} /><Drip x={250} h={18} w={2.2} />
        </svg>
      </div>
      <p style={{ fontSize: 11, lineHeight: 1.55, color: "#cbc8be", margin: "22px 0 18px" }}>{TASK.desc}</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
        <div style={{ position: "relative", fontFamily: "var(--f-anton)", color: "var(--acid)", lineHeight: 0.8, filter: "url(#snide-spray)" }}>
          <span style={{ fontSize: 42 }}>{TASK.points}</span>
          <span style={{ fontSize: 12, marginLeft: 3 }}>PTS</span>
        </div>
        <span style={{ fontFamily: "var(--f-cond)", fontSize: 13, letterSpacing: "0.14em", color: "#e7e4da", border: "2px solid #6f6f68", padding: "3px 9px", transform: "rotate(-2deg)" }}>LVL {TASK.level}</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--f-black)", fontSize: 12, color: "#15120c", background: "var(--acid)", padding: "7px 12px", transform: "rotate(2deg)", boxShadow: "2px 3px 0 rgba(0,0,0,0.4)" }}>HIT IT ↗</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   OPTION E — ZINE COLLAGE  (green/black rework, pink as accent)
   Cut-and-paste chaos ripped from acid-green stock. Black ink scraps,
   ransom title, pink tape + scrawl + CTA accents, sticker points.
   ════════════════════════════════════════════════════════════════ */
function CardZine({ task = TASK, rot = -0.8 }) {
  return (
    <div style={{
      width: 300, position: "relative", padding: "20px 18px 22px",
      background: "var(--acid)", overflow: "hidden",
      fontFamily: "var(--f-body)", color: "var(--ink)",
      boxShadow: "6px 8px 0 rgba(0,0,0,0.32)", transform: `rotate(${rot}deg)`,
    }}>
      <div className="ht-dots" style={{ position: "absolute", inset: 0, color: "rgba(20,17,11,0.22)", pointerEvents: "none" }} />
      <Grain opacity={0.45} />
      {/* torn top/bottom — ripped from black stock */}
      <div className="torn-top" style={{ background: "var(--ink)", clipPath: TORN }} />
      <div className="torn-bottom" style={{ background: "var(--ink)", clipPath: TORN }} />
      {/* masthead scrap */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ background: "var(--ink)", color: "var(--acid)", fontFamily: "var(--f-cond)", fontSize: 14, letterSpacing: "0.2em", padding: "2px 8px", transform: "rotate(-2deg)" }}>S.N.I.D.E.</span>
        <span style={{ background: "var(--paper)", fontFamily: "var(--f-type)", fontSize: 9, whiteSpace: "nowrap", padding: "2px 7px", transform: "rotate(2deg)" }}>STILL FREE</span>
      </div>
      {/* black scrap w/ ransom title */}
      <div style={{ position: "relative", background: "var(--ink)", padding: "12px 12px 14px", transform: "rotate(-1.5deg)", marginBottom: 16, boxShadow: "2px 3px 0 rgba(0,0,0,0.4)" }}>
        <div className="ht-dots" style={{ position: "absolute", inset: 0, color: "rgba(182,255,46,0.14)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}><Ransom text={task.title} size={25} /></div>
      </div>
      {/* taped cream desc scrap + pink tape accent */}
      <div style={{ position: "relative", background: "var(--paper)", padding: "13px 12px 11px", transform: "rotate(0.8deg)", marginBottom: 16, boxShadow: "2px 3px 0 rgba(0,0,0,0.28)" }}>
        <div style={{ position: "absolute", top: -9, left: "50%", marginLeft: -30, width: 60, height: 19, background: "rgba(255,45,139,0.5)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)", transform: "rotate(-4deg)" }} />
        <p style={{ fontFamily: "var(--f-type)", fontSize: 11, lineHeight: 1.5, margin: 0, color: "#1a160e" }}>{task.desc}</p>
        <div style={{ fontFamily: "var(--f-marker)", fontSize: 15, color: "var(--pink)", transform: "rotate(-3deg)", marginTop: 6, WebkitTextStroke: "0.4px var(--pink-deep)" }}>do it, coward →</div>
      </div>
      {/* bottom row: black sticker points + level + pink CTA */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", width: 56, height: 56, transform: "rotate(-6deg)" }}>
          <svg viewBox="0 0 56 56" style={{ position: "absolute", inset: 0, filter: "drop-shadow(1.5px 2px 0 rgba(0,0,0,0.35))" }}>
            <circle cx="28" cy="28" r="26" fill="var(--ink)" stroke="var(--acid)" strokeWidth="2.5" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--acid)" }}>
            <span style={{ fontFamily: "var(--f-anton)", fontSize: 22, lineHeight: 0.8 }}>{task.points}</span>
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.1em" }}>POINTS</span>
          </div>
        </div>
        <span style={{ fontFamily: "var(--f-cond)", fontSize: 13, letterSpacing: "0.12em", background: "var(--ink)", color: "var(--acid)", padding: "3px 9px", transform: "rotate(2deg)" }}>LVL {task.level}</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--f-black)", fontSize: 13, background: "var(--pink)", color: "#fff", padding: "8px 13px", transform: "rotate(-2deg)", boxShadow: "2px 3px 0 var(--ink)" }}>I'M IN ↗</span>
      </div>
    </div>
  );
}

Object.assign(window, { CardRansom, CardFlyer, CardPatch, CardSpray, CardZine, Ransom, SNIDE_TASK: TASK, SNIDE_TASKS: TASKS });
