/* ════════════════════════════════════════════════════════════════
   whimsy-updates — the Updates activity feed, cottagecore edition
   Correct components for the UPDATES page (not the task board):
   dated feed rows (actor + action + badge + referenced task), the
   right rail (task-slots window, recent-activity window, propose btn).
   Soft-pastel faction rainbow kept intact; charm details from
   whimsy-exe.jsx (Sparkle, StarSticker, Heart, Mushroom).
   ════════════════════════════════════════════════════════════════ */

/* per-mode page palette */
const UPD = {
  light: {
    bg: "#fbeef5", ink: "#5a3450", inkSoft: "#8a6a7c", label: "#a8728e", faint: "#b89aac",
    navBg: "rgba(251,238,245,0.86)", navBorder: "rgba(214,90,150,0.16)",
    panel: "#fffdfa", panelBorder: "rgba(214,90,150,0.20)", panelSoft: "rgba(214,90,150,0.10)",
    winFrom: "#fbcfe2", winTo: "#f3a6cb", winText: "#8e2f5c", winBorder: "#e487b5",
    pink: "#ec5f99", pinkDeep: "#d23b7e",
    divider: "rgba(170,90,130,0.25)",
    blob1: "rgba(246,160,198,0.5)", blob2: "rgba(199,171,230,0.45)", blob3: "rgba(160,216,194,0.4)", blob4: "rgba(246,201,94,0.36)",
    rowText: "#5a3450",
  },
  dark: {
    bg: "#150b12", ink: "#fbcfe0", inkSoft: "#cf9bb6", label: "#c78aa6", faint: "#8a5d76",
    navBg: "rgba(21,11,18,0.88)", navBorder: "rgba(244,114,182,0.2)",
    panel: "#23101b", panelBorder: "rgba(244,114,182,0.22)", panelSoft: "rgba(244,114,182,0.10)",
    winFrom: "#5e2a46", winTo: "#41203a", winText: "#fbd6e8", winBorder: "#f472b6",
    pink: "#f472b6", pinkDeep: "#f9b6d4",
    divider: "rgba(244,114,182,0.22)",
    blob1: "rgba(244,114,182,0.2)", blob2: "rgba(150,110,200,0.18)", blob3: "rgba(95,168,130,0.15)", blob4: "rgba(240,180,90,0.13)",
    rowText: "#fbcfe0",
  },
};

/* soft pastel faction tints — accent (left bar) + row background, per mode */
const FACTION_TINT = {
  light: {
    gestalt:     { a: "#ec5f99", bg: "#fde7f1" },
    analog:      { a: "#d99a2b", bg: "#fbf3da" },
    snide:       { a: "#6cbf90", bg: "#e6f6ec" },
    ua:          { a: "#b79ad8", bg: "#efe6fb" },
    singularity: { a: "#7aa8e0", bg: "#e6eefb" },
    journeymen:  { a: "#54bcc4", bg: "#ddf4f5" },
    uamasters:   { a: "#e0894f", bg: "#fbe9dc" },
    duel:        { a: "#ef6f8e", bg: "#fde6ec" },
    collab:      { a: "#b79ad8", bg: "#efe7fb" },
  },
  dark: {
    gestalt:     { a: "#f472b6", bg: "#2a0d1c" },
    analog:      { a: "#e0b24a", bg: "#241c08" },
    snide:       { a: "#5fa882", bg: "#0d1f13" },
    ua:          { a: "#a78bfa", bg: "#1d1530" },
    singularity: { a: "#6f9fe0", bg: "#0c1626" },
    journeymen:  { a: "#3fbac4", bg: "#0a2024" },
    uamasters:   { a: "#e0894f", bg: "#241408" },
    duel:        { a: "#f06f8e", bg: "#2a0f17" },
    collab:      { a: "#a78bfa", bg: "#1d1530" },
  },
};

/* semantic feed badges (soft pills, white text) */
const BADGE = {
  foe:       { bg: "#e8607f", label: "foe" },
  friend:    { bg: "#3f9e6a", label: "friend" },
  yourstuff: { bg: "#caa23e", label: "your stuff" },
  global:    { bg: "#9a8aa8", label: "global" },
  duel:      { bg: "#e85664", label: "duel" },
  collab:    { bg: "#46a06a", label: "collab" },
  solo:      { bg: "#b29cbe", label: "solo" },
};

function Badge({ kind, children }) {
  const b = BADGE[kind] || BADGE.global;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontFamily: "var(--font-body)",
      fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
      color: "#fff", background: b.bg, padding: "2.5px 7px", borderRadius: 6, lineHeight: 1.1,
      boxShadow: "0 1.5px 0 rgba(120,40,80,0.18)" }}>{children || b.label}</span>
  );
}

