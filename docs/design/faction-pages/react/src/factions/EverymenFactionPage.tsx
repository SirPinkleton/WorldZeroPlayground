import { useState } from "react";
import type { FactionContract, FactionTask, FactionPraxis, FactionMember } from "../types";
import { everymen } from "../data/everymen";
import { css } from "../lib/css";
import { fmt, kfmt, initialOf } from "../lib/format";
import { useFactionMembership } from "../lib/useFactionMembership";
import { useHead } from "../lib/useHead";
import { FdlLaurel, topPraxisIndex } from "../lib/FdlLaurel";

/* ════════════════════════════════════════════════════════════════
   The Everymen — union / victory poster.
   Propaganda red + gold + press-ink, Bebas Neue mastheads, a cog sigil,
   sunburst screen-print, rubber-stamp point seals. Stats sit in a side
   ledger panel in the hero (per the standardization review).
   ════════════════════════════════════════════════════════════════ */

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap";

function CogDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="em-cog" viewBox="0 0 24 24">
        <g fill="currentColor">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect key={deg} x="11" y="0.5" width="2" height="5" rx="0.5" transform={`rotate(${deg} 12 12)`} />
          ))}
        </g>
        <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </symbol>
    </svg>
  );
}
const Cog = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} style={{ color }}><use href="#em-cog" /></svg>
);

