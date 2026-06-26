import React from "react";
import { LevelPill } from "../core/LevelPill.jsx";
import { factionCssVar } from "../core/factions.js";

/**
 * FactionTaskCard — World Zero's signature component. Each faction renders a
 * COMPLETELY different physical card archetype; the card type IS the faction
 * identity. One <FactionTaskCard faction="…"> picks the right archetype.
 *
 *   ua          → gilt salon (heraldic crest in a gold frame, Playfair italic)
 *   gestalt     → gestalt.exe desktop window (title bar, traffic lights, charms)
 *   snide       → ransom dispatch (photocopier ink, cut-out letters, tape, acid spray)
 *   ephemerists → the discordant map (vellum, three feuding coordinate grids)
 *   singularity → terminal printout (always dark, scanlines, sprockets)
 *   everymen    → union / victory poster (sunburst field, knockout headline, stamp)
 *   albescent   → vellum correspondence (white cotton card, surveyor's mark, no hue)
 *
 * Cards have intentionally varied widths and live in a flex-wrap container with
 * slight rotations — never a strict grid.
 */
export function FactionTaskCard({
  faction = "ua",
  title,
  description,
  level = 1,
  points = 0,
  onSignup,
}) {
  const props = { title, description, level, points, onSignup };
  switch (faction) {
    case "wow": case "gestalt": return <Gestalt {...props} />;
    case "snide": return <Snide {...props} />;
    case "ephemerists": case "journeymen": return <Ephemerists {...props} />;
    case "singularity": return <Singularity {...props} />;
    case "everymen": return <Everymen {...props} />;
    case "albescent": return <Albescent {...props} />;
    case "ua":
    default: return <UA {...props} />;
  }
}

