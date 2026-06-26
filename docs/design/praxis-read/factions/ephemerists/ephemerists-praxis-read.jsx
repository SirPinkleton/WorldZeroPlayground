/* ════════════════════════════════════════════════════════════════
   THE EPHEMERISTS — Completed Praxis (read) surfaces
   A SEALED praxis is a filed ephemeris entry the faction now votes on.
   World Zero's 1–5 rating becomes THE CONCORDANCE — a wax-seal ramp
   (apocryphal → disputed → plausible → corroborated → canonical) that
   measures "how well does the filed truth hold up?". Two surfaces:
     · PraxisIndex  — the register of sealed praxes + their concordance
     · PraxisRead   — one sealed praxis in full, with the marks received
                      and the control to file your own.
   Reuses ephemerists-cards.jsx + ephemerists-faction.jsx atoms. The
   mark you file persists per-praxis in localStorage. Theme-aware.
   ════════════════════════════════════════════════════════════════ */

/* the faction's reframe of the 1–5 vote — the concordance ramp */
const CONCORD = [
  { v: 1, label: "apocryphal",   fill: "var(--eph-gold)",      ink: "var(--eph-ink)" },
  { v: 2, label: "disputed",     fill: "var(--eph-verdigris)", ink: "var(--eph-parchment)" },
  { v: 3, label: "plausible",    fill: "var(--eph-lapis)",     ink: "var(--eph-parchment)" },
  { v: 4, label: "corroborated", fill: "var(--eph-rubric)",    ink: "var(--eph-parchment)" },
  { v: 5, label: "canonical",    fill: "var(--eph-ink)",       ink: "var(--eph-gold-light)" },
];
const METHODS = {
  alone:   { name: "ALONE",      fill: "var(--eph-muted)" },
  concord: { name: "IN CONCORD", fill: "var(--eph-verdigris)" },
  dispute: { name: "IN DISPUTE", fill: "var(--eph-rubric)" },
};
const distTotal = (d) => d.reduce((a, b) => a + b, 0);
const distAvg = (d) => { const t = distTotal(d); return t ? d.reduce((a, c, i) => a + c * (i + 1), 0) / t : 0; };
const standing = (avg) => CONCORD[Math.max(0, Math.min(4, Math.round(avg) - 1))];

/* ── method chip ──────────────────────────────────────────────────── */
function MethodTag({ mode, big }) {
  const m = METHODS[mode] || METHODS.alone;
  return (
    <span style={{
      display: "inline-block", background: m.fill, color: "var(--eph-parchment)",
      fontFamily: "var(--eph-serif)", fontSize: big ? 9.5 : 8, fontWeight: 600,
      letterSpacing: "0.12em", textTransform: "uppercase", padding: big ? "3px 9px" : "2px 7px",
      transform: "rotate(-1deg)", whiteSpace: "nowrap",
    }}>{m.name}</span>
  );
}

/* ── compact concordance read-out for register rows ───────────────── */
/* a numeral avg + a five-bar tier sparkline + the marks count */
function ConcordSummary({ dist }) {
  const total = distTotal(dist), avg = distAvg(dist), max = Math.max(1, ...dist), st = standing(avg);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 30 }}>
        {dist.map((c, i) => (
          <div key={i} title={`${CONCORD[i].label}: ${c}`} style={{
            width: 7, height: Math.max(3, (c / max) * 30), background: CONCORD[i].fill,
            opacity: c ? 1 : 0.28, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.25)",
          }} />
        ))}
      </div>
      <div style={{ textAlign: "left", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{ fontFamily: "var(--eph-display)", fontWeight: 800, fontSize: 19, lineHeight: 1, color: st.fill === "var(--eph-ink)" ? "var(--eph-vellum-text)" : st.fill }}>{avg.toFixed(1)}</span>
          <span style={{ fontFamily: "var(--eph-serif)", fontStyle: "italic", fontSize: 9.5, letterSpacing: "0.02em", color: "var(--eph-muted)" }}>{st.label}</span>
        </div>
        <div style={{ fontFamily: "var(--eph-serif)", fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--eph-muted)", marginTop: 2 }}>{total} marks</div>
      </div>
    </div>
  );
}

