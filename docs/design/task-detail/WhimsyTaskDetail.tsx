import React, { useState } from "react";
import { FactionPraxisCard, FactionCommentBox } from "@world-zero/design-system";
import { TaskDetailProps, PraxisEntry, CommentEntry, markTop } from "./types";

/* ────────────────────────────────────────────────────────────────
   WARRIORS OF WHIMSY · whimsy.exe Desktop
   A pink computer-witch window: traffic-light title bar, dotted
   desktop, sparkle + heart charms, Caveat headings, spells cast
   (most loved wears a fleur-de-lis), and a pastel group chat.
   ──────────────────────────────────────────────────────────────── */

const DEFAULT_TASK = { title: "Leave a Spell on a Stranger's Door", points: 30, level: 2 };

const DEFAULT_PRAXIS: PraxisEntry[] = [
  { task: "Leave a Spell", finding: "the folded paper star", author: "Marigold",
    excerpt: "Said 'you were right to leave.' She cried at the door. mission accomplished.", rating: 5, marks: 34, points: 30, level: 2 },
  { task: "Leave a Spell", finding: "chalk sigil, bus stop", author: "Glimmer",
    excerpt: "Drew a tiny sun under the bench where the morning crowd waits. Gone by noon. Worth it.", rating: 4, marks: 21, points: 30, level: 2 },
  { task: "Leave a Spell", finding: "a charm in a library book", author: "Pocket Witch",
    excerpt: "Pressed flower + a note on page 100. Whoever borrows it next gets a small wonder.", rating: 4, marks: 18, points: 30, level: 2 },
];

const grad = (a: string[]) => `radial-gradient(circle at 32% 28%, ${a[0]}, ${a[1]} 72%, ${a[2]})`;
const avatar = (a: string[]) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><defs><radialGradient id="g" cx="32%" cy="28%"><stop offset="0" stop-color="${a[0]}"/><stop offset="0.72" stop-color="${a[1]}"/><stop offset="1" stop-color="${a[2]}"/></radialGradient></defs><rect width="80" height="80" fill="url(#g)"/></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
};

const DEFAULT_COMMENTS: CommentEntry[] = [
  { name: "Marigold", handle: "marigold", meta: "cast it · 3w", body: "left a folded paper star that said 'you were right to leave.' @Tuesday cried. mission accomplished.", avatar: avatar(["#f6a8cb", "#ec5f99", "#a83a6e"]) },
  { name: "Tuesday", handle: "tuesday", meta: "2d", body: "i WAS right to leave. how did the door know.", avatar: avatar(["#f6c75e", "#e09a2a", "#a86a12"]) },
];

const CSS = `
  .wow-page a { color: inherit; text-decoration: none; }
  .wow-link:hover { color: #d23b7e !important; }
  .wow-body p { font-family:'Courier Prime',monospace; font-size:12px; line-height:1.75; color:#6b3050; margin:0 0 14px; }
  .wow-body p:last-child { margin-bottom:0; }
  .wow-body strong { color:#d23b7e; }
  .wow-body a { color:#d23b7e; border-bottom:1px solid rgba(214,59,126,0.4); }
`;

const Sparkle: React.FC<{ size: number; color: string; style?: React.CSSProperties }> = ({ size, color, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}><path d="M12 0c.9 7 4.1 10.2 11 11-6.9.8-10.1 4-11 11-.9-7-4.1-10.2-11-11C7.9 10.2 11.1 7 12 0Z" fill={color} /></svg>
);

const sectionH2: React.CSSProperties = { fontFamily: "'Caveat',cursive", fontSize: 32, margin: 0, color: "#7a2350", whiteSpace: "nowrap" };
const sectionRule: React.CSSProperties = { flex: 1, height: 2, background: "repeating-linear-gradient(90deg,#ec5f99 0 8px, transparent 8px 14px)" };
const SectionHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
    <Sparkle size={18} color="#ec5f99" /><h2 style={sectionH2}>{children}</h2><span style={sectionRule} />
  </div>
);

