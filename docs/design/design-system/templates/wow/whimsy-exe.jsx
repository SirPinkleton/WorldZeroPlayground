/* ════════════════════════════════════════════════════════════════
   whimsy.exe — pink edition
   Lo-fi computer-witch task card. Soft pastel window chrome, dotted
   grid, notepad task area, cute ivy down the side, sticker charms.
   Light + dark variants driven by a THEME object.
   ════════════════════════════════════════════════════════════════ */

const SAMPLE = {
  title: "The L Word",
  description: "Find someone you love. Tell them you love them.",
  level: 1,
  points: 5,
};

const THEME = {
  light: {
    pageBg: "#fbeef5",
    winBorder: "#e487b5",
    titleFrom: "#fbcfe2", titleTo: "#f3a6cb",
    titleText: "#8e2f5c",
    bodyBg: "#fdeef6",
    dot: "rgba(214,90,150,0.20)",
    notepadBg: "#fffdfa", notepadBorder: "#f3b6d2",
    eyebrow: "#c2698f",
    title: "#a83a6e",
    desc: "#b06a8c",
    ink: "#a83a6e",
    pillBg: "#ffffff", pillText: "#b5588a", pillBorder: "#f3b6d2",
    statusText: "#b5588a",
    ivy: "#7cbf99", ivyLeaf: "#9ad3b1",
    grain: 0.32,
  },
  dark: {
    pageBg: "#1a0e15",
    winBorder: "#f472b6",
    titleFrom: "#5e2a46", titleTo: "#41203a",
    titleText: "#fbd6e8",
    bodyBg: "#2a0d1c",
    dot: "rgba(244,114,182,0.16)",
    notepadBg: "#39152a", notepadBorder: "#7a3358",
    eyebrow: "#e58cb6",
    title: "#fbcfe0",
    desc: "#cf9bb6",
    ink: "#fbcfe0",
    pillBg: "rgba(244,114,182,0.12)", pillText: "#f9b6d4", pillBorder: "rgba(244,114,182,0.4)",
    statusText: "#e58cb6",
    ivy: "#5fa882", ivyLeaf: "#7fc59e",
    grain: 0.22,
  },
};

