import React from "react";
import { LevelPill } from "../core/LevelPill.jsx";
import { factionCssVar } from "../core/factions.js";

/**
 * FactionPraxisCard — the companion to FactionTaskCard. A *praxis* is a filed
 * submission for a task: a finding/account someone logged, which the faction
 * then votes on. Each faction reframes World Zero's 1–5 vote in its own
 * vocabulary, and renders the praxis as a card in its own physical language:
 *
 *   ua          → gilt salon placard, filed (the Critique: rough sketch → masterwork)
 *   gestalt     → praxis.exe window (heart marks: a start → legendary)
 *   snide       → closed-case file (the mob's stamped marks)
 *   ephemerists → sealed ephemeris leaf (the concordance: apocryphal → canonical)
 *   singularity → terminal praxis log (ascii rating bar)
 *   everymen    → union work report, filed (the crew's star marks)
 *   albescent   → the register, witnessed (the witness ramp: unseeing → inscribed)
 *
 * Props mirror a real praxis: the `task` it answers, the `finding` headline,
 * the `author`, a short `excerpt`, a `rating` (1–5 average, rounded for the
 * meter), the `marks` count (how many voted), plus `points` / `level`.
 */
export function FactionPraxisCard({
  faction = "ua",
  task,
  finding,
  author = "Anon",
  excerpt,
  rating = 4,
  marks = 0,
  points = 0,
  level = 1,
}) {
  const props = { task, finding, author, excerpt, rating, marks, points, level };
  switch (faction) {
    case "wow": case "gestalt": return <GestaltPraxis {...props} />;
    case "snide": return <SnidePraxis {...props} />;
    case "ephemerists": case "journeymen": return <EphemeristsPraxis {...props} />;
    case "singularity": return <SingularityPraxis {...props} />;
    case "everymen": return <EverymenPraxis {...props} />;
    case "albescent": return <AlbescentPraxis {...props} />;
    case "ua":
    default: return <UAPraxis {...props} />;
  }
}

const clamp = (r) => Math.max(0, Math.min(5, Math.round(r)));

/* ── UA — Gilt salon placard, filed (the Critique) ── */
const UA_CRITIQUE = ["rough sketch", "study", "fair hand", "fine work", "masterwork"];
function UAPraxis({ task, finding, author, excerpt, rating, marks, points, level }) {
  const r = clamp(rating);
  return (
    <div style={{
      width: 232, padding: 6, background: "var(--ua-gilt)", transform: "rotate(-0.5deg)",
      boxShadow: "0 12px 26px rgba(60,40,10,0.24), inset 0 0 0 1px rgba(255,255,255,0.45)",
      fontFamily: "'EB Garamond', Georgia, serif",
    }}>
      <div style={{
        border: "1px solid rgba(60,40,10,0.4)", background: factionCssVar("ua", "card-bg"),
        padding: "16px 17px 14px", color: factionCssVar("ua", "card-text"),
        backgroundImage: "radial-gradient(rgba(60,40,10,0.03) 1px, transparent 1px)", backgroundSize: "5px 5px",
      }}>
        <div style={{ fontFamily: "var(--font-faction-engraved-caps)", fontSize: 8, letterSpacing: "0.12em", color: factionCssVar("ua", "card-accent") }}>Acquisition · re: {task}</div>
        <div style={{ fontFamily: factionCssVar("ua", "card-font"), fontStyle: "italic", fontWeight: 700, fontSize: 21, lineHeight: 1.14, margin: "5px 0 6px", overflowWrap: "anywhere" }}>{finding}</div>
        {excerpt && <div style={{ fontStyle: "italic", fontSize: 12, lineHeight: 1.5, color: factionCssVar("ua", "card-muted") }}>{excerpt}</div>}
        <div style={{ fontFamily: "var(--font-faction-engraved-caps)", fontSize: 9, letterSpacing: "0.06em", color: factionCssVar("ua", "card-muted"), margin: "8px 0 11px" }}>— {author}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ width: 11, height: 11, transform: "rotate(45deg)", background: i < r ? factionCssVar("ua", "card-accent") : "transparent", border: `1.5px solid ${factionCssVar("ua", "card-accent")}` }} />
          ))}
          <span style={{ fontFamily: factionCssVar("ua", "card-font"), fontStyle: "italic", fontSize: 12, color: factionCssVar("ua", "card-accent"), marginLeft: 4 }}>{UA_CRITIQUE[r - 1] || "awaiting"}</span>
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: "0.04em", color: factionCssVar("ua", "card-muted"), marginBottom: 10 }}>{marks} of the Salon weighed in</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--ua-line-soft)", paddingTop: 10 }}>
          <LevelPill level={level} factionSlug="ua" />
          <span style={{ fontFamily: factionCssVar("ua", "card-font"), fontStyle: "italic", fontWeight: 700, fontSize: 16, color: factionCssVar("ua", "card-accent") }}>{points}<span style={{ fontFamily: "var(--font-faction-engraved-caps)", fontSize: 8, marginLeft: 3, color: factionCssVar("ua", "card-muted") }}>pts</span></span>
        </div>
      </div>
    </div>
  );
}

