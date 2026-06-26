/* ════════════════════════════════════════════════════════════════
   ADR-0005 (revised) · Praxis points & votes — shared core
   MODEL: a praxis earns POINTS (scarce — specific people spend them
   on you) and VOTES (free endorsements — a headcount). No average,
   no histogram. The card shows the points+votes pairing; the read
   page itemizes WHO gave points (the backer ledger).
   ════════════════════════════════════════════════════════════════ */

const ROMAN = ["I", "II", "III", "IV", "V"];
const sumPts = (b) => b.reduce((a, x) => a + x.pts, 0);

/* ── the six factions ─────────────────────────────────────────────
   tokens + fonts + archetype + faction-voiced words for points/votes,
   plus one sample completed praxis carrying its backer ledger.
   pointFill / voteFill are single accent colors (no ramp anymore).
   ──────────────────────────────────────────────────────────────── */
const FACTIONS = [
  {
    slug: "ua", name: "UA", hue: "var(--faction-ua)", archetype: "sticky note",
    glyph: "dot", display: "var(--font-faction-old)", body: "var(--font-body)",
    surfaceBg: "var(--faction-ua-card-bg)", surfaceText: "var(--faction-ua-card-text)",
    muted: "var(--faction-ua-card-muted)", accent: "var(--faction-ua-card-accent)",
    pointFill: "var(--vote-5)", voteFill: "var(--faction-ua-card-accent)",
    pointWord: "points", voteWord: "votes", giveVerb: "Back this praxis",
    p: {
      task: "Trash Transformation", finding: "Made a Lamp From a Milk Crate", author: "Pip",
      excerpt: "Wired a thrown-out crate and a dead bulb into a reading lamp. It works.",
      points: 5, votes: 45, grade: "lvl 1", mode: "filed alone", sealed: "Apr 22, 2026",
      backers: [
        { name: "Marisol", pts: 2 }, { name: "Dez", pts: 2 }, { name: "Bex", pts: 1 },
      ],
    },
  },
  {
    slug: "gestalt", name: "Gestalt", hue: "var(--faction-gestalt)", archetype: "gestalt.exe window",
    glyph: "heart", display: "var(--font-faction-script)", body: "var(--font-body)",
    surfaceBg: "var(--gestalt-card-bg)", surfaceText: "var(--gestalt-ink)",
    muted: "var(--gestalt-label)", accent: "var(--gestalt-pink-deep)",
    pointFill: "var(--gestalt-pink-deep)", voteFill: "var(--gestalt-pink)",
    pointWord: "points", voteWord: "hearts", giveVerb: "Send points",
    p: {
      task: "The L Word", finding: "I Told My Landlord", author: "Pixie",
      excerpt: "Knocked on 4B, said it out loud, ran away. Heart still pounding.",
      points: 6, votes: 88, grade: "lvl 1", mode: "filed solo", sealed: "Apr 20, 2026",
      backers: [
        { name: "B4ndit", pts: 3 }, { name: "m0th", pts: 2 }, { name: "Sprite", pts: 1 },
      ],
    },
  },
  {
    slug: "snide", name: "S.N.I.D.E.", hue: "var(--faction-snide)", archetype: "closed-case file",
    glyph: "stamp", dark: true, display: "var(--font-faction-anton)", body: "var(--font-faction-typewriter)",
    surfaceBg: "var(--snide-ink)", surfaceText: "#efe9d6",
    muted: "#b7b5a7", accent: "var(--snide-acid)",
    pointFill: "var(--snide-acid)", voteFill: "var(--snide-pink)",
    pointWord: "pts", voteWord: "marks", giveVerb: "Spend points",
    p: {
      task: "DO A KICKFLIP", finding: "Landed It. No Board.", author: "Static",
      excerpt: "Did the kickflip motion mid-air off a curb. Nobody asked. Double points.",
      points: 25, votes: 31, grade: "lvl 2", mode: "solo job", sealed: "Apr 19, 2026",
      backers: [
        { name: "Hex", pts: 10 }, { name: "Razz", pts: 8 }, { name: "Crud", pts: 5 }, { name: "Vandal", pts: 2 },
      ],
    },
  },
  {
    slug: "ephemerists", name: "The Ephemerists", hue: "var(--faction-ephemerists)", archetype: "sealed ephemeris leaf",
    glyph: "seal", display: "var(--font-faction-engraved)", body: "var(--font-faction-codex)",
    surfaceBg: "var(--eph-vellum)", surfaceText: "var(--eph-vellum-text)",
    muted: "var(--eph-muted)", accent: "var(--eph-rubric)",
    pointFill: "var(--eph-rubric)", voteFill: "var(--eph-lapis)",
    pointWord: "pvncta", voteWord: "marks", giveVerb: "Endow pvncta",
    p: {
      task: "Trace a Myth", finding: "The Saint Was a Surveyor", author: "Vesper",
      excerpt: "Followed the legend back through eleven retellings until the road ran out.",
      points: 100, votes: 38, grade: "grade IV", mode: "filed alone", sealed: "Apr 21, 2026",
      backers: [
        { name: "Aldous", pts: 40 }, { name: "Mirth", pts: 30 }, { name: "Quill", pts: 20 }, { name: "Bede", pts: 10 },
      ],
    },
  },
  {
    slug: "singularity", name: "Singularity", hue: "var(--faction-singularity)", archetype: "terminal printout",
    glyph: "signal", dark: true, display: "var(--font-faction-terminal)", body: "var(--font-faction-terminal)",
    surfaceBg: "#050f08", surfaceText: "#4ade80", muted: "#60a5fa", accent: "#86efac",
    pointFill: "#fbbf24", voteFill: "#4ade80",
    pointWord: "CR", voteWord: "signals", giveVerb: "Allocate CR",
    p: {
      task: "Map a Non-Human Pattern", finding: "The Signal Was Always There", author: "NODE_Vesper",
      excerpt: "Non-random signal confirmed at 12.7σ — non-biological origin.",
      points: 200, votes: 44, grade: "priority 0x04", mode: "SOLO", sealed: "2026.04.21",
      backers: [
        { name: "NODE_Kell", pts: 80 }, { name: "NODE_Ash", pts: 60 }, { name: "NODE_Bo", pts: 40 }, { name: "NODE_Wynn", pts: 20 },
      ],
    },
  },
  {
    slug: "everymen", name: "The Everymen", hue: "var(--faction-everymen)", archetype: "union work report",
    glyph: "star", display: "var(--font-faction-poster)", body: "var(--font-body)",
    surfaceBg: "var(--everymen-paper)", surfaceText: "var(--everymen-paper-text)",
    muted: "var(--everymen-muted)", accent: "var(--everymen-red)",
    pointFill: "var(--everymen-red)", voteFill: "var(--everymen-gold-deep)",
    pointWord: "points", voteWord: "marks", giveVerb: "Pledge points",
    p: {
      task: "Pick Up the Load", finding: "Carried the Tran's Groceries", author: "Rivet",
      excerpt: "Took the heavy bags up four flights. Stayed for tea. Worth more than points.",
      points: 25, votes: 52, grade: "lvl 2", mode: "COLLAB", sealed: "Apr 18, 2026",
      backers: [
        { name: "Birta", pts: 10 }, { name: "Cobb", pts: 8 }, { name: "Vesna", pts: 5 }, { name: "Tuck", pts: 2 },
      ],
    },
  },
  {
    slug: "albescent", name: "Albescent", hue: "rgba(28,28,26,0.45)", archetype: "vellum correspondence",
    silent: true, italic: true, numWeight: 300,
    glyph: "mark", display: '"Cormorant Garamond", Georgia, serif', body: '"Courier Prime", monospace',
    surfaceBg: "#ffffff", surfaceText: "#1c1c1a", muted: "rgba(28,28,26,0.42)", accent: "rgba(28,28,26,0.72)",
    pointFill: "rgba(28,28,26,0.74)", voteFill: "rgba(28,28,26,0.5)",
    pointWord: "credits", voteWord: "witnesses", giveVerb: "Credit this account",
    backerWord: "keepers", voteBtn: "Witness",
    p: {
      refNo: "XIV", task: "Tend the Archive in Silence", keeper: "Keeper Vane", house: "Third House",
      output: "All volumes restored. The shelves hold their sequence without my name in them.",
      status: "witnessed", sealed: "2026.04.21 · dawn", mode: "filed in silence", grade: "Third House",
      points: 40, votes: 31,
      backers: [
        { name: "Keeper Vane", pts: 18 }, { name: "Keeper Orin", pts: 14 }, { name: "Keeper Marsh", pts: 8 },
      ],
    },
  },
];

