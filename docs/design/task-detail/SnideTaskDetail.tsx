import React, { useState } from "react";
import { FactionPraxisCard, FactionCommentBox } from "@world-zero/design-system";
import { TaskDetailProps, PraxisEntry, CommentEntry, markTop, makeAvatar } from "./types";

/* ────────────────────────────────────────────────────────────────
   S.N.I.D.E. · Ransom Dispatch
   An open-case dossier: photocopier-black file card, mugshot panel,
   ransom cut-out title, lined-paper brief, closed cases (top marks
   wears a fleur-de-lis), and a marker-scrawl discussion.
   ──────────────────────────────────────────────────────────────── */

const DEFAULT_TASK = { title: "DO A KICKFLIP", no: "0042", points: 25, level: 2 };

const DEFAULT_PRAXIS: PraxisEntry[] = [
  { task: "DO A KICKFLIP", finding: "IN A GROCERY STORE", author: "Static",
    excerpt: "Aisle 7, no board, held eye contact with a man buying eggs. He nodded. ANARCHY.", rating: 5, marks: 41, points: 25, level: 2 },
  { task: "DO A KICKFLIP", finding: "OFF A LOADING DOCK", author: "Doomscroll",
    excerpt: "Used an actual skateboard like a coward. Still landed it. Rad, not sick.", rating: 3, marks: 19, points: 25, level: 2 },
  { task: "DO A KICKFLIP", finding: "AT MY OWN WEDDING", author: "Glitter Riot",
    excerpt: "Nobody asked. Triple points. The photographer got it. So did my in-laws.", rating: 4, marks: 27, points: 25, level: 2 },
];

const DEFAULT_COMMENTS: CommentEntry[] = [
  { name: "Static", meta: "filed · 1d ago", body: "Did it in a grocery store. @Nope filmed it sideways. Worth every point.", avatar: makeAvatar("S", "#14110b", "#b6ff2e") },
  { name: "Doomscroll", meta: "5h ago", body: "The eye contact rule is what makes this art instead of exercise.", avatar: makeAvatar("D", "#14110b", "#b6ff2e") },
];

const CSS = `
  .sn-page a { color: inherit; text-decoration: none; }
  .sn-link:hover { color: #6fae00 !important; }
  .sn-tape { position:absolute; background: var(--snide-tape, rgba(228,214,120,0.5)); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.25); }
  .sn-body p { font-family:'Special Elite',serif; font-size:13px; line-height:28px; color:#14110b; margin:0 0 16px; }
  .sn-body p:last-child { margin-bottom:0; }
  .sn-body a { color:#6fae00; }
`;

const RansomChip: React.FC<{ children: React.ReactNode; bg: string; color: string; font: string; size: number; rot: number; }> = ({ children, bg, color, font, size, rot }) => (
  <span style={{ display: "inline-block", background: bg, color, fontFamily: font, fontSize: size, lineHeight: 0.9, padding: "2px 10px 0", transform: `rotate(${rot}deg)`, boxShadow: "1.5px 2.5px 0 rgba(0,0,0,0.4)", border: bg === "#f4f1e8" ? "1px solid #14110b" : "none" }}>{children}</span>
);

const tag = (label: string, value: string, accent = false) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "9px 14px", border: "1.5px solid #14110b", background: accent ? "#14110b" : "transparent", transform: `rotate(${accent ? -1.5 : 1}deg)`, boxShadow: accent ? "2px 3px 0 #ec3a86" : "none" }}>
    <span style={{ fontFamily: "'Special Elite',serif", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: accent ? "#b6ff2e" : "#8b8576" }}>{label}</span>
    <span style={{ fontFamily: "'Anton',sans-serif", fontSize: 26, lineHeight: 0.85, color: accent ? "#b6ff2e" : "#14110b" }}>{value}</span>
  </div>
);