/* ───────── paper grain overlay ───────── */
function Grain({ opacity, radius = 0 }) {
  const uri = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`);
  return <div style={{ position: "absolute", inset: 0, borderRadius: radius,
    backgroundImage: `url("${uri}")`, backgroundSize: "120px 120px",
    mixBlendMode: "multiply", opacity, pointerEvents: "none", zIndex: 8 }} />;
}

/* ════════════ sticker charms (white die-cut outline + shadow) ════════════ */
const stickerWrap = (style) => ({
  position: "absolute", filter: "drop-shadow(0 2px 2.5px rgba(120,40,80,0.28))", zIndex: 12, ...style,
});
function Heart({ size = 34, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={style}>
      <path d="M18 31C7 23 3 17 6.5 11 9 6.8 14 6.5 16 10c.9 1.5 1.6 2.7 2 3.4.4-.7 1.1-1.9 2-3.4 2-3.5 7-3.2 9.5 1C33 17 29 23 18 31Z"
        fill="#fb7aa8" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M11 13c-.6 2 .1 3.8 1.6 5.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.75" />
    </svg>
  );
}
function RainbowSticker({ size = 46, style }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 50 36" style={style}>
      <g stroke="none">
        <path d="M7 30a18 18 0 0 1 36 0h-5a13 13 0 0 0-26 0Z" fill="#f47aa6" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 30a13 13 0 0 1 26 0h-5a8 8 0 0 0-16 0Z" fill="#f6c75e" />
        <path d="M17 30a8 8 0 0 1 16 0h-5a3 3 0 0 0-6 0Z" fill="#86cfa6" />
      </g>
      <g fill="#fff" stroke="#e7a8c6" strokeWidth="1.2">
        <ellipse cx="8" cy="30" rx="6" ry="4" />
        <ellipse cx="42" cy="30" rx="6" ry="4" />
      </g>
    </svg>
  );
}
function Mushroom({ size = 34, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={style}>
      <rect x="13" y="18" width="10" height="14" rx="5" fill="#fff4e6" stroke="#fff" strokeWidth="2.2" />
      <path d="M4 19a14 9.5 0 0 1 28 0Z" fill="#fb7a86" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="11" cy="14" r="2" fill="#fff" />
      <circle cx="19" cy="11.5" r="2.6" fill="#fff" />
      <circle cx="25" cy="15" r="1.8" fill="#fff" />
      <circle cx="15.5" cy="25" r="1.3" fill="#f6b8c0" />
      <circle cx="20.5" cy="27" r="1.1" fill="#f6b8c0" />
    </svg>
  );
}
function StarSticker({ size = 26, color = "#f6c75e", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" style={style}>
      <path d="M14 2l3 7.3L24.5 10l-5.5 4.6L20.7 23 14 18.6 7.3 23l1.7-8.4L3.5 10 11 9.3Z"
        fill={color} stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function Sparkle({ size = 16, color = "#f6c75e", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <path d="M12 1c.6 5.2 2.8 7.4 8 8-5.2.6-7.4 2.8-8 8-.6-5.2-2.8-7.4-8-8 5.2-.6 7.4-2.8 8-8z" fill={color} />
    </svg>
  );
}

/* ════════════ cute ivy vine (parametric stem + leaves) ════════════ */
function IvyLeaf({ x, y, rot, scale, c, leaf }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path d="M0 0 C -9 -3 -11 -13 -6 -20 C -2 -25 2 -25 6 -20 C 11 -13 9 -3 0 0 Z"
        fill={leaf} stroke={c} strokeWidth="1.1" />
      <path d="M0 -1 L0 -19" stroke={c} strokeWidth="1" opacity="0.55" />
      <path d="M0 -8 L-4 -12 M0 -8 L4 -12" stroke={c} strokeWidth="0.8" opacity="0.45" fill="none" />
    </g>
  );
}
function Ivy({ height = 250, c, leaf, flip = false }) {
  const W = 76, segs = 60;
  const xAt = (t) => 40 + 20 * Math.sin(t * Math.PI * 2.3);
  const yAt = (t) => 6 + t * (height - 12);
  let d = "";
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    d += (i === 0 ? "M" : "L") + xAt(t).toFixed(1) + " " + yAt(t).toFixed(1) + " ";
  }
  const leafTs = [0.07, 0.17, 0.28, 0.39, 0.5, 0.61, 0.72, 0.83, 0.93];
  return (
    <svg width={W} height={height} viewBox={`0 0 ${W} ${height}`}
      style={{ transform: flip ? "scaleX(-1)" : "none" }}>
      <path d={d} fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" />
      {/* tendril curls */}
      <path d={`M${xAt(0.02)} ${yAt(0.02)} q -10 -6 -4 -13 q 4 -4 8 0`} fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      {leafTs.map((t, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        return <IvyLeaf key={i} x={xAt(t) + side * 7} y={yAt(t)} rot={side > 0 ? 38 : -38} scale={i % 3 === 0 ? 1.15 : 0.95} c={c} leaf={leaf} />;
      })}
    </svg>
  );
}

/* shared soft level pill */
function LevelPill({ t, level = SAMPLE.level }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
      fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase",
      padding: "2px 8px", borderRadius: 20, background: t.pillBg, color: t.pillText, border: `1px solid ${t.pillBorder}` }}>
      <Sparkle size={9} color={t.pillText} /> lvl {level}
    </span>
  );
}

/* ════════════════════ the card ════════════════════ */
/* decor: "full" (ivy + all charms, hero) · "min" (one charm) · "none" */
function Charm({ kind }) {
  if (kind === "star") return <StarSticker size={28} color="#f6c75e" />;
  if (kind === "mushroom") return <Mushroom size={34} />;
  if (kind === "rainbow") return <RainbowSticker size={46} />;
  if (kind === "starPink") return <StarSticker size={26} color="#f47aa6" />;
  return <Heart size={34} />;
}
function WhimsyExe({ mode = "light", task = SAMPLE, decor = "full", charm = "star" }) {
  const t = THEME[mode];
  const full = decor === "full";
  const wrapW = full ? 326 : 274;
  return (
    <div style={{ position: "relative", width: wrapW, height: full ? 300 : undefined, fontFamily: "var(--font-body)" }}>
      {/* ivy down the left, behind the window */}
      {full && (
        <div style={{ position: "absolute", left: -10, top: 34, zIndex: 1 }}>
          <Ivy height={250} c={t.ivy} leaf={t.ivyLeaf} />
        </div>
      )}

      {/* the window */}
      <div style={{ position: full ? "absolute" : "relative", left: full ? 48 : 0, top: full ? 16 : 0, marginLeft: full ? 0 : 6, marginTop: full ? 0 : 12, width: 262, zIndex: 5,
        borderRadius: 12, overflow: "hidden", border: `2px solid ${t.winBorder}`,
        boxShadow: mode === "dark" ? "0 10px 26px rgba(0,0,0,0.5)" : "0 10px 24px rgba(190,60,120,0.22)" }}>
        {/* title bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px",
          background: `linear-gradient(180deg, ${t.titleFrom}, ${t.titleTo})`, borderBottom: `2px solid ${t.winBorder}` }}>
          <div style={{ display: "flex", gap: 5 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#fb7aa8", border: "1.5px solid rgba(255,255,255,0.7)" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#f6c75e", border: "1.5px solid rgba(255,255,255,0.7)" }} />
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#86cfa6", border: "1.5px solid rgba(255,255,255,0.7)" }} />
          </div>
          <span style={{ fontSize: 10.5, color: t.titleText, letterSpacing: "0.03em", display: "flex", alignItems: "center", gap: 4 }}>
            <Sparkle size={10} color={t.titleText} /> whimsy.exe
          </span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: t.titleText, opacity: 0.75, letterSpacing: "1.5px" }}>▭ ✕</span>
        </div>
        {/* body */}
        <div style={{ position: "relative", padding: "15px 15px 13px", background: t.bodyBg,
          backgroundImage: `radial-gradient(${t.dot} 1.4px, transparent 1.4px)`, backgroundSize: "13px 13px" }}>
          <Grain opacity={t.grain} />
          {/* notepad */}
          <div style={{ position: "relative", zIndex: 9, background: t.notepadBg, border: `1.5px solid ${t.notepadBorder}`,
            borderRadius: 7, padding: "11px 13px", marginBottom: 11 }}>
            <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.18em", color: t.eyebrow, marginBottom: 4 }}>new quest · {task.points} pts</div>
            <div style={{ fontFamily: "var(--font-faction-script)", fontSize: 27, fontWeight: 700, lineHeight: 1.02, color: t.title, marginBottom: 4 }}>{task.title}</div>
            <div style={{ fontSize: 9, lineHeight: 1.5, color: t.desc }}>{task.description}</div>
          </div>
          {/* status bar */}
          <div style={{ position: "relative", zIndex: 9, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <LevelPill t={t} level={task.level} />
            <span style={{ fontSize: 9, color: t.statusText, letterSpacing: "0.1em" }}>◆ {task.points} pts</span>
          </div>
        </div>
      </div>

      {full && (
        <React.Fragment>
          {/* sticker charms peeking off the window edges */}
          <div style={stickerWrap({ top: 4, right: 8, transform: "rotate(14deg)" })}><Heart size={36} /></div>
          <div style={stickerWrap({ top: 92, right: -6, transform: "rotate(-10deg)" })}><StarSticker size={28} color="#f6c75e" /></div>
          <div style={stickerWrap({ bottom: 6, right: 30, transform: "rotate(8deg)" })}><Mushroom size={36} /></div>
          <div style={stickerWrap({ bottom: -4, left: 40, transform: "rotate(-9deg)" })}><RainbowSticker size={50} /></div>
          <div style={stickerWrap({ top: 150, left: 26, transform: "rotate(6deg)", zIndex: 4 })}><StarSticker size={18} color="#f47aa6" /></div>
        </React.Fragment>
      )}
      {decor === "min" && (
        <div style={stickerWrap({ top: 2, right: -4, transform: "rotate(13deg)" })}><Charm kind={charm} /></div>
      )}
    </div>
  );
}

/* ──────── reusable sticker sheet (for the asset set) ──────── */
function StickerSheet() {
  const cell = { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 };
  const lbl = { fontFamily: "var(--font-body)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#a8728e" };
  return (
    <div style={{ display: "flex", gap: 30, alignItems: "flex-end", justifyContent: "center", flexWrap: "wrap" }}>
      <div style={cell}><Heart size={48} /><span style={lbl}>heart</span></div>
      <div style={cell}><RainbowSticker size={62} /><span style={lbl}>rainbow</span></div>
      <div style={cell}><Mushroom size={48} /><span style={lbl}>mushroom</span></div>
      <div style={cell}><StarSticker size={44} color="#f6c75e" /><span style={lbl}>star</span></div>
      <div style={cell}><StarSticker size={40} color="#f47aa6" /><span style={lbl}>star · pink</span></div>
      <div style={cell}><Sparkle size={40} color="#f6c75e" /><span style={lbl}>sparkle</span></div>
    </div>
  );
}

Object.assign(window, { WhimsyExe, StickerSheet, Ivy, Heart, RainbowSticker, Mushroom, StarSticker, Sparkle });
