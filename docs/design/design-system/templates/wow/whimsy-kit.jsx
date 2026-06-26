/* ════════════════════════════════════════════════════════════════
   whimsy.exe — asset kit
   The supporting UI family for the Warriors of Whimsy faction, redesigned in the
   pink computer-witch language: app icon, buttons, level pill + moon
   level-track, heart vote stamps, app tabs, filter chips, empty state.
   Each component is themeable via THEME[mode]. Stickers + Ivy come from
   whimsy-exe.jsx (window.Heart, window.Sparkle, window.Ivy, …).
   ════════════════════════════════════════════════════════════════ */

const KT = {
  light: {
    panelBg: "#fbeef5", cardBg: "#fffdfa",
    ink: "#a83a6e", inkSoft: "#b5588a", label: "#a8728e",
    border: "#f3b6d2", borderSoft: "rgba(214,90,150,0.28)",
    pink: "#ec5f99", pinkDeep: "#d23b7e", pinkLt: "#fbcfe2",
    gold: "#f0b94a", green: "#7cbf99", greenLeaf: "#9ad3b1",
    dot: "rgba(214,90,150,0.18)",
    fill: "#ec5f99", onFill: "#ffffff",
    moonLit: "#f6c75e", moonShadow: "#fbe1ee",
    glow: "rgba(236,95,153,0.32)",
    titleFrom: "#fbcfe2", titleTo: "#f3a6cb", titleText: "#8e2f5c", winBorder: "#e487b5",
    voteFills: ["#f6b8cf", "#f489b0", "#ec5f99", "#df3f86", "#c52470"]
  },
  dark: {
    panelBg: "#1a0e15", cardBg: "#2a0d1c",
    ink: "#fbcfe0", inkSoft: "#e58cb6", label: "#c78aa6",
    border: "#7a3358", borderSoft: "rgba(244,114,182,0.32)",
    pink: "#f472b6", pinkDeep: "#f9b6d4", pinkLt: "#5e2a46",
    gold: "#f0d98f", green: "#5fa882", greenLeaf: "#7fc59e",
    dot: "rgba(244,114,182,0.16)",
    fill: "#f472b6", onFill: "#2a0d1c",
    moonLit: "#f0d98f", moonShadow: "#2a0d1c",
    glow: "rgba(244,114,182,0.45)",
    titleFrom: "#5e2a46", titleTo: "#41203a", titleText: "#fbd6e8", winBorder: "#f472b6",
    voteFills: ["#f9c4dc", "#f9a0c6", "#f472b6", "#ee5aa6", "#e23b8f"]
  }
};

const lbl = (t) => ({ fontFamily: "var(--font-body)", fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.18em", color: t.label, marginBottom: 11 });

/* ───── mini window glyph ───── */
function WinGlyph({ size = 22, t, color }) {
  const c = color || t.pink;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="2.5" y="4" width="19" height="16" rx="3" fill="none" stroke={c} strokeWidth="2" />
      <path d="M2.5 8.5h19" stroke={c} strokeWidth="2" />
      <circle cx="5.6" cy="6.2" r="0.9" fill={c} />
      <circle cx="8.2" cy="6.2" r="0.9" fill={c} />
    </svg>);

}

/* ───────── app icon (hero) ───────── */
function GAppIcon({ t }) {
  const Sparkle = window.Sparkle;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9 }}>
      <div style={{ position: "relative", width: 76, height: 76, borderRadius: 20,
        background: `linear-gradient(150deg, ${t.titleFrom}, ${t.pink})`,
        border: `2px solid ${t.winBorder}`, boxShadow: `0 8px 18px ${t.glow}`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 34, borderRadius: 6, background: t.cardBg, border: `2px solid ${t.cardBg}`, overflow: "hidden", boxShadow: "0 2px 5px rgba(120,40,80,0.25)" }}>
          <div style={{ height: 9, background: `linear-gradient(180deg, ${t.titleFrom}, ${t.titleTo})`, display: "flex", alignItems: "center", paddingLeft: 4, gap: 2 }}>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#fb7aa8" }} />
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#f6c75e" }} />
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#86cfa6" }} />
          </div>
          <div style={{ padding: "4px 5px" }}>
            <div style={{ height: 2.5, width: "70%", background: t.pink, borderRadius: 2, marginBottom: 3 }} />
            <div style={{ height: 2.5, width: "45%", background: t.borderSoft, borderRadius: 2 }} />
          </div>
        </div>
        <Sparkle size={16} color="#fff" style={{ position: "absolute", top: 6, right: 7 }} />
        <svg width="20" height="22" viewBox="0 0 20 22" style={{ position: "absolute", bottom: 2, left: 3 }}>
          <path d="M5 22C5 14 4 8 6 2" stroke={t.greenLeaf} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M5 12c-5-1-5-6-5-6 4 0 6 3 5 6Z" fill={t.greenLeaf} />
          <path d="M6 7c4-1 5-5 5-5-3 0-5 2-5 5Z" fill={t.greenLeaf} />
        </svg>
      </div>
      <span style={{ fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.04em", color: t.ink }}>whimsy.exe</span>
    </div>);

}

