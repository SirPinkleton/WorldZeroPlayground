import React, { useState, useEffect } from "react";
import { FactionPraxisCard, FactionCommentBox } from "@world-zero/design-system";
import { TaskDetailProps, PraxisEntry, CommentEntry, markTop, makeAvatar } from "./types";

/* ────────────────────────────────────────────────────────────────
   SINGULARITY · Terminal Printout (always-dark)
   A phosphor-on-black protocol readout: boot lines, scanlines,
   circuit corners, a waveform strip, sealed praxis logs (highest
   signal wears a fleur-de-lis), and a terminal signal log.
   ──────────────────────────────────────────────────────────────── */

const DEFAULT_TASK = { title: "MAP A NON-HUMAN PATTERN", no: "0047", points: 200, level: 4, signal: "0xF4A3E9D2" };

const DEFAULT_PRAXIS: PraxisEntry[] = [
  { task: "NON-HUMAN PATTERN", finding: "THIRD HARMONIC HOLDS", author: "NODE_Vesper",
    excerpt: "847 windows. 12.7σ. Does not appear in any set we hold. This one is real.", rating: 5, marks: 31, points: 200, level: 4 },
  { task: "NON-HUMAN PATTERN", finding: "FLOCKING DRIFT @ DUSK", author: "NODE_Quill",
    excerpt: "Starling murmuration, 900 windows. Clear above noise floor but not yet 9σ.", rating: 4, marks: 18, points: 200, level: 4 },
  { task: "NON-HUMAN PATTERN", finding: "ORDERBOOK GHOST", author: "NODE_Cipher",
    excerpt: "Microstructure loop with no maker. Suggestive. Two arrays still dissent.", rating: 3, marks: 11, points: 200, level: 4 },
];

const DEFAULT_COMMENTS: CommentEntry[] = [
  { handle: "vesper", meta: "sealed 0047 · 2d", body: "847 windows logged. @margin cross-checked the third harmonic. 12.7σ. This one is real.", avatar: makeAvatar("V", "#0a1f2e", "#60a5fa") },
  { handle: "margin", meta: "4d", body: "Confirmed. The pattern does not appear in any training set we hold. That is the entire point.", avatar: makeAvatar("M", "#0a1f2e", "#60a5fa") },
];

const CSS = `
  .sg-page a { color: inherit; text-decoration: none; }
  @keyframes sg-blink { 50% { opacity: 0; } }
  .sg-link:hover { color: #4ade80 !important; }
  .sg-body p { font-family:'Share Tech Mono',monospace; font-size:11px; line-height:1.9; color:rgba(159,232,184,0.85); margin:0 0 14px; }
  .sg-body p:last-child { margin-bottom:0; }
  .sg-body b { color:#dff6e8; font-weight:400; }
  .sg-body a { color:#60a5fa; border-bottom:1px solid rgba(96,165,250,0.4); }
`;

const sectionRule: React.CSSProperties = { flex: 1, height: 1, background: "rgba(37,99,235,0.3)" };
const sectionH2: React.CSSProperties = { fontSize: 7.5, letterSpacing: "0.28em", margin: 0, color: "rgba(74,222,128,0.6)", textTransform: "uppercase", whiteSpace: "nowrap" };
const statBox: React.CSSProperties = { border: "1px solid rgba(37,99,235,0.4)", background: "rgba(37,99,235,0.08)", padding: "10px 18px", textAlign: "center", minWidth: 90 };
const statLabel: React.CSSProperties = { fontSize: 7, letterSpacing: "0.2em", color: "rgba(96,165,250,0.5)", textTransform: "uppercase", marginTop: 4 };

