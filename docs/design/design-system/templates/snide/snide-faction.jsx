/* ════════════════════════════════════════════════════════════════
   S.N.I.D.E. — faction-aware surfaces
   Society for Nihilistic Intent and Disruptive Efforts.
   Sigil · nav badge · pennant (filter tab) · vote stamps (approval) ·
   stat block · faction-page hero (flyposted masthead) · dispatch slip.
   Reuses snide.css tokens + the photocopy filters (#snide-grain/-spray).
   Theme-aware through the cascade.
   ════════════════════════════════════════════════════════════════ */

/* ── SNIDE sigil — a sprayed, struck-through circle-S (defiant mark) ── */
function SnideSigil({ size = 48, color = "var(--acid)", strokeOnly = false }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ display: "block" }} filter="url(#snide-spray)">
      <circle cx="24" cy="24" r="19" fill="none" stroke={color} strokeWidth="3" />
      <text x="24" y="34" textAnchor="middle" fontFamily="var(--f-anton)" fontSize="30" fill={color}>S</text>
      <line x1="9" y1="40" x2="39" y2="8" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ── nav faction badge ─────────────────────────────────────────────── */
function SnideNavBadge({ name = "S.N.I.D.E." }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, background: "var(--snide-green)",
      color: "#fff", padding: "5px 9px 5px 7px", fontFamily: "var(--f-cond)",
      fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", transform: "rotate(-1deg)",
      boxShadow: "1.5px 2px 0 rgba(0,0,0,0.4)",
    }}>
      <SnideSigil size={15} color="var(--acid)" />
      {name}
    </span>
  );
}

/* ── faction pennant (filter tab) ──────────────────────────────────── */
/* Same clip-path as the other seven so the filter row aligns; only color
   changes. Inactive drops opacity. SNIDE uses its toxic green. */
function SnidePennant({ color, name, active = false, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: color, color: "#fff", fontFamily: "var(--font-body)", fontSize: 9.5,
      fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", padding: "5px 14px",
      cursor: "pointer", border: "none", borderRadius: 0, textShadow: "0 1px 2px rgba(0,0,0,0.3)",
      opacity: active ? 1 : 0.78, clipPath: "polygon(0 0, 100% 0, 94% 100%, 6% 100%)", whiteSpace: "nowrap",
      transform: active ? "translateY(-2px) rotate(-1deg)" : "none", transition: "all 120ms",
      filter: active ? "drop-shadow(0 4px 6px rgba(0,0,0,0.28))" : "none",
    }}>
      {name}
    </button>
  );
}

/* ── vote stamps — a mismatched drawer of rubber stamps ────────────── */
/* Each mark is a different junk-drawer stamp: varied shape, size, font,
   tilt and ink. Climbs from a limp "meh" to the black ANARCHY seal. */
