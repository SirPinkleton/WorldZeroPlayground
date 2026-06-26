/* ════════════════════════════════════════════════════════════════
   S.N.I.D.E. — Edit Praxis  (RAP SHEET / CONFESSION)
   The praxis-filing form, rebuilt as a confession pinned to the
   evidence wall: a stamped masthead, a PINNED MUGSHOT EXHIBIT (not a
   tidy slip), marker tape-tab labels, mismatched tilted accomplice
   stamps, a ruled-notebook confession, a polaroid evidence dropzone,
   and a slapped "file it & run" sticker bar. Heavy collage, tilt,
   ransom, halftone, redaction. Theme-aware via --snide-wall-text.
   ════════════════════════════════════════════════════════════════ */

const PX_MUTED = "color-mix(in srgb, var(--snide-wall-text) 55%, transparent)";

/* marker tape-tab label — no tidy rules */
function PxLabel({ children, meta, rot = -1.5 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 13 }}>
      <span style={{ display: "inline-block", background: "var(--acid)", color: "var(--ink)", fontFamily: "var(--f-marker)",
        fontSize: 17, lineHeight: 1.1, padding: "3px 13px", transform: `rotate(${rot}deg)`, boxShadow: "2px 2px 0 var(--pink)" }}>{children}</span>
      {meta && <span style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: PX_MUTED, whiteSpace: "nowrap" }}>{meta}</span>}
    </div>
  );
}

