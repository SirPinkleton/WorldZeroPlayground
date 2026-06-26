/* ════════════════════════════════════════════════════════════════
   THE EVERYMEN — Updates feed
   A faction-affiliated activity card. Same information architecture as
   World Zero's stock feed card (avatar · actor · action · badge · time,
   then a task reference, then an optional status line), but elevated into
   the Everymen physical archetype — a printed union dispatch slip:
   red masthead spine, manila paper + halftone, Bebas task title, rubber-
   stamp action badge, stamped points seal. Reuses the poster atoms that
   everymen-cards.jsx put on window. Theme-aware via everymen.css tokens.
   ════════════════════════════════════════════════════════════════ */

/* ── faction avatar: player avatar in an Everymen membership ring ───── */
function EmAvatar({ gradient, size = 38 }) {
  const { EM_CogMark } = window;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%", background: gradient,
        boxShadow: "0 0 0 2px var(--everymen-ink), 0 0 0 4px var(--everymen-paper)",
      }} />
      {/* faction membership badge */}
      <div style={{
        position: "absolute", right: -4, bottom: -4, width: 17, height: 17, borderRadius: "50%",
        background: "var(--everymen-red)", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 0 1.5px var(--everymen-paper)",
      }}>
        <EM_CogMark size={11} color="var(--everymen-cream)" />
      </div>
    </div>
  );
}

/* ── action badge as a rubber stamp (poster ink set) ───────────────── */
const STAMP_KIND = {
  foe:        { bg: "var(--everymen-red)",   fg: "var(--everymen-cream)", rot: -2.5 },
  duel:       { bg: "var(--everymen-red)",   fg: "var(--everymen-cream)", rot:  2 },
  collab:     { bg: "var(--everymen-olive)", fg: "var(--everymen-cream)", rot: -1.5 },
  yours:      { bg: "var(--everymen-gold)",  fg: "var(--everymen-ink)",   rot:  2 },
  friend:     { bg: "var(--everymen-olive)", fg: "var(--everymen-cream)", rot: -2 },
};
function ActionStamp({ label, kind = "foe" }) {
  const k = STAMP_KIND[kind] || STAMP_KIND.foe;
  return (
    <span style={{
      position: "relative", display: "inline-block", background: k.bg, color: k.fg,
      fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
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
  const tones = {
    accepted: "var(--everymen-olive)",
    declined: "var(--everymen-muted)",
    pending:  "var(--everymen-gold-deep)",
  };
  const color = tones[status.kind] || "var(--everymen-muted)";
  return (
    <div style={{
      marginTop: 11, paddingTop: 9, borderTop: "1px dashed color-mix(in srgb, var(--everymen-paper-text) 22%, transparent)",
      fontFamily: "var(--font-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color,
    }}>
      {status.label}
    </div>
  );
}

/* ── woven paper texture (burlap crosshatch + warm mottle) ─────────── */
function PaperWeave() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
      backgroundImage: [
        "repeating-linear-gradient(45deg, color-mix(in srgb, var(--everymen-paper-text) 7%, transparent) 0 1px, transparent 1px 4px)",
        "repeating-linear-gradient(-45deg, color-mix(in srgb, var(--everymen-paper-text) 5%, transparent) 0 1px, transparent 1px 4px)",
        "radial-gradient(130% 90% at 5% 0%, color-mix(in srgb, var(--everymen-cream) 18%, transparent), transparent 55%)",
        "radial-gradient(120% 85% at 100% 100%, color-mix(in srgb, var(--everymen-paper-deep) 65%, transparent), transparent 52%)",
      ].join(", "),
    }} />
  );
}

/* ── the activity card ─────────────────────────────────────────────── */
function EverymenActivityCard({ actor, gradient, action, badge, time, task, meta, status, completed }) {
  const { EM_Halftone, EM_PointsSeal, EM_Sunburst } = window;
  return (
    <article style={{
      position: "relative", background: "var(--everymen-paper)", color: "var(--everymen-paper-text)",
      border: "1px solid color-mix(in srgb, var(--everymen-paper-text) 26%, transparent)",
      borderLeft: "none", marginBottom: 18, overflow: "hidden",
      boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 6px 16px -12px rgba(0,0,0,0.5)",
      fontFamily: "var(--font-body)", display: "flex",
    }}>
      {/* red masthead spine with cream notches (union ribbon) */}
      <div style={{
        width: 8, flexShrink: 0, background: "var(--everymen-red)", position: "relative",
        backgroundImage: "repeating-linear-gradient(180deg, transparent 0 13px, color-mix(in srgb, var(--everymen-cream) 55%, transparent) 13px 15px)",
      }} />

      <div style={{ position: "relative", flex: 1, padding: "14px 16px 14px 15px", minWidth: 0 }}>
        <EM_Sunburst color="var(--everymen-red)" from="0% 46%" opacity={0.05} step={9} />
        <PaperWeave />
        <EM_Halftone opacity={0.06} />
        <div style={{ position: "relative", zIndex: 2 }}>

          {/* header: avatar + actor/action + badge */}
          <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <EmAvatar gradient={gradient} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", lineHeight: 1.45 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--everymen-paper-text)", whiteSpace: "nowrap" }}>{actor}</span>
                <span style={{ fontSize: 12, color: "var(--everymen-muted)", whiteSpace: "nowrap" }}>{action}</span>
                {badge && <ActionStamp label={badge.label} kind={badge.kind} />}
              </div>
              <div style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--everymen-muted)", marginTop: 3 }}>{time}</div>
            </div>
          </div>

          {/* task reference — a mini Mobilize poster strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginTop: 12, paddingLeft: 49 }}>
            {/* solid red poster rule with a gold cap */}
            <div style={{ flexShrink: 0, width: 5, alignSelf: "stretch", minHeight: 34, position: "relative",
              background: "var(--everymen-red)", borderTop: "4px solid var(--everymen-gold)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-accent)", fontSize: 25, lineHeight: 0.96, letterSpacing: "0.01em" }}>{task.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-accent)", fontSize: 16, color: "var(--everymen-red)", letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{task.points} PTS</span>
                {task.level != null && (
                  <span style={{ background: "var(--everymen-ink)", color: "var(--everymen-cream)", fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px" }}>lvl {task.level}</span>
                )}
                {meta && <span style={{ fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--everymen-muted)" }}>{meta}</span>}
              </div>
            </div>
            {completed && (
              <div style={{ flexShrink: 0, alignSelf: "center" }}>
                <EM_PointsSeal points={task.points} size={46} rotate={-8} blend="normal" />
              </div>
            )}
          </div>

          <div style={{ paddingLeft: 49 }}>
            <StatusLine status={status} />
          </div>
        </div>
      </div>
    </article>
  );
}

Object.assign(window, { EverymenActivityCard });
