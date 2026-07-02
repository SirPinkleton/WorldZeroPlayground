import { useState, type CSSProperties } from "react";
import type { FactionContract, FactionTask, FactionPraxis, FactionMember } from "../types";
import { ua } from "../data/ua";
import { css } from "../lib/css";
import { fmt, kfmt, roman, initialOf } from "../lib/format";
import { useFactionMembership } from "../lib/useFactionMembership";
import { useHead } from "../lib/useHead";
import { FdlLaurel, topPraxisIndex } from "../lib/FdlLaurel";

/* ════════════════════════════════════════════════════════════════
   University of Asthmatics — gilt salon.
   Burnt amber + antique gold on parchment, Playfair Display italic
   mastheads, a crossed-brushes crest, gilt-framed commission placards.
   Always-light. Stats sit stacked on the side of the hero crest.
   ════════════════════════════════════════════════════════════════ */

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600;1,700;1,800&family=Marcellus&family=Marcellus+SC&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap";

const GILT = "linear-gradient(135deg,#eec06a 0%,#9c6a1a 24%,#f0c878 50%,#9c6a1a 76%,#dd9322 100%)";

function CrestDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="ua-crest" viewBox="0 0 100 120">
        <defs><clipPath id="ua-crest-clip"><path d="M8 6 H92 V60 C92 92 66 108 50 116 C34 108 8 92 8 60 Z" /></clipPath></defs>
        <g clipPath="url(#ua-crest-clip)">
          <rect x="0" y="0" width="100" height="120" fill="#f8ead2" />
          <rect x="0" y="0" width="100" height="30" fill="#c2541f" />
          <circle cx="30" cy="15" r="3.6" fill="#eec06a" /><circle cx="50" cy="15" r="3.6" fill="#eec06a" /><circle cx="70" cy="15" r="3.6" fill="#eec06a" />
          <g transform="translate(50 70)">
            <g transform="rotate(40)"><rect x="-2.4" y="-30" width="4.8" height="42" rx="2" fill="#9c6a1a" /><rect x="-3.6" y="9" width="7.2" height="6" fill="#eec06a" /><path d="M-3.6 15 L3.6 15 L2 27 L-2 27 Z" fill="#c2541f" /></g>
            <g transform="rotate(-40)"><rect x="-2.4" y="-30" width="4.8" height="42" rx="2" fill="#3d2410" /><rect x="-3.6" y="9" width="7.2" height="6" fill="#eec06a" /><path d="M-3.6 15 L3.6 15 L2 27 L-2 27 Z" fill="#dd9322" /></g>
          </g>
        </g>
        <path d="M8 6 H92 V60 C92 92 66 108 50 116 C34 108 8 92 8 60 Z" fill="none" stroke="#dd9322" strokeWidth="2.5" />
        <path d="M8 6 H92 V60 C92 92 66 108 50 116 C34 108 8 92 8 60 Z" fill="none" stroke="#3d2410" strokeWidth="0.8" />
      </symbol>
    </svg>
  );
}
const Crest = ({ w, h, style }: { w: number; h: number; style?: CSSProperties }) => (
  <svg viewBox="0 0 100 120" style={{ width: w, height: h, display: "block", ...style }}><use href="#ua-crest" /></svg>
);

