import React, { useState } from "react";
import { FactionPraxisCard, FactionCommentBox } from "@world-zero/design-system";
import { TaskDetailProps, PraxisEntry, CommentEntry, markTop, makeAvatar } from "./types";

/* ────────────────────────────────────────────────────────────────
   ALBESCENT · Vellum Correspondence (always-light, no hue)
   A quiet white letter: a surveyor's-mark sigil, Cormorant italic
   title, hairline rules, the register of inscribed accounts (most
   witnessed wears a fleur-de-lis), and a soft marginal discussion.
   ──────────────────────────────────────────────────────────────── */

const DEFAULT_TASK = { title: "Notice What No One Else Did", no: "0089", points: 35, level: 3 };

const DEFAULT_PRAXIS: PraxisEntry[] = [
  { task: "Notice What No One Did", finding: "The parking meter", author: "The Archivist",
    excerpt: "A man refilled a stranger's meter and walked on without looking back. I was the only one who saw.", rating: 5, marks: 26, points: 35, level: 3 },
  { task: "Notice What No One Did", finding: "The mended fence", author: "M.",
    excerpt: "Someone repaired the gap in the school fence overnight. No note, no name. Children pass through it daily.", rating: 4, marks: 14, points: 35, level: 3 },
  { task: "Notice What No One Did", finding: "The held elevator", author: "A Witness",
    excerpt: "She held the door for a man still three floors away, by the stairs. He never knew she waited.", rating: 4, marks: 11, points: 35, level: 3 },
];

const DEFAULT_COMMENTS: CommentEntry[] = [
  { name: "The Archivist", meta: "proposed · 3w ago", body: "I watched a man refill a stranger's parking meter and walk on without looking back. @Quietly is right — some things are diminished by being told.", avatar: makeAvatar("A", "#e8e6e1", "#1c1c1a") },
  { name: "Quietly", meta: "2d ago", body: "And yet here we are, telling. Gently. Only to each other.", avatar: makeAvatar("Q", "#e8e6e1", "#1c1c1a") },
];

const CSS = `
  .al-page a { color: inherit; text-decoration: none; }
  .al-link:hover { color: #1c1c1a !important; }
  .al-body p { font-family:'Cormorant Garamond',serif; font-size:20px; line-height:1.62; color:#2a2a27; margin:0 0 16px; }
  .al-body p:last-child { margin-bottom:0; }
  .al-body em { font-style:italic; color:#1c1c1a; }
  .al-body a { color:#1c1c1a; border-bottom:1px solid rgba(28,28,26,0.4); }
`;

