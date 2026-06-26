/* ════════════════════════════════════════════════════════════════
   THE EVERYMEN — Edit Praxis form
   World Zero's praxis-filing form takes the TASK's faction treatment.
   Where the Journeymen frame it as a travel manifest, the Everymen
   frame it as a union WORK REPORT filed at the hall: a stamped masthead,
   the job reference slip, a crew selector, the job headline, the report
   body, proof-of-work attachments, and a stamp-&-file action bar.
   Reuses everymen.css tokens + poster atoms. Theme-aware.
   ════════════════════════════════════════════════════════════════ */

/* ── field label in union stencil style ────────────────────────────── */
function FieldLabel({ children, meta }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 9 }}>
      <span style={{ fontFamily: "var(--font-accent)", fontSize: 16, letterSpacing: "0.12em", color: "var(--everymen-red)", whiteSpace: "nowrap" }}>{children}</span>
      {meta && <span style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--everymen-muted)", whiteSpace: "nowrap" }}>{meta}</span>}
      <span style={{ flex: 1, height: 2, background: "repeating-linear-gradient(90deg, var(--everymen-red) 0 12px, var(--everymen-gold) 12px 20px)", opacity: 0.5 }} />
    </div>
  );
}

function PraxisForm({ faction = "THE EVERYMEN", reportNo = "0040", task }) {
  const { EM_CogMark, EM_Halftone, EM_Sunburst } = window;
  const [mode, setMode] = React.useState("solo");
  const [job, setJob] = React.useState("");
  const [report, setReport] = React.useState("");
  const [filed, setFiled] = React.useState(false);
  const [dropArmed, setDropArmed] = React.useState(false);
  const [dropped, setDropped] = React.useState(false);

  const MODES = [
    { id: "solo", name: "SOLO", sub: "one pair of hands" },
    { id: "collab", name: "COLLAB", sub: "all hands" },
    { id: "duel", name: "DUEL", sub: "head to head" },
  ];
  const words = report.trim() ? report.trim().split(/\s+/).length : 0;

  const ink = "var(--everymen-ink)";
  return (
    <div style={{ fontFamily: "var(--font-body)", color: "var(--everymen-paper-text)" }}>

      {/* masthead ribbon */}
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 10,
        background: "var(--everymen-red)", color: "var(--everymen-cream)", padding: "8px 18px 8px 16px",
        boxShadow: "5px 5px 0 var(--everymen-ink)" }}>
        <EM_CogMark size={17} color="var(--everymen-cream)" />
        <span style={{ fontFamily: "var(--font-accent)", fontSize: 18, letterSpacing: "0.16em", whiteSpace: "nowrap" }}>{faction} · WORK REPORT {reportNo}</span>
      </div>

      {/* big title */}
      <div style={{ fontFamily: "var(--font-accent)", fontSize: 58, lineHeight: 0.9, letterSpacing: "0.02em",
        color: "var(--everymen-paper-text)", margin: "16px 0 4px" }}>EDIT PRAXIS</div>
      <div style={{ height: 4, width: 180, background: "repeating-linear-gradient(90deg, var(--everymen-red) 0 16px, var(--everymen-gold) 16px 26px)", marginBottom: 24 }} />

      {/* job reference slip */}
      <div style={{ position: "relative", overflow: "hidden", border: "1.5px solid " + ink, background: "var(--everymen-paper)", marginBottom: 30, display: "flex" }}>
        <div style={{ width: 8, background: "var(--everymen-red)", flexShrink: 0,
          backgroundImage: "repeating-linear-gradient(180deg, transparent 0 13px, color-mix(in srgb, var(--everymen-cream) 55%, transparent) 13px 15px)" }} />
        <div style={{ position: "relative", flex: 1, padding: "15px 18px" }}>
          <EM_Halftone opacity={0.05} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--everymen-muted)", marginBottom: 4 }}>Re: completion of</div>
            <div style={{ fontFamily: "var(--font-accent)", fontSize: 30, lineHeight: 0.96, color: "var(--everymen-paper-text)" }}>{task.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--everymen-red)", fontWeight: 700 }}>
                <EM_CogMark size={12} color="var(--everymen-red)" /> Everymen
              </span>
              <span style={{ fontFamily: "var(--font-accent)", fontSize: 15, color: "var(--everymen-red)" }}>{task.points} PTS</span>
              <span style={{ background: ink, color: "var(--everymen-cream)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px" }}>lvl {task.level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* the crew */}
      <div style={{ marginBottom: 28 }}>
        <FieldLabel>THE CREW</FieldLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {MODES.map((m) => {
            const on = mode === m.id;
            return (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                position: "relative", cursor: "pointer", textAlign: "left", padding: "13px 15px",
                background: on ? "var(--everymen-red)" : "var(--everymen-paper)",
                color: on ? "var(--everymen-cream)" : "var(--everymen-paper-text)",
                border: "2px solid " + ink, fontFamily: "var(--font-body)",
                boxShadow: on ? "4px 4px 0 " + ink : "none", transform: on ? "translate(-1px,-1px)" : "none", transition: "all 110ms",
              }}>
                <div style={{ fontFamily: "var(--font-accent)", fontSize: 24, lineHeight: 1, letterSpacing: "0.04em" }}>{m.name}</div>
                <div style={{ fontSize: 9.5, letterSpacing: "0.04em", marginTop: 3, opacity: on ? 0.9 : 0.7 }}>{m.sub}</div>
                {on && <div style={{ position: "absolute", top: 8, right: 9, width: 9, height: 9, borderRadius: "50%", background: "var(--everymen-gold)", boxShadow: "0 0 0 2px " + ink }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* the job (headline) */}
      <div style={{ marginBottom: 28 }}>
        <FieldLabel meta={`${job.length}/200`}>THE JOB</FieldLabel>
        <input value={job} onChange={(e) => setJob(e.target.value.slice(0, 200))} placeholder="name the work in one line"
          style={{ width: "100%", border: "none", borderBottom: "2px solid " + ink, background: "transparent",
            fontFamily: "var(--font-accent)", fontSize: 26, letterSpacing: "0.01em", color: "var(--everymen-paper-text)",
            padding: "4px 2px 8px", outline: "none" }} />
      </div>

      {/* the report (body) */}
      <div style={{ marginBottom: 28 }}>
        <FieldLabel meta={`${words} words · markdown ok`}>THE REPORT</FieldLabel>
        <textarea value={report} onChange={(e) => setReport(e.target.value)} placeholder="Clocked in at…"
          rows={9} style={{ width: "100%", resize: "vertical", border: "1.5px solid " + ink, background: "var(--everymen-paper)",
            fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--everymen-paper-text)",
            padding: "13px 15px", outline: "none" }} />
      </div>

      {/* proof of work */}
      <div style={{ marginBottom: 30 }}>
        <FieldLabel meta="0 pinned">PROOF OF WORK</FieldLabel>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
          border: "2px dashed " + ink, background: "transparent", color: "var(--everymen-paper-text)",
          fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "11px 18px" }}>
          <span style={{ fontFamily: "var(--font-accent)", fontSize: 18, color: "var(--everymen-red)", lineHeight: 0.6 }}>+</span> Pin Proof
        </button>
        <div style={{ fontSize: 10, fontStyle: "italic", color: "var(--everymen-muted)", marginTop: 9 }}>images · video · audio · max 50mb each</div>
      </div>

      {/* file bar */}
      <div style={{ borderTop: "1px solid color-mix(in srgb, " + "var(--everymen-paper-text)" + " 22%, transparent)", paddingTop: 22,
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button onClick={() => setFiled(true)} style={{ cursor: "pointer", border: "2px solid " + ink,
          background: filed ? "var(--everymen-olive)" : "var(--everymen-red)", color: "var(--everymen-cream)",
          fontFamily: "var(--font-accent)", fontSize: 26, letterSpacing: "0.1em", padding: "12px 30px", whiteSpace: "nowrap",
          boxShadow: "5px 5px 0 " + ink, transition: "background 150ms" }}>
          {filed ? "✓ FILED AT THE HALL" : "★ STAMP & FILE ★"}
        </button>
        <button style={{ cursor: "pointer", border: "2px solid " + ink, background: "transparent",
          color: "var(--everymen-paper-text)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px 20px" }}>Save Draft</button>
        <button onClick={() => { if (dropped) { setDropped(false); setDropArmed(false); } else if (dropArmed) { setDropped(true); setDropArmed(false); setFiled(false); } else { setDropArmed(true); } }}
          style={{ cursor: "pointer", border: "2px solid " + ((dropArmed || dropped) ? "var(--everymen-red)" : ink), background: "transparent",
          color: (dropArmed || dropped) ? "var(--everymen-red)" : "var(--everymen-paper-text)", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px 20px", transition: "all 150ms" }}>
          {dropped ? "✕ Report Pulled" : dropArmed ? "Pull — Confirm" : "Pull Report"}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { PraxisForm });
