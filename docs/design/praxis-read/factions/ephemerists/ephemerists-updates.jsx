/* ════════════════════════════════════════════════════════════════
   THE EPHEMERISTS — Updates feed
   World Zero's stock activity card (avatar · actor · action · badge ·
   time → task reference → optional status) elevated into the Ephemerist
   archetype: a torn leaf from the faction's ephemeris. A lapis spine
   with gold notches, foxed vellum, a Cinzel task title with one word in
   the blue, a wax-seal points medallion, and a self-referential
   footnote. Reuses ephemerists-cards.jsx atoms. Theme-aware.
   ════════════════════════════════════════════════════════════════ */

/* ── small wax-seal points medallion ───────────────────────────────── */
function WaxSeal({ points, size = 46, color = "var(--eph-rubric)", rotate = -8 }) {
  return (
    <div style={{
      width: size, height: size, transform: `rotate(${rotate}deg)`, flexShrink: 0,
      borderRadius: "47% 53% 50% 50% / 52% 48% 52% 48%",
      background: `radial-gradient(circle at 36% 30%, color-mix(in srgb, ${color} 70%, #fff 18%), ${color} 58%, var(--eph-rubric-deep))`,
      boxShadow: "inset 0 2px 4px rgba(255,255,255,0.18), inset 0 -3px 5px rgba(0,0,0,0.35), 0 2px 3px rgba(0,0,0,0.3)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      color: "var(--eph-parchment)", lineHeight: 1,
    }}>
      <span style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: size * 0.34 }}>{points}</span>
      <span style={{ fontFamily: "var(--eph-serif)", fontSize: 5.5, letterSpacing: "0.14em", marginTop: 1, opacity: 0.85 }}>PVNCTA</span>
    </div>
  );
}

/* ── faction avatar: player avatar in an Ephemerist membership ring ─── */
function EphAvatar({ gradient, size = 38 }) {
  const { EPH_EphMark } = window;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: gradient,
        boxShadow: "0 0 0 2px var(--eph-ink), 0 0 0 4px var(--eph-vellum)" }} />
      <div style={{ position: "absolute", right: -4, bottom: -4, width: 17, height: 17, borderRadius: "50%",
        background: "var(--eph-lapis)", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 0 1.5px var(--eph-vellum)" }}>
        <EPH_EphMark size={11} color="var(--eph-gold-light)" />
      </div>
    </div>
  );
}

/* ── action badge as an inked stamp ────────────────────────────────── */
const STAMP_KIND = {
  foe:    { bg: "var(--eph-rubric)",    fg: "var(--eph-parchment)", rot: -2.5 },
  duel:   { bg: "var(--eph-rubric)",    fg: "var(--eph-parchment)", rot:  2 },
  collab: { bg: "var(--eph-verdigris)", fg: "var(--eph-parchment)", rot: -1.5 },
  yours:  { bg: "var(--eph-gold)",      fg: "var(--eph-ink)",       rot:  2 },
  friend: { bg: "var(--eph-lapis)",     fg: "var(--eph-parchment)", rot: -2 },
};
function ActionStamp({ label, kind = "foe" }) {
  const k = STAMP_KIND[kind] || STAMP_KIND.foe;
  return (
    <span style={{
      position: "relative", display: "inline-block", background: k.bg, color: k.fg,
      fontFamily: "var(--eph-serif)", fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
      textTransform: "uppercase", padding: "3px 8px", transform: `rotate(${k.rot}deg)`,
      verticalAlign: "middle", whiteSpace: "nowrap",
    }}>
      <span style={{ position: "absolute", inset: 2, border: "1px dashed rgba(255,255,255,0.35)", pointerEvents: "none" }} />
      {label}
    </span>
  );
}

/* ── status footer ─────────────────────────────────────────────────── */
function StatusLine({ status }) {
  if (!status) return null;
  const tones = { accepted: "var(--eph-verdigris)", declined: "var(--eph-muted)", pending: "var(--eph-gold-deep)" };
  const color = tones[status.kind] || "var(--eph-muted)";
  return (
    <div style={{
      marginTop: 11, paddingTop: 9, borderTop: "1px dashed color-mix(in srgb, var(--eph-vellum-text) 22%, transparent)",
      fontFamily: "var(--eph-serif)", fontSize: 10, fontWeight: 600, fontStyle: "italic", letterSpacing: "0.04em", color,
    }}>
      {status.label}
    </div>
  );
}

/* ── the activity card — a leaf from the ephemeris ─────────────────── */
/* No colored spine. Instead: an ephemeris running-head (catalogue no. +
   coordinates + time) over faint ledger scribe-rules, the way a real
   astronomical table is laid out. */
