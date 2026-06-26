import React, { useState } from "react";
import { FactionPraxisCard, FactionCommentBox } from "@world-zero/design-system";
import { TaskDetailProps, PraxisEntry, CommentEntry, markTop } from "./types";

/* ────────────────────────────────────────────────────────────────
   THE EVERYMEN · Union / Victory Poster
   A billboard-scale union poster: sunburst red field, knockout Bebas
   headline, cog seal, a work-order body, filed work reports (best in
   hall wears a fleur-de-lis), and a red union discussion bar.
   ──────────────────────────────────────────────────────────────── */

const DEFAULT_TASK = { title: "BREAK NEW GROUND", no: "0427", points: 25, level: 3 };

const DEFAULT_PRAXIS: PraxisEntry[] = [
  { task: "BREAK NEW GROUND", finding: "THE VERGE ON 8TH", author: "Rivet",
    excerpt: "Cleared 40ft of dead lot, put in beans and chard. Sign's up. Two neighbors already weeding.", rating: 5, marks: 28, points: 25, level: 3 },
  { task: "BREAK NEW GROUND", finding: "ALLEY ORCHARD", author: "Day Shift",
    excerpt: "Three dwarf apples behind the laundromat. Won't fruit till next year but it's theirs now.", rating: 4, marks: 16, points: 25, level: 3 },
  { task: "BREAK NEW GROUND", finding: "THE MEDIAN STRIP", author: "Salt of the Earth",
    excerpt: "Pollinator mix on a traffic median. City hasn't noticed. The bees have.", rating: 4, marks: 12, points: 25, level: 3 },
];

const grad = (a: string[]) => `radial-gradient(circle at 32% 28%, ${a[0]}, ${a[1]} 72%, ${a[2]})`;
const avatar = (a: string[]) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><defs><radialGradient id="g" cx="32%" cy="28%"><stop offset="0" stop-color="${a[0]}"/><stop offset="0.72" stop-color="${a[1]}"/><stop offset="1" stop-color="${a[2]}"/></radialGradient></defs><rect width="80" height="80" fill="url(#g)"/></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
};

const DEFAULT_COMMENTS: CommentEntry[] = [
  { name: "Foreman Okafor", meta: "proposed · 3w ago", body: "Walked past this lot for years. @Rivet finally said the obvious thing: nobody's coming to fix it but us. Report for duty.", avatar: avatar(["#9fb07a", "#5b6238", "#353b22"]) },
  { name: "Rivet", meta: "2d ago", body: "Cleared the north end already. Bring gloves and something that bears fruit. No ornamentals.", avatar: avatar(["#e8a23a", "#b4521f", "#7a2f12"]) },
];

const CSS = `
  .em-page a { color: inherit; text-decoration: none; }
  .em-link:hover { color: #c1272d !important; }
  .em-body p { font-family:'Courier Prime',monospace; font-size:13px; line-height:1.75; color:#221a12; margin:0 0 14px; }
  .em-body p:last-child { margin-bottom:0; }
  .em-body strong { color:#c1272d; }
  .em-body a { color:#c1272d; border-bottom:1px solid rgba(193,39,45,0.4); }
`;

const sectionRule: React.CSSProperties = { flex: 1, height: 3, background: "repeating-linear-gradient(90deg, #c1272d 0 16px, #e0b945 16px 26px)" };
const sectionH2: React.CSSProperties = { fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: "0.04em", margin: 0, color: "#221a12", whiteSpace: "nowrap" };