function SnidePraxisForm({ reportNo = "0666", task }) {
  const { SnideSigil } = window;
  const [mode, setMode] = React.useState("solo");
  const [stunt, setStunt] = React.useState("");
  const [confession, setConfession] = React.useState("");
  const [filed, setFiled] = React.useState(false);
  const [dropArmed, setDropArmed] = React.useState(false);
  const [dropped, setDropped] = React.useState(false);

  const wall = "var(--snide-wall-text)";
  const muted = PX_MUTED;
  const ink = "var(--ink)";

  const MODES = [
    { id: "solo", name: "LONE WOLF", sub: "no witnesses", rot: -2.5, shape: "square" },
    { id: "crew", name: "THE GANG", sub: "round up the mob", rot: 1.5, shape: "torn" },
    { id: "beef", name: "BEEF", sub: "1v1, settle it", rot: -1, shape: "square" },
  ];
  const words = confession.trim() ? confession.trim().split(/\s+/).length : 0;
  const TORN_TAB = "polygon(0 0,100% 0,100% 88%,93% 100%,82% 90%,68% 100%,54% 91%,40% 100%,26% 90%,13% 100%,0 90%)";

  return (
    <div style={{ position: "relative", fontFamily: "var(--font-body)", color: wall }}>

      {/* faint corner stamp */}
      <div aria-hidden="true" style={{ position: "absolute", top: 26, right: -6, transform: "rotate(11deg)", pointerEvents: "none",
        fontFamily: "var(--f-cond)", fontSize: 17, letterSpacing: "0.18em", color: "color-mix(in srgb, var(--pink) 38%, transparent)",
        border: "2.5px solid color-mix(in srgb, var(--pink) 38%, transparent)", padding: "5px 14px", borderRadius: 3 }}>PROPERTY OF NOBODY</div>

      {/* stamped masthead */}
      <div style={{ lineHeight: 0 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "var(--snide-green)", color: "#fff",
          padding: "8px 16px 8px 13px", transform: "rotate(-1.5deg)", boxShadow: "4px 4px 0 var(--pink)" }}>
          <SnideSigil size={17} color="var(--acid)" />
          <span style={{ fontFamily: "var(--f-cond)", fontSize: 18, letterSpacing: "0.14em", whiteSpace: "nowrap" }}>S.N.I.D.E. · RAP SHEET №{reportNo}</span>
        </div>
      </div>

      {/* big title */}
      <div style={{ position: "relative", display: "inline-block", margin: "20px 0 6px" }}>
        <div style={{ fontFamily: "var(--f-anton)", fontSize: 60, lineHeight: 0.86, letterSpacing: "0.02em", color: wall, transform: "skewX(-5deg)" }}>EDIT PRAXIS</div>
        <span style={{ position: "absolute", top: -8, right: -54, fontFamily: "var(--f-marker)", fontSize: 15, color: "var(--pink)", transform: "rotate(7deg)" }}>*allegedly</span>
      </div>

      {/* ── PINNED MUGSHOT EXHIBIT ─────────────────────────────────── */}
      <div style={{ position: "relative", margin: "26px 0 34px", maxWidth: 560 }}>
        {/* pushpin */}
        <div style={{ position: "absolute", top: -7, left: "44%", zIndex: 5, width: 16, height: 16, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #ff7ab8, var(--pink) 60%, #9c1457)", boxShadow: "1px 2px 2px rgba(0,0,0,0.45)" }} />
        <div style={{ position: "relative", display: "flex", background: "var(--paper)", color: ink, border: "1.5px solid " + ink,
          transform: "rotate(-1.5deg)", boxShadow: "5px 6px 0 rgba(0,0,0,0.3)", overflow: "hidden" }}>
          <div className="ht-dots" style={{ position: "absolute", inset: 0, color: "rgba(20,17,11,0.05)", pointerEvents: "none" }} />
          {/* mugshot (height chart, no face) */}
          <div style={{ position: "relative", flexShrink: 0, width: 98, background: ink, color: "var(--acid)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 6px",
            backgroundImage: "repeating-linear-gradient(180deg, transparent 0 13px, rgba(182,255,46,0.22) 13px 14px)" }}>
            <span style={{ fontFamily: "var(--f-anton)", fontSize: 38, lineHeight: 0.8 }}>?</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 7, letterSpacing: "0.16em", marginTop: 5, color: "#cfe6a0" }}>SUSPECT</span>
            <span style={{ fontFamily: "var(--f-cond)", fontSize: 12, letterSpacing: "0.1em", marginTop: 2 }}>№{reportNo}</span>
          </div>
          {/* details */}
          <div style={{ position: "relative", flex: 1, padding: "14px 16px 16px" }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 8.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6253" }}>Exhibit A · re: the incident —</div>
            <div style={{ fontFamily: "var(--f-anton)", fontSize: 30, lineHeight: 0.94, letterSpacing: "0.02em", color: ink, margin: "5px 0 0", transform: "skewX(-3deg)" }}>{task.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 11 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--snide-accent)", fontWeight: 700 }}>
                <span style={{ display: "inline-flex", width: 16, height: 16, borderRadius: "50%", background: ink, alignItems: "center", justifyContent: "center" }}><SnideSigil size={12} color="var(--acid)" /></span> S.N.I.D.E.
              </span>
              <span style={{ fontFamily: "var(--f-anton)", fontSize: 17, color: "var(--pink)" }}>{task.points} PTS</span>
              <span style={{ background: ink, color: "var(--acid)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px" }}>lvl {task.level}</span>
            </div>
            {/* OPEN CASE stamp */}
            <span style={{ position: "absolute", bottom: 10, right: 12, fontFamily: "var(--f-cond)", fontSize: 13, letterSpacing: "0.14em",
              color: "rgba(190,24,93,0.8)", border: "2.5px solid rgba(190,24,93,0.7)", padding: "2px 9px", transform: "rotate(-8deg)" }}>OPEN CASE</span>
          </div>
        </div>
        {/* tape corners */}
        <div className="tape" style={{ top: -8, left: 18, width: 50, height: 18, transform: "rotate(-12deg)" }} />
        <div className="tape" style={{ bottom: -7, right: 30, width: 50, height: 18, transform: "rotate(8deg)" }} />
      </div>

      {/* ── accomplices (mismatched tilted stamps) ─────────────────── */}
      <div style={{ marginBottom: 30 }}>
        <PxLabel rot={-2}>who's in on it?</PxLabel>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          {MODES.map((m) => {
            const on = mode === m.id;
            const torn = m.shape === "torn";
            return (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                position: "relative", cursor: "pointer", textAlign: "left", minWidth: 132,
                padding: torn ? "12px 18px 22px" : "12px 18px 14px",
                background: on ? "var(--acid)" : "transparent", color: on ? ink : wall,
                border: `2.5px solid ${on ? ink : "color-mix(in srgb, var(--snide-wall-text) 45%, transparent)"}`,
                clipPath: torn ? TORN_TAB : "none",
                boxShadow: on ? "4px 5px 0 var(--pink)" : "none",
                transform: `rotate(${m.rot}deg)${on ? " translate(-1px,-2px)" : ""}`, transition: "transform 110ms",
              }}>
                <div style={{ fontFamily: "var(--f-cond)", fontSize: 23, lineHeight: 1, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{m.name}</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 9.5, letterSpacing: "0.02em", marginTop: 3, opacity: on ? 0.85 : 0.7 }}>{m.sub}</div>
                {on && <div style={{ position: "absolute", top: 7, right: 9, width: 9, height: 9, borderRadius: "50%", background: "var(--pink)", boxShadow: "0 0 0 2px " + ink }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── the stunt (fill-in-the-blank) ──────────────────────────── */}
      <div style={{ marginBottom: 30 }}>
        <PxLabel meta={`${stunt.length}/200`} rot={1.5}>name the stunt</PxLabel>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <input value={stunt} onChange={(e) => setStunt(e.target.value.slice(0, 200))} placeholder="what'd you pull?"
            style={{ flex: 1, border: "none", borderBottom: "3px dashed " + wall, background: "transparent",
              fontFamily: "var(--f-cond)", fontSize: 27, letterSpacing: "0.02em", color: wall, padding: "4px 2px 7px", outline: "none" }} />
          <span style={{ fontFamily: "var(--f-marker)", fontSize: 14, color: "var(--pink)", whiteSpace: "nowrap", transform: "rotate(-3deg)", paddingBottom: 6 }}>← brag about it</span>
        </div>
      </div>

      {/* ── the confession (ruled notebook page) ───────────────────── */}
      <div style={{ marginBottom: 30 }}>
        <PxLabel meta={`${words} words · markdown ok`} rot={-1}>the confession</PxLabel>
        <div style={{ position: "relative" }}>
          <div className="tape" style={{ top: -8, left: 26, width: 56, height: 18, transform: "rotate(-5deg)", zIndex: 3 }} />
          <textarea value={confession} onChange={(e) => setConfession(e.target.value)} placeholder="so here's what went down…"
            rows={7} style={{ width: "100%", resize: "vertical", border: "1.5px solid " + ink, borderLeft: "4px solid var(--pink)",
              background: "var(--paper)",
              backgroundImage: "repeating-linear-gradient(180deg, transparent 0 27px, rgba(20,17,11,0.11) 27px 28px)",
              fontFamily: "var(--font-body)", fontSize: 13, lineHeight: "28px", color: ink, padding: "8px 14px 8px 18px", outline: "none" }} />
        </div>
      </div>

      {/* ── evidence (polaroid dropzone) ───────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <PxLabel meta="0 pinned" rot={2}>the evidence</PxLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <button style={{ cursor: "pointer", background: "var(--paper)", border: "2px dashed " + ink, padding: "10px 10px 22px",
            transform: "rotate(-3deg)", boxShadow: "3px 4px 0 rgba(0,0,0,0.2)" }}>
            <div style={{ width: 88, height: 64, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--f-anton)", fontSize: 30, color: "var(--pink)", lineHeight: 0.6 }}>+</span>
            </div>
            <div style={{ fontFamily: "var(--f-marker)", fontSize: 13, color: ink, marginTop: 7, textAlign: "center" }}>pin proof</div>
          </button>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10, fontStyle: "italic", color: muted, maxWidth: 200, lineHeight: 1.5 }}>mugshots · clips · receipts · max 50mb each. anonymity not guaranteed.</div>
        </div>
      </div>

      {/* ── file bar ───────────────────────────────────────────────── */}
      <div style={{ borderTop: "2px dashed color-mix(in srgb, var(--snide-wall-text) 25%, transparent)", paddingTop: 24,
        display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <button onClick={() => setFiled(true)} style={{ cursor: "pointer", border: "2px solid " + ink,
          background: filed ? "var(--snide-green)" : "var(--pink)", color: "#fff",
          fontFamily: "var(--f-black)", fontSize: 18, letterSpacing: "0.04em", padding: "14px 26px", whiteSpace: "nowrap",
          transform: "rotate(-1.5deg)", boxShadow: "4px 5px 0 " + ink }}>
          {filed ? "✓ ON THE RECORD" : "★ FILE IT & RUN ★"}
        </button>
        <button style={{ cursor: "pointer", border: "2px solid " + wall, background: "transparent",
          color: wall, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px 20px", transform: "rotate(0.5deg)" }}>Stash Draft</button>
        <button onClick={() => { if (dropped) { setDropped(false); setDropArmed(false); } else if (dropArmed) { setDropped(true); setDropArmed(false); setFiled(false); } else { setDropArmed(true); } }}
          style={{ cursor: "pointer", border: "2px solid " + ((dropArmed || dropped) ? "var(--pink)" : wall), background: "transparent",
          color: (dropArmed || dropped) ? "var(--pink)" : wall, fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase", padding: "13px 20px", transform: "rotate(-0.5deg)", transition: "all 150ms" }}>
          {dropped ? "✕ Ditched" : dropArmed ? "Ditch — Sure?" : "Ditch It"}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { SnidePraxisForm, PxLabel });
