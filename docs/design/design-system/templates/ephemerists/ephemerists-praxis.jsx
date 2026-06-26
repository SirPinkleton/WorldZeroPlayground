/* ════════════════════════════════════════════════════════════════
   THE EPHEMERISTS — Edit Praxis form
   World Zero's praxis-filing form in the faction's voice: filing AN
   ENTRY IN THE EPHEMERIS. A sealed masthead, the observed-task slip (a
   torn codex leaf), a METHOD selector (alone / in concord / in dispute),
   THE FINDING headline, THE ACCOUNT body, EVIDENCE attachments, and a
   seal-&-enter action bar. House-of-Leaves apparatus throughout.
   Reuses ephemerists-cards.jsx atoms. Theme-aware.
   ════════════════════════════════════════════════════════════════ */

function FieldLabel({ children, meta }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 10 }}>
      <span style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 14, letterSpacing: "0.16em", color: "var(--eph-rubric)", whiteSpace: "nowrap" }}>{children}</span>
      {meta && <span style={{ fontFamily: "var(--eph-serif)", fontSize: 9.5, fontStyle: "italic", letterSpacing: "0.06em", color: "var(--eph-muted)", whiteSpace: "nowrap" }}>{meta}</span>}
      <span style={{ flex: 1, height: 0, borderTop: "1px solid var(--eph-gold-deep)", borderBottom: "1px solid color-mix(in srgb, var(--eph-lapis) 60%, transparent)" }} />
    </div>
  );
}