function EphemeristActivityCard({ actor, gradient, action, badge, time, task, meta, status, completed, footnote, entryNo, coords = "41°54′N · 12°29′E" }) {
  const { EPH_Foxing, EPH_toRoman, EPH_SacredGeometry } = window;
  const tw = (task.title || "").trim().split(" ");
  const tlast = tw.pop();
  const cat = entryNo || EPH_toRoman(task.points || 1);
  return (
    <article style={{
      position: "relative", background: "var(--eph-vellum)", color: "var(--eph-vellum-text)",
      border: "1px solid color-mix(in srgb, var(--eph-vellum-text) 30%, transparent)",
      marginBottom: 18, overflow: "hidden", boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 8px 20px -16px rgba(0,0,0,0.6)",
      fontFamily: "var(--eph-serif)",
    }}>
      {/* sacred-geometry watermark — a Flower of Life bleeding off the fore-edge
         so the leaf no longer reads as a plain rectangle */}
      <div style={{ position: "absolute", right: -96, top: "50%", transform: "translateY(-50%)", zIndex: 1,
        opacity: 0.12, color: "var(--eph-lapis)", pointerEvents: "none" }}>
        <EPH_SacredGeometry size={300} rings={3} color="var(--eph-lapis)" stroke={0.7} spokes={12} />
      </div>
      {/* a small verdigris vesica/seed bleeding off the binding edge */}
      <div style={{ position: "absolute", left: -54, top: -34, zIndex: 1,
        opacity: 0.09, color: "var(--eph-verdigris)", pointerEvents: "none" }}>
        <EPH_SacredGeometry size={150} rings={2} color="var(--eph-verdigris)" stroke={0.7} />
      </div>
      <EPH_Foxing opacity={0.4} />

      {/* running head — catalogue no. + coordinates + time */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10,
        padding: "7px 15px 6px", borderBottom: "1px solid var(--eph-gold-deep)", boxShadow: "0 2px 0 -1px color-mix(in srgb, var(--eph-lapis) 55%, transparent)" }}>
        <span style={{ fontFamily: "var(--eph-serif)", fontSize: 8.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--eph-rubric)" }}>Ephemeris · entry {cat}</span>
        <span style={{ fontFamily: "var(--eph-serif)", fontSize: 8.5, letterSpacing: "0.06em", color: "var(--eph-muted)", whiteSpace: "nowrap" }}>{coords} &nbsp;·&nbsp; {time}</span>
      </div>

      <div style={{ position: "relative", zIndex: 2, padding: "12px 15px 13px" }}>
        {/* who + what */}
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <EphAvatar gradient={gradient} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", lineHeight: 1.4, minWidth: 0 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--eph-vellum-text)", whiteSpace: "nowrap" }}>{actor}</span>
            <span style={{ fontSize: 12, fontStyle: "italic", color: "var(--eph-muted)", whiteSpace: "nowrap" }}>{action}</span>
            {badge && <ActionStamp label={badge.label} kind={badge.kind} />}
          </div>
        </div>

        {/* the finding — a ledger line: title left, reading (seal) right */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 13, marginTop: 11 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 23, lineHeight: 0.98, letterSpacing: "0.01em" }}>
              {tw.join(" ")}{tw.length ? " " : ""}<span style={{ color: "var(--eph-lapis)" }}>{tlast}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 15, color: "var(--eph-rubric)", whiteSpace: "nowrap" }}>{task.points} pvncta</span>
              {task.level != null && (
                <span style={{ background: "var(--eph-ink)", color: "var(--eph-parchment)", fontFamily: "var(--eph-serif)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px" }}>grade {EPH_toRoman(task.level)}</span>
              )}
              {meta && <span style={{ fontSize: 10, fontStyle: "italic", letterSpacing: "0.04em", color: "var(--eph-muted)" }}>{meta}</span>}
            </div>
          </div>
          {completed && (
            <div style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Seed-of-Life halo cradling the seal — the impression sits in a rosette */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.75, color: "var(--eph-gold-deep)", pointerEvents: "none" }}>
                <EPH_SacredGeometry size={86} rings={1} color="var(--eph-gold-deep)" stroke={0.8} spokes={12} />
              </div>
              <WaxSeal points={task.points} size={46} rotate={-8} />
            </div>
          )}
        </div>

        <StatusLine status={status} />
        {footnote && <div style={{ fontFamily: "var(--eph-serif)", fontSize: 9, fontStyle: "italic", color: "var(--eph-muted)", marginTop: 8, lineHeight: 1.4 }}>{footnote}</div>}
      </div>
    </article>
  );
}

Object.assign(window, { EphemeristActivityCard, EphAvatar, EphWaxSeal: WaxSeal });