const SNIDE_VOTE = [
  { v: 1, label: "meh",     shape: "square", rot: -8, size: 38, font: "var(--f-type)",  fill: "transparent",      ink: "cur",         ring: "cur",         border: "dashed" },
  { v: 2, label: "not bad", shape: "circle", rot: 6,  size: 46, font: "var(--f-anton)", fill: "var(--acid-deep)", ink: "var(--ink)",  ring: "var(--ink)",  border: "solid" },
  { v: 3, label: "rad",     shape: "square", rot: -5, size: 52, font: "var(--f-cond)",  fill: "var(--acid)",      ink: "var(--ink)",  ring: "var(--ink)",  border: "double" },
  { v: 4, label: "sick!!",  shape: "burst",  rot: 9,  size: 56, font: "var(--f-black)", fill: "var(--pink)",      ink: "#fff",        ring: "var(--ink)",  border: "solid" },
  { v: 5, label: "ANARCHY", shape: "seal",   rot: -6, size: 62, font: "var(--f-anton)", fill: "var(--ink)",       ink: "var(--acid)", ring: "var(--acid)", border: "solid" },
];
const BURST_CLIP = "polygon(50% 0,61% 25%,90% 10%,75% 39%,100% 50%,75% 61%,90% 90%,61% 75%,50% 100%,39% 75%,10% 90%,25% 61%,0 50%,25% 39%,10% 10%,39% 25%)";
function SnideVoteStamps({ value = 0, average, totalVotes, onPick }) {
  const [sel, setSel] = React.useState(value);
  React.useEffect(() => { setSel(value); }, [value]);
  return (
    <div>
      <div style={{ display: "flex", gap: 13, alignItems: "flex-end" }}>
        {SNIDE_VOTE.map((s) => {
          const on = sel >= s.v;
          const cur = "var(--snide-wall-text)";
          const ink = on ? (s.ink === "cur" ? cur : s.ink) : cur;
          const ring = on ? (s.ring === "cur" ? cur : s.ring) : cur;
          const round = s.shape === "circle" || s.shape === "seal";
          const isBurst = s.shape === "burst";
          return (
            <div key={s.v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <button onClick={() => { setSel(s.v); if (onPick) onPick(s.v); }} style={{
                position: "relative", width: s.size, height: s.size, cursor: "pointer", padding: 0,
                border: isBurst ? "none" : `${s.border === "double" ? 4 : 2.5}px ${s.border} ${ring}`,
                borderRadius: round ? "50%" : 0,
                clipPath: isBurst ? BURST_CLIP : "none",
                background: on ? s.fill : (isBurst ? "color-mix(in srgb, var(--snide-wall-text) 13%, transparent)" : "transparent"),
                color: ink, fontFamily: s.font, fontSize: s.size * (s.shape === "seal" ? 0.4 : 0.5), lineHeight: 1,
                transform: `rotate(${s.rot}deg)${sel === s.v ? " scale(1.08)" : ""}`, transition: "all 110ms",
                filter: on && !isBurst ? "url(#snide-rough)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {s.shape === "seal" && (
                  <span style={{ position: "absolute", inset: 4, borderRadius: "50%", border: `1.5px dashed ${on ? "var(--acid)" : cur}`, opacity: 0.7, pointerEvents: "none" }} />
                )}
                {s.v}
              </button>
              <span style={{ fontFamily: s.v === 5 ? "var(--f-cond)" : "var(--font-body)", fontSize: s.v === 5 ? 9 : 8,
                textTransform: "uppercase", letterSpacing: "0.04em",
                color: sel === s.v ? "var(--snide-green)" : "color-mix(in srgb, var(--snide-wall-text) 55%, transparent)",
                maxWidth: s.size + 16, textAlign: "center", lineHeight: 1.2 }}>{s.label}</span>
            </div>
          );
        })}
      </div>
      {average !== undefined && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 10, color: "color-mix(in srgb, var(--snide-wall-text) 60%, transparent)", margin: "16px 0 0", letterSpacing: "0.04em" }}>
          <b style={{ color: "var(--snide-green)", fontFamily: "var(--f-anton)", fontSize: 17 }}>{average.toFixed(1)}</b> avg · {totalVotes ?? 0} votes · <span style={{ fontFamily: "var(--f-marker)", color: "var(--pink)" }}>nobody's impressed</span>
        </p>
      )}
    </div>
  );
}

/* ── stat block (hero) ─────────────────────────────────────────────── */
function SnideStat({ value, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 22px" }}>
      <span style={{ fontFamily: "var(--f-anton)", fontSize: 36, lineHeight: 0.85, color: "var(--acid)", whiteSpace: "nowrap" }}>{value}</span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#cfcdbf" }}>{label}</span>
    </div>
  );
}