function PraxisForm({ faction = "THE EPHEMERISTS", entryNo = "MMXXVI", task }) {
  const { EPH_EphMark, EPH_Foxing, EPH_toRoman } = window;
  const [mode, setMode] = React.useState("alone");
  const [finding, setFinding] = React.useState("");
  const [account, setAccount] = React.useState("");
  const [filed, setFiled] = React.useState(false);
  const [dropArmed, setDropArmed] = React.useState(false);
  const [dropped, setDropped] = React.useState(false);

  const MODES = [
    { id: "alone",   name: "ALONE",      sub: "one observer" },
    { id: "concord", name: "IN CONCORD", sub: "accounts agree" },
    { id: "dispute", name: "IN DISPUTE", sub: "accounts differ" },
  ];
  const words = account.trim() ? account.trim().split(/\s+/).length : 0;
  const ink = "var(--eph-ink)";

  return (
    <div style={{ fontFamily: "var(--eph-serif)", color: "var(--eph-vellum-text)" }}>

      {/* masthead — a catalogue running-head between hairlines (no poster ribbon) */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 4px 6px",
        color: "var(--eph-rubric)", borderTop: "1px solid var(--eph-gold-deep)", borderBottom: "1px solid var(--eph-gold-deep)",
        boxShadow: "0 2px 0 -1px color-mix(in srgb, var(--eph-lapis) 55%, transparent)" }}>
        <EPH_EphMark size={15} color="var(--eph-lapis)" />
        <span style={{ fontFamily: "var(--eph-display)", fontWeight: 600, fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{faction} · ephemeris entry №{entryNo}</span>
      </div>

      {/* big title */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, margin: "18px 0 4px", flexWrap: "wrap" }}>
        <div style={{ fontFamily: "var(--eph-display)", fontWeight: 800, fontSize: 54, lineHeight: 0.9, letterSpacing: "0.02em", color: "var(--eph-vellum-text)", whiteSpace: "nowrap" }}>
          EDIT <span style={{ color: "var(--eph-lapis)" }}>PRAXIS</span>
        </div>
        <span style={{ fontFamily: "var(--eph-script)", fontStyle: "italic", fontSize: 14, color: "var(--eph-muted)" }}>— set it down before it passes</span>
      </div>
      <div style={{ height: 0, width: 200, borderTop: "1px solid var(--eph-gold-deep)", borderBottom: "1px solid color-mix(in srgb, var(--eph-lapis) 60%, transparent)", marginBottom: 26 }} />

      {/* observed-task slip — a leaf from the ephemeris (running-head + ledger rules, no spine) */}
      <div style={{ position: "relative", overflow: "hidden", border: "1px solid color-mix(in srgb, var(--eph-vellum-text) 30%, transparent)", background: "var(--eph-vellum)", marginBottom: 30 }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 0.5,
          backgroundImage: "repeating-linear-gradient(0deg, transparent 0 23px, color-mix(in srgb, var(--eph-lapis) 16%, transparent) 23px 24px)" }} />
        <EPH_Foxing opacity={0.35} />
        {/* running head */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10,
          padding: "7px 16px 6px", borderBottom: "1px solid var(--eph-gold-deep)", boxShadow: "0 2px 0 -1px color-mix(in srgb, var(--eph-lapis) 55%, transparent)" }}>
          <span style={{ fontFamily: "var(--eph-serif)", fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--eph-rubric)" }}>Ephemeris · observed</span>
          <span style={{ fontFamily: "var(--eph-serif)", fontSize: 8.5, letterSpacing: "0.06em", color: "var(--eph-muted)", whiteSpace: "nowrap" }}>41°54′N · 12°29′E &nbsp;·&nbsp; grade {EPH_toRoman(task.level)} †</span>
        </div>
        {/* body */}
        <div style={{ position: "relative", zIndex: 2, padding: "13px 16px 14px" }}>
          <div style={{ fontFamily: "var(--eph-serif)", fontSize: 9, fontStyle: "italic", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--eph-muted)", marginBottom: 4 }}>Re: the truth traced in</div>
          <div style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 30, lineHeight: 0.96, color: "var(--eph-vellum-text)" }}>
            {task.title.replace(/ \S+$/, "")} <span style={{ color: "var(--eph-lapis)" }}>{task.title.split(" ").slice(-1)[0]}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--eph-serif)", fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--eph-lapis)", fontWeight: 600 }}>
              <EPH_EphMark size={12} color="var(--eph-lapis)" /> Ephemerists
            </span>
            <span style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 15, color: "var(--eph-rubric)" }}>{task.points} pvncta</span>
          </div>
        </div>
      </div>

      {/* the method */}
      <div style={{ marginBottom: 28 }}>
        <FieldLabel meta="how the account was taken">THE METHOD</FieldLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {MODES.map((m) => {
            const on = mode === m.id;
            return (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                position: "relative", cursor: "pointer", textAlign: "left", padding: "13px 15px",
                background: on ? "var(--eph-lapis)" : "var(--eph-vellum)",
                color: on ? "var(--eph-parchment)" : "var(--eph-vellum-text)",
                border: "1px solid " + ink, fontFamily: "var(--eph-serif)",
                boxShadow: on ? "inset 0 2px 6px rgba(0,0,0,0.4), inset 0 0 0 1px color-mix(in srgb, var(--eph-gold) 55%, transparent)" : "none",
                transition: "all 120ms",
              }}>
                <div style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 21, lineHeight: 1, letterSpacing: "0.03em" }}>{m.name}</div>
                <div style={{ fontFamily: "var(--eph-serif)", fontStyle: "italic", fontSize: 10, letterSpacing: "0.02em", marginTop: 4, opacity: on ? 0.9 : 0.7 }}>{m.sub}</div>
                {on && <div style={{ position: "absolute", top: 8, right: 9, width: 9, height: 9, borderRadius: "50%", background: "var(--eph-gold-light)", boxShadow: "0 0 0 2px " + ink }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* the finding (headline) */}
      <div style={{ marginBottom: 28 }}>
        <FieldLabel meta={`${finding.length}/200 · name the plain fact`}>THE FINDING</FieldLabel>
        <input value={finding} onChange={(e) => setFinding(e.target.value.slice(0, 200))} placeholder="the ordinary event the legend grew from"
          style={{ width: "100%", border: "none", borderBottom: "2px solid " + ink, background: "transparent",
            fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 24, letterSpacing: "0.01em", color: "var(--eph-vellum-text)",
            padding: "4px 2px 8px", outline: "none" }} />
      </div>

      {/* the account (body) */}
      <div style={{ marginBottom: 28 }}>
        <FieldLabel meta={`${words} words · markdown ok`}>THE ACCOUNT</FieldLabel>
        <textarea value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Followed it backward through every retelling. The first teller…"
          rows={9} style={{ width: "100%", resize: "vertical", border: "1.5px solid " + ink, background: "var(--eph-vellum)",
            fontFamily: "var(--eph-serif)", fontSize: 14, lineHeight: 1.65, color: "var(--eph-vellum-text)",
            padding: "13px 15px", outline: "none" }} />
        <div style={{ fontFamily: "var(--eph-serif)", fontSize: 9.5, fontStyle: "italic", color: "var(--eph-muted)", marginTop: 7 }}>† the account you file is itself a retelling. someone will trace it back. — <span style={{ color: "var(--eph-lapis)" }}>see †</span></div>
      </div>

      {/* evidence */}
      <div style={{ marginBottom: 30 }}>
        <FieldLabel meta="0 pinned">THE EVIDENCE</FieldLabel>
        <button style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
          border: "2px dashed " + ink, background: "transparent", color: "var(--eph-vellum-text)",
          fontFamily: "var(--eph-serif)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "11px 18px" }}>
          <span style={{ fontFamily: "var(--eph-display)", fontSize: 18, color: "var(--eph-rubric)", lineHeight: 0.6 }}>+</span> Pin a specimen
        </button>
        <div style={{ fontFamily: "var(--eph-serif)", fontSize: 10, fontStyle: "italic", color: "var(--eph-muted)", marginTop: 9 }}>rubbings · sketches · recordings · transcripts — max 50mb each</div>
      </div>

      {/* file bar */}
      <div style={{ borderTop: "1px solid color-mix(in srgb, var(--eph-vellum-text) 22%, transparent)", paddingTop: 22,
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button onClick={() => setFiled(true)} style={{ cursor: "pointer", border: "1px solid var(--eph-gold)",
          background: filed ? "var(--eph-verdigris)" : "var(--eph-rubric)", color: "var(--eph-parchment)",
          fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 22, letterSpacing: "0.08em", padding: "12px 28px", whiteSpace: "nowrap",
          boxShadow: "inset 0 2px 4px rgba(255,255,255,0.16), inset 0 -4px 7px rgba(0,0,0,0.38), 0 2px 5px rgba(0,0,0,0.25)", transition: "background 150ms" }}>
          {filed ? "✓ ENTERED IN THE EPHEMERIS" : "✦ SEAL & ENTER ✦"}
        </button>
        <button style={{ cursor: "pointer", border: "1px solid " + ink, background: "transparent",
          color: "var(--eph-vellum-text)", fontFamily: "var(--eph-serif)", fontSize: 12, fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase", padding: "13px 20px" }}>Keep as marginalia</button>
        <button onClick={() => { if (dropped) { setDropped(false); setDropArmed(false); } else if (dropArmed) { setDropped(true); setDropArmed(false); setFiled(false); } else { setDropArmed(true); } }}
          style={{ cursor: "pointer", border: "1px solid " + ((dropArmed || dropped) ? "var(--eph-rubric)" : ink), background: "transparent",
          color: (dropArmed || dropped) ? "var(--eph-rubric)" : "var(--eph-vellum-text)", fontFamily: "var(--eph-serif)", fontSize: 12, fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase", padding: "13px 20px", transition: "all 150ms" }}>
          {dropped ? "✕ Struck" : dropArmed ? "Strike — Confirm" : "Strike Entry"}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { PraxisForm });
