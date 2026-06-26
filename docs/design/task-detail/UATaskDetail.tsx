import React, { useState } from "react";
import { FactionPraxisCard, FactionCommentBox } from "@world-zero/design-system";
import { TaskDetailProps, PraxisEntry, CommentEntry, markTop, makeAvatar } from "./types";

/* ────────────────────────────────────────────────────────────────
   UA — University of Asthmatics · Gilt Salon
   A heraldic-crest task page: parchment, a gold museum frame, a
   Playfair-italic title, and "The Salon Wall" of filed praxis (the
   finest hand wears a fleur-de-lis).
   ──────────────────────────────────────────────────────────────── */

const DEFAULT_TASK = { title: "Paint the Quad at Golden Hour", no: "0317", points: 40, level: 3 };

const DEFAULT_PRAXIS: PraxisEntry[] = [
  { task: "Paint the Quad", finding: "The colonnade, 6:51pm", author: "Veridian",
    excerpt: "Charcoal, not oils. The shadows did the work; I just stayed out of their way.", rating: 5, marks: 22, points: 40, level: 3 },
  { task: "Paint the Quad", finding: "Gold on the wet stone", author: "The Understudy",
    excerpt: "It rained at golden hour. I painted the reflection instead. No regrets.", rating: 4, marks: 14, points: 40, level: 3 },
  { task: "Paint the Quad", finding: "Forty minutes, one sitting", author: "Anon. Pupil",
    excerpt: "Phone camera, held very still. Counts as a medium. The Salon decides.", rating: 3, marks: 9, points: 40, level: 3 },
];

const DEFAULT_COMMENTS: CommentEntry[] = [
  { name: "Brushwright Aimé", handle: "aime", meta: "proposed · 3w ago",
    body: "I have walked past this quad for three years. @Veridian convinced me it was worth one honest attempt. Enrol while the light holds.", avatar: makeAvatar("A", "#b07a3a", "#fdf6ea") },
  { name: "Veridian", handle: "veridian", meta: "2d ago",
    body: "Brought charcoal instead of oils. No regrets. The shadows are the whole commission.", avatar: makeAvatar("V", "#8f6a3a", "#fdf6ea") },
];

const CSS = `
  .ua-page a { color: inherit; text-decoration: none; }
  .ua-link:hover { color: #c2541f !important; }
  .ua-body p { font-family:'EB Garamond',serif; font-size:17px; line-height:1.75; color:#5a4326; margin:0 0 16px; }
  .ua-body p:last-child { margin-bottom:0; }
  .ua-body em { color:#3d2410; }
  .ua-body a { color:#c2541f; border-bottom:1px solid rgba(194,84,31,0.4); }
`;

const sectionRule: React.CSSProperties = { flex: 1, height: 1, background: "linear-gradient(90deg,#cdab63,transparent)" };
const sectionH2: React.CSSProperties = { fontFamily: "'Marcellus SC',serif", fontSize: 18, letterSpacing: "0.06em", margin: 0, color: "#3d2410", whiteSpace: "nowrap" };

