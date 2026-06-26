/* ════════════════════════════════════════════════════════════════
   S.N.I.D.E. — Completed Praxis (case files) + Praxis Detail
   · SnideVoteTally  — histogram of marks 1–5 received, punk bars
   · SnidePraxisRow  — a filed confession as a pinned case-file row
   · SnidePraxisDetail — one completed praxis in full + cast-a-vote
   Reuses snide.css tokens, photocopy filters, SnideSigil + SnideVoteStamps.
   Theme-aware via --snide-wall-text.
   ════════════════════════════════════════════════════════════════ */

const PD_MUTED = "color-mix(in srgb, var(--snide-wall-text) 55%, transparent)";
const PD_MARKS = [
  { v: 1, label: "meh", color: "color-mix(in srgb, var(--snide-wall-text) 45%, transparent)" },
  { v: 2, label: "not bad", color: "var(--acid-deep)" },
  { v: 3, label: "rad", color: "var(--acid)" },
  { v: 4, label: "sick", color: "var(--pink)" },
  { v: 5, label: "anarchy", color: "var(--snide-green)" },
];

function pdAvg(counts) {
  let n = 0, s = 0;
  for (const m of PD_MARKS) { const c = counts[m.v] || 0; n += c; s += c * m.v; }
  return { total: n, avg: n ? s / n : 0 };
}

/* ── vote tally — how the marks landed ─────────────────────────────── */
function SnideVoteTally({ counts }) {
  const { total, avg } = pdAvg(counts);
  const max = Math.max(1, ...PD_MARKS.map((m) => counts[m.v] || 0));
  const wall = "var(--snide-wall-text)";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--f-anton)", fontSize: 54, lineHeight: 0.8, color: "var(--snide-green)" }}>{avg.toFixed(1)}</span>
        <div style={{ paddingBottom: 5 }}>
          <div style={{ fontFamily: "var(--f-cond)", fontSize: 16, letterSpacing: "0.06em", color: wall }}>OUT OF 5</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.06em", color: PD_MUTED }}>{total} marks · <span style={{ fontFamily: "var(--f-marker)", color: "var(--pink)" }}>still nobody's impressed</span></div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {[...PD_MARKS].reverse().map((m) => {
          const c = counts[m.v] || 0;
          return (
            <div key={m.v} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 16, textAlign: "center", fontFamily: "var(--f-anton)", fontSize: 15, color: wall }}>{m.v}</span>
              <div style={{ flex: 1, height: 16, background: "color-mix(in srgb, var(--snide-wall-text) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--snide-wall-text) 25%, transparent)", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, width: `${(c / max) * 100}%`, background: m.color, transition: "width 200ms" }} />
              </div>
              <span style={{ width: 26, textAlign: "right", fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, color: wall }}>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── filed confession — case-file row (links to detail) ────────────── */
function SnidePraxisRow({ href = "#", author, initial, faction = "S.N.I.D.E.", when, snippet, evidence = 0, counts, mark, rank }) {
  const { avg, total } = pdAvg(counts);
  const wall = "var(--snide-wall-text)";
  const ink = "var(--ink)";
  return (
    <a href={href} className="casefile" style={{ position: "relative", display: "flex", background: "var(--paper)", color: ink,
      border: "1.5px solid " + ink, boxShadow: "4px 5px 0 rgba(0,0,0,0.22)", overflow: "hidden", textDecoration: "none" }}>
      <div className="ht-dots" style={{ position: "absolute", inset: 0, color: "rgba(20,17,11,0.05)", pointerEvents: "none" }} />
      {/* rank + mugshot tab */}
      <div style={{ position: "relative", flexShrink: 0, width: 70, background: ink, color: "var(--acid)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
        backgroundImage: "repeating-linear-gradient(180deg, transparent 0 13px, rgba(182,255,46,0.18) 13px 14px)" }}>
        {rank && <span style={{ position: "absolute", top: 5, left: 6, fontFamily: "var(--f-anton)", fontSize: 11, color: "var(--pink)" }}>#{rank}</span>}
        <span style={{ fontFamily: "var(--f-anton)", fontSize: 26, lineHeight: 0.8 }}>{initial}</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 6.5, letterSpacing: "0.14em", color: "#cfe6a0" }}>EXHIBIT</span>
      </div>
      {/* body */}
      <div style={{ position: "relative", flex: 1, padding: "12px 16px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--f-marker)", fontSize: 18, color: "var(--snide-accent)" }}>{author}</span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6b6253" }}>{faction} · {when}</span>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 11.5, lineHeight: 1.5, color: "#3a342a", margin: "5px 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{snippet}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 9 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6253", border: "1px solid rgba(20,17,11,0.25)", padding: "2px 7px" }}>📎 {evidence} evidence</span>
          <span style={{ marginLeft: "auto", fontFamily: "var(--f-marker)", fontSize: 14, color: ink }}>open the file →</span>
        </div>
      </div>
      {/* vote tally chip */}
      <div style={{ position: "relative", flexShrink: 0, width: 92, borderLeft: "1.5px dashed rgba(20,17,11,0.3)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 8px", background: "rgba(0,0,0,0.02)" }}>
        <span style={{ fontFamily: "var(--f-anton)", fontSize: 30, lineHeight: 0.8, color: "var(--snide-accent)" }}>{avg.toFixed(1)}</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 7.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6253", marginTop: 3 }}>{total} marks</span>
        {mark && <span style={{ marginTop: 6, fontFamily: "var(--f-cond)", fontSize: 11, letterSpacing: "0.08em", color: "#fff", background: "var(--pink)", padding: "1px 7px", transform: "rotate(-3deg)" }}>{mark}</span>}
      </div>
    </a>
  );
}