/* ── Gestalt — praxis.exe window (heart marks) ── */
const G_LABELS = ["a start", "solid", "good", "excellent", "legendary"];
function GHeart({ on }) {
  return (
    <svg width="15" height="15" viewBox="0 0 36 36" style={{ display: "block" }}>
      <path d="M18 31C7 23 3 17 6.5 11 9 6.8 14 6.5 16 10c.9 1.5 1.6 2.7 2 3.4.4-.7 1.1-1.9 2-3.4 2-3.5 7-3.2 9.5 1C33 17 29 23 18 31Z"
        fill={on ? "var(--gestalt-pink)" : "none"} stroke={on ? "#fff" : "var(--gestalt-border-soft)"} strokeWidth={on ? 2.2 : 2} strokeLinejoin="round" />
    </svg>
  );
}
function GestaltPraxis({ task, finding, author, excerpt, rating, marks, points, level }) {
  const r = clamp(rating);
  const dot = (c) => ({ width: 9, height: 9, borderRadius: "50%", background: c, border: "1.2px solid rgba(255,255,255,0.7)" });
  return (
    <div style={{ width: 236, borderRadius: 12, overflow: "hidden", border: "2px solid var(--gestalt-win-border)", boxShadow: "0 8px 20px var(--gestalt-glow)", fontFamily: "var(--font-body)", transform: "rotate(-0.6deg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px", background: "linear-gradient(180deg, var(--gestalt-title-from), var(--gestalt-title-to))", borderBottom: "2px solid var(--gestalt-win-border)" }}>
        <span style={dot("#fb7aa8")} /><span style={dot("#f6c75e")} /><span style={dot("#86cfa6")} />
        <span style={{ marginLeft: "auto", fontSize: 9.5, color: "var(--gestalt-title-text)" }}>praxis.exe</span>
      </div>
      <div style={{ padding: "14px 15px 16px", background: factionCssVar("gestalt", "card-bg"), backgroundImage: "radial-gradient(var(--gestalt-border-soft) 1.3px, transparent 1.3px)", backgroundSize: "13px 13px", color: factionCssVar("gestalt", "card-text") }}>
        <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--gestalt-label)", marginBottom: 4 }}>re: {task}</div>
        <div style={{ fontFamily: factionCssVar("gestalt", "card-font"), fontSize: 25, lineHeight: 1.0, color: factionCssVar("gestalt", "card-text"), marginBottom: 6, overflowWrap: "anywhere" }}>{finding}</div>
        {excerpt && <div style={{ fontSize: 9.5, lineHeight: 1.5, color: factionCssVar("gestalt", "card-muted"), marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{excerpt}</div>}
        <div style={{ fontSize: 9.5, fontStyle: "italic", color: "var(--gestalt-ink-soft)", marginBottom: 10 }}>filed by {author}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
          {Array.from({ length: 5 }).map((_, i) => <GHeart key={i} on={i < r} />)}
          <span style={{ fontFamily: factionCssVar("gestalt", "card-font"), fontSize: 16, color: "var(--gestalt-pink)", marginLeft: 4 }}>{G_LABELS[Math.max(0, r - 1)]}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 20, background: "var(--gestalt-pink-lt)", color: factionCssVar("gestalt", "card-text"), border: "1px solid var(--gestalt-border-soft)" }}>lvl {level}</span>
          <span style={{ fontSize: 9, color: "var(--gestalt-label)" }}>{marks} hearts</span>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "var(--gestalt-pink-deep)" }}>{points} pts</span>
        </div>
      </div>
    </div>
  );
}