export function SnideTaskDetail({ task, praxis, comments, onSignUp }: TaskDetailProps) {
  const t = { ...DEFAULT_TASK, ...task };
  const entries = markTop(praxis ?? DEFAULT_PRAXIS);
  const thread = comments ?? DEFAULT_COMMENTS;
  const [signed, setSigned] = useState(false);
  const sign = () => { setSigned((s) => !s); onSignUp?.(); };

  return (
    <div className="sn-page" style={{ minHeight: "100vh", fontFamily: "'Special Elite',serif", color: "#14110b", position: "relative", background: "#efece3", backgroundImage: "radial-gradient(rgba(20,17,11,0.04) 1px, transparent 1px)", backgroundSize: "5px 5px" }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 30, padding: "16px 40px", background: "rgba(239,236,227,0.86)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(20,17,11,0.14)" }}>
        <span style={{ fontFamily: "'Lora',serif", fontStyle: "italic", fontWeight: 600, fontSize: 25, lineHeight: 1, borderBottom: "3px solid", borderImage: "linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1", paddingBottom: 2 }}>World Zero</span>
        <div style={{ display: "flex", gap: 22, flex: 1 }}>
          <a className="sn-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#6b6253" }}>Tasks</a>
          <a className="sn-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#14110b", borderBottom: "2px solid #14110b", paddingBottom: 2 }}>Job File</a>
          <a className="sn-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#6b6253" }}>Praxis</a>
          <a className="sn-link" href="#" style={{ fontSize: 11, letterSpacing: "0.13em", textTransform: "uppercase", color: "#6b6253" }}>Dispatch</a>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#14110b", color: "#b6ff2e", padding: "5px 12px", fontFamily: "'Anton',sans-serif", fontSize: 12, letterSpacing: "0.14em", transform: "rotate(-1deg)" }}>★ ON THE INSIDE</span>
      </nav>

      {/* PAGE */}
      <div style={{ position: "relative", zIndex: 5, maxWidth: 920, margin: "0 auto", padding: "30px 40px 90px" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b6253", marginBottom: 26, fontFamily: "'Special Elite',serif" }}>
          <a className="sn-link" href="#">Tasks</a><span style={{ opacity: 0.5, margin: "0 8px" }}>›</span><span>S.N.I.D.E.</span><span style={{ opacity: 0.5, margin: "0 8px" }}>›</span><span style={{ color: "#6fae00" }}>{t.title}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>

          {/* HERO — open-case dossier */}
          <div style={{ position: "relative", background: "#f4f1e8", color: "#14110b", border: "1.5px solid #14110b", boxShadow: "6px 7px 0 rgba(0,0,0,0.25)", transform: "rotate(-0.5deg)", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: "#b6ff2e", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 13px, rgba(0,0,0,0.25) 13px 14px)" }} />
            <div className="sn-tape" style={{ top: -9, right: 44, width: 64, height: 20, transform: "rotate(6deg)" }} />
            <div style={{ position: "relative", display: "flex", gap: 0 }}>
              <div style={{ flexShrink: 0, width: 138, background: "#14110b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "22px 10px", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 13px, rgba(182,255,46,0.16) 13px 14px)" }}>
                <svg width="58" height="58" viewBox="0 0 48 48" fill="none"><rect x="6" y="6" width="36" height="36" stroke="#b6ff2e" strokeWidth="2.5" transform="rotate(45 24 24)" /><circle cx="24" cy="24" r="7" fill="#b6ff2e" /><path d="M24 2 V10 M24 38 V46 M2 24 H10 M38 24 H46" stroke="#b6ff2e" strokeWidth="2.5" /></svg>
                <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 13, letterSpacing: "0.12em", color: "#b6ff2e", marginTop: 12 }}>JOB FILE</div>
                <div style={{ fontFamily: "'Special Elite',serif", fontSize: 8, color: "#7fa83f", letterSpacing: "0.1em", marginTop: 3 }}>OPEN CASE</div>
              </div>
              <div style={{ flex: 1, minWidth: 0, padding: "24px 24px 22px 20px", position: "relative" }}>
                <div style={{ fontFamily: "'Special Elite',serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6253", marginBottom: 10 }}>S.N.I.D.E. Case File · job no. {t.no}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 5px", alignItems: "center", marginBottom: 18 }}>
                  <RansomChip bg="#f4f1e8" color="#14110b" font="'Anton',sans-serif" size={40} rot={-4}>DO</RansomChip>
                  <RansomChip bg="#14110b" color="#b6ff2e" font="'Archivo Black',sans-serif" size={34} rot={3}>A</RansomChip>
                  <RansomChip bg="#ec3a86" color="#fff" font="'Anton',sans-serif" size={40} rot={-2}>KICK</RansomChip>
                  <RansomChip bg="#b6ff2e" color="#14110b" font="'Archivo Black',sans-serif" size={34} rot={4}>FLIP</RansomChip>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {tag("Points", String(t.points), true)}
                  {tag("Level", `LVL ${t.level}`)}
                  {tag("Filed", "88×")}
                </div>
                <span style={{ position: "absolute", bottom: 16, right: 16, fontFamily: "'Anton',sans-serif", fontSize: 15, letterSpacing: "0.14em", color: "rgba(190,24,93,0.75)", border: "2.5px solid rgba(190,24,93,0.7)", padding: "3px 12px", transform: "rotate(-7deg)" }}>OPEN CASE</span>
              </div>
            </div>
          </div>

          {/* CTA bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", background: "#14110b", padding: "16px 20px", transform: "rotate(-0.4deg)", boxShadow: "4px 5px 0 rgba(0,0,0,0.2)" }}>
            <button onClick={sign} style={{ cursor: "pointer", border: "2px solid #14110b", background: signed ? "#ec3a86" : "#6fae00", color: "#fff", fontFamily: "'Archivo Black',sans-serif", fontSize: 14, letterSpacing: "0.03em", padding: "13px 24px", transform: "rotate(-1.5deg)", boxShadow: "3px 4px 0 #b6ff2e" }}>
              {signed ? "→ FILE THE RAP SHEET" : "★ PULL THIS JOB ★"}
            </button>
            <div style={{ fontFamily: "'Permanent Marker',cursive", fontSize: 13, color: "#ec3a86", transform: "rotate(-1deg)" }}>
              {signed ? "↳ go get it on the record" : "↳ no take-backs once it's filed"}
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "'Anton',sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "#b6ff2e" }}>88 ATTEMPTED · 61 FILED · 2.1 AVG</div>
          </div>

          {/* THE BRIEF (user-written body) */}
          <section>
            <div style={{ display: "inline-block", background: "#b6ff2e", color: "#14110b", fontFamily: "'Permanent Marker',cursive", fontSize: 17, padding: "3px 14px", transform: "rotate(-1.5deg)", boxShadow: "2px 2px 0 #ec3a86", marginBottom: 14 }}>the brief</div>
            <div className="sn-body" style={{ position: "relative", background: "#f4f1e8", color: "#14110b", border: "1.5px solid #14110b", borderLeft: "4px solid #b6ff2e", padding: "24px 24px 20px", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 27px, rgba(20,17,11,0.08) 27px 28px)", transform: "rotate(0.3deg)", boxShadow: "3px 4px 0 rgba(0,0,0,0.18)", maxWidth: 640 }}>
              <div className="sn-tape" style={{ top: -9, left: 32, width: 62, height: 18, transform: "rotate(-5deg)" }} />
              <p>Do a kickflip. Bonus points if you don't use a skateboard. Double if nobody asked you to. Triple if you make meaningful eye contact with a bystander immediately after.</p>
              <p>Most people do it wrong. That's the point. We're not grading the kickflip — we're grading the nerve. Commitment is the trick; the board is optional; the audience is a bonus.</p>
              <p>File the rap sheet before anyone can claim it didn't happen. — <a href="#">the unwritten rules ↗</a></p>
            </div>
          </section>

          {/* CASES CLOSED (completions) */}
          <section>
            <div style={{ display: "inline-block", background: "#b6ff2e", color: "#14110b", fontFamily: "'Permanent Marker',cursive", fontSize: 17, padding: "3px 14px", transform: "rotate(1deg)", boxShadow: "2px 2px 0 #ec3a86", marginBottom: 18 }}>cases closed</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "32px 26px", alignItems: "flex-start" }}>
              {entries.map((p, i) => (
                <div key={i} style={{ position: "relative", paddingTop: 22 }}>
                  {p.top && (
                    <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%) rotate(-3deg)", zIndex: 3, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: "#ec3a86", color: "#fff", fontFamily: "'Archivo Black',sans-serif", fontSize: 9, letterSpacing: "0.06em", padding: "4px 12px", boxShadow: "2px 3px 0 #14110b" }}>
                      <span style={{ fontSize: 12, lineHeight: 1 }}>⚜</span> TOP MARKS
                    </div>
                  )}
                  <FactionPraxisCard faction="snide" {...p} />
                </div>
              ))}
            </div>
          </section>

          {/* THE CHATTER (discussion) */}
          <section>
            <div style={{ display: "inline-block", background: "#b6ff2e", color: "#14110b", fontFamily: "'Permanent Marker',cursive", fontSize: 17, padding: "3px 14px", transform: "rotate(-1deg)", boxShadow: "2px 2px 0 #ec3a86", marginBottom: 18 }}>the chatter</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
              {thread.map((c, i) => <FactionCommentBox key={i} faction="snide" {...c} />)}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default SnideTaskDetail;