/* ════════════════════════════════════════════════════════════════
   GLYPHS — one per faction, used as the vote icon + backer markers
   ════════════════════════════════════════════════════════════════ */
function Glyph({ kind, fill, size = 16, tier = 5 }) {
  switch (kind) {
    case "heart":
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" style={{ display: "block" }}>
          <path d="M18 31C7 23 3 17 6.5 11 9 6.8 14 6.5 16 10c.9 1.5 1.6 2.7 2 3.4.4-.7 1.1-1.9 2-3.4 2-3.5 7-3.2 9.5 1C33 17 29 23 18 31Z" fill={fill} stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
      );
    case "star":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block" }}>
          <path d="M12 1.5l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 8.7l7.1-.6z" fill={fill} stroke="var(--everymen-ink)" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );
    case "stamp":
      return (
        <span style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: fill, color: "var(--snide-ink)", fontFamily: "var(--font-faction-black)", fontSize: size * 0.6, transform: `rotate(${tier % 2 ? 4 : -4}deg)` }}>✓</span>
      );
    case "seal":
      return (
        <span style={{ width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: fill, color: "var(--eph-parchment)", fontFamily: "var(--font-faction-engraved)", fontWeight: 700, fontSize: size * 0.46, position: "relative" }}>
          <span style={{ position: "absolute", inset: 2, borderRadius: "50%", border: "1px dashed rgba(255,255,255,0.4)", opacity: 0.6 }} />
          {ROMAN[Math.min(4, tier - 1)]}
        </span>
      );
    case "signal":
      return (
        <span style={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: size, width: size }}>
          {[0, 1, 2].map((b) => <span key={b} style={{ flex: 1, height: `${40 + b * 30}%`, background: fill }} />)}
        </span>
      );
    case "mark": {
      const s = size, c = s / 2;
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" style={{ display: "block", flexShrink: 0 }}>
          <circle cx={c} cy={c} r={s * 0.43} stroke={fill} strokeWidth={s * 0.022} opacity={0.3} />
          <circle cx={c} cy={c} r={s * 0.235} stroke={fill} strokeWidth={s * 0.05} opacity={0.7} />
          {[0, 90, 180, 270].map((deg) => {
            const a = (deg * Math.PI) / 180, t0 = s * 0.26, t1 = s * 0.39;
            return <line key={deg} x1={c + t0 * Math.cos(a)} y1={c + t0 * Math.sin(a)} x2={c + t1 * Math.cos(a)} y2={c + t1 * Math.sin(a)} stroke={fill} strokeWidth={s * 0.05} />;
          })}
          <circle cx={c} cy={c} r={s * 0.05} fill={fill} />
        </svg>
      );
    }
    case "dot":
    default:
      return <span style={{ width: size * 0.7, height: size * 0.7, borderRadius: "50%", background: fill, display: "block" }} />;
  }
}