/* ── register row — one sealed praxis ─────────────────────────────── */
function PraxisRow({ p, href }) {
  const tw = p.finding.trim().split(" ");
  const tlast = tw.pop();
  return (
    <a className="prx-row" href={href}>
      <div className="prx-cat">
        <span className="prx-no">№ {p.entryNo}</span>
        <span className="prx-seal" aria-hidden="true">✦</span>
      </div>
      <div className="prx-main">
        <div className="prx-finding">{tw.join(" ")}{tw.length ? " " : ""}<span style={{ color: "var(--eph-lapis)" }}>{tlast}</span></div>
        <div className="prx-byline">
          <span style={{ color: "var(--eph-rubric)", fontStyle: "italic" }}>re: {p.task}</span>
          <span className="prx-dot">·</span>
          <span>filed by <b style={{ color: "var(--eph-vellum-text)", fontStyle: "normal" }}>{p.actor}</b></span>
          <MethodTag mode={p.mode} />
          <span className="prx-pts">{p.points} pvncta</span>
        </div>
      </div>
      <div className="prx-vote"><ConcordSummary dist={p.dist} /></div>
      <span className="prx-go" aria-hidden="true">→</span>
    </a>
  );
}

/* ── the register ─────────────────────────────────────────────────── */
function PraxisIndex({ praxes, hrefFor }) {
  const [filter, setFilter] = React.useState("all");
  const FILTERS = [
    { id: "all", name: "All sealed" },
    { id: "canonical", name: "Holds (IV–V)" },
    { id: "dispute", name: "In dispute" },
    { id: "alone", name: "Single observer" },
  ];
  const rows = praxes.filter((p) => {
    if (filter === "all") return true;
    if (filter === "canonical") return distAvg(p.dist) >= 3.5;
    if (filter === "dispute") return p.mode === "dispute" || distAvg(p.dist) < 2.5;
    if (filter === "alone") return p.mode === "alone";
    return true;
  });
  const totalMarks = praxes.reduce((a, p) => a + distTotal(p.dist), 0);

  return (
    <React.Fragment>
      {/* register masthead */}
      <div className="prx-masthead">
        <div className="prx-mast-l">
          <div className="prx-kicker">The Ephemerists · the sealed record</div>
          <h1 className="prx-h1">THE <span style={{ color: "var(--eph-lapis)" }}>PRAXES</span></h1>
          <div className="prx-mast-rule" />
          <p className="prx-mast-sub">Findings entered in the ephemeris and put to the concordance. <em>Every sealed truth is open to a mark — see how well it holds.</em></p>
        </div>
        <div className="prx-mast-r">
          <div className="prx-stat"><b>{praxes.length}</b><span>sealed praxes</span></div>
          <div className="prx-stat"><b>{totalMarks}</b><span>marks filed</span></div>
        </div>
      </div>

      {/* filter strip */}
      <div className="prx-filters">
        {FILTERS.map((f) => (
          <button key={f.id} className={"prx-filter" + (filter === f.id ? " on" : "")} onClick={() => setFilter(f.id)}>{f.name}</button>
        ))}
        <span className="prx-count">{rows.length} of {praxes.length}</span>
      </div>

      {/* column heads */}
      <div className="prx-heads">
        <span>Entry</span>
        <span>The finding</span>
        <span style={{ textAlign: "right" }}>The concordance</span>
      </div>

      <div className="prx-list">
        {rows.map((p) => <PraxisRow key={p.id} p={p} href={hrefFor(p)} />)}
        {rows.length === 0 && <div className="prx-empty">No sealed praxes under this lens — <span style={{ color: "var(--eph-lapis)", fontStyle: "italic" }}>the margin stays blank.</span></div>}
      </div>
    </React.Fragment>
  );
}

/* ════════════════════════════════════════════════════════════════
   THE READ PAGE — one sealed praxis, the marks it has received, and
   the control to file your own.
   ════════════════════════════════════════════════════════════════ */