export function UATaskDetail({ task, praxis, comments, onSignUp }: TaskDetailProps) {
  const t = { ...DEFAULT_TASK, ...task };
  const entries = markTop(praxis ?? DEFAULT_PRAXIS);
  const thread = comments ?? DEFAULT_COMMENTS;
  const [signed, setSigned] = useState(false);
  const sign = () => { setSigned((s) => !s); onSignUp?.(); };

  return (
    <div className="ua-page" style={{ minHeight: "100vh", fontFamily: "'Courier Prime',monospace", color: "#3d2410", position: "relative",
      background: "#ece4d2", backgroundImage: "radial-gradient(70% 50% at 8% 0%, rgba(221,147,34,0.08), transparent 70%), radial-gradient(60% 50% at 100% 6%, rgba(194,84,31,0.07), transparent 70%), radial-gradient(rgba(140,106,30,0.045) 1px, transparent 1px)", backgroundSize: "auto, auto, 6px 6px" }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 30, padding: "16px 40px", background: "rgba(253,246,234,0.82)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e3cb98" }}>
        <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 600, fontSize: 25, lineHeight: 1, borderBottom: "3px solid", borderImage: "linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1", paddingBottom: 2 }}>World Zero</span>
        <div style={{ display: "flex", gap: 22, flex: 1 }}>
          <a className="ua-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#a8895a" }}>Tasks</a>
          <a className="ua-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#3d2410", borderBottom: "2px solid #c2541f", paddingBottom: 2 }}>Detail</a>
          <a className="ua-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#a8895a" }}>Praxis</a>
          <a className="ua-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#a8895a" }}>Salon</a>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid #cdab63", padding: "4px 11px", fontFamily: "'Marcellus SC',serif", fontSize: 10, letterSpacing: "0.14em", color: "#9c6a1a" }}>✦ UA · Matriculated</span>
      </nav>

      {/* PAGE */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 920, margin: "0 auto", padding: "26px 40px 90px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#a8895a", marginBottom: 22 }}>
          <a className="ua-link" href="#">Tasks</a><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span>University of Asthmatics</span><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span style={{ color: "#c2541f" }}>{t.title}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>

          {/* HERO — gilt salon plate */}
          <div style={{ padding: 11, background: "linear-gradient(135deg,#eec06a 0%,#9c6a1a 24%,#f0c878 50%,#9c6a1a 76%,#dd9322 100%)", boxShadow: "0 18px 40px rgba(60,40,10,0.28), inset 0 0 0 1px rgba(255,255,255,0.45)" }}>
            <div style={{ padding: 5, background: "linear-gradient(135deg,#9c6a1a,#eec06a)" }}>
              <div style={{ position: "relative", border: "1px solid rgba(60,40,10,0.45)", background: "#fef7ea", backgroundImage: "radial-gradient(rgba(60,40,10,0.03) 1px,transparent 1px)", backgroundSize: "5px 5px", padding: "34px 38px 30px", display: "flex", gap: 30, alignItems: "center" }}>
                <svg width="150" height="180" viewBox="0 0 100 120" style={{ display: "block", flexShrink: 0 }}>
                  <defs><clipPath id="ua-det-shield"><path d="M8 6 H92 V60 C92 92 66 108 50 116 C34 108 8 92 8 60 Z" /></clipPath></defs>
                  <g clipPath="url(#ua-det-shield)">
                    <rect x="0" y="0" width="100" height="120" fill="#c2541f" />
                    <rect x="0" y="60" width="100" height="60" fill="#f8ead2" />
                    <circle cx="50" cy="60" r="15" fill="#f0b53e" />
                    <g stroke="#f0b53e" strokeWidth="2.4" strokeLinecap="round"><line x1="50" y1="60" x2="50" y2="20" /><line x1="50" y1="60" x2="22" y2="30" /><line x1="50" y1="60" x2="78" y2="30" /><line x1="50" y1="60" x2="14" y2="48" /><line x1="50" y1="60" x2="86" y2="48" /><line x1="50" y1="60" x2="34" y2="22" /><line x1="50" y1="60" x2="66" y2="22" /></g>
                    <g transform="translate(50 84)"><g transform="rotate(38)"><rect x="-2" y="-30" width="4" height="44" rx="1.5" fill="#3d2410" /><rect x="-3" y="10" width="6" height="6" fill="#eab94a" /><path d="M-3 16 L3 16 L1.5 26 L-1.5 26 Z" fill="#c2541f" /></g><g transform="rotate(-38)"><rect x="-2" y="-30" width="4" height="44" rx="1.5" fill="#9c6a1a" /><rect x="-3" y="10" width="6" height="6" fill="#eab94a" /><path d="M-3 16 L3 16 L1.5 26 L-1.5 26 Z" fill="#dd9322" /></g></g>
                  </g>
                  <path d="M8 6 H92 V60 C92 92 66 108 50 116 C34 108 8 92 8 60 Z" fill="none" stroke="#dd9322" strokeWidth="2.5" />
                  <path d="M8 6 H92 V60 C92 92 66 108 50 116 C34 108 8 92 8 60 Z" fill="none" stroke="#3d2410" strokeWidth="0.8" />
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Marcellus SC',serif", fontSize: 11, letterSpacing: "0.16em", color: "#c2541f", marginBottom: 3 }}>University of Asthmatics</div>
                  <div style={{ fontFamily: "'Courier Prime',monospace", fontSize: 8, letterSpacing: "0.3em", color: "#a8895a", marginBottom: 14 }}>COMMISSION №{t.no} · EST · MMXX</div>
                  <h1 style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 700, fontSize: 42, lineHeight: 1.06, color: "#3d2410", margin: "0 0 16px", overflowWrap: "anywhere" }}>{t.title}</h1>
                  <div style={{ position: "relative", width: "fit-content", background: "#c2541f", color: "#fce4c4", fontFamily: "'Marcellus SC',serif", fontSize: 9, letterSpacing: "0.1em", padding: "5px 24px", clipPath: "polygon(0 0,100% 0,96% 50%,100% 100%,0 100%,4% 50%)", marginBottom: 18 }}>Ars Longa · Spiritus Brevis</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "9px 16px", border: "1px solid #cdab63", background: "#fdf6ea" }}>
                      <span style={{ fontFamily: "'Marcellus SC',serif", fontSize: 8, letterSpacing: "0.14em", color: "#a8895a" }}>ANNO</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 700, fontSize: 24, lineHeight: 0.9, color: "#3d2410" }}>{romanLevel(t.level)}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "9px 16px", border: "1px solid #c2541f", background: "#c2541f" }}>
                      <span style={{ fontFamily: "'Marcellus SC',serif", fontSize: 8, letterSpacing: "0.14em", color: "#fce4c4" }}>HONORARIA</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 700, fontSize: 24, lineHeight: 0.9, color: "#fef7ea" }}>{t.points}<span style={{ fontFamily: "'Marcellus SC',serif", fontSize: 9, marginLeft: 4 }}>pts</span></span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "9px 16px", border: "1px solid #cdab63", background: "#fdf6ea" }}>
                      <span style={{ fontFamily: "'Marcellus SC',serif", fontSize: 8, letterSpacing: "0.14em", color: "#a8895a" }}>STANDING</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontWeight: 600, fontSize: 18, lineHeight: 1.2, color: "#8f6a3a" }}>Open Salon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", padding: "16px 20px", border: "1px solid #cdab63", background: "#fdf6ea" }}>
            <button onClick={sign} style={{ cursor: "pointer", fontFamily: "'Marcellus SC',serif", fontSize: 12, letterSpacing: "0.14em", color: "#fef7ea", background: signed ? "#9c6a1a" : "#c2541f", border: "none", padding: "13px 26px", boxShadow: "0 3px 8px rgba(194,84,31,0.3)" }}>
              {signed ? "✦ Enrolled — see you at the Salon" : "Matriculate ▸"}
            </button>
            <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 14, color: "#8f6a3a" }}>
              {signed ? "Your easel is reserved." : "Open to all standing. No portfolio required."}
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "'Marcellus SC',serif", fontSize: 9, letterSpacing: "0.12em", color: "#a8895a" }}>52 attempted · 31 exhibited · 4.1 avg critique</div>
          </div>

          {/* THE COMMISSION (user-written body) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <h2 style={sectionH2}>The Commission</h2>
              <span style={sectionRule} />
              <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 8, letterSpacing: "0.12em", color: "#a8895a" }}>posted by Brushwright Aimé</span>
            </div>
            <div className="ua-body" style={{ border: "1px solid #cdab63", background: "#fdf6ea", padding: "28px 32px", maxWidth: 660 }}>
              <p>Capture the light before it leaves. <em>Any medium, any madness</em> — oils, charcoal, a phone camera held very still. The quad has been painted ten thousand times; I ask only that yours be unmistakably the eleven-thousand-and-first.</p>
              <p>Go an hour before sunset, when the gold first lands on the western colonnade. Commit to one medium and render the whole thing in a single sitting — golden hour does not grant extensions. When it's done, title it, sign it, and pin it to the Salon wall below.</p>
              <p>A few things the Salon tends to reward:</p>
              <ul style={{ fontFamily: "'EB Garamond',serif", fontSize: 16, lineHeight: 1.7, color: "#5a4326", margin: "0 0 16px", paddingLeft: 22 }}>
                <li>Conviction over hedging — one bold choice beats three timid ones.</li>
                <li>The shadows, not just the light. Most people forget the shadows.</li>
                <li>Evidence you were actually <em>there</em> at the hour, not working from memory.</li>
              </ul>
              <p>Submit the work, not the excuse. — <a href="#">read the full rubric ↗</a></p>
            </div>
          </section>

          {/* THE SALON WALL (praxis completions) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <h2 style={sectionH2}>The Salon Wall</h2>
              <span style={sectionRule} />
              <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 8, letterSpacing: "0.12em", color: "#a8895a" }}>{entries.length} works filed against this commission</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px 22px", alignItems: "flex-start" }}>
              {entries.map((p, i) => (
                <div key={i} style={{ position: "relative", paddingTop: 20 }}>
                  {p.top && (
                    <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: "#c2541f", color: "#fef7ea", fontFamily: "'Marcellus SC',serif", fontSize: 8.5, letterSpacing: "0.12em", padding: "4px 12px", boxShadow: "0 3px 8px rgba(60,40,10,0.3)" }}>
                      <span style={{ fontSize: 13, lineHeight: 1 }}>⚜</span> FINEST HAND
                    </div>
                  )}
                  <FactionPraxisCard faction="ua" {...p} />
                </div>
              ))}
            </div>
          </section>

          {/* THE CRITIQUE (discussion) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <h2 style={sectionH2}>The Critique</h2>
              <span style={sectionRule} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 680 }}>
              {thread.map((c, i) => (
                <FactionCommentBox key={i} faction="ua" {...c} />
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function romanLevel(n: number): string {
  return ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][Math.max(0, Math.min(9, n - 1))] ?? String(n);
}

export default UATaskDetail;
