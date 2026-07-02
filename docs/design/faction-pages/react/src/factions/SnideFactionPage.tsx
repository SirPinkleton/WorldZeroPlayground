import { useState } from "react";
import type { FactionContract, FactionTask, FactionPraxis, FactionMember } from "../types";
import { snide } from "../data/snide";
import { css } from "../lib/css";
import { fmt, kfmt, initialOf } from "../lib/format";
import { useFactionMembership } from "../lib/useFactionMembership";
import { useHead } from "../lib/useHead";
import { FdlLaurel, topPraxisIndex } from "../lib/FdlLaurel";

/* ════════════════════════════════════════════════════════════════
   S.N.I.D.E. — ransom dispatch (ALWAYS DARK).
   Cut-and-paste ransom-note punk: acid green + hot pink on photocopier
   ink, Anton / Bebas Neue / Permanent Marker, sprayed sigil, wanted
   posters, halftone dots. Task titles render as cut-out ransom letters.
   Stat chits stack on the side of the hero sigil.
   ════════════════════════════════════════════════════════════════ */

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Anton&family=Permanent+Marker&family=Special+Elite&family=Bebas+Neue&family=Archivo+Black&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap";

/** Full name is a SNIDE-specific presentational detail (not in the shared contract). */
const FULL_NAME = "Society for Nihilistic Intent & Disruptive Efforts";

const RANSOM = [
  { bg: "#f4f1e8", col: "#14110b", font: "'Anton',Impact,sans-serif", rot: -5, it: false },
  { bg: "#14110b", col: "#b6ff2e", font: "'Bebas Neue',Impact,sans-serif", rot: 4, it: false },
  { bg: "#ff2d8b", col: "#fff", font: "'Archivo Black',Impact,sans-serif", rot: -3, it: false },
  { bg: "#b6ff2e", col: "#14110b", font: "'Anton',Impact,sans-serif", rot: 6, it: false },
  { bg: "#f4f1e8", col: "#14110b", font: "'Lora',Georgia,serif", rot: 2, it: true },
  { bg: "#14110b", col: "#fff", font: "'Bebas Neue',Impact,sans-serif", rot: -6, it: false },
];