/* pink-gradient avatar with a soft moon glyph */
function Avatar({ t, glyph = "🌙", size = 38 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(150deg, ${t.winFrom}, ${t.pink})`,
      border: `1.5px solid ${t.winBorder}`, display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45, boxShadow: "0 2px 6px rgba(190,60,120,0.22)" }}>{glyph}</div>
  );
}

/* date divider with a center sparkle */
function DateDivider({ t, date }) {
  const Sparkle = window.Sparkle;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "26px 4px 18px" }}>
      <div style={{ flex: 1, height: 0, borderTop: `1px dashed ${t.divider}` }} />
      <Sparkle size={11} color={t.pink} />
      <span style={{ fontFamily: "var(--font-body)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.22em", color: t.label }}>{date}</span>
      <Sparkle size={11} color={t.pink} />
      <div style={{ flex: 1, height: 0, borderTop: `1px dashed ${t.divider}` }} />
    </div>
  );
}

/* the feed row */
function FeedRow({ t, mode, actor, action, badge, timeAgo, task, meta, status, statusKind, tint, sticker }) {
  const ft = FACTION_TINT[mode][tint] || FACTION_TINT[mode].gestalt;
  const statusColor = statusKind === "declined" ? "#cf6b7e" : statusKind === "accepted" ? "#46a06a" : t.inkSoft;
  return (
    <div style={{ position: "relative", display: "flex", gap: 13, alignItems: "flex-start",
      background: ft.bg, border: `1px solid ${t.panelSoft}`, borderLeft: `4px solid ${ft.a}`,
      borderRadius: 14, padding: "16px 18px 16px 17px", marginBottom: 16,
      boxShadow: mode === "dark" ? "0 4px 14px rgba(0,0,0,0.3)" : "0 4px 14px rgba(190,60,120,0.07)" }}>
      <Avatar t={t} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 7 }}>
        {/* headline */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", rowGap: 4 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.5, color: t.ink }}>
            <strong style={{ fontWeight: 700 }}>{actor}</strong> <span style={{ color: t.inkSoft }}>{action}</span>
          </span>
          {badge && <Badge kind={badge} />}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 9, lineHeight: 1, textTransform: "uppercase", letterSpacing: "0.12em", color: t.faint }}>{timeAgo}</div>
        {/* referenced task */}
        <div style={{ borderLeft: `2px solid ${ft.a}`, paddingLeft: 12, marginTop: 2 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap", rowGap: 4 }}>
            {meta && meta.dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: ft.a, flexShrink: 0, alignSelf: "center" }} />}
            <span style={{ fontFamily: "var(--font-faction-script)", fontSize: 21, fontWeight: 700, color: t.ink, lineHeight: 1.25 }}>{task.title}</span>
            {task.points != null && <span style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.1em", color: t.label }}>{task.points} PTS</span>}
            {meta && meta.level != null && <span style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.1em", color: t.faint }}>· LVL {meta.level}</span>}
            {meta && meta.tag && <span style={{ alignSelf: "center" }}><Badge kind={meta.tag} /></span>}
            {meta && meta.note && <span style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.08em", color: t.faint }}>· {meta.note}</span>}
          </div>
        </div>
        {/* status / action line */}
        {status && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 10.5, lineHeight: 1.2, textTransform: "uppercase", letterSpacing: "0.1em", color: statusColor }}>{status}</div>
        )}
      </div>
      {sticker}
    </div>
  );
}

/* ── right rail: a soft .exe window shell ── */
function RailWindow({ t, mode, name, children, pad = "13px 14px" }) {
  return (
    <div style={{ borderRadius: 13, overflow: "hidden", border: `2px solid ${t.winBorder}`, marginBottom: 22,
      boxShadow: mode === "dark" ? "0 8px 20px rgba(0,0,0,0.4)" : "0 8px 20px rgba(190,60,120,0.10)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px",
        background: `linear-gradient(180deg, ${t.winFrom}, ${t.winTo})`, borderBottom: `2px solid ${t.winBorder}` }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fb7aa8", border: "1.2px solid rgba(255,255,255,0.7)" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f6c75e", border: "1.2px solid rgba(255,255,255,0.7)" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#86cfa6", border: "1.2px solid rgba(255,255,255,0.7)" }} />
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-body)", fontSize: 9.5, color: t.winText, letterSpacing: "0.02em" }}>{name}</span>
      </div>
      <div style={{ background: t.panel, padding: pad }}>{children}</div>
    </div>
  );
}

function SlotRow({ t, title, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 2px",
      borderBottom: last ? "none" : `1px dashed ${t.panelSoft}` }}>
      <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 11, color: t.ink, lineHeight: 1.25 }}>{title}</span>
      <Badge kind="solo" />
    </div>
  );
}

function ActivityRow({ t, title, time, last }) {
  return (
    <div style={{ padding: "9px 2px", borderBottom: last ? "none" : `1px dashed ${t.panelSoft}` }}>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 11, color: t.ink, lineHeight: 1.35 }}>
        <strong style={{ fontWeight: 700 }}>New task:</strong> <span style={{ color: t.inkSoft }}>{title}</span>
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: t.faint, marginTop: 4 }}>{time}</div>
    </div>
  );
}

Object.assign(window, { UPD, Badge, Avatar, DateDivider, FeedRow, RailWindow, SlotRow, ActivityRow });