/* ───────── buttons ───────── */
function GButton({ t, variant = "primary", children }) {
  const base = { fontFamily: "var(--font-body)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
    padding: "7px 14px", borderRadius: 9, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, transition: "all 120ms", whiteSpace: "nowrap" };
  if (variant === "primary")
  return <button style={{ ...base, background: `linear-gradient(180deg, ${t.pink}, ${t.pinkDeep})`, color: t.onFill, border: `1.5px solid ${t.pinkDeep}`, boxShadow: `0 4px 10px ${t.glow}` }}><window.Sparkle size={11} color={t.onFill} />{children}</button>;
  if (variant === "outline")
  return <button style={{ ...base, background: "transparent", color: t.ink, border: `1.5px solid ${t.border}` }}>{children}</button>;
  return <button style={{ ...base, background: t.cardBg, color: t.ink, border: `1.5px solid ${t.border}`, borderRadius: 7, boxShadow: `inset 0 -2px 0 ${t.borderSoft}` }}>{children}</button>;
}

/* ───────── level pill ───────── */
function GLevelPill({ t, level }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)", fontSize: 9,
      letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 20,
      background: t.pinkLt, color: t.ink, border: `1px solid ${t.borderSoft}` }}>
      <window.Sparkle size={9} color={t.pink} /> lvl {level}
    </span>);

}

/* ───────── moon level-track ───────── */
function MoonNode({ phase, active, t }) {
  const size = 30,r = 11,cx = 15,cy = 15;
  const dx = -(2 * r) * phase;
  const cid = "mc" + Math.round(phase * 100) + (active ? "a" : "");
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" style={{ transform: active ? "scale(1.18)" : "scale(1)", transition: "transform 120ms" }}>
      {active && <circle cx={cx} cy={cy} r={r + 3} fill={t.glow} />}
      <clipPath id={cid}><circle cx={cx} cy={cy} r={r} /></clipPath>
      <circle cx={cx} cy={cy} r={r} fill={t.moonLit} stroke={active ? t.pink : t.borderSoft} strokeWidth={active ? 2 : 1.5} />
      <g clipPath={`url(#${cid})`}>
        <circle cx={cx + dx} cy={cy} r={r} fill={t.moonShadow} />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={active ? t.pink : t.borderSoft} strokeWidth={active ? 2 : 1.5} />
    </svg>);

}
function GLevelTrack({ t, value = 3 }) {
  const levels = [0, 1, 2, 3, 4, 5];
  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {levels.map((lv, i) =>
      <div key={lv} style={{ display: "flex", alignItems: "flex-start" }}>
          {i > 0 && <div style={{ width: 16, height: 0, borderTop: `2px dotted ${t.green}`, marginTop: 14 }} />}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: 34 }}>
            <MoonNode phase={lv / 5} active={value === lv} t={t} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 8, color: value === lv ? t.pink : t.label, letterSpacing: "0.04em" }}>{lv}+</span>
          </div>
        </div>
      )}
    </div>);

}

