import { useState } from "react";
import type { FactionContract, FactionTask, FactionPraxis, FactionMember } from "../types";
import { albescent } from "../data/albescent";
import { css } from "../lib/css";
import { fmt, kfmt } from "../lib/format";
import { useFactionMembership } from "../lib/useFactionMembership";
import { useHead } from "../lib/useHead";
import { FdlLaurel, topPraxisIndex } from "../lib/FdlLaurel";

/* ════════════════════════════════════════════════════════════════
   Albescent — vellum correspondence.
   Pure white, Cormorant Garamond italic, a surveyor's cross-hair sigil,
   hairline borders, and NO colour at all (the order refuses the rainbow).
   Renders the shared FactionContract; only the skin is Albescent's.
   ════════════════════════════════════════════════════════════════ */

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap";
const KEYFRAMES = `@keyframes al-breathe{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}`;

/** Duty numerals are presentational — derived client-side, never stored. */
const DUTY_REFS = ["XIV", "XI", "XVII", "XXI"];

const witnessFor = (e: number) => (e >= 200 ? "Inscribed" : e >= 100 ? "Verified" : "Witnessed");

function AlMarkDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="al-mark" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="2.2" opacity="0.18" />
        <circle cx="50" cy="50" r="23.5" fill="none" stroke="currentColor" strokeWidth="3.8" opacity="0.5" />
        <line x1="76" y1="50" x2="89" y2="50" stroke="currentColor" strokeWidth="3.8" />
        <line x1="50" y1="76" x2="50" y2="89" stroke="currentColor" strokeWidth="3.8" />
        <line x1="24" y1="50" x2="11" y2="50" stroke="currentColor" strokeWidth="3.8" />
        <line x1="50" y1="24" x2="50" y2="11" stroke="currentColor" strokeWidth="3.8" />
        <circle cx="50" cy="50" r="4.4" fill="currentColor" />
      </symbol>
    </svg>
  );
}
const Mark = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} style={{ color }}>
    <use href="#al-mark" />
  </svg>
);