export function EverymenTaskDetail({ task, praxis, comments, onSignUp }: TaskDetailProps) {
  const t = { ...DEFAULT_TASK, ...task };
  const entries = markTop(praxis ?? DEFAULT_PRAXIS);
  const thread = comments ?? DEFAULT_COMMENTS;
  const [signed, setSigned] = useState(false);
  const sign = () => { setSigned((s) => !s); onSignUp?.(); };

  return (
    <div className="em-page" style={{ minHeight: "100vh", fontFamily: "'Courier Prime',monospace", color: "#221a12", position: "relative", background: "var(--everymen-paper)" }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 30, padding: "16px 40px", background: "rgba(245,237,221,0.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(34,26,18,0.12)" }}>
        <span style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontWeight: 600, fontSize: 25, lineHeight: 1, borderBottom: "3px solid", borderImage: "linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1", paddingBottom: 2 }}>World Zero</span>
        <div style={{ display: "flex", gap: 22, flex: 1 }}>
          <a className="em-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#6c5a40" }}>Tasks</a>
          <a className="em-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#221a12", borderBottom: "2px solid #c1272d", paddingBottom: 2 }}>Work Order</a>
          <a className="em-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#6c5a40" }}>Hall</a>
          <a className="em-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#6c5a40" }}>Dispatch</a>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid #c1272d", background: "#c1272d", color: "#f4ecd6", padding: "5px 12px", fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: "0.14em" }}>CARD-CARRYING</span>
      </nav>

      {/* PAGE */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 920, margin: "0 auto", padding: "26px 40px 90px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6c5a40", marginBottom: 22 }}>
          <a className="em-link" href="#">Tasks</a><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span>The Everymen</span><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span style={{ color: "#c1272d" }}>{t.title}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>

          {/* HERO — union billboard */}
          <div style={{ position: "relative", overflow: "hidden", border: "3px solid #221a12", background: "#c1272d", color: "#f4ecd6" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5, background: "repeating-conic-gradient(from 0deg at 24% 34%, #8d1c20 0deg 7deg, transparent 7deg 14deg)" }} />
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.1, backgroundImage: "radial-gradient(#f4ecd6 0.6px, transparent 0.7px)", backgroundSize: "5px 5px" }} />
            <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#221a12", padding: "9px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#e0b945" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <g fill="#e0b945">{[0, 45, 90, 135, 180, 225, 270, 315].map((d) => <rect key={d} x="11" y="0.5" width="2" height="5" rx="0.5" transform={`rotate(${d} 12 12)`} />)}</g>
                  <circle cx="12" cy="12" r="6.5" fill="none" stroke="#e0b945" strokeWidth="2.4" /><circle cx="12" cy="12" r="2" fill="#e0b945" />
                </svg>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, letterSpacing: "0.2em" }}>THE EVERYMEN</span>
              </div>
              <span style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f4ecd6", border: "1.5px solid #e0b945", padding: "3px 10px" }}>Open · accepting hands</span>
            </div>
            <div style={{ height: 4, background: "#e0b945", position: "relative", zIndex: 2 }} />
            <div style={{ position: "relative", zIndex: 2, padding: "30px 34px 32px" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, lineHeight: 0.9, letterSpacing: "0.01em", color: "#f4ecd6", textShadow: "3px 3px 0 #221a12", maxWidth: 660, overflowWrap: "anywhere" }}>{t.title}</div>
              <div style={{ height: 3, background: "#e0b945", width: 120, margin: "20px 0 18px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ background: "#221a12", color: "#f4ecd6", fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: "0.06em", padding: "6px 16px" }}>LVL {t.level}</span>
                <span style={{ background: "#e0b945", color: "#221a12", fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: "0.06em", padding: "6px 16px" }}>{t.points} PTS</span>
                <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 11, letterSpacing: "0.06em", color: "#f4ecd6" }}>4 of 12 hands on the job</span>
              </div>
            </div>
          </div>

          {/* CTA bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", border: "1.5px solid #221a12", background: "#fff", padding: "16px 20px" }}>
            <button onClick={sign} style={{ cursor: "pointer", fontFamily: "'Courier Prime',monospace", fontSize: 13, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "14px 26px", border: "none", background: signed ? "#5b6238" : "#c1272d", color: "#f4ecd6" }}>
              {signed ? "✓ Reported for duty" : "Report for duty ▸"}
            </button>
            <div style={{ fontSize: 11, color: "#6c5a40" }}>Proposed by Foreman Okafor · Apr 12, 2026</div>
            <div style={{ marginLeft: "auto", fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: "0.06em", color: "#c1272d" }}>96 reported · 71 delivered · 4.4 avg</div>
          </div>

          {/* THE ORDER (user-written body) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <h2 style={sectionH2}>The Order</h2>
              <span style={sectionRule} />
            </div>
            <div className="em-body" style={{ border: "1.5px solid #221a12", background: "#fff", padding: "26px 30px", maxWidth: 660 }}>
              <p>Find a neglected patch of public land — a verge, a lot, a forgotten strip nobody tends. Clear it, plant something that <strong>actually feeds people</strong>, and post a sign so whoever comes next knows it's theirs to keep going.</p>
              <p>This isn't a garden show. The work outlasts the worker — that's the whole idea. Bring gloves, bring something that bears fruit, and leave the ornamentals at home.</p>
              <p>What gets a report marked delivered:</p>
              <ul style={{ fontFamily: "'Courier Prime',monospace", fontSize: 13, lineHeight: 1.7, color: "#221a12", margin: "0 0 14px", paddingLeft: 22 }}>
                <li>The ground was public and genuinely neglected — not someone's yard.</li>
                <li>What you planted feeds people or pollinators, not just the eye.</li>
                <li>You left a sign so the next hands know to keep it going.</li>
              </ul>
              <p>Report for duty below. — <a href="#">read the charter ↗</a></p>
            </div>
          </section>

          {/* WORK REPORTS (completions) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <h2 style={sectionH2}>Work Reports Filed</h2>
              <span style={sectionRule} />
              <span style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6c5a40" }}>{entries.length} delivered</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px 24px", alignItems: "flex-start" }}>
              {entries.map((p, i) => (
                <div key={i} style={{ position: "relative", paddingTop: 20 }}>
                  {p.top && (
                    <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: "#e0b945", color: "#221a12", fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: "0.1em", padding: "3px 13px", boxShadow: "0 3px 8px rgba(34,26,18,0.3)" }}>
                      <span style={{ fontSize: 13, lineHeight: 1 }}>⚜</span> BEST IN HALL
                    </div>
                  )}
                  <FactionPraxisCard faction="everymen" {...p} />
                </div>
              ))}
            </div>
          </section>

          {/* THE HALL SPEAKS (discussion) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <h2 style={sectionH2}>The Hall Speaks</h2>
              <span style={sectionRule} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
              {thread.map((c, i) => <FactionCommentBox key={i} faction="everymen" {...c} />)}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default EverymenTaskDetail;
