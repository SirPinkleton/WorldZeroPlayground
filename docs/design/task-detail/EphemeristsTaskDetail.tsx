import React, { useState } from "react";
import { FactionPraxisCard, FactionCommentBox } from "@world-zero/design-system";
import { TaskDetailProps, PraxisEntry, CommentEntry, markTop, makeAvatar } from "./types";

/* ────────────────────────────────────────────────────────────────
   THE EPHEMERISTS · The Discordant Map (illuminated codex)
   One place, three irreconcilable readings. A vellum exhibit with a
   contested coordinate field, Cinzel title (one word pulled to lapis),
   sealed ephemerides (most canonical wears a fleur-de-lis), and
   marginalia. Reads against the design system's --eph-* tokens.
   ──────────────────────────────────────────────────────────────── */

const DEFAULT_TASK = { title: "Map a Walk That Lies", titleA: "Map a Walk That", titleB: "Lies", no: "C-19", points: 80, grade: "IV" };

const DEFAULT_PRAXIS: PraxisEntry[] = [
  { task: "Map a Walk That Lies", finding: "The Alley Disagrees", author: "Vermilion",
    excerpt: "Three lengths from three methods. The polar reading is the honest one. It cannot be settled.", rating: 5, marks: 19, points: 80, level: 4 },
  { task: "Map a Walk That Lies", finding: "The Stairwell Spiral", author: "The Apostate",
    excerpt: "Counted 41 paces up, sighted 38, felt 50. I submit all three. Reconcile them yourself.", rating: 4, marks: 12, points: 80, level: 4 },
  { task: "Map a Walk That Lies", finding: "Home, By Three Roads", author: "Surveyor Wren",
    excerpt: "The route that felt shortest measured longest. The map has been lying to me for years.", rating: 3, marks: 8, points: 80, level: 4 },
];

const DEFAULT_COMMENTS: CommentEntry[] = [
  { name: "Surveyor Wren", meta: "proposed · 3w", body: "Walked the same alley three ways and got three lengths. @Vermilion insists the polar reading is the honest one. I no longer agree it can be settled.", avatar: makeAvatar("W", "#3a2a18", "#c9a23c") },
  { name: "Vermilion", meta: "2d", body: "It cannot be settled. That is precisely why it is worth canonizing.", avatar: makeAvatar("V", "#3a2a18", "#c9a23c") },
];

const CSS = `
  .ep-page a { color: inherit; text-decoration: none; }
  .ep-link:hover { color: var(--eph-rubric) !important; }
  .ep-body p { font-family:'EB Garamond',serif; font-size:17px; line-height:1.7; color:var(--eph-vellum-text); margin:0 0 16px; }
  .ep-body p:last-child { margin-bottom:0; }
  .ep-body em { color:var(--eph-lapis); font-style:italic; }
  .ep-body a { color:var(--eph-rubric); border-bottom:1px solid color-mix(in srgb, var(--eph-rubric) 40%, transparent); }
`;

const sectionH2: React.CSSProperties = { fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 15, letterSpacing: "0.1em", margin: 0, color: "var(--eph-vellum-text)", whiteSpace: "nowrap" };
const sectionRule: React.CSSProperties = { flex: 1, height: 1, background: "linear-gradient(90deg,var(--eph-gold),transparent)" };