/* a subtly-striped specimen placeholder the user drops real evidence into */
function Specimen({ label, kind }) {
  return (
    <figure style={{ margin: 0, border: "1px solid var(--eph-ink)", background: "var(--eph-vellum)", overflow: "hidden" }}>
      <div style={{
        height: 96, position: "relative",
        backgroundImage: "repeating-linear-gradient(45deg, color-mix(in srgb, var(--eph-lapis) 14%, transparent) 0 6px, transparent 6px 12px)",
        backgroundColor: "color-mix(in srgb, var(--eph-vellum) 60%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "var(--font-faction-mono, monospace)", fontSize: 9, letterSpacing: "0.08em", color: "var(--eph-muted)", background: "color-mix(in srgb, var(--eph-vellum) 86%, transparent)", padding: "3px 7px" }}>{kind}</span>
      </div>
      <figcaption style={{ fontFamily: "var(--eph-serif)", fontSize: 9.5, fontStyle: "italic", color: "var(--eph-muted)", padding: "7px 9px", borderTop: "1px solid color-mix(in srgb, var(--eph-vellum-text) 22%, transparent)" }}>{label}</figcaption>
    </figure>
  );
}

/* the concordance meter — distribution histogram + headline standing */
function ConcordMeter({ dist }) {
  const total = distTotal(dist), avg = distAvg(dist), max = Math.max(1, ...dist), st = standing(avg);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--eph-display)", fontWeight: 800, fontSize: 46, lineHeight: 0.8, color: st.fill === "var(--eph-ink)" ? "var(--eph-vellum-text)" : st.fill }}>{avg.toFixed(1)}</span>
        <div>
          <div style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--eph-rubric)" }}>{st.label}</div>
          <div style={{ fontFamily: "var(--eph-serif)", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--eph-muted)", marginTop: 1 }}>{total} marks filed</div>
        </div>
      </div>
      {/* per-tier distribution */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
        {CONCORD.slice().reverse().map((s) => {
          const c = dist[s.v - 1];
          return (
            <div key={s.v} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 70, textAlign: "right", fontFamily: "var(--eph-serif)", fontSize: 9.5, fontStyle: "italic", color: "var(--eph-muted)", whiteSpace: "nowrap" }}>{s.label}</span>
              <div style={{ flex: 1, height: 12, background: "color-mix(in srgb, var(--eph-vellum-text) 9%, transparent)", position: "relative", border: "1px solid color-mix(in srgb, var(--eph-vellum-text) 18%, transparent)" }}>
                <div style={{ position: "absolute", inset: 0, width: `${(c / max) * 100}%`, background: s.fill, opacity: c ? 0.92 : 0 }} />
              </div>
              <span style={{ width: 22, fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 12, color: "var(--eph-vellum-text)", textAlign: "right" }}>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* the interactive control — file your mark (persists per praxis) */
function MarkCaster({ praxisId, baseDist }) {
  const key = "eph-mark-" + praxisId;
  const [my, setMy] = React.useState(0);
  React.useEffect(() => {
    try { const v = +localStorage.getItem(key); if (v >= 1 && v <= 5) setMy(v); } catch (e) {}
  }, [key]);
  const cast = (v) => { const nv = my === v ? 0 : v; setMy(nv); try { nv ? localStorage.setItem(key, String(nv)) : localStorage.removeItem(key); } catch (e) {} };
  const live = baseDist.map((c, i) => c + (my === i + 1 ? 1 : 0));

  return (
    <div>
      <ConcordMeter dist={live} />

      <div style={{ height: 1, background: "color-mix(in srgb, var(--eph-vellum-text) 18%, transparent)", margin: "20px 0 16px" }} />

      <div style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--eph-rubric)", marginBottom: 3 }}>File your mark</div>
      <div style={{ fontFamily: "var(--eph-serif)", fontSize: 11, fontStyle: "italic", color: "var(--eph-muted)", marginBottom: 14 }}>how well does this truth hold up?</div>

      {/* the wax-seal concordance ramp */}
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        {CONCORD.map((s) => {
          const on = my >= s.v;
          const picked = my === s.v;
          return (
            <div key={s.v} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <button onClick={() => cast(s.v)} aria-label={`${s.v} — ${s.label}`} style={{
                position: "relative", width: 44, height: 44, cursor: "pointer", padding: 0, borderRadius: "50%",
                border: "2px solid var(--eph-ink)",
                background: on ? s.fill : "var(--eph-vellum)", color: on ? s.ink : "var(--eph-muted)",
                fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 15, lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: picked ? "rotate(-6deg) scale(1.1)" : "none", transition: "all 110ms",
                boxShadow: on ? "inset 0 -2px 4px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.18)" : "none",
              }}>
                <span style={{ position: "absolute", inset: 3, borderRadius: "50%", border: `1px dashed ${on ? "color-mix(in srgb, #fff 40%, transparent)" : "color-mix(in srgb, var(--eph-vellum-text) 28%, transparent)"}`, pointerEvents: "none" }} />
                {window.EPH_toRoman(s.v)}
              </button>
              <span style={{ fontFamily: "var(--eph-serif)", fontSize: 8, fontStyle: "italic", letterSpacing: "0.02em", color: picked ? "var(--eph-rubric)" : "var(--eph-muted)", maxWidth: 54, textAlign: "center", lineHeight: 1.2 }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, fontFamily: "var(--eph-serif)", fontSize: 11.5, fontStyle: "italic", lineHeight: 1.5,
        color: my ? "var(--eph-verdigris)" : "var(--eph-muted)" }}>
        {my
          ? <span>✦ your mark — <b style={{ fontStyle: "normal", color: standing(my).fill === "var(--eph-ink)" ? "var(--eph-vellum-text)" : standing(my).fill }}>{CONCORD[my - 1].label}</b> — is filed. the concordance now stands at <b style={{ fontStyle: "normal", color: "var(--eph-rubric)" }}>{distAvg(live).toFixed(1)}</b> across {distTotal(live)} marks. <span style={{ color: "var(--eph-lapis)", textDecoration: "underline" }}>amend ↺</span></span>
          : <span>↳ no mark from you yet — the record waits.</span>}
      </div>
    </div>
  );
}

/* full read view */
function PraxisRead({ p }) {
  const { EPH_EphMark, EPH_Foxing, EPH_toRoman, EphAvatar } = window;
  const tw = p.finding.trim().split(" ");
  const tlast = tw.pop();
  const Avatar = EphAvatar || (() => null);

  return (
    <div style={{ fontFamily: "var(--eph-serif)", color: "var(--eph-vellum-text)" }}>
      {/* masthead running-head */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, flexWrap: "wrap",
        padding: "8px 0 7px", borderTop: "1px solid var(--eph-gold-deep)", borderBottom: "1px solid var(--eph-gold-deep)",
        boxShadow: "0 2px 0 -1px color-mix(in srgb, var(--eph-lapis) 55%, transparent)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "var(--eph-rubric)", fontFamily: "var(--eph-display)", fontWeight: 600, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          <EPH_EphMark size={14} color="var(--eph-lapis)" /> The Ephemerists · ephemeris entry №{p.entryNo}
        </span>
        <span style={{ fontFamily: "var(--eph-serif)", fontSize: 9.5, letterSpacing: "0.06em", color: "var(--eph-muted)", whiteSpace: "nowrap" }}>{p.coords} &nbsp;·&nbsp; sealed {p.sealed}</span>
      </div>

      {/* status line */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 2px", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--eph-ink)", color: "var(--eph-gold-light)",
          fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", padding: "5px 12px", whiteSpace: "nowrap" }}>
          ✦ Sealed · under concordance
        </span>
        <MethodTag mode={p.mode} big />
        <span style={{ fontFamily: "var(--eph-serif)", fontStyle: "italic", fontSize: 11, color: "var(--eph-muted)" }}>re: <span style={{ color: "var(--eph-rubric)" }}>{p.task}</span> · grade {EPH_toRoman(p.level)}</span>
      </div>

      {/* the finding headline */}
      <h1 style={{ fontFamily: "var(--eph-display)", fontWeight: 800, fontSize: 46, lineHeight: 1.1, letterSpacing: "0.01em", margin: "12px 0 14px", color: "var(--eph-vellum-text)" }}>
        {tw.join(" ")}{tw.length ? " " : ""}<span style={{ color: "var(--eph-lapis)" }}>{tlast}</span><sup style={{ fontFamily: "var(--eph-serif)", fontSize: 18, color: "var(--eph-lapis)", fontWeight: 400 }}>†</sup>
      </h1>
      <div style={{ fontFamily: "var(--eph-script)", fontStyle: "italic", fontSize: 17, color: "var(--eph-muted)", margin: "2px 0 16px" }}>{p.gloss}</div>

      {/* byline */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 18, marginBottom: 22, borderBottom: "1px dashed color-mix(in srgb, var(--eph-vellum-text) 26%, transparent)" }}>
        <Avatar gradient={p.gradient} size={40} />
        <div style={{ lineHeight: 1.4, whiteSpace: "nowrap", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--eph-serif)", fontSize: 14 }}>filed by <b>{p.actor}</b></div>
          <div style={{ fontFamily: "var(--eph-serif)", fontSize: 10.5, fontStyle: "italic", color: "var(--eph-muted)" }}>{p.role}</div>
        </div>
        <span style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 18, color: "var(--eph-rubric)", marginLeft: "auto", flexShrink: 0 }}>{p.points} pvncta</span>
      </div>

      {/* THE ACCOUNT */}
      <div style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--eph-rubric)", marginBottom: 12 }}>The account</div>
      <div style={{ fontFamily: "var(--eph-serif)", fontSize: 15.5, lineHeight: 1.72, color: "var(--eph-vellum-text)" }}>
        {p.account.map((para, i) => (
          <p key={i} style={{ margin: i ? "14px 0 0" : 0, textWrap: "pretty" }} dangerouslySetInnerHTML={{ __html: para }} />
        ))}
      </div>
      <div style={{ fontFamily: "var(--eph-serif)", fontSize: 11, fontStyle: "italic", color: "var(--eph-muted)", margin: "16px 0 0", lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: p.footnote }} />

      {/* THE EVIDENCE */}
      <div style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--eph-rubric)", margin: "30px 0 12px" }}>The evidence <span style={{ fontFamily: "var(--eph-serif)", fontWeight: 400, fontStyle: "italic", fontSize: 10, letterSpacing: "0.04em", textTransform: "none", color: "var(--eph-muted)" }}>· {p.evidence.length} specimens pinned</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {p.evidence.map((e, i) => <Specimen key={i} kind={e.kind} label={e.label} />)}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/* shared dataset — sealed praxes (the read page features the first) */
const G_AV = {
  vesper:  "radial-gradient(circle at 32% 28%, #8fb0c4, #2d6285 72%, #14303f)",
  margin:  "radial-gradient(circle at 32% 28%, #d8b25a, #9c7626 72%, #5e4715)",
  cartouche:"radial-gradient(circle at 32% 28%, #c98aa6, #8a3d5e 72%, #54223a)",
  almanac: "radial-gradient(circle at 32% 28%, #9fc0a0, #4a7d70 72%, #28473f)",
  quill:   "radial-gradient(circle at 32% 28%, #b9a7c9, #6b4f86 72%, #3a2850)",
};

const EPH_PRAXES = [
  {
    id: "trace-a-myth", entryNo: "MMXXVI·041", task: "Trace a Myth", level: 4, points: 100,
    actor: "Vesper", role: "ephemerist · third circuit", gradient: G_AV.vesper, mode: "alone",
    coords: "41°54′N · 12°29′E", sealed: "Apr 21, 2026",
    finding: "THE SAINT WAS A SURVEYOR",
    gloss: "the miracle, traced back, is a measurement",
    // dist = counts at [I apocryphal, II disputed, III plausible, IV corroborated, V canonical]
    dist: [1, 2, 7, 19, 18],
    account: [
      "The legend holds that St. Verro crossed from the sea to the capital in a single night, and a road rose behind his feet as he walked. I followed it backward through every retelling I could lay hands on — eleven of them, in four tongues — until the road ran out.",
      "The earliest copy is not a life of a saint at all. It is a surveyor's day-book. <span style=\"color:var(--eph-lapis)\">Verro</span> is not a name; it is a column heading — <em>verum</em>, the true line — ruled down a page of measured stations from the shore to the gates. The night of the miracle is a working season, compressed by three centuries of telling into a single dark.",
      "So the road did rise behind him, in the only sense that survives scrutiny: he set the stones' positions before anyone walked them. The man was real, the walk was real, and the marvel is that a ledger outlived the church that borrowed it.",
    ],
    footnote: "† the day-book's final station carries no coordinate — the line simply stops being recorded. where the saint is said to have ascended, the surveyor merely ran out of page. <span style=\"color:var(--eph-lapis)\">see †</span>",
    evidence: [
      { kind: "rubbing", label: "milestone VII, north face — the ruled stations" },
      { kind: "transcript", label: "day-book fol. 12r, the 'Verro' column heading" },
      { kind: "map overlay", label: "the eleven retellings, georeferenced" },
    ],
  },
  {
    id: "lost-cubit", entryNo: "MMXXVI·028", task: "Recover a Lost Unit of Measure", level: 5, points: 500,
    actor: "Vesper", role: "ephemerist · third circuit", gradient: G_AV.vesper, mode: "alone",
    coords: "30°02′N · 31°14′E", sealed: "Apr 18, 2026",
    finding: "THE CUBIT MOVED A QUARTER-INCH",
    gloss: "the same rule, measured twice, disagreed with itself",
    dist: [0, 1, 4, 11, 9],
    account: ["The cubit cut into the temple's inner wall ran a quarter-inch longer than the cubit cut into its outer wall — the same rule, the same hand, a generation apart."],
    footnote: "† which cubit is the true cubit? both. neither. the record keeps them both. <span style=\"color:var(--eph-lapis)\">see †</span>",
    evidence: [{ kind: "rubbing", label: "inner-wall standard" }, { kind: "rubbing", label: "outer-wall standard" }],
  },
  {
    id: "dead-road", entryNo: "MMXXVI·036", task: "Walk a Dead Road", level: 3, points: 25,
    actor: "Almanac Okonkwo", role: "ephemerist · cartographer", gradient: G_AV.almanac, mode: "alone",
    coords: "37°58′N · 23°43′E", sealed: "Apr 19, 2026",
    finding: "THE INN PREDATES ITS ROAD",
    gloss: "the house was built for a road that came forty years late",
    dist: [0, 3, 9, 6, 2],
    account: ["The roadside inn carries a founding stone four decades older than the road it serves. It was raised for traffic that did not yet exist — and the traffic, eventually, obliged."],
    footnote: "† who tells the road where to run? sometimes, a man who guesses early. <span style=\"color:var(--eph-lapis)\">see †</span>",
    evidence: [{ kind: "photo", label: "the founding stone, dated" }],
  },
  {
    id: "the-bell", entryNo: "—", task: "A Bell Heard in Three Centuries", level: 2, points: 5,
    actor: "Day Cartouche", role: "ephemerist · disputant", gradient: G_AV.cartouche, mode: "dispute",
    coords: "48°51′N · 2°21′E", sealed: "Apr 19, 2026",
    finding: "ONE BELL, THREE CASTINGS",
    gloss: "the same toll, recast twice, never the same bell",
    dist: [6, 11, 4, 1, 0],
    account: ["Three chronicles, three centuries apart, each record the 'same' famous bell. They cannot be: the metal was melted and recast twice. The toll is continuous; the bell is not. The account remains contested."],
    footnote: "† a thing that is replaced part by part — is it the same thing? the disputants still differ. <span style=\"color:var(--eph-lapis)\">see †</span>",
    evidence: [{ kind: "transcript", label: "the three chronicle entries, aligned" }],
  },
  {
    id: "first-teller", entryNo: "—", task: "Name the First Teller", level: 4, points: 200,
    actor: "Quill Anselm", role: "ephemerist · first circuit", gradient: G_AV.quill, mode: "dispute",
    coords: "55°57′N · 3°11′W", sealed: "Apr 16, 2026",
    finding: "THE FIRST TELLER LEFT NO NAME",
    gloss: "every origin is itself a retelling",
    dist: [9, 7, 3, 1, 0],
    account: ["Traced the tale to its earliest written form, then found that form citing an earlier one, now lost. The first teller cannot be named because there is no first telling — only the next-oldest copy, all the way down."],
    footnote: "† this finding is itself a retelling; someone will trace it back. <span style=\"color:var(--eph-lapis)\">see †</span>",
    evidence: [{ kind: "transcript", label: "the citation chain, six deep" }],
  },
  {
    id: "two-maps", entryNo: "MMXXVI·033", task: "Where the Two Maps Disagree", level: 3, points: 60,
    actor: "Marginalia", role: "ephemerist · in concord with Vesper", gradient: G_AV.margin, mode: "concord",
    coords: "51°30′N · 0°07′W", sealed: "Apr 17, 2026",
    finding: "THE RIVER MOVED, THE MAP DID NOT",
    gloss: "two surveys, one place, a century of silt between them",
    dist: [0, 2, 6, 12, 7],
    account: ["Two surveys of the same parish disagree by ninety yards at the waterline. Neither is wrong: the river migrated. The maps are both true — of different rivers wearing the same name."],
    footnote: "† the ground does not hold still for the map. we record the disagreement, not the winner. <span style=\"color:var(--eph-lapis)\">see †</span>",
    evidence: [{ kind: "map overlay", label: "1788 survey vs. 1891 survey" }, { kind: "photo", label: "the present waterline" }],
  },
];

Object.assign(window, {
  EPH_CONCORD: CONCORD, EPH_PRAXES,
  PraxisIndex, PraxisRead, PraxisRow, ConcordSummary, ConcordMeter, MarkCaster, MethodTag, Specimen,
  EPH_distAvg: distAvg, EPH_distTotal: distTotal,
});