/* ───────── heart vote stamps ───────── */
function VoteHeart({ filled, color, dim }) {
  return (
    <svg width="30" height="30" viewBox="0 0 36 36">
      <path d="M18 31C7 23 3 17 6.5 11 9 6.8 14 6.5 16 10c.9 1.5 1.6 2.7 2 3.4.4-.7 1.1-1.9 2-3.4 2-3.5 7-3.2 9.5 1C33 17 29 23 18 31Z"
      fill={filled ? color : "none"} stroke={filled ? "#fff" : dim} strokeWidth={filled ? 2.2 : 2} strokeLinejoin="round" />
    </svg>);

}
function GVoteStamps({ t, value = 4 }) {
  const labels = ["a start", "solid", "good", "excellent", "legendary"];
  return (
    <div style={{ display: "flex", gap: 9 }}>
      {labels.map((label, i) => {
        const on = i < value;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
              background: on ? t.cardBg : "transparent", border: `1.5px solid ${on ? t.border : t.borderSoft}`,
              boxShadow: on ? `0 3px 7px ${t.glow}` : "none" }}>
              <VoteHeart filled={on} color={t.voteFills[i]} dim={t.borderSoft} />
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.04em",
              color: on ? t.voteFills[i] : t.label, maxWidth: 42, textAlign: "center", lineHeight: 1.2 }}>{label}</span>
          </div>);

      })}
    </div>);

}

/* ───────── app tabs (faction filter) ───────── */
function GTab({ t, label, active, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 13px 7px",
      borderRadius: "11px 11px 0 0", fontFamily: "var(--font-body)", fontSize: 9.5, letterSpacing: "0.03em",
      background: active ? t.cardBg : "transparent",
      color: active ? t.ink : t.label,
      borderTop: active ? `2px solid ${t.pink}` : "2px solid transparent",
      borderLeft: active ? `1px solid ${t.border}` : "1px solid transparent",
      borderRight: active ? `1px solid ${t.border}` : "1px solid transparent",
      boxShadow: active ? `0 -2px 8px ${t.glow}` : "none", opacity: active ? 1 : 0.8 }}>
      {icon}{label}
    </div>);

}
function GTabRow({ t }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", borderBottom: `1.5px solid ${t.border}`, paddingBottom: 0 }}>
      <GTab t={t} label="whimsy.exe" active icon={<WinGlyph size={15} t={t} />} />
      <GTab t={t} label="analog.exe" icon={<WinGlyph size={15} t={t} color={t.label} />} />
      <GTab t={t} label="snide.exe" icon={<WinGlyph size={15} t={t} color={t.label} />} />
    </div>);

}

/* ───────── filter chips ───────── */
function GChip({ t, label, active }) {
  return (
    <button style={{ fontFamily: "var(--font-body)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em",
      padding: "5px 11px", borderRadius: 7, cursor: "pointer", transition: "all 120ms",
      background: active ? `linear-gradient(180deg, ${t.pink}, ${t.pinkDeep})` : t.cardBg,
      color: active ? t.onFill : t.inkSoft,
      border: `1.5px solid ${active ? t.pinkDeep : t.border}`,
      boxShadow: active ? `0 3px 8px ${t.glow}` : `inset 0 -2px 0 ${t.borderSoft}` }}>{label}</button>);

}
function GChipRow({ t }) {
  return (
    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
      <GChip t={t} label="✦ new" active />
      <GChip t={t} label="mine" />
      <GChip t={t} label="friends" />
      <GChip t={t} label="duels" />
    </div>);

}