export function EphemeristsTaskDetail({ task, praxis, comments, onSignUp }: TaskDetailProps) {
  const t = { ...DEFAULT_TASK, ...task };
  const entries = markTop(praxis ?? DEFAULT_PRAXIS);
  const thread = comments ?? DEFAULT_COMMENTS;
  const [signed, setSigned] = useState(false);
  const sign = () => { setSigned((s) => !s); onSignUp?.(); };

  return (
    <div className="ep-page" style={{ minHeight: "100vh", fontFamily: "'EB Garamond',serif", color: "var(--eph-vellum-text)", position: "relative", background: "var(--eph-parchment)" }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 30, padding: "16px 40px", background: "color-mix(in srgb, var(--eph-vellum) 90%, transparent)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--eph-gold-deep)" }}>
        <span style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontWeight: 600, fontSize: 25, lineHeight: 1, borderBottom: "3px solid", borderImage: "linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1", paddingBottom: 2 }}>World Zero</span>
        <div style={{ display: "flex", gap: 22, flex: 1 }}>
          {["Tasks", "Exhibit", "Praxes", "Ephemeris"].map((n, i) => (
            <a key={n} className="ep-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: i === 1 ? "var(--eph-vellum-text)" : "var(--eph-muted)", borderBottom: i === 1 ? "2px solid var(--eph-rubric)" : "none", paddingBottom: i === 1 ? 2 : 0, fontFamily: "'Courier Prime',monospace" }}>{n}</a>
          ))}
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid var(--eph-gold)", padding: "4px 12px", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "var(--eph-gold-deep)" }}>◬ INITIATE · GRADE IV</span>
      </nav>

      {/* PAGE */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 920, margin: "0 auto", padding: "26px 40px 90px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--eph-muted)", marginBottom: 22, fontFamily: "'Courier Prime',monospace" }}>
          <a className="ep-link" href="#">Tasks</a><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span>The Ephemerists</span><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span style={{ color: "var(--eph-rubric)" }}>{t.title}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>

          {/* HERO — the discordant exhibit */}
          <div style={{ position: "relative", background: "var(--eph-vellum)", border: "1.5px solid var(--eph-ink)", boxShadow: "0 14px 34px rgba(42,29,18,0.18)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr" }}>
              <div style={{ position: "relative", minHeight: 320, borderRight: "1px solid var(--eph-gold-deep)", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "repeating-linear-gradient(0deg, color-mix(in srgb, var(--eph-vellum-text) 26%, transparent) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, color-mix(in srgb, var(--eph-vellum-text) 26%, transparent) 0 1px, transparent 1px 18px)" }} />
                <svg viewBox="0 0 300 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.7 }}>
                  <g stroke="var(--eph-lapis)" strokeWidth="0.9" fill="none">
                    {[0, 40, 80, 120, 160, 200, 240, 280].map((x) => <line key={x} x1={x} y1="320" x2="185" y2="70" />)}
                    {[110, 160, 210, 250].map((y) => <line key={y} x1="0" y1={y} x2="300" y2={y} />)}
                  </g>
                </svg>
                <svg viewBox="0 0 300 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.72 }}>
                  <g stroke="var(--eph-rubric)" strokeWidth="0.8" fill="none">
                    {[28, 58, 92, 128].map((r) => <circle key={r} cx="185" cy="150" r={r} />)}
                    {Array.from({ length: 8 }).map((_, i) => <line key={i} x1="185" y1="150" x2={185 + 130 * Math.cos((i * Math.PI) / 4)} y2={150 + 130 * Math.sin((i * Math.PI) / 4)} />)}
                  </g>
                </svg>
                <div style={{ position: "absolute", left: "62%", top: "47%", transform: "translate(-50%,-50%)", width: 11, height: 11, borderRadius: "50%", background: "var(--eph-gold-light)", boxShadow: "0 0 14px 4px color-mix(in srgb, var(--eph-gold-light) 70%, transparent)" }} />
                <div style={{ position: "absolute", top: "8%", left: "6%", fontSize: 9, color: "var(--eph-vellum-text)", background: "color-mix(in srgb, var(--eph-vellum) 82%, transparent)", padding: "2px 5px" }}>x 14 · y <span style={{ textDecoration: "line-through", opacity: 0.65 }}>8</span> <span style={{ color: "var(--eph-lapis)", fontStyle: "italic" }}>9</span></div>
                <div style={{ position: "absolute", top: "74%", left: "50%", fontSize: 9, color: "var(--eph-rubric)", background: "color-mix(in srgb, var(--eph-vellum) 82%, transparent)", padding: "2px 5px" }}>r 47 · θ 31°</div>
                <div style={{ position: "absolute", top: "5%", left: "62%", fontSize: 9, color: "var(--eph-lapis)", background: "color-mix(in srgb, var(--eph-vellum) 82%, transparent)", padding: "2px 5px" }}>∞ · vanishing</div>
                <div style={{ position: "absolute", left: 4, bottom: 8, transformOrigin: "left bottom", transform: "rotate(-90deg)", whiteSpace: "nowrap", fontSize: 7.5, color: "var(--eph-muted)", opacity: 0.85 }}>¼″ wider within than without †</div>
              </div>
              <div style={{ padding: "30px 34px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--eph-gold)", marginBottom: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--eph-gold)" strokeWidth="1.4"><ellipse cx="12" cy="12" rx="11" ry="4.4" transform="rotate(-24 12 12)" /><path d="M4 12 C7.5 8.2 16.5 8.2 20 12 C16.5 15.8 7.5 15.8 4 12 Z" /><circle cx="12" cy="12" r="2.7" /></svg>
                  <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 9, letterSpacing: "0.24em" }}>THE EPHEMERISTS</span>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 12, color: "var(--eph-muted)", marginBottom: 16 }}>exhibit C · no single here · commission {t.no}</div>
                <h1 style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 38, lineHeight: 1.04, color: "var(--eph-vellum-text)", margin: "0 0 14px", overflowWrap: "anywhere" }}>{t.titleA} <span style={{ color: "var(--eph-lapis)" }}>{t.titleB}</span><sup style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, color: "var(--eph-lapis)", fontWeight: 400 }}>†</sup></h1>
                <div style={{ height: 1, background: "linear-gradient(90deg,var(--eph-gold),transparent)", marginBottom: 16 }} />
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 12, color: "var(--eph-vellum-text)" }}>▦ GRADE {t.grade}</span>
                  <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 20, color: "var(--eph-rubric)" }}>{t.points} <span style={{ fontSize: 11, letterSpacing: "0.06em" }}>PVNCTA</span></span>
                </div>
                <div style={{ fontSize: 9, fontStyle: "italic", color: "var(--eph-muted)", marginTop: 14, lineHeight: 1.4 }}>† the road does not return you to where you began — <span style={{ color: "var(--eph-lapis)" }}>see †</span></div>
              </div>
            </div>
          </div>

          {/* CTA bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", border: "1px solid var(--eph-ink)", background: "var(--eph-vellum)", padding: "16px 20px" }}>
            <button onClick={sign} style={{ cursor: "pointer", fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 15, letterSpacing: "0.06em", color: "var(--eph-parchment)", background: signed ? "var(--eph-lapis)" : "var(--eph-ink)", border: "none", padding: "13px 26px" }}>
              {signed ? "◬ Enrolled — three readings await" : "Triangulate the truth ▸"}
            </button>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 14, color: "var(--eph-muted)" }}>
              {signed ? "your contradictions are now on record." : "bring no certainty. only instruments."}
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.1em", color: "var(--eph-gold-deep)" }}>41 TRIANGULATED · 23 CANONIZED · 3.7 CREDENCE</div>
          </div>

          {/* THE COMMISSION (user-written body) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <h2 style={sectionH2}>The Commission</h2><span style={sectionRule} />
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 12, color: "var(--eph-muted)" }}>scribed by Surveyor Wren</span>
            </div>
            <div className="ep-body" style={{ border: "1px solid var(--eph-gold-deep)", background: "var(--eph-vellum)", padding: "28px 32px", maxWidth: 660 }}>
              <p>Walk a route you believe you know. Record <em>three readings</em> of the same ground — by pace, by sight-line, and by the feeling in your chest — and submit them side by side.</p>
              <p>Where the three disagree is where the truth actually lives. Do <em>not</em> reconcile them. The contradiction is the exhibit; a tidy map is a lie we have all agreed to tell.</p>
              <p>The concordance will weigh:</p>
              <ul style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, lineHeight: 1.7, color: "var(--eph-vellum-text)", margin: "0 0 16px", paddingLeft: 22 }}>
                <li>The cartesian reading — plain paces, right angles, total trust in the grid.</li>
                <li>The perspective reading — what loomed, what shrank, where it vanished.</li>
                <li>The polar reading — distance and angle from the one place that mattered.</li>
              </ul>
              <p>Bring no certainty. Only instruments. — <a href="#">the surveyor's rubric ↗</a></p>
            </div>
          </section>

          {/* SEALED EPHEMERIDES (completions) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <h2 style={sectionH2}>Sealed Ephemerides</h2><span style={sectionRule} />
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 12, color: "var(--eph-muted)" }}>{entries.length} leaves filed against this exhibit</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px 24px", alignItems: "flex-start" }}>
              {entries.map((p, i) => (
                <div key={i} style={{ position: "relative", paddingTop: 22 }}>
                  {p.top && (
                    <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: "var(--eph-ink)", color: "var(--eph-gold-light)", fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", padding: "4px 12px", boxShadow: "0 3px 8px rgba(42,29,18,0.35)" }}>
                      <span style={{ fontSize: 12, lineHeight: 1, color: "var(--eph-gold-light)" }}>⚜</span> MOST CANONICAL
                    </div>
                  )}
                  <FactionPraxisCard faction="ephemerists" {...p} />
                </div>
              ))}
            </div>
          </section>

          {/* THE MARGINALIA (discussion) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <h2 style={sectionH2}>The Marginalia</h2><span style={sectionRule} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
              {thread.map((c, i) => <FactionCommentBox key={i} faction="ephemerists" {...c} />)}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default EphemeristsTaskDetail;