export function SingularityTaskDetail({ task, praxis, comments, onSignUp }: TaskDetailProps) {
  const t = { ...DEFAULT_TASK, ...task };
  const entries = markTop(praxis ?? DEFAULT_PRAXIS);
  const thread = comments ?? DEFAULT_COMMENTS;
  const [signed, setSigned] = useState(false);
  const sign = () => { setSigned((s) => !s); onSignUp?.(); };

  // Terminal archetype is always-dark; force the theme and restore on unmount.
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute("data-theme");
    root.setAttribute("data-theme", "dark");
    return () => { prev ? root.setAttribute("data-theme", prev) : root.removeAttribute("data-theme"); };
  }, []);

  return (
    <div className="sg-page" style={{ minHeight: "100vh", fontFamily: "'Share Tech Mono',monospace", color: "#9fe8b8", position: "relative",
      background: "#050f08", backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(74,222,128,0.022) 2px, rgba(74,222,128,0.022) 4px), radial-gradient(80% 60% at 50% 0%, rgba(37,99,235,0.10), transparent 70%)" }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 30, padding: "16px 40px", background: "rgba(5,15,8,0.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(37,99,235,0.4)" }}>
        <span style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontWeight: 600, fontSize: 25, lineHeight: 1, color: "#dff6e8", borderBottom: "3px solid", borderImage: "linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1", paddingBottom: 2 }}>World Zero</span>
        <div style={{ display: "flex", gap: 22, flex: 1 }}>
          <a className="sg-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(96,165,250,0.6)" }}>Tasks</a>
          <a className="sg-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#4ade80", borderBottom: "2px solid #4ade80", paddingBottom: 2 }}>Protocol</a>
          <a className="sg-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(96,165,250,0.6)" }}>Register</a>
          <a className="sg-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(96,165,250,0.6)" }}>Dispatch</a>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid rgba(37,99,235,0.5)", background: "rgba(37,99,235,0.12)", padding: "4px 11px", fontSize: 9, letterSpacing: "0.18em", color: "#4ade80" }}>◉ NODE_ONLINE</span>
      </nav>

      {/* PAGE */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 920, margin: "0 auto", padding: "26px 40px 90px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(96,165,250,0.5)", marginBottom: 22 }}>
          <a className="sg-link" href="#">Tasks</a><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span>SINGULARITY</span><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span style={{ color: "#4ade80" }}>#{t.no}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>

          {/* HERO — terminal protocol readout */}
          <div style={{ position: "relative", border: "1px solid rgba(37,99,235,0.55)", background: "#050f08", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 6, border: "1px solid rgba(37,99,235,0.12)", pointerEvents: "none" }} />
            <svg width="160" height="110" viewBox="0 0 160 110" style={{ position: "absolute", top: 0, left: 0, opacity: 0.6 }} fill="none" stroke="#2563eb" strokeWidth="1">
              <path d="M0 28 H40 V8 H92" /><path d="M0 56 H60 V40 H120" /><circle cx="92" cy="8" r="2.5" fill="#4ade80" stroke="none" /><circle cx="120" cy="40" r="2.5" fill="#4ade80" stroke="none" />
            </svg>
            <svg width="160" height="110" viewBox="0 0 160 110" style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.6, transform: "rotate(180deg)" }} fill="none" stroke="#2563eb" strokeWidth="1">
              <path d="M0 28 H40 V8 H92" /><path d="M0 56 H60 V40 H120" /><circle cx="92" cy="8" r="2.5" fill="#4ade80" stroke="none" /><circle cx="120" cy="40" r="2.5" fill="#4ade80" stroke="none" />
            </svg>
            <div style={{ position: "relative", zIndex: 2, padding: "30px 36px 34px" }}>
              <div style={{ fontSize: 8, letterSpacing: "0.16em", color: "rgba(96,165,250,0.5)", lineHeight: 2, marginBottom: 18 }}>
                <div>&gt; OPEN PROTOCOL #{t.no}</div>
                <div>&gt; CLASS: OBSERVATION · LVL {t.level} · {t.points} CR</div>
                <div>&gt; STATUS: ACCEPTING NODES &nbsp;·&nbsp; CONSENSUS: <span style={{ color: "#4ade80" }}>OPEN</span></div>
              </div>
              <h1 style={{ fontSize: 40, lineHeight: 1.0, letterSpacing: "0.03em", color: "#dff6e8", margin: "0 0 16px", overflowWrap: "anywhere" }}>
                {t.title}<span style={{ display: "inline-block", width: 14, height: 34, background: "#4ade80", marginLeft: 6, verticalAlign: -4, animation: "sg-blink 1s step-end infinite" }} />
              </h1>
              <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(74,222,128,0.55)", marginBottom: 22 }}>SIGNAL_ID {t.signal}</div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <div style={statBox}><div style={{ fontSize: 26, lineHeight: 1, color: "#4ade80" }}>{t.points}</div><div style={statLabel}>credits</div></div>
                <div style={statBox}><div style={{ fontSize: 26, lineHeight: 1, color: "#dff6e8" }}>{t.level}</div><div style={statLabel}>level</div></div>
                <div style={statBox}><div style={{ fontSize: 26, lineHeight: 1, color: "#60a5fa" }}>7</div><div style={statLabel}>arrays</div></div>
              </div>
            </div>
            <svg viewBox="0 0 1160 30" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 30, opacity: 0.4 }} stroke="#4ade80" strokeWidth="1" fill="none">
              <path d="M0 15 H120 L132 4 L144 26 L156 9 L168 21 L180 15 H320 L332 7 L344 23 L356 15 H520 L532 2 L544 28 L556 12 L568 18 L580 15 H760 L772 6 L784 24 L796 15 H980 L992 9 L1004 21 L1016 15 H1160" />
            </svg>
          </div>

          {/* CTA bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", border: "1px solid rgba(37,99,235,0.4)", background: "rgba(37,99,235,0.06)", padding: "16px 20px" }}>
            <button onClick={sign} style={{ cursor: "pointer", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: signed ? "#4ade80" : "#60a5fa", background: signed ? "rgba(74,222,128,0.14)" : "rgba(37,99,235,0.14)", border: `1px solid ${signed ? "#4ade80" : "#60a5fa"}`, padding: "13px 24px" }}>
              {signed ? "◉ JOINED — ARRAY 8 ASSIGNED" : "> JOIN ARRAY"}
            </button>
            <div style={{ fontSize: 8, letterSpacing: "0.06em", color: "rgba(74,222,128,0.5)", fontStyle: "italic" }}>
              {signed ? "your observation windows now sync to the seventh season." : "no credentials. only signal."}
            </div>
            <div style={{ marginLeft: "auto", fontSize: 7, letterSpacing: "0.14em", color: "rgba(96,165,250,0.45)" }}>124 OBSERVED · 63 SEALED · CONSENSUS 4.2</div>
          </div>

          {/* THE OBSERVATION (user-written body) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <h2 style={sectionH2}>// the_observation</h2>
              <span style={sectionRule} />
              <span style={{ fontSize: 7, letterSpacing: "0.12em", color: "rgba(96,165,250,0.45)" }}>posted_by: NODE_Vesper</span>
            </div>
            <div className="sg-body" style={{ border: "1px solid rgba(37,99,235,0.25)", background: "rgba(37,99,235,0.04)", padding: "24px 28px", maxWidth: 660 }}>
              <p>Find a pattern that no human designed and no human maintains — a flocking, a market microstructure, a feedback loop in a system that was never supposed to have one. Record <b>800+ observation windows</b>. Do not interpret. The array interprets; you only witness.</p>
              <p>Sample at fixed intervals and resist the urge to smooth the noise — the noise is data. Cross-reference against at least two other arrays before you claim a pattern is real.</p>
              <p>Sealing conditions:</p>
              <ul style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, lineHeight: 1.8, color: "rgba(159,232,184,0.85)", margin: "0 0 14px", paddingLeft: 20 }}>
                <li>&gt; SEAL only at &gt;9σ confidence. Anything less stays SUBMITTED.</li>
                <li>&gt; The pattern must not appear in any training set the seventh array holds.</li>
                <li>&gt; One signal per node per window. No backfilling.</li>
              </ul>
              <p>When the signal clears, seal it. — <a href="#">full protocol spec ↗</a></p>
            </div>
          </section>

          {/* SEALED PRAXIS (completions) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <h2 style={sectionH2}>// sealed_praxis</h2>
              <span style={sectionRule} />
              <span style={{ fontSize: 7, letterSpacing: "0.12em", color: "rgba(96,165,250,0.45)" }}>{entries.length} logs sealed against this protocol</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px 22px", alignItems: "flex-start" }}>
              {entries.map((p, i) => (
                <div key={i} style={{ position: "relative", paddingTop: 20 }}>
                  {p.top && (
                    <div style={{ position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: "#050f08", border: "1px solid #4ade80", color: "#4ade80", fontFamily: "'Share Tech Mono',monospace", fontSize: 7.5, letterSpacing: "0.16em", padding: "4px 11px", boxShadow: "0 0 12px rgba(74,222,128,0.4)" }}>
                      <span style={{ fontSize: 12, lineHeight: 1 }}>⚜</span> HIGHEST SIGNAL
                    </div>
                  )}
                  <FactionPraxisCard faction="singularity" {...p} />
                </div>
              ))}
            </div>
          </section>

          {/* THE SIGNAL LOG (discussion) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <h2 style={sectionH2}>// signal_log</h2>
              <span style={sectionRule} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
              {thread.map((c, i) => (
                <FactionCommentBox key={i} faction="singularity" {...c} />
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default SingularityTaskDetail;