export function WhimsyTaskDetail({ task, praxis, comments, onSignUp }: TaskDetailProps) {
  const t = { ...DEFAULT_TASK, ...task };
  const entries = markTop(praxis ?? DEFAULT_PRAXIS);
  const thread = comments ?? DEFAULT_COMMENTS;
  const [signed, setSigned] = useState(false);
  const sign = () => { setSigned((s) => !s); onSignUp?.(); };

  return (
    <div className="wow-page" style={{ minHeight: "100vh", fontFamily: "'Courier Prime',monospace", color: "#5b2a44", position: "relative", background: "#fbe6f0", backgroundImage: "radial-gradient(rgba(214,90,150,0.16) 1.3px, transparent 1.3px)", backgroundSize: "15px 15px" }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 30, padding: "16px 40px", background: "rgba(255,240,247,0.86)", backdropFilter: "blur(8px)", borderBottom: "1px solid #f3b6d2" }}>
        <span style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontWeight: 600, fontSize: 25, lineHeight: 1, borderBottom: "3px solid", borderImage: "linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1", paddingBottom: 2 }}>World Zero</span>
        <div style={{ display: "flex", gap: 22, flex: 1 }}>
          <a className="wow-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#b56391" }}>Tasks</a>
          <a className="wow-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#d23b7e", borderBottom: "2px solid #ec5f99", paddingBottom: 2 }}>Quest</a>
          <a className="wow-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#b56391" }}>Spells</a>
          <a className="wow-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#b56391" }}>Updates</a>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1.5px solid #ec5f99", borderRadius: 20, background: "#fbcfe2", padding: "4px 12px", fontFamily: "'Caveat',cursive", fontSize: 16, color: "#d23b7e" }}>✦ whimsy unlocked</span>
      </nav>

      {/* PAGE */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 920, margin: "0 auto", padding: "26px 40px 90px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b56391", marginBottom: 22 }}>
          <a className="wow-link" href="#">Tasks</a><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span>Warriors of Whimsy</span><span style={{ opacity: 0.5, margin: "0 8px" }}>/</span><span style={{ color: "#d23b7e" }}>{t.title}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>

          {/* HERO — whimsy.exe window */}
          <div style={{ borderRadius: 14, overflow: "hidden", border: "2px solid #d23b7e", boxShadow: "0 10px 26px rgba(214,90,150,0.32)", transform: "rotate(-0.5deg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", background: "linear-gradient(180deg,#f9b6d4,#ec5f99)", borderBottom: "2px solid #d23b7e" }}>
              {["#fb7aa8", "#f6c75e", "#86cfa6"].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, border: "1.2px solid rgba(255,255,255,0.7)" }} />)}
              <span style={{ marginLeft: "auto", fontFamily: "'Caveat',cursive", fontSize: 20, color: "#fff", textShadow: "1px 1px 0 #a83a6e" }}>quest.exe</span>
            </div>
            <div style={{ position: "relative", padding: "30px 34px 32px", background: "#fff0f7", backgroundImage: "radial-gradient(rgba(214,90,150,0.18) 1.3px, transparent 1.3px)", backgroundSize: "14px 14px" }}>
              <Sparkle size={22} color="#f0b94a" style={{ position: "absolute", top: 18, right: 22, transform: "rotate(10deg)" }} />
              <Sparkle size={14} color="#ec5f99" style={{ position: "absolute", top: 64, right: 70, transform: "rotate(-12deg)" }} />
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.16em", color: "#b56391", marginBottom: 8 }}>a little magic, due by moonrise</div>
              <div style={{ fontFamily: "'Caveat',cursive", fontSize: 62, lineHeight: 0.92, color: "#7a2350", marginBottom: 18, overflowWrap: "anywhere" }}>{t.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 14px", borderRadius: 20, background: "#fbcfe2", color: "#5b2a44", border: "1.5px solid rgba(214,90,150,0.4)" }}>
                  <Sparkle size={11} color="#ec5f99" /> level {t.level}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Caveat',cursive", fontSize: 30, color: "#ec5f99" }}>
                  <svg width="22" height="22" viewBox="0 0 36 36"><path d="M18 31C7 23 3 17 6.5 11 9 6.8 14 6.5 16 10c.9 1.5 1.6 2.7 2 3.4.4-.7 1.1-1.9 2-3.4 2-3.5 7-3.2 9.5 1C33 17 29 23 18 31Z" fill="#ec5f99" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" /></svg> {t.points} sparks
                </span>
              </div>
            </div>
          </div>

          {/* CTA bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", border: "2px solid #d23b7e", borderRadius: 12, background: "#fff0f7", padding: "16px 20px", boxShadow: "4px 4px 0 #fbcfe2" }}>
            <button onClick={sign} style={{ cursor: "pointer", fontFamily: "'Courier Prime',monospace", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#fff", padding: "13px 24px", border: "1.5px solid #d23b7e", borderRadius: 10, background: signed ? "linear-gradient(180deg,#86cfa6,#3f9070)" : "linear-gradient(180deg,#ec5f99,#d23b7e)", boxShadow: "0 4px 10px rgba(214,90,150,0.35)" }}>
              {signed ? "✦ you're in the party!" : "join the party ✦"}
            </button>
            <div style={{ fontFamily: "'Caveat',cursive", fontSize: 20, color: "#d23b7e" }}>
              {signed ? "the group chat just got louder" : "no experience with magic required"}
            </div>
            <div style={{ marginLeft: "auto", fontSize: 10, letterSpacing: "0.06em", color: "#b56391" }}>73 tried · 58 pulled it off · 4.6 avg love</div>
          </div>

          {/* WHAT WE'RE ASKING (user-written body) */}
          <section>
            <SectionHead>what we're asking</SectionHead>
            <div className="wow-body" style={{ border: "2px solid #f3b6d2", borderRadius: 12, background: "#fff", padding: "24px 28px", maxWidth: 640 }}>
              <p>Make a small, kind, slightly inexplicable thing — a paper charm, a chalk sigil, a tiny note that says exactly the right impossible thing — and leave it where one <strong>specific stranger</strong> will find it. No signature. No credit. Just a little magic loosed into a Tuesday.</p>
              <p>Choose your stranger by vibe, not by knowing them. Trust the pull. Then vanish like a good witch does, and tell the party here — but never tell <em>them</em>.</p>
              <p>The party tends to lose its mind over:</p>
              <ul style={{ fontFamily: "'Courier Prime',monospace", fontSize: 12, lineHeight: 1.7, color: "#6b3050", margin: "0 0 14px", paddingLeft: 22 }}>
                <li>Handmade beats bought, every single time.</li>
                <li>The right impossible words on a scrap of paper.</li>
                <li>A clean vanish — nobody saw you do it.</li>
              </ul>
              <p>Glitter is permitted but never required. — <a href="#">the witch's handbook ↗</a></p>
            </div>
          </section>

          {/* SPELLS CAST (completions) */}
          <section>
            <SectionHead>spells cast so far</SectionHead>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px 24px", alignItems: "flex-start" }}>
              {entries.map((p, i) => (
                <div key={i} style={{ position: "relative", paddingTop: 22 }}>
                  {p.top && (
                    <div style={{ position: "absolute", top: -2, left: "50%", transform: "translateX(-50%) rotate(-2deg)", zIndex: 3, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: "#ec5f99", color: "#fff", fontFamily: "'Caveat',cursive", fontSize: 17, padding: "2px 14px", borderRadius: 14, boxShadow: "2px 3px 0 #fbcfe2" }}>
                      <span style={{ fontSize: 13, lineHeight: 1 }}>⚜</span> most loved
                    </div>
                  )}
                  <FactionPraxisCard faction="wow" {...p} />
                </div>
              ))}
            </div>
          </section>

          {/* THE GROUP CHAT (discussion) */}
          <section>
            <SectionHead>the group chat</SectionHead>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
              {thread.map((c, i) => <FactionCommentBox key={i} faction="wow" {...c} />)}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default WhimsyTaskDetail;