const card: React.CSSProperties = { background: "#fdfdfc", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" };
const sectionH2: React.CSSProperties = { fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontWeight: 600, fontSize: 22, margin: 0, color: "#1c1c1a", whiteSpace: "nowrap" };
const sectionRule: React.CSSProperties = { flex: 1, height: 1, background: "rgba(0,0,0,0.08)" };
const heroStat = (label: string, value: string) => (
  <div>
    <div style={{ fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(28,28,26,0.4)", marginBottom: 6 }}>{label}</div>
    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 22, color: "#1c1c1a" }}>{value}</div>
  </div>
);

export function AlbescentTaskDetail({ task, praxis, comments, onSignUp }: TaskDetailProps) {
  const t = { ...DEFAULT_TASK, ...task };
  const entries = markTop(praxis ?? DEFAULT_PRAXIS);
  const thread = comments ?? DEFAULT_COMMENTS;
  const [signed, setSigned] = useState(false);
  const sign = () => { setSigned((s) => !s); onSignUp?.(); };

  return (
    <div className="al-page" style={{ minHeight: "100vh", fontFamily: "'Courier Prime',monospace", color: "#1c1c1a", position: "relative", background: "#f4f3f0" }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 30, padding: "16px 40px", background: "rgba(244,243,240,0.88)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <span style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontWeight: 600, fontSize: 25, lineHeight: 1, borderBottom: "3px solid", borderImage: "linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1", paddingBottom: 2 }}>World Zero</span>
        <div style={{ display: "flex", gap: 22, flex: 1 }}>
          {["Tasks", "Correspondence", "Praxes", "Register"].map((n, i) => (
            <a key={n} className="al-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: i === 1 ? "#1c1c1a" : "rgba(28,28,26,0.45)", borderBottom: i === 1 ? "2px solid #1c1c1a" : "none", paddingBottom: i === 1 ? 2 : 0 }}>{n}</a>
          ))}
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 14, letterSpacing: "0.04em", color: "rgba(28,28,26,0.6)" }}>— admitted, in confidence</span>
      </nav>

      {/* PAGE */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 880, margin: "0 auto", padding: "26px 40px 96px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(28,28,26,0.4)", marginBottom: 24 }}>
          <a className="al-link" href="#">Tasks</a><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span>Albescent</span><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span style={{ color: "#1c1c1a" }}>{t.title}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>

          {/* HERO — the letter */}
          <div style={{ ...card, boxShadow: "0 2px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)", padding: "54px 60px 48px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="19" stroke="#1c1c1a" strokeWidth="1" opacity="0.18" />
                <circle cx="22" cy="22" r="10.3" stroke="#1c1c1a" strokeWidth="1.7" opacity="0.5" />
                <line x1="32.3" y1="22" x2="38" y2="22" stroke="#1c1c1a" strokeWidth="1.7" /><line x1="6" y1="22" x2="11.7" y2="22" stroke="#1c1c1a" strokeWidth="1.7" />
                <line x1="22" y1="32.3" x2="22" y2="38" stroke="#1c1c1a" strokeWidth="1.7" /><line x1="22" y1="6" x2="22" y2="11.7" stroke="#1c1c1a" strokeWidth="1.7" />
                <circle cx="22" cy="22" r="1.9" fill="#1c1c1a" />
              </svg>
            </div>
            <div style={{ fontSize: 9, letterSpacing: "0.34em", textTransform: "uppercase", color: "rgba(28,28,26,0.45)", marginBottom: 6 }}>Albescent</div>
            <div style={{ fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(28,28,26,0.3)", marginBottom: 26 }}>Correspondence №{t.no} · in confidence</div>
            <div style={{ width: 54, height: 1, background: "rgba(0,0,0,0.12)", margin: "0 auto 26px" }} />
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontWeight: 500, fontSize: 46, lineHeight: 1.16, color: "#1c1c1a", margin: "0 auto 22px", maxWidth: 560, overflowWrap: "anywhere" }}>{t.title}</h1>
            <div style={{ width: 54, height: 1, background: "rgba(0,0,0,0.12)", margin: "0 auto 28px" }} />
            <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
              {heroStat("Standing", `Lvl ${t.level}`)}
              <div style={{ borderLeft: "1px solid rgba(0,0,0,0.1)" }} />
              {heroStat("Worth", `${t.points} pts`)}
              <div style={{ borderLeft: "1px solid rgba(0,0,0,0.1)" }} />
              {heroStat("Witnessed", "31 times")}
            </div>
          </div>

          {/* CTA bar */}
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", padding: "16px 22px" }}>
            <button onClick={sign} style={{ cursor: "pointer", fontFamily: "'Courier Prime',monospace", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: signed ? "#fdfdfc" : "#1c1c1a", background: signed ? "#1c1c1a" : "transparent", border: "1px solid #1c1c1a", padding: "13px 26px" }}>
              {signed ? "✓ Taken in confidence" : "Acknowledge"}
            </button>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 15, color: "rgba(28,28,26,0.55)" }}>
              {signed ? "you carry it now. quietly." : "no portfolio. no announcement."}
            </div>
            <div style={{ marginLeft: "auto", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(28,28,26,0.4)" }}>44 taken · 31 inscribed · 4.3 credence</div>
          </div>

          {/* THE ASK (user-written body) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <h2 style={sectionH2}>The Ask</h2><span style={sectionRule} />
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 13, color: "rgba(28,28,26,0.45)" }}>in the hand of The Archivist</span>
            </div>
            <div className="al-body" style={{ ...card, padding: "34px 40px", maxWidth: 640 }}>
              <p>Spend one ordinary day attending to a single small thing the world has agreed not to see — the way a stranger holds a door a half-second too long, a repair someone made and never mentioned, a kindness performed for <em>no audience</em>.</p>
              <p>Choose nothing in advance; let the day present the thing to you. When you notice it, stay with it a moment longer than is comfortable. Then write it down in the fewest words that keep it true.</p>
              <p>Inscribe it in the register, unsigned. Claim nothing. To witness is enough — that is the whole of the practice. <a href="#">— the full correspondence ↗</a></p>
            </div>
          </section>

          {/* THE REGISTER (completions) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <h2 style={sectionH2}>Inscribed in the Register</h2><span style={sectionRule} />
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 13, color: "rgba(28,28,26,0.45)" }}>{entries.length} accounts returned</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px 24px", alignItems: "flex-start" }}>
              {entries.map((p, i) => (
                <div key={i} style={{ position: "relative", paddingTop: 22 }}>
                  {p.top && (
                    <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", zIndex: 3, display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", background: "#1c1c1a", color: "#fdfdfc", fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 13, letterSpacing: "0.04em", padding: "3px 14px" }}>
                      <span style={{ fontSize: 13, lineHeight: 1 }}>⚜</span> most witnessed
                    </div>
                  )}
                  <FactionPraxisCard faction="albescent" {...p} />
                </div>
              ))}
            </div>
          </section>

          {/* IN THE MARGIN (discussion) */}
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <h2 style={sectionH2}>In the Margin</h2><span style={sectionRule} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 680 }}>
              {thread.map((c, i) => <FactionCommentBox key={i} faction="albescent" {...c} />)}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default AlbescentTaskDetail;