/** Cut-out ransom lettering — the signature S.N.I.D.E. title treatment. */
function RansomText({ text, size }: { text: string; size: number }) {
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "5px 3px", alignItems: "center" }}>
      {[...text].map((ch, idx) => {
        if (ch === " ") return <span key={idx} style={{ display: "inline-block", width: size * 0.22 }} />;
        const s = RANSOM[(ch.charCodeAt(0) + idx * 3) % RANSOM.length];
        return (
          <span
            key={idx}
            style={{
              display: "inline-block",
              background: s.bg,
              color: s.col,
              fontFamily: s.font,
              fontStyle: s.it ? "italic" : "normal",
              fontSize: size,
              lineHeight: 0.92,
              padding: "2px 6px 0",
              transform: `rotate(${s.rot}deg)`,
              boxShadow: "1.5px 2.5px 0 rgba(0,0,0,.4)",
              textTransform: "uppercase",
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}

function SigilDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="snide-sigil" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="3" />
        <text x="24" y="34" textAnchor="middle" fontFamily="'Anton',Impact,sans-serif" fontSize="30" fill="currentColor">S</text>
        <line x1="9" y1="40" x2="39" y2="8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </symbol>
    </svg>
  );
}
const Sigil = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} style={{ color }}><use href="#snide-sigil" /></svg>
);

export function SnideFactionPage({ data = snide }: { data?: FactionContract }) {
  useHead("snide", FONT_HREF, "");
  const { isMember, showJoin, showGate, join, leave } = useFactionMembership(data.viewer);
  const [filter, setFilter] = useState("All");

  const { stats, identity, viewer } = data;
  const statList = [
    { value: fmt(stats.memberCount), label: "agitators", rot: "-2.5deg" },
    { value: stats.seasonRank && stats.seasonRank >= 7 ? "LAST" : stats.seasonRank ? "#" + stats.seasonRank : "—", label: "season rank · lol", rot: "2deg" },
    { value: fmt(stats.praxisFiled), label: "praxis filed", rot: "-1.5deg" },
    { value: kfmt(stats.pointsAwarded), label: "points looted", rot: "2.5deg" },
  ];

  const chipBase =
    "font-family:'Courier Prime',monospace;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 11px;transition:all 120ms;white-space:nowrap;";
  const filters = ["All", "Open to me"].map((label) => ({
    label,
    chip:
      chipBase +
      (filter === label
        ? "background:#14110b;color:#b6ff2e;border:2px solid #14110b;"
        : "background:#f4f1e8;color:#14110b;border:2px solid #14110b;"),
  }));

  const taskRots = ["-1.5deg", "1.2deg", "-0.8deg", "1.6deg"];
  const pxRots = ["-0.7deg", "0.6deg", "-0.5deg"];
  const dispatchNos = ["0666", "0667", "0668", "0669"];
  const topIdx = topPraxisIndex(data.recentPraxis.map((p) => p.points));
  const spot = data.members.find((m) => m.isSpotlight);
  const others = data.members.filter((m) => !m.isSpotlight);
  const tape = "rgba(228,214,120,.62)";

  return (
    <div data-theme="dark" style={css("min-height:100vh;position:relative;font-family:'Courier Prime',monospace;color:#f0e6d0;background-color:#14120c;background-image:radial-gradient(55% 45% at 12% 6%,rgba(150,160,195,.07),transparent 70%),radial-gradient(50% 42% at 92% 14%,rgba(195,140,170,.055),transparent 70%),radial-gradient(48% 52% at 82% 100%,rgba(150,180,150,.05),transparent 70%);")}>
      <SigilDefs />

      {/* NEUTRAL SHARED NAV */}
      <nav style={css("position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:22px;padding:12px 26px;background:rgba(12,10,6,.92);border-bottom:1px solid rgba(240,230,208,.14);backdrop-filter:blur(8px);")}>
        <span style={css("font-family:'Lora',Georgia,serif;font-style:italic;font-weight:600;font-size:20px;line-height:1;color:#f0e6d0;padding-bottom:2px;border-bottom:3px solid;border-image:linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1;")}>World Zero</span>
        <div style={css("display:flex;gap:16px;flex:1;")}>
          {["Home", "Tasks", "Praxis", "Players", "Factions", "Updates"].map((l) => (
            <a key={l} style={css("font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.13em;text-transform:uppercase;" + (l === "Factions" ? "color:#f0e6d0;border-bottom:2px solid #f0e6d0;padding-bottom:3px;" : "color:rgba(240,230,208,.5);"))}>{l}</a>
          ))}
        </div>
        <span style={css("display:inline-flex;align-items:center;gap:6px;background:#16a34a;color:#fff;font-family:'Bebas Neue',Impact,sans-serif;font-size:12px;letter-spacing:.14em;text-transform:uppercase;padding:5px 9px 5px 7px;transform:rotate(-1deg);box-shadow:1.5px 2px 0 rgba(0,0,0,.4);")}><Sigil size={15} color="#b6ff2e" />S.N.I.D.E.</span>
        <span style={css("font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:rgba(240,230,208,.5);border:1px solid rgba(240,230,208,.2);padding:5px 11px;")}>Logout</span>
      </nav>

      <div style={css("max-width:1140px;margin:0 auto;padding:34px 30px 80px;")}>

        {/* ① HERO */}
        <header style={css("position:relative;overflow:hidden;background:#14110b;color:#fff;border:1px solid rgba(182,255,46,.22);box-shadow:8px 10px 0 rgba(0,0,0,.5);margin-bottom:34px;")}>
          <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(182,255,46,.055) 32%,transparent 34%);background-size:5px 5px;")} />
          <div style={css("height:6px;background:#b6ff2e;position:relative;z-index:2;clip-path:polygon(0 0,100% 0,100% 55%,97% 100%,94% 50%,90% 100%,86% 55%,82% 100%,78% 60%,0 100%);")} />
          <div style={css("position:relative;z-index:2;display:flex;gap:30px;align-items:flex-start;flex-wrap:wrap;padding:26px 38px 30px;")}>
            <div style={css("flex:1;min-width:300px;")}>
              <div style={css("display:inline-block;white-space:nowrap;background:rgba(228,214,120,.62);color:#14110b;font-family:'Special Elite','Courier New',monospace;font-size:10px;letter-spacing:.05em;padding:3px 12px;transform:rotate(-1.5deg);box-shadow:1px 1px 0 rgba(0,0,0,.3);")}>World Zero · faction no. 4</div>
              <h1 style={css("font-family:'Anton',Impact,sans-serif;font-size:82px;line-height:.8;letter-spacing:.02em;margin:16px 0 0;color:#b6ff2e;text-shadow:4px 4px 0 #ff2d8b;transform:skewX(-5deg) rotate(-1.5deg);")}>{data.name}</h1>
              <div style={css("font-family:'Courier Prime',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#b7b5a7;margin:12px 0 0;")}>{FULL_NAME}</div>
              <div style={css("display:inline-block;margin-top:14px;background:#b6ff2e;color:#14110b;font-family:'Archivo Black',Impact,sans-serif;font-size:15px;letter-spacing:.02em;padding:6px 15px;transform:rotate(-2deg);box-shadow:2px 3px 0 #ff2d8b;")}>{identity.motto}</div>
              <p style={css("font-family:'Courier Prime',monospace;font-size:12.5px;line-height:1.6;max-width:560px;margin:16px 0 0;color:#e7e4d8;")}>{identity.blurb}</p>
            </div>
            {/* right: sigil + stat chits stacked on the side */}
            <div style={css("display:flex;flex-direction:column;align-items:flex-end;gap:13px;flex-shrink:0;width:196px;")}>
              <div style={css("position:relative;transform:rotate(9deg);margin:2px 10px 6px 0;")}>
                <div style={css("position:relative;width:94px;height:94px;border-radius:50%;background:#f4f1e8;display:flex;align-items:center;justify-content:center;border:2px solid #16a34a;box-shadow:0 0 0 4px #14110b,3px 4px 0 rgba(0,0,0,.4);")}>
                  <Sigil size={54} color="#16a34a" />
                </div>
                <div style={{ position: "absolute", top: -9, left: "50%", marginLeft: -26, width: 52, height: 18, background: tape, transform: "rotate(-7deg)" }} />
              </div>
              {statList.map((s) => (
                <div key={s.label} style={{ ...css("align-self:stretch;text-align:right;background:rgba(0,0,0,.34);border:2px solid #b6ff2e;padding:7px 14px 6px;box-shadow:2px 3px 0 rgba(0,0,0,.4);"), transform: `rotate(${s.rot})` }}>
                  <div style={css("font-family:'Anton',Impact,sans-serif;font-size:30px;line-height:.85;color:#b6ff2e;white-space:nowrap;")}>{s.value}</div>
                  <div style={css("font-family:'Courier Prime',monospace;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#cfcdbf;")}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div style={css("display:grid;grid-template-columns:1fr 320px;gap:30px;align-items:start;")}>
          {/* MAIN COLUMN */}
          <div style={css("display:flex;flex-direction:column;gap:36px;")}>

            {/* ② ABOUT */}
            <div style={css("position:relative;transform:rotate(-.6deg);")}>
              <div style={{ position: "absolute", height: 26, width: 70, background: tape, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)", top: -11, left: 28, transform: "rotate(-7deg)", zIndex: 3 }} />
              <div style={{ position: "absolute", height: 26, width: 70, background: tape, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)", top: -9, right: 32, transform: "rotate(6deg)", zIndex: 3 }} />
              <div style={css("position:relative;background:#f4f1e8;border:1.5px solid #14110b;box-shadow:4px 6px 0 rgba(0,0,0,.22);padding:22px 26px;overflow:hidden;")}>
                <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(0,0,0,.06) 1px,transparent 1px),radial-gradient(rgba(0,0,0,.04) 1px,transparent 1px);background-size:3px 3px,4px 4px;background-position:0 0,2px 1px;")} />
                <div style={css("position:relative;font-family:'Permanent Marker',cursive;font-size:26px;color:#16a34a;transform:rotate(-1deg);margin-bottom:12px;")}>what we're about —</div>
                <div style={css("position:relative;display:flex;flex-direction:column;gap:10px;")}>
                  {identity.about.map((para, i) => (
                    <p key={i} style={css("font-family:'Special Elite','Courier New',monospace;font-size:12px;line-height:1.75;color:#1a160e;margin:0;")}>{para}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* ④ TASKS */}
            <div>
              <div style={css("display:flex;align-items:center;gap:12px;margin-bottom:22px;flex-wrap:wrap;")}>
                <span style={css("font-family:'Anton',Impact,sans-serif;font-size:30px;letter-spacing:.02em;color:#b6ff2e;text-transform:uppercase;transform:skewX(-5deg);")}>Tasks</span>
                <div style={css("flex:1;height:4px;background:repeating-linear-gradient(90deg,#16a34a 0 14px,#ff2d8b 14px 22px,transparent 22px 30px);min-width:40px;")} />
                <div style={css("display:flex;gap:6px;")}>
                  {filters.map((f) => (
                    <button key={f.label} onClick={() => setFilter(f.label)} style={css(f.chip)}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:34px 30px;padding-top:6px;")}>
                {data.openTasks.map((task: FactionTask, i) => (
                  <div key={task.id} style={{ position: "relative", transform: `rotate(${taskRots[i % taskRots.length]})` }}>
                    <div style={css("position:relative;background:#14110b;color:#fff;padding:30px 20px 22px;font-family:'Courier Prime',monospace;overflow:hidden;border:1px solid rgba(182,255,46,.18);box-shadow:7px 9px 0 rgba(0,0,0,.45);")}>
                      <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(182,255,46,.09) 32%,transparent 34%);background-size:5px 5px;")} />
                      <div style={css("position:relative;display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #b6ff2e;padding-bottom:6px;margin-bottom:14px;")}>
                        <span style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:15px;letter-spacing:.22em;color:#b6ff2e;")}>S.N.I.D.E.</span>
                        <span style={css("font-size:8px;letter-spacing:.16em;color:#8f9183;text-transform:uppercase;")}>dispatch №{dispatchNos[i % dispatchNos.length]}</span>
                      </div>
                      <div style={css("position:relative;font-family:'Permanent Marker',cursive;font-size:13px;color:#ff2d8b;transform:rotate(-1.5deg);margin-bottom:8px;")}>your assignment, should you ignore it —</div>
                      <div style={css("position:relative;margin:10px 0 16px;")}>
                        <RansomText text={task.title} size={26} />
                      </div>
                      <p style={css("position:relative;font-size:11px;line-height:1.55;color:#d8d6c8;margin:0 0 18px;")}>{task.description}</p>
                      <div style={css("position:relative;display:flex;align-items:center;gap:14px;")}>
                        <div style={css("font-family:'Anton',Impact,sans-serif;color:#b6ff2e;line-height:.8;")}>
                          <span style={css("font-size:40px;")}>{task.points}</span>
                          <span style={css("font-size:11px;letter-spacing:.1em;margin-left:3px;")}>PTS</span>
                        </div>
                        <span style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:12px;letter-spacing:.1em;border:1.5px dashed #6b6d60;color:#cfd1c4;padding:3px 8px;transform:rotate(2deg);")}>LVL {task.level}</span>
                        <span style={css("margin-left:auto;background:#ff2d8b;color:#fff;font-family:'Archivo Black',Impact,sans-serif;font-size:12px;padding:7px 12px;transform:rotate(-3deg);box-shadow:2px 3px 0 rgba(0,0,0,.4);")}>I'M IN ↗</span>
                      </div>
                      <div style={{ position: "absolute", height: 26, width: 64, background: tape, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)", top: -11, left: 34, transform: "rotate(-8deg)" }} />
                      <div style={{ position: "absolute", height: 26, width: 64, background: tape, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)", top: -9, right: 26, transform: "rotate(7deg)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ⑤ PRAXIS */}
            <div>
              <div style={css("display:flex;align-items:center;gap:12px;margin-bottom:22px;flex-wrap:wrap;")}>
                <span style={css("font-family:'Anton',Impact,sans-serif;font-size:30px;letter-spacing:.02em;color:#b6ff2e;text-transform:uppercase;transform:skewX(-5deg);")}>praxis</span>
                <div style={css("flex:1;height:4px;background:repeating-linear-gradient(90deg,#16a34a 0 14px,#ff2d8b 14px 22px,transparent 22px 30px);min-width:40px;")} />
              </div>
              <div style={css("display:flex;flex-direction:column;gap:18px;")}>
                {data.recentPraxis.map((px: FactionPraxis, i) => (
                  <div key={px.id} style={{ ...css("position:relative;background:#f4f1e8;color:#14110b;border:1.5px solid #14110b;padding:14px 18px 16px;box-shadow:3px 4px 0 rgba(0,0,0,.22);overflow:hidden;"), transform: `rotate(${pxRots[i % pxRots.length]})` }}>
                    <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(20,17,11,.05) 32%,transparent 34%);background-size:5px 5px;")} />
                    {i === topIdx && <FdlLaurel size={50} innerBg="#f4f1e8" glyphColor="#14110b" rotate="-8deg" shadow="drop-shadow(2px 2px 0 rgba(0,0,0,.3))" style={{ position: "absolute", top: 6, right: 10 }} />}
                    <div style={css("position:relative;display:flex;align-items:center;gap:12px;")}>
                      <div style={css("flex-shrink:0;width:42px;height:42px;border-radius:50%;background:#14110b;border:2px solid #16a34a;display:flex;align-items:center;justify-content:center;color:#b6ff2e;font-family:'Anton',Impact,sans-serif;font-size:20px;transform:rotate(-4deg);")}>{initialOf(px.author)}</div>
                      <div style={css("flex:1;min-width:0;")}>
                        <div style={css("font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:#444;margin-bottom:2px;")}>intercepted dispatch · {px.sealedAt}</div>
                        <div style={css("font-size:12.5px;line-height:1.4;")}><span style={css("font-family:'Permanent Marker',cursive;font-size:16px;color:#16a34a;margin-right:4px;")}>{px.author}</span>pulled it off</div>
                      </div>
                    </div>
                    <div style={css("position:relative;margin:12px 0 0;background:#14110b;padding:8px 12px;transform:rotate(-1deg);display:inline-block;")}>
                      <span style={css("font-family:'Anton',Impact,sans-serif;font-size:19px;letter-spacing:.01em;color:#b6ff2e;text-transform:uppercase;")}>{px.finding}</span>
                    </div>
                    <div style={css("position:relative;margin-top:10px;font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.06em;color:#6b6d60;text-transform:uppercase;")}>from “{px.taskTitle}” · +{px.points} pts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div style={css("display:flex;flex-direction:column;gap:36px;")}>
            {/* ③ JOIN */}
            <div style={css("position:relative;transform:rotate(-1deg);")}>
              <div style={{ position: "absolute", height: 24, width: 60, background: tape, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)", top: -10, left: "50%", marginLeft: -30, transform: "rotate(-5deg)", zIndex: 3 }} />
              <div style={css("position:relative;background:#14110b;color:#fff;padding:22px 20px;border:1px solid rgba(182,255,46,.18);box-shadow:6px 8px 0 rgba(0,0,0,.45);overflow:hidden;")}>
                <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(182,255,46,.08) 32%,transparent 34%);background-size:5px 5px;")} />
                <div style={css("position:relative;display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #b6ff2e;padding-bottom:6px;margin-bottom:16px;")}>
                  <span style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:14px;letter-spacing:.22em;color:#b6ff2e;")}>S.N.I.D.E.</span>
                  <span style={css("font-size:8px;letter-spacing:.16em;color:#8f9183;text-transform:uppercase;")}>re: you</span>
                </div>
                <div style={css("position:relative;")}>
                  {isMember && (
                    <div>
                      <div style={css("font-family:'Anton',Impact,sans-serif;font-size:26px;line-height:.9;color:#b6ff2e;text-transform:uppercase;")}>You're on the inside</div>
                      <div style={css("font-family:'Courier Prime',monospace;font-size:10.5px;color:#cfcdbf;margin:8px 0 16px;")}>Standing · <b style={css("color:#ff2d8b;")}>{viewer.role}</b></div>
                      <button onClick={leave} style={css("width:100%;font-family:'Bebas Neue',Impact,sans-serif;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#cfcdbf;background:transparent;border:2px dashed #6b6d60;padding:9px;")}>Defect →</button>
                    </div>
                  )}
                  {showJoin && (
                    <div>
                      <div style={css("font-family:'Permanent Marker',cursive;font-size:16px;color:#ff2d8b;transform:rotate(-1.5deg);margin-bottom:6px;")}>the door's open —</div>
                      <div style={css("font-family:'Anton',Impact,sans-serif;font-size:24px;line-height:.9;color:#b6ff2e;text-transform:uppercase;margin-bottom:8px;")}>Come cause trouble</div>
                      <div style={css("font-family:'Special Elite','Courier New',monospace;font-size:10.5px;line-height:1.5;color:#d8d6c8;margin-bottom:16px;")}>No forms. No gods. No managers. Just show up and mean it.</div>
                      <button onClick={join} style={css("width:100%;background:#ff2d8b;color:#fff;font-family:'Archivo Black',Impact,sans-serif;font-size:14px;padding:12px;transform:rotate(-1deg);box-shadow:3px 4px 0 rgba(0,0,0,.4);border:none;")}>I'M IN ↗</button>
                    </div>
                  )}
                  {showGate && (
                    <div>
                      <div style={css("position:relative;")}>
                        <span style={css("position:absolute;top:-6px;right:-6px;font-family:'Bebas Neue',Impact,sans-serif;font-size:13px;letter-spacing:.16em;color:#ff2d8b;border:2.5px solid #ff2d8b;padding:3px 10px;transform:rotate(8deg);opacity:.9;")}>DENIED</span>
                        <div style={css("font-family:'Anton',Impact,sans-serif;font-size:26px;line-height:.86;color:#b6ff2e;text-transform:uppercase;")}>{viewer.requirement.summary}</div>
                      </div>
                      <div style={css("font-family:'Special Elite','Courier New',monospace;font-size:10.5px;line-height:1.6;color:#d8d6c8;margin-top:14px;")}>{viewer.requirement.detail}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ⑥ MEMBERS */}
            <div style={css("display:flex;flex-direction:column;gap:20px;")}>
              {spot && (
                <div style={css("position:relative;transform:rotate(1.2deg);")}>
                  <div style={{ position: "absolute", height: 22, width: 56, background: tape, top: -9, left: 26, transform: "rotate(-6deg)", zIndex: 3 }} />
                  <div style={css("position:relative;background:#14110b;color:#fff;border:2px solid #b6ff2e;padding:18px 16px 16px;text-align:center;box-shadow:5px 6px 0 rgba(0,0,0,.3);overflow:hidden;")}>
                    <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(182,255,46,.07) 32%,transparent 34%);background-size:5px 5px;")} />
                    <div style={css("position:relative;font-family:'Bebas Neue',Impact,sans-serif;font-size:13px;letter-spacing:.35em;color:#ff2d8b;")}>★ WANTED ★</div>
                    <div style={css("position:relative;font-family:'Permanent Marker',cursive;font-size:13px;color:#b6ff2e;transform:rotate(-2deg);margin-bottom:10px;")}>menace of the week</div>
                    <div style={css("position:relative;width:70px;height:70px;border-radius:50%;margin:0 auto 10px;background:#f4f1e8;border:2px solid #16a34a;display:flex;align-items:center;justify-content:center;color:#14110b;font-family:'Anton',Impact,sans-serif;font-size:32px;box-shadow:0 0 0 3px #14110b;")}>{initialOf(spot.name)}</div>
                    <div style={css("position:relative;font-family:'Anton',Impact,sans-serif;font-size:30px;line-height:.9;color:#b6ff2e;text-transform:uppercase;")}>{spot.name}</div>
                    <div style={css("position:relative;font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:.08em;color:#cfcdbf;text-transform:uppercase;margin-top:4px;")}>{spot.role} · lvl {spot.level} · {fmt(spot.points)} pts</div>
                  </div>
                </div>
              )}
              <div style={css("position:relative;transform:rotate(-.6deg);")}>
                <div style={css("position:relative;background:#f4f1e8;border:1.5px solid #14110b;padding:16px 16px 12px;box-shadow:4px 5px 0 rgba(0,0,0,.2);overflow:hidden;")}>
                  <div style={css("position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(20,17,11,.05) 32%,transparent 34%);background-size:5px 5px;")} />
                  <div style={css("position:relative;font-family:'Permanent Marker',cursive;font-size:22px;color:#16a34a;transform:rotate(-1deg);margin-bottom:10px;")}>the rap sheet</div>
                  {others.map((m: FactionMember) => (
                    <div key={m.id} style={css("position:relative;display:flex;align-items:center;gap:11px;padding:7px 0;border-bottom:1px dashed rgba(20,17,11,.22);")}>
                      <span style={css("width:30px;height:30px;border-radius:50%;flex-shrink:0;background:#14110b;border:1.5px solid #16a34a;display:flex;align-items:center;justify-content:center;color:#b6ff2e;font-family:'Anton',Impact,sans-serif;font-size:14px;transform:rotate(-3deg);")}>{initialOf(m.name)}</span>
                      <div style={css("flex:1;min-width:0;")}>
                        <div style={css("font-family:'Permanent Marker',cursive;font-size:16px;color:#14110b;line-height:1;")}>{m.name}</div>
                        <div style={css("font-family:'Courier Prime',monospace;font-size:8px;letter-spacing:.06em;color:#6b6d60;text-transform:uppercase;")}>{m.role}</div>
                      </div>
                      <span style={css("font-family:'Bebas Neue',Impact,sans-serif;font-size:13px;letter-spacing:.06em;color:#be185d;")}>lvl {m.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