/* ───────── empty state window ───────── */
function GEmptyState({ t }) {
  const Sparkle = window.Sparkle;
  return (
    <div style={{ width: 244, borderRadius: 12, overflow: "hidden", border: `2px solid ${t.winBorder}`, boxShadow: `0 8px 20px ${t.glow}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px",
        background: `linear-gradient(180deg, ${t.titleFrom}, ${t.titleTo})`, borderBottom: `2px solid ${t.winBorder}` }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fb7aa8", border: "1.2px solid rgba(255,255,255,0.7)" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f6c75e", border: "1.2px solid rgba(255,255,255,0.7)" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#86cfa6", border: "1.2px solid rgba(255,255,255,0.7)" }} />
        <span style={{ marginLeft: "auto", fontSize: 9.5, color: t.titleText }}>whimsy.exe</span>
      </div>
      <div style={{ position: "relative", padding: "26px 16px 24px", textAlign: "center", background: t.cardBg,
        backgroundImage: `radial-gradient(${t.dot} 1.3px, transparent 1.3px)`, backgroundSize: "13px 13px" }}>
        <Sparkle size={12} color={t.gold} style={{ position: "absolute", top: 14, left: 22 }} />
        <Sparkle size={9} color={t.pink} style={{ position: "absolute", top: 30, right: 26 }} />
        {/* sleeping moon */}
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ marginBottom: 6 }}>
          <circle cx="28" cy="28" r="20" fill={t.glow} opacity="0.5" />
          <path d="M37 12a20 20 0 1 0 9 24A17 17 0 0 1 37 12Z" fill={t.moonLit} stroke={t.borderSoft} strokeWidth="1" />
          <path d="M22 26q3 3 6 0M30 24q3 3 6 0" stroke={t.pinkDeep} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <text x="44" y="18" fontFamily="var(--font-faction-script)" fontSize="11" fill={t.pink}>z</text>
        </svg>
        <div style={{ fontFamily: "var(--font-faction-script)", fontSize: 24, color: t.ink, lineHeight: 1, marginBottom: 5 }}>no quests yet</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 9, color: t.inkSoft, marginBottom: 14, lineHeight: 1.5 }}>the coven is resting. check back<br />soon for new little magics.</div>
        <GButton t={t} variant="primary">find quests</GButton>
      </div>
    </div>);

}

/* ───────── page title (signature WZ header, reskinned) ───────── */
function GPageTitle({ t, eyebrow = "the coven · quest board", title = "little magics" }) {
  const bars = [t.pink, t.gold, t.green, t.pinkDeep, t.greenLeaf];
  let ci = 0;
  return (
    <div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.18em", color: t.label, marginBottom: 6 }}>{eyebrow}</div>
      <h1 style={{ fontFamily: "var(--font-faction-script)", fontSize: 44, fontWeight: 700, lineHeight: 1.15, margin: 0, color: t.ink, display: "flex", flexWrap: "wrap", alignItems: "flex-end" }}>
        {title.split("").map((ch, i) => {
          if (ch === " ") return <span key={i} style={{ display: "inline-block", width: "0.28em" }} />;
          const c = bars[ci % bars.length];ci++;
          return <span key={i} style={{ borderBottom: `4px solid ${c}`, paddingBottom: 1, lineHeight: 1 }}>{ch}</span>;
        })}
      </h1>
    </div>);

}

/* ───────── faction pennants (faction filter banner) ───────── */
function GPennant({ t }) {
  const facs = [
  { name: "whimsy.exe", bg: `linear-gradient(180deg, ${t.pink}, ${t.pinkDeep})`, active: true },
  { name: "snide", bg: "#5fae53", active: false },
  { name: "ephemerists", bg: "#2f9e92", active: false },
  { name: "everymen", bg: "#d2442f", active: false }];

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {facs.map((f, i) =>
      <button key={i} style={{ background: f.bg, color: "#fff", fontFamily: "var(--font-body)", fontSize: 9, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.07em", padding: "5px 14px", cursor: "pointer", border: "none",
        textShadow: "0 1px 2px rgba(0,0,0,0.3)", opacity: f.active ? 1 : 0.85,
        clipPath: "polygon(0 0, 100% 0, 92% 100%, 8% 100%)", transition: "all 120ms" }}>{f.name}</button>
      )}
    </div>);

}

/* ───────── praxis.exe card (filed submission + heart marks) ───────── */
const PRAXIS_LABELS = ["a start", "solid", "good", "excellent", "legendary"];
function GPraxisCard({ t, praxis }) {
  const p = praxis || {
    task: "The L Word", finding: "Said It First", author: "pixie",
    excerpt: "Knocked on her door at 7am with a thermos of cocoa and just… said it. She said it back.",
    rating: 4, marks: 23, points: 5, level: 1
  };
  const r = Math.max(0, Math.min(5, Math.round(p.rating)));
  const dot = (c) => ({ width: 9, height: 9, borderRadius: "50%", background: c, border: "1.2px solid rgba(255,255,255,0.7)" });
  return (
    <div style={{ width: 248, borderRadius: 12, overflow: "hidden", border: `2px solid ${t.winBorder}`, boxShadow: `0 8px 20px ${t.glow}`, fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px",
        background: `linear-gradient(180deg, ${t.titleFrom}, ${t.titleTo})`, borderBottom: `2px solid ${t.winBorder}` }}>
        <span style={dot("#fb7aa8")} /><span style={dot("#f6c75e")} /><span style={dot("#86cfa6")} />
        <span style={{ marginLeft: "auto", fontSize: 9.5, color: t.titleText }}>praxis.exe</span>
      </div>
      <div style={{ padding: "14px 15px 15px", background: t.cardBg,
        backgroundImage: `radial-gradient(${t.dot} 1.3px, transparent 1.3px)`, backgroundSize: "13px 13px" }}>
        <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.16em", color: t.label, marginBottom: 4 }}>re: {p.task}</div>
        <div style={{ fontFamily: "var(--font-faction-script)", fontSize: 25, lineHeight: 1, color: t.ink, marginBottom: 6 }}>{p.finding}</div>
        <div style={{ fontSize: 9.5, lineHeight: 1.5, color: t.inkSoft, marginBottom: 8 }}>{p.excerpt}</div>
        <div style={{ fontSize: 9.5, fontStyle: "italic", color: t.inkSoft, marginBottom: 11 }}>filed by {p.author}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          {Array.from({ length: 5 }).map((_, i) =>
          <svg key={i} width="15" height="15" viewBox="0 0 36 36">
              <path d="M18 31C7 23 3 17 6.5 11 9 6.8 14 6.5 16 10c.9 1.5 1.6 2.7 2 3.4.4-.7 1.1-1.9 2-3.4 2-3.5 7-3.2 9.5 1C33 17 29 23 18 31Z"
            fill={i < r ? t.voteFills[i] : "none"} stroke={i < r ? "#fff" : t.borderSoft} strokeWidth={i < r ? 2.2 : 2} strokeLinejoin="round" />
            </svg>
          )}
          <span style={{ fontFamily: "var(--font-faction-script)", fontSize: 16, color: t.pink, marginLeft: 4 }}>{PRAXIS_LABELS[Math.max(0, r - 1)]}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, letterSpacing: "0.06em",
            textTransform: "uppercase", padding: "3px 9px", borderRadius: 20, background: t.pinkLt, color: t.ink, border: `1px solid ${t.borderSoft}` }}>lvl {p.level}</span>
          <span style={{ fontSize: 9, color: t.label }}>{p.marks} hearts</span>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: t.pinkDeep }}>◆ {p.points} pts</span>
        </div>
      </div>
    </div>);

}

/* ───────── watercolor backdrop (page paint-bleed) ───────── */
function GBackdrop({ t }) {
  const fid = "gb-" + t.fill.replace("#", "");
  return (
    <div style={{ position: "relative", height: 132, borderRadius: 12, overflow: "hidden", border: `2px solid ${t.winBorder}`, background: t.panelBg }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id={fid} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20" /></filter>
        </defs>
        <ellipse cx="12%" cy="14%" rx="22%" ry="36%" fill={t.titleFrom} opacity="0.85" filter={`url(#${fid})`} />
        <ellipse cx="86%" cy="20%" rx="20%" ry="30%" fill={t.gold} opacity="0.5" filter={`url(#${fid})`} />
        <ellipse cx="78%" cy="94%" rx="24%" ry="36%" fill={t.pink} opacity="0.6" filter={`url(#${fid})`} />
        <ellipse cx="20%" cy="98%" rx="20%" ry="30%" fill={t.greenLeaf} opacity="0.45" filter={`url(#${fid})`} />
      </svg>
      <span style={{ position: "absolute", left: 13, bottom: 11, fontFamily: "var(--font-body)", fontSize: 8.5,
        textTransform: "uppercase", letterSpacing: "0.16em", color: t.ink, opacity: 0.7 }}>page backdrop · watercolor</span>
    </div>);

}

Object.assign(window, {
  KT, GAppIcon, GButton, GLevelPill, GLevelTrack, GVoteStamps, GTabRow, GChipRow, GEmptyState, WinGlyph,
  GPageTitle, GPennant, GPraxisCard, GBackdrop
});