/* ── S.N.I.D.E. — Closed-case file (the mob's marks) ── */
function SnidePraxis({ task, finding, author, excerpt, rating, marks, points, level }) {
  const r = clamp(rating);
  return (
    <div style={{ width: 252, position: "relative", background: factionCssVar("snide", "card-bg"), color: "#fff", padding: "26px 18px 18px", fontFamily: "var(--font-body)", overflow: "hidden", boxShadow: "6px 8px 0 rgba(0,0,0,0.28)", transform: "rotate(-1deg)" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(rgba(182,255,46,0.09) 32%, transparent 34%)", backgroundSize: "5px 5px" }} />
      <div style={{ position: "absolute", top: -9, left: 26, width: 54, height: 20, background: "var(--snide-tape)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)", transform: "rotate(-8deg)" }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid var(--snide-acid)", paddingBottom: 6, marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-accent)", fontSize: 14, letterSpacing: "0.2em", color: "var(--snide-acid)" }}>S.N.I.D.E. · CASE CLOSED</span>
      </div>
      <div style={{ position: "relative", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8f9183", marginBottom: 5 }}>re: {task}</div>
      <div style={{ position: "relative", fontFamily: "var(--font-faction-anton)", fontSize: 26, lineHeight: 0.94, letterSpacing: "0.02em", transform: "skewX(-4deg)", marginBottom: 8, overflowWrap: "anywhere" }}>{finding}</div>
      {excerpt && <p style={{ position: "relative", fontFamily: "var(--font-faction-typewriter)", fontSize: 10, lineHeight: 1.5, color: "#d8d6c8", margin: "0 0 8px" }}>{excerpt}</p>}
      <div style={{ position: "relative", fontFamily: "var(--font-faction-marker)", fontSize: 13, color: "var(--snide-pink)", transform: "rotate(-1deg)", marginBottom: 12 }}>confessed by {author}</div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, marginBottom: 11 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", background: i < r ? "var(--snide-acid)" : "transparent", color: "var(--snide-ink)", border: `1.5px solid ${i < r ? "var(--snide-acid)" : "#6b6d60"}`, fontFamily: "var(--font-faction-black)", fontSize: 9, transform: `rotate(${i % 2 ? 4 : -4}deg)` }}>✓</span>
        ))}
        <span style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.1em", color: "#cfd1c4", marginLeft: 5 }}>{marks} MARKS</span>
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: "var(--font-faction-anton)", fontSize: 22, color: "var(--snide-acid)" }}>{points}<span style={{ fontSize: 9, marginLeft: 2 }}>PTS</span></span>
        <span style={{ fontFamily: "var(--font-accent)", fontSize: 11, letterSpacing: "0.1em", border: "1.5px dashed #6b6d60", color: "#cfd1c4", padding: "2px 7px", transform: "rotate(2deg)" }}>LVL {level}</span>
        <span style={{ marginLeft: "auto", background: "var(--snide-pink)", color: "#fff", fontFamily: "var(--font-faction-black)", fontSize: 10, padding: "5px 9px", transform: "rotate(-3deg)", boxShadow: "2px 3px 0 rgba(0,0,0,0.4)" }}>VERDICT ↗</span>
      </div>
    </div>
  );
}