/* ── faction-page hero (flyposted wall — NOT a tidy poster) ────────── */
const HERO_GHOSTS = [
  { w: 122, h: 152, top: -24, left: 54, rot: -12 },
  { w: 96, h: 128, top: 44, left: 232, rot: 7 },
  { w: 150, h: 92, top: 158, left: 430, rot: -5 },
  { w: 84, h: 116, top: 14, left: 690, rot: 11 },
  { w: 116, h: 150, top: 128, left: 858, rot: -8 },
];
function SnideHero({ name, motto, fullName, blurb, stats }) {
  const chitRot = [-3, 2.5, -2];
  return (
    <header style={{ position: "relative", overflow: "hidden", background: "var(--ink)", color: "#fff", boxShadow: "8px 10px 0 rgba(0,0,0,0.32)", paddingBottom: 4 }}>
      <div className="ht-dots" style={{ position: "absolute", inset: 0, color: "rgba(182,255,46,0.055)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, filter: "url(#snide-grain)", opacity: 0.4, mixBlendMode: "screen", pointerEvents: "none" }} />
      {/* faint pasted flyers on the wall */}
      {HERO_GHOSTS.map((g, i) => (
        <div key={i} aria-hidden="true" style={{ position: "absolute", top: g.top, left: g.left, width: g.w, height: g.h,
          border: "1px solid rgba(182,255,46,0.07)", background: i % 2 ? "rgba(255,45,139,0.035)" : "rgba(182,255,46,0.025)",
          transform: `rotate(${g.rot}deg)`, pointerEvents: "none" }} />
      ))}
      {/* torn acid strip */}
      <div style={{ height: 6, background: "var(--acid)", position: "relative", zIndex: 2, clipPath: "polygon(0 0,100% 0,100% 55%,97% 100%,94% 50%,90% 100%,86% 55%,82% 100%,78% 60%,0 100%)" }} />

      {/* slapped sigil sticker, tilted */}
      <div style={{ position: "absolute", top: 34, right: 42, zIndex: 3, transform: "rotate(9deg)" }}>
        <div style={{ position: "relative", width: 104, height: 104, borderRadius: "50%", background: "var(--paper)",
          display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--snide-green)",
          boxShadow: "0 0 0 4px var(--ink), 3px 4px 0 rgba(0,0,0,0.4)" }}>
          <div className="ht-dots" style={{ position: "absolute", inset: 0, color: "rgba(20,17,11,0.06)", borderRadius: "50%", pointerEvents: "none" }} />
          <SnideSigil size={60} color="var(--snide-green)" />
        </div>
        <div style={{ position: "absolute", top: -9, left: "50%", marginLeft: -26, width: 52, height: 18, background: "var(--tape)", transform: "rotate(-7deg)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 2, padding: "26px 38px 2px", maxWidth: 770 }}>
        {/* eyebrow on tape */}
        <div style={{ display: "inline-block", width: "fit-content", whiteSpace: "nowrap", background: "var(--tape)", color: "var(--ink)", fontFamily: "var(--f-type)", fontSize: 10, letterSpacing: "0.05em", padding: "3px 12px", transform: "rotate(-1.5deg)", boxShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}>World Zero · faction no. 4</div>
        {/* wordmark */}
        <h1 style={{ fontFamily: "var(--f-anton)", fontSize: 86, lineHeight: 0.8, letterSpacing: "0.02em", margin: "14px 0 0",
          color: "var(--acid)", textShadow: "4px 4px 0 var(--pink)", transform: "skewX(-5deg) rotate(-1.5deg)" }}>{name}</h1>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#b7b5a7", margin: "12px 0 0", transform: "rotate(-0.4deg)" }}>{fullName}</div>
        {/* motto */}
        <div style={{ display: "inline-block", marginTop: 14, background: "var(--acid)", color: "var(--ink)",
          fontFamily: "var(--f-black)", fontSize: 15, letterSpacing: "0.02em", padding: "6px 15px", transform: "rotate(-2deg)", boxShadow: "2px 3px 0 var(--pink)" }}>{motto}</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.6, maxWidth: 600, margin: "16px 0 0", color: "#e7e4d8" }}>{blurb}</p>
      </div>

      {/* staggered stat chits — not a clean band */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", gap: 16, flexWrap: "wrap", padding: "24px 38px 28px" }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ background: "rgba(0,0,0,0.34)", border: "2px solid var(--acid)", padding: "8px 16px 7px",
            transform: `rotate(${chitRot[i % chitRot.length]}deg)`, boxShadow: "2px 3px 0 rgba(0,0,0,0.4)" }}>
            <div style={{ fontFamily: "var(--f-anton)", fontSize: 34, lineHeight: 0.85, color: "var(--acid)", whiteSpace: "nowrap" }}>{s.value}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#cfcdbf" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </header>
  );
}

/* ── dispatch slip (faction activity feed item) ────────────────────── */
/* World Zero's activity card reframed as an intercepted ransom-note slip. */
const STAMP_KINDS = {
  foe:   { label: "FOE",        color: "var(--pink)" },
  yours: { label: "YOUR STUFF", color: "var(--snide-green)" },
  duel:  { label: "DUEL",       color: "var(--color-danger, #dc2626)" },
};
function SnideDispatch({ actor, initial, action, task, badge, time, status, rot = -0.6 }) {
  const stamp = badge ? STAMP_KINDS[badge] ?? STAMP_KINDS.yours : null;
  return (
    <div style={{
      position: "relative", background: "var(--paper)", color: "var(--ink)", border: "1.5px solid var(--ink)",
      padding: "14px 18px 18px", marginBottom: 18, transform: `rotate(${rot}deg)`, boxShadow: "3px 4px 0 rgba(0,0,0,0.22)",
      fontFamily: "var(--font-body)", maxWidth: 560,
    }}>
      <div className="ht-dots" style={{ position: "absolute", inset: 0, color: "rgba(20,17,11,0.05)", pointerEvents: "none" }} />
      {/* torn bottom */}
      <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 6, background: "var(--snide-wall)", clipPath: "polygon(0 0,4% 100%,8% 20%,14% 90%,20% 10%,26% 80%,32% 0,40% 95%,48% 20%,56% 85%,64% 5%,72% 90%,80% 15%,88% 95%,94% 20%,100% 0)" }} />
      {/* rubber stamp badge */}
      {stamp && (
        <span style={{ position: "absolute", top: 10, right: 12, fontFamily: "var(--f-cond)", fontSize: 12, letterSpacing: "0.12em",
          color: stamp.color, border: `2px solid ${stamp.color}`, padding: "2px 9px", transform: "rotate(5deg)", opacity: 0.9 }}>{stamp.label}</span>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
        {/* sprayed avatar */}
        <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: "50%", background: "var(--ink)", border: "2px solid var(--snide-green)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acid)", fontFamily: "var(--f-anton)", fontSize: 20, transform: "rotate(-4deg)" }}>{initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--snide-muted)", marginBottom: 2 }}>intercepted dispatch · {time}</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>
            <span style={{ fontFamily: "var(--f-marker)", fontSize: 16, color: "var(--snide-green)", marginRight: 4 }}>{actor}</span>
            {action}
          </div>
        </div>
      </div>
      {/* task chip */}
      {task && (
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, background: "var(--ink)", padding: "5px 10px", transform: "rotate(-1deg)", whiteSpace: "nowrap", maxWidth: "100%" }}>
          <span style={{ fontFamily: "var(--f-cond)", fontSize: 13, letterSpacing: "0.06em", color: "var(--acid)", whiteSpace: "nowrap" }}>{task.title}</span>
          <span style={{ fontFamily: "var(--f-anton)", fontSize: 13, color: "var(--pink)" }}>+{task.points}</span>
          {task.level && <span style={{ fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: "0.08em", color: "#cfcdbf", textTransform: "uppercase" }}>lvl {task.level}</span>}
        </div>
      )}
      {status && (
        <div style={{ position: "relative", marginTop: 11, fontFamily: "var(--f-marker)", fontSize: 13, color: "var(--pink)", transform: "rotate(-1deg)" }}>{status}</div>
      )}
    </div>
  );
}

Object.assign(window, { SnideSigil, SnideNavBadge, SnidePennant, SnideVoteStamps, SnideStat, SnideHero, SnideDispatch });