export function AlbescentFactionPage({ data = albescent }: { data?: FactionContract }) {
  useHead("albescent", FONT_HREF, KEYFRAMES);
  const { isMember, showJoin, showGate, join, leave } = useFactionMembership(data.viewer);
  const [filter, setFilter] = useState("All");

  const { stats, identity, viewer } = data;
  const statList = [
    { value: fmt(stats.memberCount), label: "keepers" },
    { value: stats.seasonRank ? "#" + stats.seasonRank : "—", label: "unranked" },
    { value: fmt(stats.praxisFiled), label: "records kept" },
    { value: kfmt(stats.pointsAwarded), label: "pts noted" },
  ];

  const chipBase =
    "font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.16em;text-transform:uppercase;padding:6px 12px;transition:all 120ms;white-space:nowrap;";
  const filters = ["All", "Open to me"].map((label) => ({
    label,
    active: filter === label,
    chip:
      chipBase +
      (filter === label
        ? "background:#1c1c1a;color:#fff;border:1px solid #1c1c1a;"
        : "background:transparent;color:rgba(28,28,26,.5);border:1px solid rgba(0,0,0,.14);"),
  }));

  const topIdx = topPraxisIndex(data.recentPraxis.map((p) => p.points));
  const spot = data.members.find((m) => m.isSpotlight);
  const others = data.members.filter((m) => !m.isSpotlight);
  const surname = (n: string) => n.split(" ").pop()![0];
  const houseOf = (author: string) =>
    (data.members.find((m) => m.name === author)?.role.split("·").pop() ?? "").trim();

  return (
    <div style={css("min-height:100vh;font-family:'Cormorant Garamond',Georgia,serif;color:#1c1c1a;background:#edece8;background-image:radial-gradient(60% 50% at 50% 0%,rgba(255,255,255,.6),transparent 70%);")}>
      <AlMarkDefs />

      {/* NEUTRAL SHARED NAV */}
      <nav style={css("position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:24px;padding:14px 34px;background:rgba(255,255,255,.82);border-bottom:1px solid rgba(0,0,0,.08);backdrop-filter:blur(8px);")}>
        <span style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;font-size:23px;line-height:1;padding-bottom:2px;border-bottom:3px solid;border-image:linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1;")}>World Zero</span>
        <div style={css("display:flex;gap:20px;flex:1;")}>
          {["Home", "Tasks", "Praxis", "Players", "Factions", "Updates"].map((l) => (
            <a key={l} style={css("font-family:'Courier Prime',monospace;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;" + (l === "Factions" ? "color:#1c1c1a;border-bottom:1px solid #1c1c1a;padding-bottom:3px;" : "color:rgba(28,28,26,.42);"))}>{l}</a>
          ))}
        </div>
        <span style={css("display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.6);padding:5px 11px;")}>
          <Mark size={12} color="#1c1c1a" />
          <span style={css("font-family:'Courier Prime',monospace;font-size:8.5px;letter-spacing:.18em;text-transform:uppercase;color:rgba(28,28,26,.55);")}>Albescent</span>
        </span>
        <span style={css("font-family:'Courier Prime',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:rgba(28,28,26,.42);border:1px solid rgba(0,0,0,.12);padding:5px 11px;")}>Logout</span>
      </nav>

      <div style={css("max-width:1120px;margin:0 auto;padding:32px 34px 84px;")}>

        {/* ① HERO */}
        <header style={css("position:relative;overflow:hidden;background:#fff;border:1px solid rgba(0,0,0,.09);box-shadow:0 2px 18px rgba(0,0,0,.055),0 1px 3px rgba(0,0,0,.04);margin-bottom:36px;")}>
          <div style={css("position:relative;z-index:2;display:grid;grid-template-columns:1fr auto;gap:52px;align-items:center;padding:46px 48px 48px;")}>
            <div>
              <div style={css("font-family:'Courier Prime',monospace;font-size:7.5px;letter-spacing:.28em;text-transform:uppercase;color:rgba(28,28,26,.24);margin-bottom:18px;line-height:2;")}>
                <div>Faction · the unranked order</div>
                <div>Fourth Season · active</div>
                <div>Unranked · by design</div>
              </div>
              <h1 style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:74px;line-height:.92;letter-spacing:-.015em;margin:0;color:#1c1c1a;")}>{data.name}</h1>
              <div style={css("font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.34em;text-transform:uppercase;color:rgba(28,28,26,.3);margin:20px 0 0;")}>{identity.motto}</div>
              <p style={css("font-family:'Courier Prime',monospace;font-size:10px;line-height:1.85;color:rgba(28,28,26,.5);max-width:470px;margin:22px 0 0;")}>{identity.blurb}</p>
            </div>
            {/* right column: the mark + stats on the side */}
            <div style={css("display:flex;flex-direction:column;gap:26px;align-items:center;width:210px;")}>
              <svg width="104" height="104" style={{ color: "#1c1c1a", animation: "al-breathe 5.5s ease-in-out infinite" }}><use href="#al-mark" /></svg>
              <div style={css("align-self:stretch;display:flex;flex-direction:column;gap:12px;")}>
                {statList.map((s) => (
                  <div key={s.label} style={css("display:flex;justify-content:space-between;align-items:baseline;gap:12px;border-top:1px solid rgba(0,0,0,.07);padding-top:10px;")}>
                    <span style={css("font-family:'Courier Prime',monospace;font-size:7px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,28,26,.26);")}>{s.label}</span>
                    <span style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:26px;line-height:1;color:rgba(28,28,26,.7);")}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div style={css("display:grid;grid-template-columns:1fr 320px;gap:36px;align-items:start;")}>
          {/* MAIN COLUMN */}
          <div style={css("display:flex;flex-direction:column;gap:48px;")}>

            {/* ② ABOUT */}
            <div style={css("position:relative;background:#fff;border:1px solid rgba(0,0,0,.09);box-shadow:0 2px 18px rgba(0,0,0,.05);padding:28px 32px 30px;")}>
              <div style={css("display:flex;align-items:center;gap:12px;margin-bottom:18px;")}>
                <Mark size={14} color="rgba(28,28,26,.5)" />
                <span style={css("font-family:'Courier Prime',monospace;font-size:7.5px;letter-spacing:.26em;text-transform:uppercase;color:rgba(28,28,26,.26);")}>A standing order</span>
                <span style={css("flex:1;height:1px;background:rgba(0,0,0,.07);")} />
              </div>
              <div style={css("display:flex;flex-direction:column;gap:14px;")}>
                {identity.about.map((para, i) => (
                  <p key={i} style={css("font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:400;line-height:1.7;color:rgba(28,28,26,.78);margin:0;")}>{para}</p>
                ))}
              </div>
            </div>

            {/* ④ TASKS */}
            <div>
              <div style={css("display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:6px;flex-wrap:wrap;")}>
                <h2 style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:34px;line-height:1;margin:0;color:#1c1c1a;")}>Tasks</h2>
                <div style={css("display:flex;gap:7px;")}>
                  {filters.map((f) => (
                    <button key={f.label} onClick={() => setFilter(f.label)} style={css(f.chip)}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,28,26,.24);margin-bottom:22px;")}>Duties awaiting a quiet hand</div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:24px;")}>
                {data.openTasks.map((task: FactionTask, i) => (
                  <div key={task.id} style={css("background:#fff;border:1px solid rgba(0,0,0,.09);box-shadow:0 2px 18px rgba(0,0,0,.055),0 1px 3px rgba(0,0,0,.04);padding:24px 22px 18px;")}>
                    <div style={css("display:flex;justify-content:center;margin-bottom:16px;")}>
                      <svg width="20" height="20" style={{ color: "#1c1c1a", animation: "al-breathe 5.5s ease-in-out infinite" }}><use href="#al-mark" /></svg>
                    </div>
                    <div style={css("height:1px;background:rgba(0,0,0,.07);margin-bottom:13px;")} />
                    <div style={css("font-family:'Courier Prime',monospace;font-size:6.5px;letter-spacing:.32em;text-transform:uppercase;color:rgba(0,0,0,.24);margin-bottom:11px;")}>Albescent · duty {DUTY_REFS[i % DUTY_REFS.length]}</div>
                    <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:22px;line-height:1.24;color:#1c1c1a;margin-bottom:11px;")}>{task.title}</div>
                    <div style={css("font-family:'Courier Prime',monospace;font-size:8px;line-height:1.65;color:rgba(28,28,26,.42);margin-bottom:18px;")}>{task.description}</div>
                    <div style={css("border-top:1px solid rgba(0,0,0,.07);padding-top:12px;display:flex;justify-content:space-between;align-items:center;")}>
                      <span style={css("font-family:'Courier Prime',monospace;font-size:7px;letter-spacing:.2em;text-transform:uppercase;color:rgba(0,0,0,.24);")}>Lvl {task.level}</span>
                      <span style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:20px;color:rgba(28,28,26,.5);")}>{task.points}<span style={css("font-family:'Courier Prime',monospace;font-size:6.5px;margin-left:4px;letter-spacing:.1em;text-transform:uppercase;")}>pts</span></span>
                    </div>
                    <div style={css("margin-top:14px;")}>
                      <span style={css("font-family:'Courier Prime',monospace;font-size:7px;letter-spacing:.22em;text-transform:uppercase;color:rgba(0,0,0,.34);border-bottom:1px solid rgba(0,0,0,.16);padding-bottom:1px;")}>acknowledge</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ⑤ PRAXIS */}
            <div>
              <h2 style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:34px;line-height:1;margin:0;color:#1c1c1a;")}>Praxis</h2>
              <div style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,28,26,.24);margin:6px 0 20px;")}>Duties returned &amp; entered into the record</div>
              <div style={css("display:flex;flex-direction:column;gap:0;background:#fff;border:1px solid rgba(0,0,0,.09);box-shadow:0 2px 18px rgba(0,0,0,.05);padding:6px 26px;")}>
                {data.recentPraxis.map((px: FactionPraxis, i) => (
                  <div key={px.id} style={css("position:relative;display:flex;gap:18px;align-items:flex-start;padding:20px 0;border-bottom:1px solid rgba(0,0,0,.07);")}>
                    <div style={css("flex-shrink:0;padding-top:3px;")}><Mark size={22} color="rgba(28,28,26,.6)" /></div>
                    <div style={css("flex:1;min-width:0;")}>
                      <div style={css("display:flex;justify-content:space-between;align-items:baseline;gap:12px;")}>
                        <span style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:15px;color:rgba(28,28,26,.72);")}>{px.author}</span>
                        <span style={css("font-family:'Courier Prime',monospace;font-size:7px;letter-spacing:.06em;color:rgba(28,28,26,.24);")}>{houseOf(px.author)} · {px.sealedAt}</span>
                      </div>
                      <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:22px;line-height:1.2;color:#1c1c1a;margin:5px 0 7px;")}>{px.finding}</div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:7.5px;letter-spacing:.06em;color:rgba(28,28,26,.36);")}>from “{px.taskTitle}” · {px.points} pts · marked <span style={css("color:rgba(28,28,26,.6);")}>{witnessFor(px.endorsements)}</span> · {px.endorsements} keepers in accord</div>
                    </div>
                    {i === topIdx && (
                      <div style={css("flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:2px;")}>
                        {/* Albescent renders the FDL monochrome — no rainbow, per the order's refusal of colour */}
                        <span style={{ position: "relative", width: 40, height: 40 }}>
                          <span style={css("position:absolute;inset:0;border-radius:50%;border:1px solid rgba(0,0,0,.3);")} />
                          <span style={css("position:absolute;inset:4px;border-radius:50%;border:1px solid rgba(0,0,0,.14);display:flex;align-items:center;justify-content:center;")}>
                            <FdlLaurel size={30} innerBg="transparent" glyphColor="#1c1c1a" ringInset={30} />
                          </span>
                        </span>
                        <span style={css("font-family:'Courier Prime',monospace;font-size:5.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,28,26,.4);")}>Distinction</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div style={css("display:flex;flex-direction:column;gap:48px;")}>
            {/* ③ THE ORDER */}
            <div style={css("position:relative;background:#fff;border:1px solid rgba(0,0,0,.09);box-shadow:0 2px 18px rgba(0,0,0,.055);padding:26px 24px;")}>
              <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:18px;")}>
                <span style={css("font-family:'Courier Prime',monospace;font-size:7px;letter-spacing:.26em;text-transform:uppercase;color:rgba(28,28,26,.26);")}>Concerning you</span>
                <span style={css("flex:1;height:1px;background:rgba(0,0,0,.07);")} />
              </div>
              {isMember && (
                <div>
                  <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:26px;line-height:1.05;color:#1c1c1a;")}>You are of the Order</div>
                  <div style={css("font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.04em;color:rgba(28,28,26,.44);margin:12px 0 20px;")}>Standing · <span style={css("color:rgba(28,28,26,.7);")}>{viewer.role}</span></div>
                  <button onClick={leave} style={css("width:100%;font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:rgba(28,28,26,.44);background:transparent;border:1px solid rgba(0,0,0,.12);padding:11px;")}>Withdraw from the Order</button>
                </div>
              )}
              {showJoin && (
                <div>
                  <div style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,28,26,.3);margin-bottom:7px;")}>A hand is extended —</div>
                  <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:27px;line-height:1.02;color:#1c1c1a;margin-bottom:12px;")}>Take up the work</div>
                  <div style={css("font-family:'Courier Prime',monospace;font-size:9px;line-height:1.75;color:rgba(28,28,26,.48);margin-bottom:20px;")}>Attend the quiet duties, return them well, and leave no trace of yourself in the work. That is the whole of it.</div>
                  <button onClick={join} style={css("width:100%;font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#fff;background:#1c1c1a;border:none;padding:13px;")}>Accept the order</button>
                </div>
              )}
              {showGate && (
                <div>
                  <div style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:rgba(28,28,26,.3);margin-bottom:7px;")}>Not yet of the Order —</div>
                  <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:25px;line-height:1.08;color:#1c1c1a;margin-bottom:12px;")}>{viewer.requirement.summary}</div>
                  <div style={css("font-family:'Courier Prime',monospace;font-size:9px;line-height:1.8;color:rgba(28,28,26,.48);")}>{viewer.requirement.detail}</div>
                </div>
              )}
            </div>

            {/* ⑥ MEMBERS */}
            <div style={css("display:flex;flex-direction:column;gap:20px;")}>
              {spot && (
                <div style={css("position:relative;background:#fff;border:1px solid rgba(0,0,0,.09);box-shadow:0 2px 18px rgba(0,0,0,.055);text-align:center;padding:26px 20px 22px;")}>
                  <div style={css("font-family:'Courier Prime',monospace;font-size:6.5px;letter-spacing:.3em;text-transform:uppercase;color:rgba(28,28,26,.26);margin-bottom:16px;")}>Keeper in residence</div>
                  <div style={css("width:74px;height:74px;border-radius:50%;margin:0 auto 14px;border:1px solid rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:30px;color:rgba(28,28,26,.7);")}>{surname(spot.name)}</div>
                  <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:25px;line-height:1;color:#1c1c1a;")}>{spot.name}</div>
                  <div style={css("font-family:'Courier Prime',monospace;font-size:7.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,28,26,.4);margin-top:8px;")}>{spot.role}</div>
                  <div style={css("font-family:'Courier Prime',monospace;font-size:7px;letter-spacing:.1em;text-transform:uppercase;color:rgba(28,28,26,.28);margin-top:5px;")}>Lvl {spot.level} · {fmt(spot.points)} pts</div>
                </div>
              )}
              <div style={css("position:relative;background:#fff;border:1px solid rgba(0,0,0,.09);box-shadow:0 2px 18px rgba(0,0,0,.05);padding:20px 22px 14px;")}>
                <div style={css("font-family:'Courier Prime',monospace;font-size:7px;letter-spacing:.24em;text-transform:uppercase;color:rgba(28,28,26,.26);margin-bottom:14px;")}>The keepers</div>
                {others.map((m: FactionMember) => (
                  <div key={m.id} style={css("display:flex;align-items:center;gap:13px;padding:9px 0;border-bottom:1px solid rgba(0,0,0,.06);")}>
                    <span style={css("width:32px;height:32px;border-radius:50%;flex-shrink:0;border:1px solid rgba(0,0,0,.12);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:300;font-size:15px;color:rgba(28,28,26,.6);")}>{surname(m.name)}</span>
                    <div style={css("flex:1;min-width:0;")}>
                      <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:15px;color:#1c1c1a;line-height:1.15;")}>{m.name}</div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:7px;letter-spacing:.06em;text-transform:uppercase;color:rgba(28,28,26,.36);")}>{m.role}</div>
                    </div>
                    <span style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.08em;color:rgba(28,28,26,.4);")}>lvl {m.level}</span>
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