/* ── UA — Gilt Salon (heraldic crest in a gold frame; always-light) ── */
function UACrest({ w = 50 }) {
  const id = "ua-tc-shield";
  return (
    <svg width={w} height={w * 1.2} viewBox="0 0 100 120" style={{ display: "block" }}>
      <defs><clipPath id={id}><path d="M8 6 H92 V60 C92 92 66 108 50 116 C34 108 8 92 8 60 Z" /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="100" height="120" fill="var(--ua-orange)" />
        <rect x="0" y="60" width="100" height="60" fill="#f8ead2" />
        <circle cx="50" cy="60" r="15" fill="#f0b53e" />
        <g stroke="#f0b53e" strokeWidth="2.4" strokeLinecap="round">
          <line x1="50" y1="60" x2="50" y2="20" /><line x1="50" y1="60" x2="22" y2="30" /><line x1="50" y1="60" x2="78" y2="30" />
          <line x1="50" y1="60" x2="14" y2="48" /><line x1="50" y1="60" x2="86" y2="48" /><line x1="50" y1="60" x2="34" y2="22" /><line x1="50" y1="60" x2="66" y2="22" />
        </g>
        <g transform="translate(50 84)">
          <g transform="rotate(38)"><rect x="-2" y="-30" width="4" height="44" rx="1.5" fill="#3d2410" /><rect x="-3" y="10" width="6" height="6" fill="#eab94a" /><path d="M-3 16 L3 16 L1.5 26 L-1.5 26 Z" fill="var(--ua-orange)" /></g>
          <g transform="rotate(-38)"><rect x="-2" y="-30" width="4" height="44" rx="1.5" fill="var(--ua-gold)" /><rect x="-3" y="10" width="6" height="6" fill="#eab94a" /><path d="M-3 16 L3 16 L1.5 26 L-1.5 26 Z" fill="var(--ua-gold-lt)" /></g>
        </g>
      </g>
      <path d="M8 6 H92 V60 C92 92 66 108 50 116 C34 108 8 92 8 60 Z" fill="none" stroke="var(--ua-gold-lt)" strokeWidth="2.5" />
      <path d="M8 6 H92 V60 C92 92 66 108 50 116 C34 108 8 92 8 60 Z" fill="none" stroke="#3d2410" strokeWidth="0.8" />
    </svg>
  );
}
function UA({ title, description, level, points, onSignup }) {
  return (
    <div style={{
      width: 170, flex: "0 0 auto", transform: "rotate(-0.5deg)",
      padding: 7, background: "var(--ua-gilt)",
      boxShadow: "0 12px 26px rgba(60,40,10,0.28), inset 0 0 0 1px rgba(255,255,255,0.45)",
      fontFamily: "'EB Garamond', Georgia, serif",
    }}>
      <div style={{ padding: 3, background: "linear-gradient(135deg, var(--ua-gold), var(--ua-gold-pale))" }}>
        <div style={{
          border: "1px solid rgba(60,40,10,0.45)", background: factionCssVar("ua", "card-bg"),
          padding: "15px 14px 13px", textAlign: "center",
          backgroundImage: "radial-gradient(rgba(60,40,10,0.03) 1px, transparent 1px)", backgroundSize: "5px 5px",
          color: factionCssVar("ua", "card-text"),
        }}>
          <div style={{ fontFamily: "var(--font-faction-engraved-caps)", fontSize: 8.5, letterSpacing: "0.13em", color: factionCssVar("ua", "card-accent") }}>University of Asthmatics</div>
          <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 6px" }}><UACrest w={50} /></div>
          <div style={{ position: "relative", margin: "0 auto 11px", width: "94%", background: factionCssVar("ua", "card-accent"), color: "#fce4c4", fontFamily: "var(--font-faction-engraved-caps)", fontSize: 7.5, letterSpacing: "0.07em", padding: "4px 0", clipPath: "polygon(0 0,100% 0,95% 50%,100% 100%,0 100%,5% 50%)" }}>Ars Longa · Spiritus Brevis</div>
          <div style={{ fontFamily: factionCssVar("ua", "card-font"), fontStyle: "italic", fontWeight: 600, fontSize: 19, lineHeight: 1.18, marginBottom: 6, overflowWrap: "anywhere" }}>{title}</div>
          {description && <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontStyle: "italic", fontSize: 10.5, lineHeight: 1.5, color: factionCssVar("ua", "card-muted"), marginBottom: 12 }}>{description}</div>}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, borderTop: "1px solid var(--ua-line-soft)", paddingTop: 10 }}>
            <LevelPill level={level} factionSlug="ua" />
            <span style={{ fontFamily: factionCssVar("ua", "card-font"), fontStyle: "italic", fontWeight: 700, fontSize: 17, color: factionCssVar("ua", "card-accent") }}>{points}<span style={{ fontFamily: "var(--font-faction-engraved-caps)", fontSize: 8, marginLeft: 3, color: factionCssVar("ua", "card-muted") }}>pts</span></span>
          </div>
          {onSignup && <button onClick={onSignup} style={{ width: "100%", marginTop: 11, cursor: "pointer", fontFamily: "var(--font-faction-engraved-caps)", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--ua-paper-warm)", background: factionCssVar("ua", "card-accent"), border: "none", padding: "8px" }}>Matriculate</button>}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GESTALT — gestalt.exe desktop window
   Pink computer-witch window: traffic-light title bar, dotted desktop
   body, sparkle charms, a Caveat title, heart vote, glossy CTA.
   ════════════════════════════════════════════════════════════════ */
function Sparkle({ size = 12, color = "var(--gestalt-pink)", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", ...style }}>
      <path d="M12 0c.9 7 4.1 10.2 11 11-6.9.8-10.1 4-11 11-.9-7-4.1-10.2-11-11C7.9 10.2 11.1 7 12 0Z" fill={color} />
    </svg>
  );
}
function HeartGlyph({ size = 16, color = "var(--gestalt-pink)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ display: "block" }}>
      <path d="M18 31C7 23 3 17 6.5 11 9 6.8 14 6.5 16 10c.9 1.5 1.6 2.7 2 3.4.4-.7 1.1-1.9 2-3.4 2-3.5 7-3.2 9.5 1C33 17 29 23 18 31Z"
        fill={color} stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}
function Gestalt({ title, description, level, points, onSignup }) {
  const dot = (c) => ({ width: 9, height: 9, borderRadius: "50%", background: c, border: "1.2px solid rgba(255,255,255,0.7)" });
  return (
    <div style={{
      width: 232, flex: "0 0 auto", borderRadius: 12, overflow: "hidden",
      border: "2px solid var(--gestalt-win-border)", boxShadow: "0 8px 20px var(--gestalt-glow)",
      fontFamily: "var(--font-body)", transform: "rotate(-0.6deg)",
    }}>
      {/* title bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px",
        background: "linear-gradient(180deg, var(--gestalt-title-from), var(--gestalt-title-to))",
        borderBottom: "2px solid var(--gestalt-win-border)" }}>
        <span style={dot("#fb7aa8")} /><span style={dot("#f6c75e")} /><span style={dot("#86cfa6")} />
        <span style={{ marginLeft: "auto", fontSize: 9.5, color: "var(--gestalt-title-text)" }}>gestalt.exe</span>
      </div>
      {/* desktop body */}
      <div style={{ position: "relative", padding: "15px 15px 16px", background: factionCssVar("gestalt", "card-bg"),
        backgroundImage: "radial-gradient(var(--gestalt-border-soft) 1.3px, transparent 1.3px)", backgroundSize: "13px 13px",
        color: factionCssVar("gestalt", "card-text") }}>
        <Sparkle size={13} color="var(--gestalt-gold)" style={{ position: "absolute", top: 11, right: 13, transform: "rotate(8deg)" }} />
        <div style={{ fontFamily: "var(--font-body)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--gestalt-label)", marginBottom: 5 }}>a little magic</div>
        <div style={{ fontFamily: factionCssVar("gestalt", "card-font"), fontSize: 27, lineHeight: 1.0, color: factionCssVar("gestalt", "card-text"), marginBottom: 7, overflowWrap: "anywhere" }}>{title}</div>
        {description && <div style={{ fontSize: 9.5, lineHeight: 1.5, color: factionCssVar("gestalt", "card-muted"), marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: onSignup ? 12 : 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "3px 9px", borderRadius: 20, background: "var(--gestalt-pink-lt)", color: factionCssVar("gestalt", "card-text"), border: "1px solid var(--gestalt-border-soft)" }}>
            <Sparkle size={9} color="var(--gestalt-pink)" /> lvl {level}
          </span>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontFamily: factionCssVar("gestalt", "card-font"), fontSize: 20, color: "var(--gestalt-pink)" }}>
            <HeartGlyph size={15} color="var(--gestalt-pink)" /> {points}
          </span>
        </div>
        {onSignup && (
          <button onClick={onSignup} style={{ width: "100%", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 10,
            textTransform: "uppercase", letterSpacing: "0.12em", color: "#fff", padding: "9px",
            border: "1.5px solid var(--gestalt-pink-deep)", borderRadius: 9,
            background: "linear-gradient(180deg, var(--gestalt-pink), var(--gestalt-pink-deep))",
            boxShadow: "0 4px 10px var(--gestalt-glow)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Sparkle size={11} color="#fff" /> sign up
          </button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   S.N.I.D.E. — Ransom Dispatch
   Photocopier-black demand note: acid masthead, cut-out ransom title,
   pink marker scrawl, acid points inside a sprayed pink ellipse, tape.
   ════════════════════════════════════════════════════════════════ */
const RANSOM_STYLES = [
  { bg: "var(--snide-paper)", col: "var(--snide-ink)", font: "var(--font-faction-anton)", rot: -5 },
  { bg: "var(--snide-ink)", col: "var(--snide-acid)", font: "var(--font-accent)", rot: 4 },
  { bg: "var(--snide-pink)", col: "#fff", font: "var(--font-faction-black)", rot: -3 },
  { bg: "var(--snide-acid)", col: "var(--snide-ink)", font: "var(--font-faction-anton)", rot: 6 },
  { bg: "var(--snide-paper)", col: "var(--snide-ink)", font: "var(--font-faction-typewriter)", rot: 2, italic: true },
  { bg: "var(--snide-ink)", col: "#fff", font: "var(--font-accent)", rot: -6 },
];
function Ransom({ text, size = 26 }) {
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
function Snide({ title, description, level, points, onSignup }) {
  return (
    <div style={{
      width: 256, position: "relative", background: factionCssVar("snide", "card-bg"), color: "#fff",
      padding: "28px 18px 20px", fontFamily: "var(--font-body)", overflow: "hidden",
      boxShadow: "6px 8px 0 rgba(0,0,0,0.28)", transform: "rotate(-1deg)",
    }}>
      {/* acid halftone wash */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(rgba(182,255,46,0.09) 32%, transparent 34%)", backgroundSize: "5px 5px" }} />
      {/* tape */}
      <div style={{ position: "absolute", top: -10, left: 28, width: 56, height: 22, background: "var(--snide-tape)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)", transform: "rotate(-8deg)" }} />
      <div style={{ position: "absolute", top: -8, right: 22, width: 56, height: 22, background: "var(--snide-tape)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)", transform: "rotate(7deg)" }} />
      {/* masthead */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid var(--snide-acid)", paddingBottom: 6, marginBottom: 11 }}>
        <span style={{ fontFamily: "var(--font-accent)", fontSize: 15, letterSpacing: "0.22em", color: "var(--snide-acid)" }}>S.N.I.D.E.</span>
        <span style={{ fontSize: 7.5, letterSpacing: "0.16em", color: "#8f9183", textTransform: "uppercase" }}>dispatch №0666</span>
      </div>
      <div style={{ position: "relative", fontFamily: "var(--font-faction-marker)", fontSize: 12, color: "var(--snide-pink)", transform: "rotate(-1.5deg)", marginBottom: 6 }}>your assignment, should you ignore it —</div>
      <div style={{ position: "relative", margin: "8px 0 14px" }}><Ransom text={title} size={25} /></div>
      {description && <p style={{ position: "relative", fontFamily: "var(--font-faction-typewriter)", fontSize: 10.5, lineHeight: 1.5, color: "#d8d6c8", margin: "0 0 16px" }}>{description}</p>}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", fontFamily: "var(--font-faction-anton)", color: "var(--snide-acid)", lineHeight: 0.8 }}>
          <span style={{ fontSize: 36 }}>{points}</span>
          <span style={{ fontSize: 10, letterSpacing: "0.1em", marginLeft: 3 }}>PTS</span>
          <svg viewBox="0 0 120 60" style={{ position: "absolute", inset: "-12px -10px", width: "calc(100% + 20px)", height: "calc(100% + 24px)" }}>
            <ellipse cx="60" cy="30" rx="54" ry="24" fill="none" stroke="var(--snide-pink)" strokeWidth="2.5" />
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-accent)", fontSize: 12, letterSpacing: "0.1em", border: "1.5px dashed #6b6d60", color: "#cfd1c4", padding: "3px 8px", transform: "rotate(2deg)" }}>LVL {level}</span>
        {onSignup && (
          <button onClick={onSignup} style={{ marginLeft: "auto", cursor: "pointer", background: "var(--snide-pink)", color: "#fff", fontFamily: "var(--font-faction-black)", fontSize: 11, border: "none", padding: "7px 12px", transform: "rotate(-3deg)", boxShadow: "2px 3px 0 rgba(0,0,0,0.4)" }}>I'M IN ↗</button>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   THE EPHEMERISTS — The Discordant Map
   One place, three irreconcilable addresses: cartesian, perspective
   and polar grids all claim the sheet and disagree. One word is always
   pulled into the lapis; a self-referential footnote points at itself.
   ════════════════════════════════════════════════════════════════ */
const ROMAN = [["M", 1000], ["CM", 900], ["D", 500], ["CD", 400], ["C", 100], ["XC", 90], ["L", 50], ["XL", 40], ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1]];
function toRoman(n) { let s = ""; for (const [g, v] of ROMAN) { while (n >= v) { s += g; n -= v; } } return s; }
function EphMark({ size = 11, color = "var(--eph-gold-light)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.4" style={{ display: "block" }}>
      <ellipse cx="12" cy="12" rx="11" ry="4.4" transform="rotate(-24 12 12)" />
      <path d="M4 12 C7.5 8.2 16.5 8.2 20 12 C16.5 15.8 7.5 15.8 4 12 Z" />
      <circle cx="12" cy="12" r="2.7" />
      <circle cx="12" cy="12" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}
function Ephemerists({ title, description, level, points, onSignup }) {
  const tw = title.trim().split(" ");
  const tlast = tw.pop();
  return (
    <div style={{
      width: 214, minHeight: 300, position: "relative", overflow: "hidden",
      background: factionCssVar("ephemerists", "card-bg"), color: factionCssVar("ephemerists", "card-text"),
      border: "1.5px solid var(--eph-ink)", fontFamily: "var(--font-faction-codex)", display: "flex", flexDirection: "column",
    }}>
      {/* eyebrow */}
      <div style={{ position: "relative", zIndex: 5, padding: "9px 0 4px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, color: "var(--eph-gold)" }}>
          <EphMark size={11} color="var(--eph-gold)" />
          <span style={{ fontFamily: "var(--font-faction-engraved)", fontWeight: 600, fontSize: 8.5, letterSpacing: "0.24em" }}>THE EPHEMERISTS</span>
        </div>
        <div style={{ fontFamily: "var(--font-faction-codex-script)", fontStyle: "italic", fontSize: 8.5, color: "var(--eph-muted)", marginTop: 1 }}>exhibit C · no single here</div>
      </div>
      {/* the contested field */}
      <div style={{ position: "relative", flex: 1, minHeight: 188, margin: "2px 4px", border: "1px solid var(--eph-gold-deep)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "repeating-linear-gradient(0deg, color-mix(in srgb, var(--eph-vellum-text) 26%, transparent) 0 1px, transparent 1px 16px), repeating-linear-gradient(90deg, color-mix(in srgb, var(--eph-vellum-text) 26%, transparent) 0 1px, transparent 1px 16px)" }} />
        <svg viewBox="0 0 200 188" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.7 }}>
          <g stroke="var(--eph-lapis)" strokeWidth="0.9" fill="none">
            {Array.from({ length: 11 }).map((_, i) => <line key={i} x1={i * 20} y1="188" x2="122" y2="40" />)}
            {[60, 96, 124, 146, 163, 176].map((y, i) => <line key={i} x1="0" y1={y} x2="200" y2={y} />)}
          </g>
        </svg>
        <svg viewBox="0 0 200 188" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.72 }}>
          <g stroke="var(--eph-rubric)" strokeWidth="0.8" fill="none">
            {[16, 34, 54, 76].map((r, i) => <circle key={i} cx="122" cy="88" r={r} />)}
            {Array.from({ length: 12 }).map((_, i) => <line key={i} x1="122" y1="88" x2={122 + 80 * Math.cos(i * Math.PI / 6)} y2={88 + 80 * Math.sin(i * Math.PI / 6)} />)}
          </g>
        </svg>
        <div style={{ position: "absolute", left: "61%", top: "47%", transform: "translate(-50%,-50%)", zIndex: 4 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--eph-gold-light)", boxShadow: "0 0 10px 3px color-mix(in srgb, var(--eph-gold-light) 70%, transparent)" }} />
        </div>
        <div style={{ position: "absolute", top: "8%", left: "6%", fontSize: 7.5, letterSpacing: "0.04em", color: "var(--eph-vellum-text)", background: "color-mix(in srgb, var(--eph-vellum) 82%, transparent)", padding: "1px 4px" }}>x 14 · y <span style={{ textDecoration: "line-through", opacity: 0.65 }}>8</span> <span style={{ color: "var(--eph-lapis)", fontStyle: "italic" }}>9</span></div>
        <div style={{ position: "absolute", top: "78%", left: "54%", fontSize: 7.5, color: "var(--eph-rubric)", background: "color-mix(in srgb, var(--eph-vellum) 82%, transparent)", padding: "1px 4px" }}>r 47 · θ 31°</div>
        <div style={{ position: "absolute", top: "6%", left: "68%", fontSize: 7.5, color: "var(--eph-lapis)", background: "color-mix(in srgb, var(--eph-vellum) 82%, transparent)", padding: "1px 4px" }}>∞ · vanishing</div>
        <div style={{ position: "absolute", left: 2, bottom: 7, transformOrigin: "left bottom", transform: "rotate(-90deg)", whiteSpace: "nowrap", fontSize: 6, color: "var(--eph-muted)", opacity: 0.85 }}>¼″ wider within than without †</div>
      </div>
      {/* legend / title */}
      <div style={{ position: "relative", zIndex: 5, padding: "8px 14px 10px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-faction-engraved)", fontWeight: 700, fontSize: 22, lineHeight: 0.94, color: factionCssVar("ephemerists", "card-text") }}>{tw.join(" ")}{tw.length ? " " : ""}<span style={{ color: "var(--eph-lapis)" }}>{tlast}</span><sup style={{ fontFamily: "var(--font-faction-codex)", fontSize: 9, color: "var(--eph-lapis)", fontWeight: 400 }}>†</sup></div>
        {description && <div style={{ fontSize: 8.5, lineHeight: 1.45, fontStyle: "italic", color: "var(--eph-muted)", margin: "4px 0 6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</div>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 7.5 }}>
          <span style={{ color: factionCssVar("ephemerists", "card-text") }}>▦ grade {toRoman(level)}</span>
          <span style={{ color: "var(--eph-gold-deep)" }}>·</span>
          <span style={{ fontFamily: "var(--font-faction-engraved)", fontWeight: 700, fontSize: 13, color: "var(--eph-rubric)" }}>{points} pvncta</span>
        </div>
        <div style={{ fontSize: 6.5, fontStyle: "italic", color: "var(--eph-muted)", marginTop: 6, lineHeight: 1.35 }}>† the road does not return you to where you began — <span style={{ color: "var(--eph-lapis)" }}>see †</span></div>
      </div>
      {onSignup && (
        <button onClick={onSignup} style={{ fontFamily: "var(--font-faction-codex)", fontSize: 9, letterSpacing: "0.12em", fontStyle: "italic", padding: "7px 10px", border: "none", cursor: "pointer", width: "100%", background: "var(--eph-ink)", color: "var(--eph-parchment)", position: "relative", zIndex: 6 }}>Triangulate the truth ▸</button>
      )}
    </div>
  );
}

/* ── Singularity — Terminal Printout (always dark) ── */
function SprocketHoles() {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "4px 0" }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} style={{ width: 6, height: 4, background: "rgba(10,26,14)", border: "1px solid var(--faction-singularity-card-accent)", borderRadius: 1 }} />
      ))}
    </div>
  );
}
function Singularity({ title, description, level, points, onSignup }) {
  return (
    <div style={{
      minWidth: 128, maxWidth: 156, flex: "0 1 140px", background: "var(--faction-singularity-card-bg)",
      border: "1px solid var(--faction-singularity-border-hard)", position: "relative",
      fontFamily: factionCssVar("singularity", "card-font"), color: "var(--faction-singularity-card-text)", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(74,222,128,0.015) 2px, rgba(74,222,128,0.015) 4px)", pointerEvents: "none", zIndex: 1 }} />
      {[["top", 3, "left", 3, "borderTop", "borderLeft"], ["top", 3, "right", 3, "borderTop", "borderRight"], ["bottom", 3, "left", 3, "borderBottom", "borderLeft"], ["bottom", 3, "right", 3, "borderBottom", "borderRight"]].map((c, i) => (
        <div key={i} style={{ position: "absolute", [c[0]]: c[1], [c[2]]: c[3], width: 10, height: 10, [c[4]]: "1px solid var(--faction-singularity-card-text)", [c[5]]: "1px solid var(--faction-singularity-card-text)" }} />
      ))}
      <SprocketHoles />
      <div style={{ padding: "4px 12px 8px", position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 7, color: "var(--faction-singularity-card-muted)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
          singularity protocol
          <span style={{ display: "inline-block", width: 5, height: 9, background: "var(--faction-singularity-card-text)", marginLeft: 3, verticalAlign: "middle", animation: "wz-blink 1s step-end infinite" }} />
        </div>
        <div style={{ fontSize: "var(--text-sm)", marginBottom: 6, lineHeight: 1.3, overflowWrap: "anywhere" }}>{"> "}{title}</div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--faction-singularity-card-muted)", lineHeight: 1.6, marginBottom: 6 }}>
          <div>PTS: <span style={{ color: "var(--faction-singularity-card-text)", fontSize: "var(--text-md)", fontWeight: 700 }}>{points}</span></div>
          <div>LVL: {level}</div>
        </div>
        {description && <div style={{ fontSize: 7, color: "var(--faction-singularity-card-muted)", lineHeight: 1.4, marginBottom: 6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{description}</div>}
        {onSignup && (
          <button onClick={onSignup} style={{ background: "transparent", color: "var(--faction-singularity-card-text)", border: "1px solid var(--faction-singularity-card-text)", fontFamily: factionCssVar("singularity", "card-font"), fontSize: 7, textTransform: "uppercase", letterSpacing: "0.1em", padding: "2px 8px", cursor: "pointer", marginBottom: 4 }}>{">"} sign up</button>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--faction-singularity-border-hard)", paddingTop: 5 }}>
          <span style={{ border: "1px solid var(--faction-singularity-card-text)", color: "var(--faction-singularity-card-text)", fontSize: 7, padding: "1px 6px", borderRadius: 6, textTransform: "uppercase" }}>lvl {level}</span>
        </div>
      </div>
      <SprocketHoles />
      <style>{`@keyframes wz-blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ALBESCENT — Vellum Correspondence (always light)
   Pure-white cotton card, hairline borders, a centred surveyor's-mark
   sigil, Cormorant Garamond italic title. No hue. The card whispers.
   ════════════════════════════════════════════════════════════════ */
function AlbescentMark({ size = 20, color = "var(--faction-albescent-card-text)" }) {
  const c = size / 2, rO = size * 0.43, rI = size * 0.235, rD = size * 0.044;
  const tS = rI + size * 0.025, tE = tS + size * 0.13;
  const tick = (deg) => { const a = deg * Math.PI / 180; return { x1: c + tS * Math.cos(a), y1: c + tS * Math.sin(a), x2: c + tE * Math.cos(a), y2: c + tE * Math.sin(a) }; };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ display: "block", flexShrink: 0 }}>
      <circle cx={c} cy={c} r={rO} stroke={color} strokeWidth={size * 0.022} opacity={0.18} />
      <circle cx={c} cy={c} r={rI} stroke={color} strokeWidth={size * 0.038} opacity={0.5} />
      {[0, 90, 180, 270].map((deg, i) => { const { x1, y1, x2, y2 } = tick(deg); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={size * 0.038} />; })}
      <circle cx={c} cy={c} r={rD} fill={color} />
    </svg>
  );
}
function Albescent({ title, description, level, points, onSignup }) {
  return (
    <div style={{
      width: 196, flex: "0 0 auto", background: factionCssVar("albescent", "card-bg"),
      border: "1px solid var(--faction-albescent-border)", boxShadow: "var(--al-shadow)",
      padding: "22px 18px 16px", fontFamily: factionCssVar("albescent", "card-font"),
      color: factionCssVar("albescent", "card-text"),
    }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><AlbescentMark size={20} /></div>
      <div style={{ height: 1, background: "var(--al-border-faint)", marginBottom: 12 }} />
      <div style={{ fontFamily: "var(--font-body)", fontSize: 6, letterSpacing: "0.32em", textTransform: "uppercase", color: factionCssVar("albescent", "card-muted"), marginBottom: 9 }}>Albescent</div>
      <div style={{ fontStyle: "italic", fontWeight: 300, fontSize: 18, lineHeight: 1.28, marginBottom: 10, overflowWrap: "anywhere" }}>{title}</div>
      {description && <div style={{ fontFamily: "var(--font-body)", fontSize: 7.5, lineHeight: 1.6, color: factionCssVar("albescent", "card-muted"), marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</div>}
      {onSignup && (
        <button onClick={onSignup} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: factionCssVar("albescent", "card-accent"), borderBottom: "1px solid var(--faction-albescent-border)", paddingBottom: 1, marginBottom: 14, display: "inline-block" }}>acknowledge</button>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--al-border-faint)", paddingTop: 10 }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 6.5, letterSpacing: "0.2em", textTransform: "uppercase", color: factionCssVar("albescent", "card-muted") }}>Lvl {level}</span>
        <span style={{ fontStyle: "italic", fontWeight: 300, fontSize: 16, color: factionCssVar("albescent", "card-accent") }}>{points}<span style={{ fontFamily: "var(--font-body)", fontSize: 6.5, marginLeft: 3, letterSpacing: "0.1em", textTransform: "uppercase" }}>pts</span></span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   THE EVERYMEN — Union / Victory Poster ("Mobilize")
   Sunburst red field, knocked-out Bebas headline, cog sigil seal,
   gold rule, split LVL/PTS footer bar, rubber-stamp enlist CTA.
   ════════════════════════════════════════════════════════════════ */
function CogMark({ size = 22, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
      <g fill={color}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="11" y="0.5" width="2" height="5" rx="0.5" transform={`rotate(${i * 45} 12 12)`} />
        ))}
      </g>
      <circle cx="12" cy="12" r="6.5" fill="none" stroke={color} strokeWidth="2.4" />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  );
}
function Everymen({ title, description, level, points, onSignup }) {
  return (
    <div style={{
      width: 206, background: "var(--everymen-field)", color: "var(--everymen-cream)",
      border: "3px solid var(--everymen-ink)", position: "relative", overflow: "hidden",
      fontFamily: "var(--font-body)",
    }}>
      {/* sunburst + halftone */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.55, zIndex: 0,
        background: "repeating-conic-gradient(from 0deg at 50% 38%, var(--everymen-field-deep) 0deg 7.5deg, transparent 7.5deg 15deg)" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.1, zIndex: 1,
        backgroundImage: "radial-gradient(var(--everymen-cream) 0.6px, transparent 0.7px)", backgroundSize: "4px 4px" }} />
      {/* eyebrow ribbon */}
      <div style={{ position: "relative", zIndex: 2, background: "var(--everymen-ink)", color: "var(--everymen-gold)", textAlign: "center", padding: "5px 0", fontFamily: "var(--font-faction-poster)", fontSize: 12, letterSpacing: "0.3em" }}>THE EVERYMEN</div>
      <div style={{ position: "relative", zIndex: 2, padding: "16px 14px 13px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--everymen-cream)", color: "var(--everymen-red)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 3px var(--everymen-ink)" }}>
            <CogMark size={24} color="var(--everymen-red)" />
          </div>
        </div>
        <div style={{ minHeight: 74, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "var(--font-faction-poster)", fontSize: 34, lineHeight: 1.06, color: "var(--everymen-cream)", textShadow: "1.5px 1.5px 0 var(--everymen-ink)", overflowWrap: "anywhere" }}>{title}</div>
        </div>
        <div style={{ height: 2, background: "var(--everymen-gold)", margin: "11px 22px 10px" }} />
        {description && <div style={{ fontSize: 8, lineHeight: 1.5, color: "var(--everymen-cream)", opacity: 0.92, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}</div>}
      </div>
      {/* footer bar */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "stretch", borderTop: "3px solid var(--everymen-ink)" }}>
        <div style={{ flex: 1, background: "var(--everymen-ink)", color: "var(--everymen-gold)", textAlign: "center", padding: "6px 0", fontFamily: "var(--font-faction-poster)", fontSize: 16 }}>LVL {level}</div>
        <div style={{ flex: 1, background: "var(--everymen-gold)", color: "var(--everymen-ink)", textAlign: "center", padding: "6px 0", fontFamily: "var(--font-faction-poster)", fontSize: 16 }}>{points} PTS</div>
      </div>
      {onSignup && (
        <button onClick={onSignup} style={{ width: "100%", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.14em", padding: "8px 10px", border: "none", background: "var(--everymen-cream)", color: "var(--everymen-ink)", position: "relative", zIndex: 2 }}>Mobilize ▸</button>
      )}
    </div>
  );
}