/* round monogram avatar for ledger rows */
function Avatar({ name, fill, dark }) {
  const parts = name.replace(/^NODE_/, "").split(/[ _]+/).filter(Boolean);
  const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]) : parts[0].slice(0, 2);
  return (
    <span style={{
      width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: `color-mix(in srgb, ${fill} 22%, ${dark ? "#000" : "#fff"})`, color: fill,
      border: `1.5px solid ${fill}`, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.02em",
    }}>{initials}</span>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE BLOCK — points & votes on the read page.
   Two headline stats (POINTS · VOTES), then the BACKER LEDGER
   (who gave points — the thing the user wants), then a lightweight
   "give points" control. No average. No histogram.
   ════════════════════════════════════════════════════════════════ */
function PagePointsBlock({ f }) {
  const p = f.p, total = sumPts(p.backers), maxB = Math.max(1, ...p.backers.map((b) => b.pts));
  const line = f.dark ? "rgba(255,255,255,0.14)" : "var(--color-border-strong)";
  const lineSoft = f.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  return (
    <div style={{ background: f.surfaceBg, color: f.surfaceText, border: `1px solid ${line}`, padding: "18px 18px 20px", fontFamily: f.body, position: "relative", overflow: "hidden" }}>
      {f.glyph === "signal" && <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 3px, rgba(74,222,128,0.02) 3px 4px)", pointerEvents: "none" }} />}
      <div style={{ position: "relative" }}>
        {/* two headline stats */}
        <div style={{ display: "flex", gap: 0, marginBottom: 18 }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ fontFamily: f.display, fontWeight: f.numWeight || 800, fontStyle: f.italic ? "italic" : "normal", fontSize: 44, lineHeight: 0.85, color: f.pointFill }}>{p.points}</div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: f.muted, marginTop: 6 }}>{p.pointWord} earned</div>
          </div>
          <div style={{ flex: 1, paddingLeft: 16, borderLeft: `1px solid ${lineSoft}` }}>
            <div style={{ fontFamily: f.display, fontWeight: f.numWeight || 800, fontStyle: f.italic ? "italic" : "normal", fontSize: 44, lineHeight: 0.85, color: f.surfaceText, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: f.voteFill, display: "flex" }}><Glyph kind={f.glyph} fill={f.voteFill} size={22} /></span>{p.votes}
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: f.muted, marginTop: 6 }}>{p.voteWord}</div>
          </div>
        </div>

        {/* THE BACKER LEDGER */}
        <div style={{ fontFamily: "var(--font-body)", fontSize: 8.5, letterSpacing: "0.16em", textTransform: "uppercase", color: f.muted, marginBottom: 11, paddingTop: 14, borderTop: `1px dashed ${line}` }}>
          {p.pointWord} awarded by
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 6 }}>
          {p.backers.map((b) => (
            <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={b.name} fill={f.pointFill} dark={f.dark} />
              <span style={{ fontFamily: f.body, fontSize: 11.5, color: f.surfaceText, width: 96, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</span>
              <div style={{ flex: 1, height: 9, background: f.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, width: `${(b.pts / maxB) * 100}%`, background: f.pointFill, opacity: 0.9 }} />
              </div>
              <span style={{ fontFamily: f.display, fontWeight: 700, fontSize: 14, color: f.pointFill, width: 52, textAlign: "right", whiteSpace: "nowrap" }}>+{b.pts} <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 8, color: f.muted }}>{f.pointWord === "pvncta" || f.pointWord === "CR" ? f.pointWord : "pts"}</span></span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0 0", marginTop: 4, borderTop: `1px solid ${lineSoft}` }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: f.muted }}>{p.backers.length} {f.backerWord || "backers"} · total</span>
          <span style={{ fontFamily: f.display, fontWeight: f.numWeight || 800, fontStyle: f.italic ? "italic" : "normal", fontSize: 18, color: f.pointFill }}>{total} {f.pointWord}</span>
        </div>

        {/* give-points control */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px dashed ${line}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 8.5, letterSpacing: "0.14em", textTransform: "uppercase", color: f.muted }}>{f.giveVerb}</span>
          <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${f.pointFill}`, marginLeft: "auto" }}>
            <button type="button" style={{ width: 26, height: 26, border: "none", background: "transparent", color: f.pointFill, fontFamily: f.display, fontSize: 16, cursor: "pointer", lineHeight: 1 }}>−</button>
            <span style={{ minWidth: 30, textAlign: "center", fontFamily: f.display, fontWeight: 700, fontSize: 14, color: f.surfaceText }}>1</span>
            <button type="button" style={{ width: 26, height: 26, border: "none", background: "transparent", color: f.pointFill, fontFamily: f.display, fontSize: 16, cursor: "pointer", lineHeight: 1 }}>+</button>
          </div>
          <button type="button" style={{ height: 28, padding: "0 14px", border: "none", background: f.pointFill, color: f.dark ? "#0a0a0a" : "#fff", fontFamily: "var(--font-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Give</button>
          <button type="button" style={{ height: 28, padding: "0 12px", border: `1.5px solid ${f.voteFill}`, background: "transparent", color: f.voteFill, fontFamily: "var(--font-body)", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Glyph kind={f.glyph} fill={f.voteFill} size={13} /> {f.voteBtn || "Vote"}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  WZ_FACTIONS: FACTIONS, WZ_sumPts: sumPts, WZ_Glyph: Glyph, WZ_Avatar: Avatar,
  WZ_PagePointsBlock: PagePointsBlock,
});