export function UaFactionPage({ data = ua }: { data?: FactionContract }) {
  useHead("ua", FONT_HREF, "");
  const { isMember, showJoin, showGate, join, leave } = useFactionMembership(data.viewer);
  const [filter, setFilter] = useState("All");

  const { stats, identity, viewer } = data;
  const ordinal = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh"];
  const statList = [
    { value: fmt(stats.memberCount), label: "enrolled" },
    { value: stats.seasonRank ? ordinal[stats.seasonRank] ?? "#" + stats.seasonRank : "—", label: "season seat" },
    { value: fmt(stats.praxisFiled), label: "exhibited" },
    { value: kfmt(stats.pointsAwarded), label: "pts awarded" },
  ];

  const chipBase =
    "font-family:'Marcellus SC',serif;font-size:9px;letter-spacing:.1em;padding:6px 13px;transition:all 120ms;white-space:nowrap;";
  const filters = ["All", "Open to me"].map((label) => ({
    label,
    chip:
      chipBase +
      (filter === label
        ? "background:#c2541f;color:#fef9f0;border:1px solid #c2541f;"
        : "background:#fdf1df;color:#c2541f;border:1px solid #e0b88a;"),
  }));

  const rots = ["-0.6deg", "0.5deg", "-0.4deg", "0.7deg"];
  const markFor = (e: number) => (e >= 100 ? "masterwork" : e >= 60 ? "distinguished" : "accomplished");
  const topIdx = topPraxisIndex(data.recentPraxis.map((p) => p.points));
  const spot = data.members.find((m) => m.isSpotlight);
  const others = data.members.filter((m) => !m.isSpotlight);

  return (
    <div style={css("min-height:100vh;font-family:'Courier Prime',monospace;color:#3d2410;background:#ece4d2;background-image:radial-gradient(70% 50% at 8% 0%,rgba(221,147,34,.07),transparent 70%),radial-gradient(60% 50% at 100% 8%,rgba(194,84,31,.06),transparent 70%),radial-gradient(rgba(140,106,30,.045) 1px,transparent 1px);background-size:auto,auto,6px 6px;")}>
      <CrestDefs />

      {/* NEUTRAL SHARED NAV */}
      <nav style={css("position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:22px;padding:13px 30px;background:rgba(253,246,234,.86);border-bottom:1px solid #d8c39a;backdrop-filter:blur(8px);")}>
        <span style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:21px;line-height:1;padding-bottom:2px;border-bottom:3px solid;border-image:linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1;")}>World Zero</span>
        <div style={css("display:flex;gap:17px;flex:1;")}>
          {["Home", "Tasks", "Salon", "Players", "Factions", "Updates"].map((l) => (
            <a key={l} style={css("font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;" + (l === "Factions" ? "color:#c2541f;border-bottom:1px solid #c2541f;padding-bottom:3px;" : "color:#a8895a;"))}>{l}</a>
          ))}
        </div>
        <span style={css("display:inline-flex;align-items:center;gap:7px;border:1px solid #e0b88a;background:#fdf1df;color:#c2541f;font-family:'Marcellus SC',serif;font-size:11px;letter-spacing:.12em;padding:5px 12px;")}><span style={css("width:8px;height:8px;border-radius:50%;background:#c2541f;")} />UA</span>
        <span style={css("font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#a8895a;border:1px solid #d8c39a;padding:5px 11px;")}>Logout</span>
      </nav>

      <div style={css("max-width:1140px;margin:0 auto;padding:30px 30px 84px;")}>

        {/* ① HERO */}
        <header style={css("position:relative;overflow:hidden;background:#fdf6ea;border:1px solid #cdab63;box-shadow:0 16px 40px rgba(60,40,10,.16),inset 0 0 0 4px #fdf6ea,inset 0 0 0 5px #e7c889;margin-bottom:40px;")}>
          <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(60,40,10,.03) 1px,transparent 1px);background-size:6px 6px;")} />
          <div style={css("position:relative;z-index:2;display:grid;grid-template-columns:1fr auto;gap:44px;align-items:center;padding:42px 46px;")}>
            <div>
              <div style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:#a8895a;line-height:2;margin-bottom:14px;")}>
                <div>World Zero · faction no. 1 · the purple seat, repainted</div>
                <div>Fourth Season · now enrolling</div>
                <div>Motto · <span style={css("color:#c2541f;")}>{identity.motto}</span></div>
              </div>
              <h1 style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:800;font-size:56px;line-height:.96;letter-spacing:-.01em;color:#3d2410;margin:0;max-width:9ch;")}>{data.name}</h1>
              <div style={css("font-family:'Marcellus SC',serif;font-size:12px;letter-spacing:.14em;color:#9c6a1a;margin:12px 0 0;")}>An academy of the arts &amp; shallow breathing</div>
              <p style={css("font-family:'EB Garamond',serif;font-size:15px;line-height:1.7;color:#6a4f2c;max-width:500px;margin:20px 0 0;")}>{identity.blurb}</p>
            </div>
            {/* right column: gilt crest + stats stacked on the side */}
            <div style={css("flex-shrink:0;display:flex;flex-direction:column;gap:22px;width:248px;")}>
              <div style={{ padding: 13, background: GILT, boxShadow: "0 14px 30px rgba(60,40,10,.26),inset 0 0 0 1px rgba(255,255,255,.45)" }}>
                <div style={{ padding: 4, background: "linear-gradient(135deg,#9c6a1a,#eec06a)" }}>
                  <div style={css("background:#fef9f0;padding:18px 18px 13px;border:1px solid rgba(60,40,10,.35);text-align:center;")}>
                    <Crest w={132} h={158} style={{ margin: "0 auto" }} />
                    <div style={css("font-family:'Marcellus SC',serif;font-size:8px;letter-spacing:.1em;color:#9c6a1a;margin-top:6px;")}>{identity.motto}</div>
                  </div>
                </div>
              </div>
              <div style={css("display:flex;flex-direction:column;gap:11px;")}>
                {statList.map((s) => (
                  <div key={s.label} style={css("display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid #e0c89a;padding-top:9px;")}>
                    <span style={css("font-family:'Marcellus SC',serif;font-size:8.5px;letter-spacing:.12em;color:#a8895a;text-transform:uppercase;")}>{s.label}</span>
                    <span style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:23px;line-height:1;color:#c2541f;")}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div style={css("display:grid;grid-template-columns:1fr 322px;gap:34px;align-items:start;")}>
          {/* MAIN COLUMN */}
          <div style={css("display:flex;flex-direction:column;gap:50px;")}>

            {/* ② PROSPECTUS */}
            <div style={css("position:relative;background:#fdf6ea;border:1px solid #cdab63;box-shadow:0 6px 20px rgba(60,40,10,.09),inset 0 0 0 3px #fdf6ea,inset 0 0 0 4px #ecd6a4;padding:26px 30px 28px;overflow:hidden;")}>
              <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(60,40,10,.03) 1px,transparent 1px);background-size:5px 5px;")} />
              <div style={css("position:relative;display:flex;align-items:center;gap:12px;margin-bottom:16px;")}>
                <span style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:#a8895a;")}>The prospectus</span>
                <span style={css("flex:1;height:1px;background:linear-gradient(90deg,#dd9322,transparent);")} />
              </div>
              <div style={css("position:relative;display:flex;flex-direction:column;gap:12px;")}>
                {identity.about.map((para, i) => (
                  <p key={i} style={css("font-family:'EB Garamond',serif;font-size:15px;line-height:1.75;color:#4a3218;margin:0;")}>{para}</p>
                ))}
              </div>
            </div>

            {/* ④ TASKS */}
            <div>
              <div style={css("display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:8px;flex-wrap:wrap;")}>
                <div>
                  <div style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:#a8895a;margin-bottom:7px;")}>Now accepting submissions</div>
                  <h2 style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:30px;line-height:1;color:#3d2410;margin:0;")}>Tasks</h2>
                </div>
                <div style={css("display:flex;gap:7px;")}>
                  {filters.map((f) => (
                    <button key={f.label} onClick={() => setFilter(f.label)} style={css(f.chip)}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:26px;padding-top:20px;")}>
                {data.openTasks.map((task: FactionTask, i) => (
                  <div key={task.id} style={{ ...css("font-family:'EB Garamond',serif;"), transform: `rotate(${rots[i % rots.length]})` }}>
                    <div style={{ padding: 10, background: GILT, boxShadow: "0 14px 30px rgba(60,40,10,.22),inset 0 0 0 1px rgba(255,255,255,.45)" }}>
                      <div style={{ padding: 4, background: "linear-gradient(135deg,#9c6a1a,#eec06a)" }}>
                        <div style={css("border:1px solid rgba(60,40,10,.4);background:#fef9f0;padding:20px 18px 18px;text-align:center;background-image:radial-gradient(rgba(60,40,10,.03) 1px,transparent 1px);background-size:5px 5px;")}>
                          <div style={css("font-family:'Marcellus SC',serif;font-size:9px;letter-spacing:.12em;color:#c2541f;margin-bottom:1px;")}>University of Asthmatics</div>
                          <div style={css("font-family:'Courier Prime',monospace;font-size:6.5px;letter-spacing:.3em;color:#a8895a;margin-bottom:11px;")}>COMMISSION {roman(43 + i)}</div>
                          <Crest w={82} h={98} style={{ margin: "0 auto 4px" }} />
                          <div style={css("margin:6px auto 12px;width:94%;background:#c2541f;color:#fce4c4;font-family:'Marcellus SC',serif;font-size:8px;letter-spacing:.06em;padding:4px 0;clip-path:polygon(0 0,100% 0,95% 50%,100% 100%,0 100%,5% 50%);")}>{identity.motto}</div>
                          <div style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:600;font-size:21px;line-height:1.14;color:#3d2410;margin-bottom:8px;")}>{task.title}</div>
                          <div style={css("font-family:'EB Garamond',serif;font-style:italic;font-size:12px;line-height:1.45;color:#8f6a3a;margin-bottom:13px;")}>{task.description}</div>
                          <div style={css("display:flex;justify-content:center;align-items:center;gap:10px;border-top:1px solid #e3cb98;padding-top:11px;margin-bottom:14px;")}><span style={css("font-family:'Marcellus SC',serif;font-size:9px;color:#8f6a3a;")}>Anno {roman(task.level)}</span><span style={css("color:#dd9322;")}>✦</span><span style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:16px;color:#c2541f;")}>{task.points}<span style={css("font-family:'Marcellus SC',serif;font-size:8px;margin-left:3px;color:#8f6a3a;")}>pts</span></span></div>
                          <button style={css("width:100%;font-family:'Marcellus SC',serif;font-size:10px;letter-spacing:.14em;color:#fef9f0;background:#c2541f;border:none;padding:9px;")}>Take it up ▸</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ⑤ PRAXIS */}
            <div>
              <div style={css("margin-bottom:20px;")}>
                <div style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:#a8895a;margin-bottom:7px;")}>Recently exhibited &amp; critiqued</div>
                <h2 style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:30px;line-height:1;color:#3d2410;margin:0;")}>Praxis</h2>
              </div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:16px;")}>
                {data.recentPraxis.map((px: FactionPraxis, i) => (
                  <div key={px.id} style={css("position:relative;display:flex;gap:15px;align-items:stretch;background:#fdf6ea;border:1px solid #cdab63;box-shadow:0 4px 14px rgba(60,40,10,.08),inset 0 0 0 3px #fdf6ea,inset 0 0 0 4px #ecd6a4;padding:16px 18px;")}>
                    {i === topIdx && <FdlLaurel size={42} innerBg="#fef9f0" glyphColor="#3d2410" rotate="-8deg" shadow="drop-shadow(1.5px 2px 0 rgba(60,40,10,.28))" style={{ position: "absolute", top: 10, right: 12 }} />}
                    <Crest w={44} h={53} style={{ flexShrink: 0, alignSelf: "center" }} />
                    <div style={css("flex:1;min-width:0;")}>
                      <div style={css("font-family:'EB Garamond',serif;font-style:italic;font-size:15px;color:#3d2410;margin-bottom:3px;")}>{px.author}</div>
                      <div style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:600;font-size:16px;line-height:1.15;color:#5a4326;margin-bottom:7px;")}>{px.finding}</div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.04em;color:#a8895a;line-height:1.6;")}>Oil on canvas · marked <span style={css("color:#c2541f;")}>{markFor(px.endorsements)}</span><br />from “{px.taskTitle}” · {px.points} pts · {px.sealedAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div style={css("display:flex;flex-direction:column;gap:50px;")}>
            {/* ③ THE REGISTRY */}
            <div style={css("position:relative;background:#fdf6ea;border:1px solid #cdab63;box-shadow:0 8px 24px rgba(60,40,10,.12),inset 0 0 0 3px #fdf6ea,inset 0 0 0 4px #e7c889;padding:24px 22px;overflow:hidden;")}>
              <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(60,40,10,.03) 1px,transparent 1px);background-size:5px 5px;")} />
              <div style={css("position:relative;display:flex;align-items:center;gap:10px;margin-bottom:16px;")}>
                <span style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.24em;text-transform:uppercase;color:#a8895a;")}>The Registry</span>
                <span style={css("flex:1;height:1px;background:linear-gradient(90deg,#dd9322,transparent);")} />
              </div>
              <div style={css("position:relative;")}>
                {isMember && (
                  <div>
                    <div style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:24px;line-height:1;color:#3d2410;")}>Your name is on the wall</div>
                    <div style={css("font-family:'EB Garamond',serif;font-size:13px;color:#6a4f2c;margin:10px 0 18px;")}>Standing · <span style={css("font-style:italic;color:#c2541f;")}>{viewer.role}</span></div>
                    <button onClick={leave} style={css("width:100%;font-family:'Marcellus SC',serif;font-size:10px;letter-spacing:.14em;color:#8f6a3a;background:transparent;border:1px solid #d8c39a;padding:10px;")}>Withdraw from the Salon</button>
                  </div>
                )}
                {showJoin && (
                  <div>
                    <div style={css("font-family:'Marcellus SC',serif;font-size:10px;letter-spacing:.1em;color:#9c6a1a;margin-bottom:5px;")}>The easels are warm —</div>
                    <div style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:24px;line-height:1.02;color:#3d2410;margin-bottom:10px;")}>Submit your portfolio</div>
                    <div style={css("font-family:'EB Garamond',serif;font-size:13px;line-height:1.55;color:#6a4f2c;margin-bottom:18px;")}>All media welcome, talent optional. Enroll and take your first commission today.</div>
                    <button onClick={join} style={css("width:100%;font-family:'Marcellus SC',serif;font-size:11px;letter-spacing:.14em;color:#fef9f0;background:#c2541f;border:none;padding:12px;box-shadow:0 6px 16px rgba(194,84,31,.28);")}>Enroll ▸</button>
                  </div>
                )}
                {showGate && (
                  <div>
                    <div style={css("font-family:'Marcellus SC',serif;font-size:10px;letter-spacing:.1em;color:#9c6a1a;margin-bottom:5px;")}>Not enrolled — yet</div>
                    <div style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:23px;line-height:1.04;color:#3d2410;margin-bottom:12px;")}>{viewer.requirement.summary}</div>
                    <div style={css("font-family:'EB Garamond',serif;font-size:13px;line-height:1.65;color:#6a4f2c;")}>{viewer.requirement.detail}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ⑥ MEMBERS */}
            <div style={css("display:flex;flex-direction:column;gap:20px;")}>
              {spot && (
                <div style={{ position: "relative", padding: 11, background: GILT, boxShadow: "0 12px 28px rgba(60,40,10,.22),inset 0 0 0 1px rgba(255,255,255,.45)" }}>
                  <div style={{ padding: 4, background: "linear-gradient(135deg,#9c6a1a,#eec06a)" }}>
                    <div style={css("background:#fef9f0;border:1px solid rgba(60,40,10,.35);padding:20px 18px 18px;text-align:center;")}>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:7px;letter-spacing:.3em;text-transform:uppercase;color:#a8895a;margin-bottom:12px;")}>Artist in Residence</div>
                      <div style={css("width:72px;height:72px;border-radius:50%;margin:0 auto 12px;background:#f6ead0;border:2px solid #c2541f;box-shadow:0 0 0 3px #fef9f0,0 0 0 4px #dd9322;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:30px;color:#c2541f;")}>{initialOf(spot.name)}</div>
                      <div style={css("font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:24px;line-height:1;color:#3d2410;")}>{spot.name}</div>
                      <div style={css("font-family:'EB Garamond',serif;font-style:italic;font-size:12.5px;color:#8f6a3a;margin-top:4px;")}>{spot.role}</div>
                      <div style={css("font-family:'Marcellus SC',serif;font-size:8px;letter-spacing:.12em;color:#a8895a;margin-top:8px;text-transform:uppercase;")}>Anno {roman(spot.level)} · {fmt(spot.points)} pts</div>
                    </div>
                  </div>
                </div>
              )}
              <div style={css("position:relative;background:#fdf6ea;border:1px solid #cdab63;box-shadow:0 4px 14px rgba(60,40,10,.08),inset 0 0 0 3px #fdf6ea,inset 0 0 0 4px #ecd6a4;padding:18px 20px 14px;overflow:hidden;")}>
                <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(60,40,10,.03) 1px,transparent 1px);background-size:5px 5px;")} />
                <div style={css("position:relative;font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.24em;text-transform:uppercase;color:#a8895a;margin-bottom:12px;")}>The register</div>
                {others.map((m: FactionMember) => (
                  <div key={m.id} style={css("position:relative;display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #ecd6a4;")}>
                    <span style={css("width:32px;height:32px;border-radius:50%;flex-shrink:0;background:#f6ead0;border:1px solid #dd9322;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-style:italic;font-weight:700;font-size:14px;color:#c2541f;")}>{initialOf(m.name)}</span>
                    <div style={css("flex:1;min-width:0;")}>
                      <div style={css("font-family:'EB Garamond',serif;font-style:italic;font-size:15px;color:#3d2410;line-height:1.1;")}>{m.name}</div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:7.5px;letter-spacing:.06em;text-transform:uppercase;color:#a8895a;")}>{m.role}</div>
                    </div>
                    <span style={css("font-family:'Marcellus SC',serif;font-size:9px;letter-spacing:.08em;color:#9c6a1a;")}>Anno {roman(m.level)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