/* ── Ephemerists — sealed leaf (the concordance) ── */
const CONCORD = [
  { fill: "var(--eph-gold)", label: "apocryphal" },
  { fill: "var(--eph-verdigris)", label: "disputed" },
  { fill: "var(--eph-lapis)", label: "plausible" },
  { fill: "var(--eph-rubric)", label: "corroborated" },
  { fill: "var(--eph-ink)", label: "canonical" },
];
const ROMAN = ["I", "II", "III", "IV", "V"];
function EphemeristsPraxis({ task, finding, author, excerpt, rating, marks, points, level }) {
  const r = clamp(rating);
  const tw = (finding || "").trim().split(" ");
  const tlast = tw.pop();
  const st = CONCORD[Math.max(0, r - 1)];
  return (
    <div style={{ width: 232, position: "relative", overflow: "hidden", background: factionCssVar("ephemerists", "card-bg"), color: factionCssVar("ephemerists", "card-text"), border: "1.5px solid var(--eph-ink)", fontFamily: "var(--font-faction-codex)", padding: "11px 14px 13px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, color: "var(--eph-rubric)", borderBottom: "1px solid var(--eph-gold-deep)", paddingBottom: 6, marginBottom: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-faction-engraved)", fontWeight: 600, fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--eph-lapis)" strokeWidth="1.4"><ellipse cx="12" cy="12" rx="11" ry="4.4" transform="rotate(-24 12 12)"></ellipse><path d="M4 12 C7.5 8.2 16.5 8.2 20 12 C16.5 15.8 7.5 15.8 4 12 Z"></path><circle cx="12" cy="12" r="2.7"></circle></svg>
          Ephemeris entry
        </span>
        <span style={{ fontFamily: "var(--font-faction-codex)", fontSize: 8.5, color: "var(--eph-muted)" }}>✦ sealed</span>
      </div>
      <div style={{ fontFamily: "var(--font-faction-codex)", fontStyle: "italic", fontSize: 9, color: "var(--eph-rubric)", marginBottom: 3 }}>re: {task}</div>
      <div style={{ fontFamily: "var(--font-faction-engraved)", fontWeight: 700, fontSize: 21, lineHeight: 0.98, marginBottom: 5, color: factionCssVar("ephemerists", "card-text") }}>{tw.join(" ")}{tw.length ? " " : ""}<span style={{ color: "var(--eph-lapis)" }}>{tlast}</span><sup style={{ fontFamily: "var(--font-faction-codex)", fontSize: 9, color: "var(--eph-lapis)", fontWeight: 400 }}>†</sup></div>
      {excerpt && <div style={{ fontSize: 9, lineHeight: 1.45, fontStyle: "italic", color: "var(--eph-muted)", marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{excerpt}</div>}
      <div style={{ fontSize: 9.5, color: "var(--eph-muted)", marginBottom: 9 }}>filed by <b style={{ color: factionCssVar("ephemerists", "card-text") }}>{author}</b></div>
      {/* concordance sparkline */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 26 }}>
          {CONCORD.map((c, i) => (
            <div key={i} style={{ width: 7, height: 6 + i * 5, background: c.fill === "var(--eph-ink)" && i + 1 !== r ? c.fill : c.fill, opacity: i + 1 <= r ? 1 : 0.28 }} />
          ))}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontFamily: "var(--font-faction-engraved)", fontWeight: 800, fontSize: 17, lineHeight: 1, color: st.fill === "var(--eph-ink)" ? "var(--eph-vellum-text)" : st.fill }}>{rating.toFixed(1)}</span>
            <span style={{ fontFamily: "var(--font-faction-codex)", fontStyle: "italic", fontSize: 9, color: "var(--eph-muted)" }}>{st.label}</span>
          </div>
          <div style={{ fontSize: 7.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--eph-muted)" }}>{marks} marks</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 8, borderTop: "1px dashed color-mix(in srgb, var(--eph-vellum-text) 26%, transparent)", paddingTop: 8 }}>
        <span style={{ color: factionCssVar("ephemerists", "card-text") }}>▦ grade {ROMAN[Math.max(0, Math.min(4, level - 1))]}</span>
        <span style={{ color: "var(--eph-gold-deep)" }}>·</span>
        <span style={{ fontFamily: "var(--font-faction-engraved)", fontWeight: 700, fontSize: 12, color: "var(--eph-rubric)" }}>{points} pvncta</span>
      </div>
    </div>
  );
}

/* ── Singularity — terminal praxis log (ascii bar) ── */
function SingularityPraxis({ task, finding, author, excerpt, rating, marks, points, level }) {
  const r = clamp(rating);
  const bar = "█".repeat(r) + "░".repeat(5 - r);
  return (
    <div style={{ width: 232, background: "var(--faction-singularity-card-bg)", border: "1px solid var(--faction-singularity-border-hard)", position: "relative", fontFamily: factionCssVar("singularity", "card-font"), color: "var(--faction-singularity-card-text)", overflow: "hidden", padding: "12px 14px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(74,222,128,0.015) 2px, rgba(74,222,128,0.015) 4px)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 7, color: "var(--faction-singularity-card-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>praxis.log · sealed
          <span style={{ display: "inline-block", width: 5, height: 9, background: "var(--faction-singularity-card-text)", marginLeft: 3, verticalAlign: "middle", animation: "wz-blink 1s step-end infinite" }} />
        </div>
        <div style={{ fontSize: 7.5, color: "var(--faction-singularity-card-muted)", marginBottom: 6 }}>re: {task}</div>
        <div style={{ fontSize: 13, lineHeight: 1.25, marginBottom: 6, overflowWrap: "anywhere" }}>{"> "}{finding}</div>
        {excerpt && <div style={{ fontSize: 8, color: "var(--faction-singularity-card-muted)", lineHeight: 1.5, marginBottom: 7, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{excerpt}</div>}
        <div style={{ fontSize: 8, color: "var(--faction-singularity-card-muted)", marginBottom: 8 }}>filed_by: <span style={{ color: "var(--faction-singularity-card-text)" }}>{author}</span></div>
        <div style={{ fontSize: 11, letterSpacing: "0.08em", marginBottom: 7 }}>
          <span style={{ color: "var(--faction-singularity-card-text)" }}>[{bar}]</span>
          <span style={{ color: "var(--faction-singularity-card-muted)", fontSize: 8, marginLeft: 6 }}>{rating.toFixed(1)}/5 · {marks} votes</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--faction-singularity-border-hard)", paddingTop: 6, fontSize: 8, color: "var(--faction-singularity-card-muted)" }}>
          <span>PTS: <span style={{ color: "var(--faction-singularity-card-text)", fontSize: 11, fontWeight: 700 }}>{points}</span></span>
          <span style={{ border: "1px solid var(--faction-singularity-card-text)", color: "var(--faction-singularity-card-text)", padding: "1px 6px", borderRadius: 6, textTransform: "uppercase" }}>lvl {level}</span>
        </div>
      </div>
      <style>{`@keyframes wz-blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

/* ── Albescent — returned account, witnessed (the witness ramp) ── */
const AL_WITNESS = ["unseeing", "glimpsed", "witnessed", "verified", "inscribed"];
function AlPraxisMark({ size = 16 }) {
  const c = size / 2, rO = size * 0.43, rI = size * 0.235, rD = size * 0.05;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ display: "block", flexShrink: 0 }}>
      <circle cx={c} cy={c} r={rO} stroke="var(--faction-albescent-card-text)" strokeWidth={size * 0.05} opacity={0.2} />
      <circle cx={c} cy={c} r={rI} stroke="var(--faction-albescent-card-text)" strokeWidth={size * 0.07} opacity={0.55} />
      <circle cx={c} cy={c} r={rD} fill="var(--faction-albescent-card-text)" />
    </svg>
  );
}
function AlbescentPraxis({ task, finding, author, excerpt, rating, marks, points, level }) {
  const r = clamp(rating);
  const shades = ["rgba(0,0,0,0.16)", "rgba(0,0,0,0.30)", "rgba(0,0,0,0.48)", "rgba(0,0,0,0.66)", "rgba(0,0,0,0.84)"];
  return (
    <div style={{
      width: 224, background: factionCssVar("albescent", "card-bg"),
      border: "1px solid var(--faction-albescent-border)", boxShadow: "var(--al-shadow)",
      padding: "18px 20px 16px", fontFamily: factionCssVar("albescent", "card-font"),
      color: factionCssVar("albescent", "card-text"),
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--al-border-faint)", paddingBottom: 9, marginBottom: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 6.5, letterSpacing: "0.22em", textTransform: "uppercase", color: factionCssVar("albescent", "card-muted") }}><AlPraxisMark size={13} /> the register</span>
        <span style={{ fontStyle: "italic", fontSize: 9, color: factionCssVar("albescent", "card-muted") }}>returned</span>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 7, letterSpacing: "0.06em", color: factionCssVar("albescent", "card-muted"), marginBottom: 4 }}>re: {task}</div>
      <div style={{ fontStyle: "italic", fontWeight: 300, fontSize: 18, lineHeight: 1.22, marginBottom: 7, overflowWrap: "anywhere" }}>{finding}</div>
      {excerpt && <div style={{ fontFamily: "var(--font-body)", fontSize: 7.5, lineHeight: 1.6, color: factionCssVar("albescent", "card-muted"), marginBottom: 9, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{excerpt}</div>}
      <div style={{ fontStyle: "italic", fontSize: 10, color: factionCssVar("albescent", "card-muted"), marginBottom: 12 }}>— {author}</div>
      {/* witness ramp */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
        {shades.map((sh, i) => (
          <span key={i} style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${sh}`, background: i < r ? sh : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{i === r - 1 && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />}</span>
        ))}
        <span style={{ fontStyle: "italic", fontSize: 11, color: factionCssVar("albescent", "card-accent"), marginLeft: 4 }}>{AL_WITNESS[Math.max(0, r - 1)]}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--al-border-faint)", paddingTop: 9, fontFamily: "var(--font-body)", fontSize: 6.5, letterSpacing: "0.16em", textTransform: "uppercase", color: factionCssVar("albescent", "card-muted") }}>
        <span>{marks} keepers · lvl {level}</span>
        <span style={{ fontFamily: factionCssVar("albescent", "card-font"), fontStyle: "italic", fontSize: 14, letterSpacing: 0, textTransform: "none", color: factionCssVar("albescent", "card-accent") }}>{points} pts</span>
      </div>
    </div>
  );
}

/* ── Everymen — union work report, filed (the crew's star marks) ── */
function Star({ on }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ display: "block" }}>
      <path d="M12 1.5l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 8.7l7.1-.6z"
        fill={on ? "var(--everymen-gold)" : "none"} stroke={on ? "var(--everymen-ink)" : "var(--everymen-muted)"} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
function EverymenPraxis({ task, finding, author, excerpt, rating, marks, points, level }) {
  const r = clamp(rating);
  return (
    <div style={{ width: 224, background: "var(--everymen-paper)", color: "var(--everymen-paper-text)", border: "1.5px solid var(--everymen-ink)", boxShadow: "0 0 0 3px var(--everymen-paper), 0 0 0 4px var(--everymen-ink)", position: "relative", fontFamily: "var(--font-body)", overflow: "hidden" }}>
      <div style={{ background: "var(--everymen-red)", color: "var(--everymen-cream)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px" }}>
        <span style={{ fontFamily: "var(--font-faction-poster)", fontSize: 14, letterSpacing: "0.1em" }}>WORK REPORT · FILED</span>
      </div>
      <div style={{ position: "relative", padding: "13px 14px 14px" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.05, backgroundImage: "radial-gradient(var(--everymen-ink) 0.6px, transparent 0.7px)", backgroundSize: "4px 4px" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--everymen-muted)", marginBottom: 3 }}>re: {task}</div>
          <div style={{ fontFamily: "var(--font-faction-poster)", fontSize: 28, lineHeight: 0.96, marginBottom: 6, overflowWrap: "anywhere" }}>{finding}</div>
          {excerpt && <div style={{ fontSize: 9, lineHeight: 1.5, color: "var(--everymen-muted)", marginBottom: 7, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{excerpt}</div>}
          <div style={{ fontSize: 10, fontStyle: "italic", color: "var(--everymen-muted)", marginBottom: 10 }}>filed by {author}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 11 }}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} on={i < r} />)}
            <span style={{ fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--everymen-muted)", marginLeft: 5 }}>{marks} marks</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "stretch", borderTop: "2px solid var(--everymen-ink)" }}>
        <div style={{ flex: 1, background: "var(--everymen-ink)", color: "var(--everymen-gold)", textAlign: "center", padding: "5px 0", fontFamily: "var(--font-faction-poster)", fontSize: 14 }}>LVL {level}</div>
        <div style={{ flex: 1, background: "var(--everymen-gold)", color: "var(--everymen-ink)", textAlign: "center", padding: "5px 0", fontFamily: "var(--font-faction-poster)", fontSize: 14 }}>{points} PTS</div>
      </div>
    </div>
  );
}
