import { useState, type CSSProperties } from "react";
import type { FactionContract, FactionTask, FactionPraxis, FactionMember } from "../types";
import { wow } from "../data/wow";
import { css } from "../lib/css";
import { fmt, kfmt, initialOf } from "../lib/format";
import { useFactionMembership } from "../lib/useFactionMembership";
import { useHead } from "../lib/useHead";
import { topPraxisIndex } from "../lib/FdlLaurel";

/* ════════════════════════════════════════════════════════════════
   Warriors of Whimsy — whimsy.exe.
   Magenta computer-witch cork memo board: pinned .exe windows, taped
   index cards & polaroids, sticker charms, Caveat/Quicksand vibe (here
   approximated with Google's "Caveat" script + a rounded body face).
   Charms/pins/tapes are presentational, derived client-side per card.
   ════════════════════════════════════════════════════════════════ */

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap";

// Local aliases so inline strings can reference the two skin faces.
const SCRIPT = "'Caveat',cursive";
const BODY = "'Quicksand',sans-serif";

type Charm = "sparkle" | "heart" | "star" | "mushroom" | "rainbow" | "app";

function CharmDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="wm-sparkle" viewBox="0 0 24 24"><path d="M12 1c.6 5.2 2.8 7.4 8 8-5.2.6-7.4 2.8-8 8-.6-5.2-2.8-7.4-8-8 5.2-.6 7.4-2.8 8-8z" fill="#f6c75e" /></symbol>
      <symbol id="wm-heart" viewBox="0 0 36 36"><path d="M18 31C7 23 3 17 6.5 11 9 6.8 14 6.5 16 10c.9 1.5 1.6 2.7 2 3.4.4-.7 1.1-1.9 2-3.4 2-3.5 7-3.2 9.5 1C33 17 29 23 18 31Z" fill="#fb7aa8" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" /></symbol>
      <symbol id="wm-star" viewBox="0 0 28 28"><path d="M14 2l3 7.3L24.5 10l-5.5 4.6L20.7 23 14 18.6 7.3 23l1.7-8.4L3.5 10 11 9.3Z" fill="#f6c75e" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></symbol>
      <symbol id="wm-mushroom" viewBox="0 0 36 36"><rect x="13" y="18" width="10" height="14" rx="5" fill="#fff4e6" stroke="#fff" strokeWidth="2.2" /><path d="M4 19a14 9.5 0 0 1 28 0Z" fill="#fb7a86" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" /><circle cx="11" cy="14" r="2" fill="#fff" /><circle cx="19" cy="11.5" r="2.6" fill="#fff" /><circle cx="25" cy="15" r="1.8" fill="#fff" /></symbol>
      <symbol id="wm-rainbow" viewBox="0 0 50 36"><path d="M7 30a18 18 0 0 1 36 0h-5a13 13 0 0 0-26 0Z" fill="#f47aa6" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 30a13 13 0 0 1 26 0h-5a8 8 0 0 0-16 0Z" fill="#f6c75e" /><path d="M17 30a8 8 0 0 1 16 0h-5a3 3 0 0 0-6 0Z" fill="#86cfa6" /><ellipse cx="8" cy="30" rx="6" ry="4" fill="#fff" stroke="#e7a8c6" strokeWidth="1.2" /><ellipse cx="42" cy="30" rx="6" ry="4" fill="#fff" stroke="#e7a8c6" strokeWidth="1.2" /></symbol>
      <symbol id="wm-app" viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="40" rx="7" fill="#fffdfa" stroke="#e487b5" strokeWidth="2.5" /><rect x="8" y="12" width="48" height="12" rx="7" fill="#f3a6cb" /><circle cx="15" cy="18" r="1.8" fill="#fff" /><circle cx="21" cy="18" r="1.8" fill="#fff" /><path d="M20 34h24M20 41h15" stroke="#ec5f99" strokeWidth="2.6" strokeLinecap="round" /><path d="M50 6c.4 3.5 1.9 5 5.4 5.4-3.5.4-5 1.9-5.4 5.4-.4-3.5-1.9-5-5.4-5.4 3.5-.4 5-1.9 5.4-5.4z" fill="#f6c75e" /></symbol>
    </svg>
  );
}
const Charm = ({ id, size, style }: { id: Charm; size: number; style?: CSSProperties }) => (
  <svg width={size} height={size} style={style}><use href={`#wm-${id}`} /></svg>
);