/* ── one completed praxis, in full (voting lives on the page) ───────── */
function SnidePraxisDetail({ task, author, initial, when, faction = "S.N.I.D.E.", confession, evidence = [] }) {
  const { SnideSigil } = window;
  const wall = "var(--snide-wall-text)";
  const ink = "var(--ink)";
  return (
    <div style={{ position: "relative", fontFamily: "var(--font-body)", color: wall }}>
      {/* stamped masthead */}
      <div style={{ lineHeight: 0 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--snide-green)", color: "#fff",
          padding: "8px 16px 8px 13px", transform: "rotate(-1.5deg)", boxShadow: "4px 4px 0 var(--pink)" }}>
          <SnideSigil size={17} color="var(--acid)" />
          <span style={{ fontFamily: "var(--f-cond)", fontSize: 17, letterSpacing: "0.14em", whiteSpace: "nowrap" }}>S.N.I.D.E. · CLOSED CASE · FILED</span>
        </div>
      </div>

      {/* author + task line */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "20px 0 6px" }}>
        <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: "50%", background: ink, border: "2px solid var(--snide-green)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--acid)", fontFamily: "var(--f-anton)", fontSize: 26, transform: "rotate(-4deg)" }}>{initial}</div>
        <div>
          <div style={{ fontFamily: "var(--f-anton)", fontSize: 40, lineHeight: 0.84, color: wall, transform: "skewX(-4deg)" }}>{author}</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: PD_MUTED, marginTop: 5 }}>{faction} · pulled it off · {when}</div>
        </div>
      </div>

      {/* the job they closed */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: ink, padding: "6px 12px", transform: "rotate(-0.5deg)", margin: "8px 0 26px", whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8f9183" }}>re:</span>
        <span style={{ fontFamily: "var(--f-cond)", fontSize: 18, letterSpacing: "0.04em", color: "var(--acid)", whiteSpace: "nowrap" }}>{task.title}</span>
        <span style={{ fontFamily: "var(--f-anton)", fontSize: 15, color: "var(--pink)" }}>+{task.points}</span>
      </div>

      {/* the confession (ruled notebook) */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <span style={{ display: "inline-block", background: "var(--acid)", color: ink, fontFamily: "var(--f-marker)", fontSize: 17, padding: "3px 13px", transform: "rotate(-1.5deg)", boxShadow: "2px 2px 0 var(--pink)", marginBottom: 12 }}>the confession</span>
        <div style={{ position: "relative" }}>
          <div className="tape" style={{ top: -8, left: 28, width: 56, height: 18, transform: "rotate(-5deg)", zIndex: 3 }} />
          <div style={{ border: "1.5px solid " + ink, borderLeft: "4px solid var(--pink)", background: "var(--paper)", color: ink,
            backgroundImage: "repeating-linear-gradient(180deg, transparent 0 27px, rgba(20,17,11,0.11) 27px 28px)",
            padding: "8px 16px 14px 18px", fontSize: 13, lineHeight: "28px", whiteSpace: "pre-line" }}>{confession}</div>
        </div>
      </div>

      {/* the evidence */}
      <div style={{ marginBottom: 30 }}>
        <span style={{ display: "inline-block", background: "var(--acid)", color: ink, fontFamily: "var(--f-marker)", fontSize: 17, padding: "3px 13px", transform: "rotate(1.5deg)", boxShadow: "2px 2px 0 var(--pink)", marginBottom: 14 }}>the evidence</span>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {evidence.map((e, i) => (
            <div key={i} style={{ background: "var(--paper)", border: "1.5px solid " + ink, padding: "8px 8px 18px", transform: `rotate(${i % 2 ? 2.5 : -2.5}deg)`, boxShadow: "3px 4px 0 rgba(0,0,0,0.2)" }}>
              <div style={{ position: "relative", width: 122, height: 92, background: ink, overflow: "hidden" }}>
                <div className="ht-dots-lg" style={{ position: "absolute", inset: 0, color: "rgba(182,255,46,0.5)", mixBlendMode: "screen" }} />
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-marker)", fontSize: 13, color: "var(--acid)" }}>{e}</span>
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6253", marginTop: 7, textAlign: "center" }}>exhibit {String.fromCharCode(65 + i)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SnideVoteTally, SnidePraxisRow, SnidePraxisDetail, pdAvg });