export function EverymenFactionPage({ data = everymen }: { data?: FactionContract }) {
  useHead("everymen", FONT_HREF, "");
  const { isMember, showJoin, showGate, join, leave } = useFactionMembership(data.viewer);
  const [filter, setFilter] = useState("All");

  const { stats, identity, viewer } = data;
  const statList = [
    { value: fmt(stats.memberCount), label: "members" },
    { value: fmt(stats.praxisFiled), label: "tasks done" },
    { value: stats.seasonRank ? "#" + stats.seasonRank : "—", label: "season rank" },
    { value: kfmt(stats.pointsAwarded), label: "pts awarded" },
  ];

  const chipBase =
    "font-family:'Courier Prime',monospace;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 12px;transition:all 120ms;white-space:nowrap;";
  const filters = ["All", "Open to me"].map((label) => ({
    label,
    chip:
      chipBase +
      (filter === label
        ? "background:#221a12;color:#d99a2b;border:1.5px solid #221a12;"
        : "background:#f4ecd6;color:#221a12;border:1.5px solid #221a12;"),
  }));

  const topIdx = topPraxisIndex(data.recentPraxis.map((p) => p.points));
  const spot = data.members.find((m) => m.isSpotlight);
  const others = data.members.filter((m) => !m.isSpotlight);

  return (
    <div style={css("min-height:100vh;font-family:'Courier Prime',monospace;color:#221a12;background:#ece1c6;background-image:radial-gradient(rgba(34,26,18,.05) .6px,transparent .7px);background-size:4px 4px;")}>
      <CogDefs />

      {/* NEUTRAL SHARED NAV */}
      <nav style={css("position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:24px;padding:14px 32px;background:rgba(236,225,198,.9);border-bottom:1px solid rgba(34,26,18,.14);backdrop-filter:blur(8px);")}>
        <span style={css("font-family:'Lora',Georgia,serif;font-style:italic;font-weight:500;font-size:22px;line-height:1;padding-bottom:2px;border-bottom:3px solid;border-image:linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1;")}>World Zero</span>
        <div style={css("display:flex;gap:19px;flex:1;")}>
          {["Home", "Tasks", "Praxis", "Players", "Factions", "Updates"].map((l) => (
            <a key={l} style={css("font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.13em;text-transform:uppercase;" + (l === "Factions" ? "color:#221a12;border-bottom:2px solid #221a12;padding-bottom:3px;" : "color:#6c5a40;"))}>{l}</a>
          ))}
        </div>
        <span style={css("display:inline-flex;align-items:center;gap:6px;background:#c1272d;color:#f4ecd6;font-family:'Courier Prime',monospace;font-weight:700;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:5px 10px;")}><Cog size={13} color="#f4ecd6" />Everymen</span>
        <span style={css("font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#6c5a40;border:1px solid rgba(34,26,18,.22);padding:5px 11px;")}>Logout</span>
      </nav>

      <div style={css("max-width:1160px;margin:0 auto;padding:30px 32px 84px;")}>

        {/* ① HERO */}
        <header style={css("position:relative;overflow:hidden;border:3px solid #221a12;background:#c1272d;color:#f4ecd6;box-shadow:8px 10px 0 rgba(34,26,18,.35);margin-bottom:40px;")}>
          <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.5;background:repeating-conic-gradient(from 0deg at 20% 40%,#8d1c20 0deg 8deg,transparent 8deg 16deg);")} />
          <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.08;background-image:radial-gradient(#f4ecd6 .6px,transparent .7px);background-size:4px 4px;")} />
          <div style={css("height:5px;background:#d99a2b;position:relative;z-index:2;")} />
          <div style={css("position:relative;z-index:2;display:flex;align-items:stretch;flex-wrap:wrap;")}>
            <div style={css("flex:1;min-width:300px;display:flex;align-items:center;gap:30px;padding:32px 40px;")}>
              <div style={css("flex-shrink:0;width:116px;height:116px;border-radius:50%;background:#f4ecd6;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 4px #221a12,inset 0 0 0 6px #c1272d;")}>
                <Cog size={58} color="#c1272d" />
              </div>
              <div style={css("flex:1;min-width:0;")}>
                <div style={css("font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#d99a2b;margin-bottom:6px;")}>World Zero · faction no. 6 · the missing red</div>
                <h1 style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:78px;line-height:.82;letter-spacing:.01em;margin:0;color:#f4ecd6;text-shadow:3px 3px 0 #221a12;")}>{data.name}</h1>
                <div style={css("display:inline-block;margin-top:12px;background:#221a12;color:#d99a2b;font-family:'Bebas Neue',Impact,sans-serif;font-size:18px;letter-spacing:.18em;padding:4px 15px;")}>{identity.motto}</div>
                <p style={css("font-family:'Courier Prime',monospace;font-size:12.5px;line-height:1.65;max-width:520px;margin:14px 0 0;color:#f4ecd6;")}>{identity.blurb}</p>
              </div>
            </div>
            {/* stats on the side — ledger panel */}
            <div style={css("flex-shrink:0;width:238px;background:#221a12;border-left:2px solid #d99a2b;display:flex;flex-direction:column;justify-content:center;padding:14px 26px;")}>
              {statList.map((s) => (
                <div key={s.label} style={css("display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:11px 0;border-bottom:1px solid rgba(217,154,43,.22);")}>
                  <span style={css("font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#f4ecd6;opacity:.85;")}>{s.label}</span>
                  <span style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:34px;line-height:.8;color:#d99a2b;")}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div style={css("display:grid;grid-template-columns:1fr 322px;gap:34px;align-items:start;")}>
          {/* MAIN COLUMN */}
          <div style={css("display:flex;flex-direction:column;gap:46px;")}>

            {/* ② CHARTER */}
            <div style={css("position:relative;background:#f4ecd6;border:1.5px solid #221a12;box-shadow:0 0 0 3px #f4ecd6,0 0 0 4px #221a12;padding:24px 28px 26px;overflow:hidden;")}>
              <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.05;background-image:radial-gradient(#221a12 .6px,transparent .7px);background-size:4px 4px;")} />
              <div style={css("position:relative;display:flex;align-items:center;gap:10px;margin-bottom:15px;")}>
                <Cog size={15} color="#c1272d" />
                <span style={css("font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.24em;text-transform:uppercase;color:#6c5a40;")}>The Charter</span>
                <span style={css("flex:1;height:2px;background:repeating-linear-gradient(90deg,#c1272d 0 12px,#d99a2b 12px 20px);")} />
              </div>
              <div style={css("position:relative;display:flex;flex-direction:column;gap:11px;")}>
                {identity.about.map((para, i) => (
                  <p key={i} style={css("font-family:'Courier Prime',monospace;font-size:12.5px;line-height:1.75;color:#221a12;margin:0;")}>{para}</p>
                ))}
              </div>
            </div>

            {/* ④ TASKS */}
            <div>
              <div style={css("display:flex;align-items:center;gap:14px;margin-bottom:6px;flex-wrap:wrap;")}>
                <h2 style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:34px;letter-spacing:.04em;margin:0;color:#221a12;white-space:nowrap;")}>Tasks</h2>
                <span style={css("flex:1;height:3px;background:repeating-linear-gradient(90deg,#c1272d 0 16px,#d99a2b 16px 26px);min-width:30px;")} />
                <div style={css("display:flex;gap:7px;")}>
                  {filters.map((f) => (
                    <button key={f.label} onClick={() => setFilter(f.label)} style={css(f.chip)}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div style={css("font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#6c5a40;margin-bottom:20px;")}>Now mobilizing</div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:24px;")}>
                {data.openTasks.map((task: FactionTask) => (
                  <div key={task.id} style={css("position:relative;overflow:hidden;background:#c1272d;color:#f4ecd6;border:3px solid #221a12;")}>
                    <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.55;background:repeating-conic-gradient(from 0deg at 50% 38%,#8d1c20 0deg 7.5deg,transparent 7.5deg 15deg);")} />
                    <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.1;background-image:radial-gradient(#f4ecd6 .6px,transparent .7px);background-size:4px 4px;")} />
                    <div style={css("position:relative;z-index:2;background:#221a12;color:#d99a2b;text-align:center;padding:6px 0;font-family:'Bebas Neue',Impact,sans-serif;font-size:13px;letter-spacing:.3em;")}>THE EVERYMEN</div>
                    <div style={css("position:relative;z-index:2;padding:18px 16px 14px;text-align:center;")}>
                      <div style={css("display:flex;justify-content:center;margin-bottom:9px;")}>
                        <div style={css("width:42px;height:42px;border-radius:50%;background:#f4ecd6;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px #221a12;")}>
                          <Cog size={25} color="#c1272d" />
                        </div>
                      </div>
                      <div style={css("min-height:70px;display:flex;align-items:center;justify-content:center;")}>
                        <div style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:32px;line-height:1.04;color:#f4ecd6;text-shadow:1.5px 1.5px 0 #221a12;")}>{task.title}</div>
                      </div>
                      <div style={css("height:2px;background:#d99a2b;margin:10px 24px;")} />
                      <p style={css("font-family:'Courier Prime',monospace;font-size:9.5px;line-height:1.55;color:#f4ecd6;opacity:.92;margin:0;")}>{task.description}</p>
                    </div>
                    <div style={css("position:relative;z-index:2;display:flex;align-items:stretch;border-top:3px solid #221a12;")}>
                      <div style={css("flex:1;background:#221a12;color:#d99a2b;text-align:center;padding:7px 0;font-family:'Bebas Neue',Impact,sans-serif;font-size:17px;")}>LVL {task.level}</div>
                      <div style={css("flex:1;background:#d99a2b;color:#221a12;text-align:center;padding:7px 0;font-family:'Bebas Neue',Impact,sans-serif;font-size:17px;")}>{task.points} PTS</div>
                    </div>
                    <button style={css("position:relative;z-index:2;width:100%;background:#f4ecd6;color:#221a12;border:none;font-family:'Courier Prime',monospace;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:9px;")}>Report for duty ▸</button>
                  </div>
                ))}
              </div>
            </div>

            {/* ⑤ PRAXIS */}
            <div>
              <div style={css("display:flex;align-items:center;gap:14px;margin-bottom:6px;")}>
                <h2 style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:34px;letter-spacing:.04em;margin:0;color:#221a12;white-space:nowrap;")}>Praxis</h2>
                <span style={css("flex:1;height:3px;background:repeating-linear-gradient(90deg,#c1272d 0 16px,#d99a2b 16px 26px);")} />
              </div>
              <div style={css("font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#6c5a40;margin-bottom:18px;")}>Work that held up</div>
              <div style={css("display:flex;flex-direction:column;gap:14px;")}>
                {data.recentPraxis.map((px: FactionPraxis, i) => (
                  <div key={px.id} style={css("position:relative;display:flex;gap:16px;align-items:center;background:#f4ecd6;color:#221a12;border:1.5px solid #221a12;box-shadow:4px 5px 0 rgba(34,26,18,.16);padding:15px 18px;overflow:hidden;")}>
                    <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.05;background-image:radial-gradient(#221a12 .6px,transparent .7px);background-size:4px 4px;")} />
                    <div style={css("position:relative;flex-shrink:0;width:46px;height:46px;border-radius:50%;background:#c1272d;color:#f4ecd6;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',Impact,sans-serif;font-size:24px;box-shadow:0 0 0 3px #221a12;")}>{initialOf(px.author)}</div>
                    <div style={css("position:relative;flex:1;min-width:0;")}>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:#6c5a40;margin-bottom:2px;")}>{px.author} · reported {px.sealedAt}</div>
                      <div style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:26px;line-height:.95;color:#221a12;")}>{px.finding}</div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:8.5px;letter-spacing:.04em;color:#6c5a40;margin-top:5px;")}>from “{px.taskTitle}” · {px.points} pts · {px.endorsements} approvals</div>
                    </div>
                    <div style={css("position:relative;flex-shrink:0;display:flex;align-items:center;gap:12px;")}>
                      {i === topIdx && <FdlLaurel size={44} innerBg="#f4ecd6" glyphColor="#221a12" rotate="-8deg" shadow="drop-shadow(1.5px 2px 0 rgba(34,26,18,.3))" />}
                      <span style={css("width:52px;height:52px;border-radius:50%;border:2px solid #c1272d;box-shadow:inset 0 0 0 2px #c1272d;color:#c1272d;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;transform:rotate(-9deg);opacity:.92;")}>
                        <span style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:22px;")}>{px.points}</span>
                        <span style={css("font-family:'Courier Prime',monospace;font-size:6px;letter-spacing:.18em;margin-top:1px;")}>POINTS</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div style={css("display:flex;flex-direction:column;gap:46px;")}>
            {/* ③ THE ROLL */}
            <div style={css("position:relative;background:#f4ecd6;border:1.5px solid #221a12;box-shadow:0 0 0 3px #f4ecd6,0 0 0 4px #221a12;padding:0;overflow:hidden;")}>
              <div style={css("background:#c1272d;color:#f4ecd6;text-align:center;padding:7px 0;font-family:'Bebas Neue',Impact,sans-serif;font-size:16px;letter-spacing:.16em;border-bottom:2px solid #d99a2b;")}>THE ROLL</div>
              <div style={css("position:relative;padding:22px 20px;")}>
                <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.05;background-image:radial-gradient(#221a12 .6px,transparent .7px);background-size:4px 4px;")} />
                <div style={css("position:relative;")}>
                  {isMember && (
                    <div>
                      <div style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:30px;line-height:.9;color:#221a12;")}>You're on the roll</div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:11px;color:#6c5a40;margin:9px 0 18px;")}>Standing · <b style={css("color:#c1272d;")}>{viewer.role}</b></div>
                      <button onClick={leave} style={css("width:100%;font-family:'Courier Prime',monospace;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6c5a40;background:transparent;border:1.5px solid rgba(34,26,18,.3);padding:10px;")}>Leave the ranks</button>
                    </div>
                  )}
                  {showJoin && (
                    <div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#d99a2b;margin-bottom:5px;")}>Doors are open —</div>
                      <div style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:32px;line-height:.9;color:#221a12;margin-bottom:9px;")}>Join the ranks</div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:11px;line-height:1.6;color:#221a12;margin-bottom:18px;")}>Anyone willing to put in the shift belongs here. Pick up the work in front of you and finish what you start.</div>
                      <button onClick={join} style={css("width:100%;font-family:'Bebas Neue',Impact,sans-serif;font-size:18px;letter-spacing:.12em;color:#f4ecd6;background:#c1272d;border:none;padding:12px;box-shadow:3px 4px 0 #221a12;")}>ENLIST ▸</button>
                    </div>
                  )}
                  {showGate && (
                    <div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#d99a2b;margin-bottom:5px;")}>Not on the roll — yet</div>
                      <div style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:30px;line-height:.92;color:#221a12;margin-bottom:11px;")}>{viewer.requirement.summary}</div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:11px;line-height:1.65;color:#221a12;")}>{viewer.requirement.detail}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ⑥ MEMBERS */}
            <div style={css("display:flex;flex-direction:column;gap:20px;")}>
              {spot && (
                <div style={css("position:relative;overflow:hidden;background:#221a12;color:#f4ecd6;border:3px solid #221a12;box-shadow:0 0 0 3px #d99a2b;text-align:center;")}>
                  <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.5;background:repeating-conic-gradient(from 0deg at 50% 30%,rgba(141,28,32,.6) 0deg 8deg,transparent 8deg 16deg);")} />
                  <div style={css("position:relative;z-index:2;padding:20px 18px 18px;")}>
                    <div style={css("font-family:'Courier Prime',monospace;font-size:7px;letter-spacing:.3em;text-transform:uppercase;color:#d99a2b;margin-bottom:12px;")}>Standard-bearer of the week</div>
                    <div style={css("width:74px;height:74px;border-radius:50%;margin:0 auto 12px;background:#f4ecd6;color:#c1272d;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',Impact,sans-serif;font-size:34px;box-shadow:0 0 0 4px #221a12,inset 0 0 0 5px #c1272d;")}>{initialOf(spot.name)}</div>
                    <div style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:32px;line-height:.9;color:#f4ecd6;text-shadow:2px 2px 0 rgba(0,0,0,.4);")}>{spot.name}</div>
                    <div style={css("font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#d99a2b;margin-top:6px;")}>{spot.role} · lvl {spot.level} · {fmt(spot.points)} pts</div>
                  </div>
                </div>
              )}
              <div style={css("position:relative;background:#f4ecd6;border:1.5px solid #221a12;box-shadow:0 0 0 3px #f4ecd6,0 0 0 4px #221a12;padding:16px 18px 12px;overflow:hidden;")}>
                <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.05;background-image:radial-gradient(#221a12 .6px,transparent .7px);background-size:4px 4px;")} />
                <div style={css("position:relative;font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:#6c5a40;margin-bottom:12px;")}>The roster</div>
                {others.map((m: FactionMember) => (
                  <div key={m.id} style={css("position:relative;display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid rgba(34,26,18,.16);")}>
                    <span style={css("width:32px;height:32px;border-radius:50%;flex-shrink:0;background:#c1272d;color:#f4ecd6;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',Impact,sans-serif;font-size:16px;box-shadow:0 0 0 2px #221a12;")}>{initialOf(m.name)}</span>
                    <div style={css("flex:1;min-width:0;")}>
                      <div style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:19px;line-height:1;color:#221a12;")}>{m.name}</div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:7.5px;letter-spacing:.06em;text-transform:uppercase;color:#6c5a40;")}>{m.role}</div>
                    </div>
                    <span style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:16px;letter-spacing:.04em;color:#c1272d;")}>lvl {m.level}</span>
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