export function WowFactionPage({ data = wow }: { data?: FactionContract }) {
  useHead("wow", FONT_HREF, "");
  const { isMember, showJoin, showGate, join, leave } = useFactionMembership(data.viewer);
  const [filter, setFilter] = useState("All");

  const { stats, identity, viewer } = data;
  const statTags = [
    { value: fmt(stats.memberCount), label: "witches", color: "#ec5f99", charm: "heart" as Charm, rot: "-3deg" },
    { value: stats.seasonRank ? "#" + stats.seasonRank : "—", label: "season rank", color: "#f6c75e", charm: "star" as Charm, rot: "2.5deg" },
    { value: fmt(stats.praxisFiled), label: "praxis filed", color: "#86cfa6", charm: "mushroom" as Charm, rot: "-2deg" },
    { value: kfmt(stats.pointsAwarded), label: "points won", color: "#b79ad8", charm: "sparkle" as Charm, rot: "3deg" },
  ];

  const chipBase =
    `font-family:${BODY};font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 11px;transition:all 120ms;white-space:nowrap;`;
  const filters = ["All", "Open to me"].map((label) => ({
    label,
    chip:
      chipBase +
      (filter === label
        ? "background:#a83a6e;color:#fff;border:2px solid #a83a6e;"
        : "background:#fffdfa;color:#a83a6e;border:2px solid #f3b6d2;"),
  }));

  const taskCharms: Charm[] = ["heart", "star", "mushroom", "rainbow"];
  const taskRots = ["-2.4deg", "1.8deg", "-1.3deg", "2.5deg"];
  const pins = ["#ec5f99", "#f6c75e", "#86cfa6", "#b79ad8"];
  const pxRots = ["-1.3deg", "2.5deg", "-0.9deg"];
  const tapes = ["#f6c75e", "#86cfa6", "#b79ad8"];
  const topIdx = topPraxisIndex(data.recentPraxis.map((p) => p.points));
  const spot = data.members.find((m) => m.isSpotlight);
  const others = data.members.filter((m) => !m.isSpotlight);

  const exeBar = (
    <>
      <span style={css("width:10px;height:10px;border-radius:50%;background:#fb7aa8;border:1.4px solid rgba(255,255,255,.7);")} />
      <span style={css("width:10px;height:10px;border-radius:50%;background:#f6c75e;border:1.4px solid rgba(255,255,255,.7);")} />
      <span style={css("width:10px;height:10px;border-radius:50%;background:#86cfa6;border:1.4px solid rgba(255,255,255,.7);")} />
    </>
  );

  return (
    <div style={css("min-height:100vh;font-family:" + BODY + ";background:#eeb4ce;background-image:radial-gradient(rgba(200,90,150,.26) 1px,transparent 1.4px),radial-gradient(rgba(224,150,190,.2) 1px,transparent 1.3px);background-size:7px 7px,11px 11px;background-position:0 0,3px 4px;")}>
      <CharmDefs />

      {/* NEUTRAL SHARED NAV */}
      <nav style={css("position:relative;z-index:6;display:flex;align-items:center;gap:22px;padding:12px 24px;background:rgba(255,253,250,.9);border-bottom:1px solid #e2b8cc;backdrop-filter:blur(8px);")}>
        <span style={css("font-family:'Quicksand',sans-serif;font-weight:700;font-size:20px;line-height:1;color:#3a2b33;padding-bottom:2px;border-bottom:3px solid;border-image:linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1;")}>World Zero</span>
        <div style={css("display:flex;gap:16px;flex:1;")}>
          {["Home", "Tasks", "Praxis", "Players", "Factions", "Updates"].map((l) => (
            <a key={l} style={css("font-family:" + BODY + ";font-size:10px;letter-spacing:.13em;text-transform:uppercase;" + (l === "Factions" ? "color:#3a2b33;border-bottom:2px solid #3a2b33;padding-bottom:3px;" : "color:#a8728e;"))}>{l}</a>
          ))}
        </div>
        <span style={css("display:inline-flex;align-items:center;gap:6px;background:#ec5f99;color:#fff;font-family:" + BODY + ";font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:5px 10px;")}><Charm id="sparkle" size={11} />Whimsy</span>
        <span style={css("font-family:" + BODY + ";font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#a8728e;border:1px solid #e2b8cc;padding:5px 11px;")}>Logout</span>
      </nav>

      {/* ══ THE CORK MEMO BOARD ══ */}
      <div style={css("position:relative;z-index:2;padding:22px;")}>
        <div style={css("position:relative;border:9px solid;border-image:linear-gradient(135deg,#f7d9e6,#e79ec2,#f7d9e6) 1;box-shadow:inset 0 0 0 2px rgba(170,90,130,.35),inset 0 3px 14px rgba(150,60,110,.35);padding:26px 30px 34px;background:#eeb4ce;background-image:radial-gradient(rgba(200,90,150,.24) 1px,transparent 1.4px),radial-gradient(rgba(224,150,190,.18) 1px,transparent 1.3px);background-size:7px 7px,11px 11px;background-position:0 0,3px 4px;overflow:hidden;max-width:1100px;margin:0 auto;")}>

          {/* ① HERO — pinned banner */}
          <div style={css("position:relative;transform:rotate(-.6deg);margin-bottom:30px;z-index:3;")}>
            <span style={css("position:absolute;top:-11px;left:34px;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#ec5f99 62%,rgba(0,0,0,.25));box-shadow:0 4px 6px rgba(80,50,30,.4);z-index:5;")} />
            <span style={css("position:absolute;top:-11px;right:34px;width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#86cfa6 62%,rgba(0,0,0,.25));box-shadow:0 4px 6px rgba(80,50,30,.4);z-index:5;")} />
            <div style={css("display:flex;align-items:center;gap:24px;flex-wrap:wrap;background:linear-gradient(135deg,#fffdfa,#fde7f1);border:1.5px solid #e487b5;border-radius:14px;padding:22px 26px;box-shadow:0 12px 26px rgba(80,50,30,.3);")}>
              <Charm id="app" size={74} style={{ flexShrink: 0, filter: "drop-shadow(0 6px 12px rgba(190,60,120,.22))" }} />
              <div style={css("flex:1;min-width:250px;")}>
                <div style={css("font-family:" + BODY + ";font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#a8728e;margin-bottom:2px;")}>Faction · est. MMXXI</div>
                <div style={css("font-family:" + SCRIPT + ";font-size:48px;font-weight:700;line-height:.9;color:#a83a6e;")}>{data.name}</div>
                <div style={css("font-family:" + SCRIPT + ";font-size:22px;color:#d23b7e;margin-top:2px;")}>{identity.motto}</div>
                <div style={css("font-family:" + BODY + ";font-size:11px;line-height:1.6;color:#b06a8c;max-width:440px;margin-top:8px;")}>{identity.blurb}</div>
              </div>
              {/* stat tags */}
              <div style={css("display:flex;flex-direction:column;gap:9px;")}>
                {statTags.map((s) => (
                  <div key={s.label} style={{ ...css("position:relative;display:flex;align-items:center;gap:8px;background:#fffdfa;border:3px solid #fff;border-radius:18px;padding:5px 14px 5px 10px;box-shadow:0 4px 9px rgba(150,60,110,.3);"), transform: `rotate(${s.rot})` }}>
                    <Charm id={s.charm} size={22} style={{ flexShrink: 0, filter: "drop-shadow(0 1px 1px rgba(120,40,80,.25))" }} />
                    <span style={{ fontFamily: SCRIPT, fontSize: 27, fontWeight: 700, lineHeight: 1, color: s.color }}>{s.value}</span>
                    <span style={css("font-family:" + BODY + ";font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:#8a6a7c;width:66px;")}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* two columns */}
          <div style={css("display:grid;grid-template-columns:1fr 320px;gap:30px;align-items:start;position:relative;z-index:3;")}>
            {/* MAIN COLUMN */}
            <div style={css("display:flex;flex-direction:column;gap:34px;")}>

              {/* ② ABOUT — taped lined index card */}
              <div style={css("position:relative;transform:rotate(-1deg);")}>
                <span style={css("position:absolute;top:-10px;left:24px;width:78px;height:24px;background:repeating-linear-gradient(45deg,#f6c75e 0 6px,#f9d886 6px 12px);opacity:.82;transform:rotate(-7deg);box-shadow:0 2px 4px rgba(80,50,30,.25);border-radius:1px;")} />
                <span style={css("position:absolute;top:-8px;right:30px;width:78px;height:24px;background:repeating-linear-gradient(45deg,#86cfa6 0 6px,#a6e0c0 6px 12px);opacity:.82;transform:rotate(6deg);box-shadow:0 2px 4px rgba(80,50,30,.25);border-radius:1px;")} />
                <div style={css("background:#fffdf8;background-image:repeating-linear-gradient(#fffdf8,#fffdf8 25px,#f2d0dd 25px,#f2d0dd 26px);border:1px solid #ecccd9;border-radius:4px;box-shadow:0 10px 22px rgba(80,50,30,.28);padding:20px 24px 22px 46px;position:relative;")}>
                  <div style={css("position:absolute;left:32px;top:0;bottom:0;width:2px;background:#f0a6bf;")} />
                  <div style={css("font-family:" + SCRIPT + ";font-size:30px;font-weight:700;color:#a83a6e;line-height:1;margin-bottom:10px;")}>the manifesto ✦</div>
                  <div style={css("display:flex;flex-direction:column;gap:9px;")}>
                    {identity.about.map((para, i) => (
                      <p key={i} style={css("font-family:" + BODY + ";font-size:11.5px;line-height:1.85;color:#7a5266;margin:0;")}>{para}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* ④ TASKS — pinned .exe windows */}
              <div>
                <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:20px;")}>
                  <span style={css("font-family:" + SCRIPT + ";font-size:28px;font-weight:700;color:#8a5c3f;line-height:1;background:#fce9d6;border:1px solid #d9a878;border-radius:8px;padding:1px 12px;transform:rotate(-1.5deg);box-shadow:0 2px 5px rgba(80,50,30,.25);")}>Tasks</span>
                  <div style={css("flex:1;")} />
                  <div style={css("display:flex;gap:6px;")}>
                    {filters.map((f) => (
                      <button key={f.label} onClick={() => setFilter(f.label)} style={css(f.chip)}>{f.label}</button>
                    ))}
                  </div>
                </div>
                <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:30px 26px;padding-top:6px;")}>
                  {data.openTasks.map((task: FactionTask, i) => (
                    <div key={task.id} style={{ position: "relative", transform: `rotate(${taskRots[i % taskRots.length]})` }}>
                      <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", width: 18, height: 18, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%,#fff,${pins[i % pins.length]} 62%,rgba(0,0,0,.28))`, boxShadow: "0 5px 7px rgba(80,50,30,.4)", zIndex: 16 }} />
                      <div style={css("border-radius:12px;overflow:hidden;border:2px solid #e487b5;box-shadow:0 12px 24px rgba(80,50,30,.32);")}>
                        <div style={css("display:flex;align-items:center;gap:7px;padding:7px 11px;background:linear-gradient(180deg,#fbcfe2,#f3a6cb);border-bottom:2px solid #e487b5;")}>
                          {exeBar}
                          <span style={css("display:inline-flex;align-items:center;gap:4px;font-family:" + BODY + ";font-size:10px;color:#8e2f5c;margin-left:4px;")}><Charm id="sparkle" size={10} />whimsy.exe</span>
                          <span style={css("margin-left:auto;font-size:11px;color:#8e2f5c;opacity:.7;letter-spacing:1.5px;")}>▭ ✕</span>
                        </div>
                        <div style={css("position:relative;padding:14px 15px 13px;background:#fdeef6;background-image:radial-gradient(rgba(214,90,150,.2) 1.4px,transparent 1.4px);background-size:13px 13px;")}>
                          <Charm id={taskCharms[i % taskCharms.length]} size={30} style={{ position: "absolute", top: -13, right: -8, transform: "rotate(13deg)", filter: "drop-shadow(0 2px 2.5px rgba(120,40,80,.3))", zIndex: 12 }} />
                          <div style={css("position:relative;z-index:2;background:#fffdfa;border:1.5px solid #f3b6d2;border-radius:7px;padding:11px 13px;margin-bottom:11px;")}>
                            <div style={css("font-family:" + BODY + ";font-size:8.5px;text-transform:uppercase;letter-spacing:.18em;color:#c2698f;margin-bottom:4px;")}>new quest · {task.points} pts</div>
                            <div style={css("font-family:" + SCRIPT + ";font-size:27px;font-weight:700;line-height:1.02;color:#a83a6e;margin-bottom:4px;")}>{task.title}</div>
                            <div style={css("font-family:" + BODY + ";font-size:9.5px;line-height:1.5;color:#b06a8c;")}>{task.description}</div>
                          </div>
                          <div style={css("position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;")}>
                            <span style={css("display:inline-flex;align-items:center;gap:4px;font-family:" + BODY + ";font-size:9px;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:20px;background:#fff;color:#b5588a;border:1px solid #f3b6d2;")}><Charm id="sparkle" size={9} />lvl {task.level}</span>
                            <span style={css("font-family:" + BODY + ";font-size:9px;color:#b5588a;letter-spacing:.1em;")}>◆ {task.points} pts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ⑤ PRAXIS — taped polaroids */}
              <div>
                <div style={css("font-family:" + SCRIPT + ";font-size:28px;font-weight:700;color:#8a5c3f;line-height:1;background:#fce9d6;border:1px solid #d9a878;border-radius:8px;padding:1px 12px;transform:rotate(-1.5deg);box-shadow:0 2px 5px rgba(80,50,30,.25);display:inline-block;margin-bottom:22px;")}>Praxis</div>
                <div style={css("display:flex;gap:22px;flex-wrap:wrap;padding-top:8px;")}>
                  {data.recentPraxis.map((px: FactionPraxis, i) => (
                    <div key={px.id} style={{ ...css("position:relative;width:172px;background:#fffdfa;border:1px solid #f0c6da;box-shadow:0 10px 20px rgba(80,50,30,.3);padding:9px 9px 0;"), transform: `rotate(${pxRots[i % pxRots.length]})` }}>
                      <span style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%) rotate(-4deg)", width: 66, height: 21, background: tapes[i % tapes.length], opacity: 0.78, boxShadow: "0 2px 3px rgba(80,50,30,.25)", borderRadius: 1 }} />
                      <div style={css("position:relative;height:104px;background:linear-gradient(140deg,#fbcfe2,#f3a6cb);display:flex;align-items:center;justify-content:center;overflow:hidden;")}>
                        <div style={css("width:52px;height:52px;border-radius:50%;background:linear-gradient(150deg,#f3a6cb,#d23b7e);border:2px solid #fff;box-shadow:0 3px 9px rgba(190,60,120,.35);display:flex;align-items:center;justify-content:center;font-family:" + BODY + ";font-weight:700;color:#fff;font-size:20px;")}>{initialOf(px.author)}</div>
                        {i === topIdx
                          ? <span style={{ position: "absolute", bottom: 4, right: 4, width: 30, height: 30 }}><span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 90deg,#fbbf24,#f97316,#be185d,#4f46e5,#0e7490,#16a34a,#fbbf24)" }} /><span style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#fffdfa" }} /></span>
                          : <Charm id="heart" size={26} style={{ position: "absolute", bottom: 6, right: 6, transform: "rotate(-10deg)" }} />}
                      </div>
                      <div style={css("padding:11px 6px 15px;text-align:center;")}>
                        <div style={css("font-family:" + SCRIPT + ";font-size:19px;font-weight:700;color:#a83a6e;line-height:1.15;margin-bottom:6px;")}>{px.finding}</div>
                        <div style={css("font-family:" + BODY + ";font-size:8px;letter-spacing:.05em;text-transform:uppercase;color:#a8728e;")}>{px.author} · {px.sealedAt}</div>
                        <div style={css("display:inline-flex;align-items:center;gap:3px;font-family:" + BODY + ";font-size:10px;color:#d23b7e;margin-top:5px;")}><Charm id="heart" size={12} />{px.endorsements} · ◆ {px.points}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT RAIL */}
            <div style={css("display:flex;flex-direction:column;gap:34px;")}>
              {/* ③ JOIN.exe */}
              <div style={css("position:relative;transform:rotate(1deg);")}>
                <span style={css("position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:18px;height:18px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#f6c75e 62%,rgba(0,0,0,.28));box-shadow:0 5px 7px rgba(80,50,30,.4);z-index:16;")} />
                <div style={css("border-radius:13px;overflow:hidden;border:2px solid #e487b5;box-shadow:0 12px 24px rgba(80,50,30,.32);")}>
                  <div style={css("display:flex;align-items:center;gap:7px;padding:8px 12px;background:linear-gradient(180deg,#fbcfe2,#f3a6cb);border-bottom:2px solid #e487b5;")}>
                    {exeBar}
                    <span style={css("margin-left:auto;font-family:" + BODY + ";font-size:9.5px;color:#8e2f5c;")}>join.exe</span>
                  </div>
                  <div style={css("background:#fffdfa;padding:18px;")}>
                    {isMember && (
                      <div style={css("text-align:center;")}>
                        <Charm id="star" size={36} style={{ marginBottom: 6 }} />
                        <div style={css("font-family:" + SCRIPT + ";font-size:25px;font-weight:700;color:#2f8f5f;line-height:1;")}>You're in the circle</div>
                        <div style={css("font-family:" + BODY + ";font-size:10.5px;color:#7a5266;margin:6px 0 14px;")}>Standing · <b style={css("color:#a83a6e;")}>{viewer.role}</b></div>
                        <button onClick={leave} style={css("width:100%;font-family:" + BODY + ";font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#b06a8c;background:transparent;border:1px solid #e487b5;border-radius:8px;padding:9px;")}>Leave the coven</button>
                      </div>
                    )}
                    {showJoin && (
                      <div style={css("text-align:center;")}>
                        <div style={css("font-family:" + SCRIPT + ";font-size:26px;font-weight:700;color:#a83a6e;line-height:1;margin-bottom:6px;")}>The circle is open</div>
                        <div style={css("font-family:" + BODY + ";font-size:10.5px;line-height:1.55;color:#8a6a7c;margin-bottom:14px;")}>You've done the work — welcome home, witch.</div>
                        <button onClick={join} style={css("width:100%;font-family:" + BODY + ";font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:#ec5f99;border:none;border-radius:10px;padding:12px;box-shadow:0 6px 16px rgba(236,95,153,.4);")}>Join the coven</button>
                      </div>
                    )}
                    {showGate && (
                      <div>
                        <div style={css("display:flex;align-items:flex-start;gap:9px;margin-bottom:12px;")}>
                          <Charm id="mushroom" size={20} style={{ flexShrink: 0, marginTop: 3 }} />
                          <span style={css("font-family:" + SCRIPT + ";font-size:23px;font-weight:700;color:#a83a6e;line-height:1.2;")}>{viewer.requirement.summary}</span>
                        </div>
                        <div style={css("font-family:" + BODY + ";font-size:10.5px;line-height:1.55;color:#8a6a7c;margin-bottom:14px;")}>{viewer.requirement.detail}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ⑥ MEMBERS — polaroid + roster note */}
              <div style={css("display:flex;flex-direction:column;gap:20px;")}>
                {spot && (
                  <div style={css("position:relative;transform:rotate(-2deg);align-self:center;width:180px;background:#fffdfa;border:1px solid #f0c6da;box-shadow:0 10px 20px rgba(80,50,30,.3);padding:10px 10px 0;")}>
                    <span style={css("position:absolute;top:-11px;left:50%;transform:translateX(-50%);width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#b79ad8 62%,rgba(0,0,0,.28));box-shadow:0 5px 7px rgba(80,50,30,.4);z-index:16;")} />
                    <div style={css("height:120px;background:linear-gradient(140deg,#f3a6cb,#d23b7e);display:flex;align-items:center;justify-content:center;")}>
                      <div style={css("width:60px;height:60px;border-radius:50%;background:linear-gradient(150deg,#fbcfe2,#a83a6e);border:2px solid #fff;box-shadow:0 3px 10px rgba(190,60,120,.4);display:flex;align-items:center;justify-content:center;font-family:" + BODY + ";font-weight:700;color:#fff;font-size:24px;")}>{initialOf(spot.name)}</div>
                    </div>
                    <div style={css("padding:8px 4px 14px;text-align:center;")}>
                      <div style={css("font-family:" + BODY + ";font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:#c2698f;")}>Witch of the week</div>
                      <div style={css("font-family:" + SCRIPT + ";font-size:26px;font-weight:700;color:#a83a6e;line-height:1;")}>{spot.name}</div>
                      <div style={css("font-family:" + BODY + ";font-size:8.5px;color:#8a6a7c;margin-top:2px;")}>lvl {spot.level} · {fmt(spot.points)} pts</div>
                    </div>
                  </div>
                )}
                <div style={css("position:relative;transform:rotate(.8deg);")}>
                  <span style={css("position:absolute;top:-9px;left:26px;width:72px;height:22px;background:repeating-linear-gradient(45deg,#b79ad8 0 6px,#cdb6e6 6px 12px);opacity:.8;transform:rotate(-6deg);box-shadow:0 2px 4px rgba(80,50,30,.25);")} />
                  <div style={css("background:#fffdf8;background-image:repeating-linear-gradient(#fffdf8,#fffdf8 23px,#f2d0dd 23px,#f2d0dd 24px);border:1px solid #ecccd9;border-radius:4px;box-shadow:0 10px 20px rgba(80,50,30,.28);padding:14px 16px;")}>
                    <div style={css("font-family:" + SCRIPT + ";font-size:23px;font-weight:700;color:#a83a6e;line-height:1;margin-bottom:8px;")}>the coven roster</div>
                    {others.map((m: FactionMember) => (
                      <div key={m.id} style={css("display:flex;align-items:center;gap:10px;padding:5px 0;")}>
                        <span style={css("width:26px;height:26px;border-radius:50%;flex-shrink:0;background:linear-gradient(150deg,#fbcfe2,#ec5f99);border:1.5px solid #e487b5;display:flex;align-items:center;justify-content:center;font-family:" + BODY + ";font-weight:700;color:#fff;font-size:10px;")}>{initialOf(m.name)}</span>
                        <span style={css("flex:1;min-width:0;font-family:" + SCRIPT + ";font-size:19px;color:#5a3450;line-height:1;")}>{m.name}</span>
                        <span style={css("font-family:" + BODY + ";font-size:9px;color:#b5588a;")}>lvl {m.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
