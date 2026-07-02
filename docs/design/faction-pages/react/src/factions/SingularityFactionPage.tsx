import { useState } from "react";
import type { FactionContract, FactionTask, FactionPraxis, FactionMember } from "../types";
import { singularity } from "../data/singularity";
import { css } from "../lib/css";
import { fmt, kfmt, splitLast, initialOf } from "../lib/format";
import { useFactionMembership } from "../lib/useFactionMembership";
import { useHead } from "../lib/useHead";
import { FdlLaurel, topPraxisIndex } from "../lib/FdlLaurel";

/* ════════════════════════════════════════════════════════════════
   Singularity — terminal printout (ALWAYS DARK).
   Phosphor green + signal blue on void black, Share Tech Mono, a
   rotating node sigil, sprocketed protocol cards, scanlines, an
   oscilloscope waveform. Stats live in a side "system readout" panel.
   ════════════════════════════════════════════════════════════════ */

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Lora:ital,wght@1,500;1,600&display=swap";
const KEYFRAMES = `
@keyframes sg-rotate{to{transform:rotate(360deg)}}
@keyframes sg-pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.8;transform:scale(1.05)}}
@keyframes sg-blink{50%{opacity:0}}
@keyframes sg-sweep{0%{top:-12%}100%{top:112%}}`;

const SPROCKETS = [0, 1, 2, 3, 4, 5, 6];

function NodeDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="sg-mark" viewBox="0 0 100 100">
        <defs><clipPath id="sg-clip"><circle cx="50" cy="50" r="49" /></clipPath></defs>
        <g clipPath="url(#sg-clip)">
          <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="2.6" opacity="0.32" />
          <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="3.4" opacity="0.68" />
          <line x1="74" y1="50" x2="93" y2="50" stroke="currentColor" strokeWidth="3.6" opacity="0.8" />
          <line x1="50" y1="74" x2="50" y2="93" stroke="currentColor" strokeWidth="3.6" opacity="0.8" />
          <line x1="26" y1="50" x2="7" y2="50" stroke="currentColor" strokeWidth="3.6" opacity="0.8" />
          <line x1="50" y1="26" x2="50" y2="7" stroke="currentColor" strokeWidth="3.6" opacity="0.8" />
          <line x1="66.97" y1="66.97" x2="74.93" y2="74.93" stroke="currentColor" strokeWidth="2.4" opacity="0.36" />
          <line x1="33.03" y1="66.97" x2="25.07" y2="74.93" stroke="currentColor" strokeWidth="2.4" opacity="0.36" />
          <line x1="33.03" y1="33.03" x2="25.07" y2="25.07" stroke="currentColor" strokeWidth="2.4" opacity="0.36" />
          <line x1="66.97" y1="33.03" x2="74.93" y2="25.07" stroke="currentColor" strokeWidth="2.4" opacity="0.36" />
          <circle cx="93" cy="50" r="5" fill="currentColor" opacity="0.78" />
          <circle cx="50" cy="93" r="5" fill="currentColor" opacity="0.78" />
          <circle cx="7" cy="50" r="5" fill="currentColor" opacity="0.78" />
          <circle cx="50" cy="7" r="5" fill="currentColor" opacity="0.78" />
          <circle cx="50" cy="50" r="10.5" fill="currentColor" opacity="0.12" />
          <circle cx="50" cy="50" r="9.5" fill="currentColor" opacity="0.92" />
          <circle cx="50" cy="50" r="3.6" fill="#050f08" />
        </g>
      </symbol>
    </svg>
  );
}

export function SingularityFactionPage({ data = singularity }: { data?: FactionContract }) {
  useHead("singularity", FONT_HREF, KEYFRAMES);
  const { isMember, showJoin, showGate, join, leave } = useFactionMembership(data.viewer);
  const [filter, setFilter] = useState("All");

  const { stats, identity, viewer } = data;
  const statList = [
    { value: fmt(stats.memberCount), label: "nodes" },
    { value: stats.seasonRank ? "#" + stats.seasonRank : "—", label: "season rank" },
    { value: fmt(stats.praxisFiled), label: "sealed" },
    { value: kfmt(stats.pointsAwarded), label: "credits" },
  ];

  const chipBase =
    "font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:.14em;text-transform:uppercase;padding:5px 11px;transition:all 120ms;white-space:nowrap;";
  const filters = ["All", "Open to me"].map((label) => ({
    label,
    chip:
      chipBase +
      (filter === label
        ? "background:#2563eb;color:#fff;border:1px solid #2563eb;"
        : "background:transparent;color:rgba(96,165,250,.6);border:1px solid rgba(37,99,235,.3);"),
  }));

  const seqNos = ["0047", "0031", "0039", "0051"];
  const signalIds = ["0xF4A3E9D2", "0xA2C7F041", "0xE8B30C7A", "0x9D01B7C4"];
  const topIdx = topPraxisIndex(data.recentPraxis.map((p) => p.points));
  const spot = data.members.find((m) => m.isSpotlight);
  const others = data.members.filter((m) => !m.isSpotlight);

  return (
    <div data-theme="dark" style={css("position:relative;min-height:100vh;overflow:hidden;font-family:'Share Tech Mono',monospace;color:#4ade80;background-color:#07090c;background-image:radial-gradient(55% 45% at 50% 50%,rgba(74,222,128,.045),transparent 68%),radial-gradient(44% 38% at 0% 0%,rgba(37,99,235,.08),transparent 72%),radial-gradient(36% 30% at 100% 100%,rgba(37,99,235,.05),transparent 72%),repeating-linear-gradient(0deg,rgba(37,99,235,.055) 0 1px,transparent 1px 32px),repeating-linear-gradient(90deg,rgba(37,99,235,.055) 0 1px,transparent 1px 32px);")}>
      <NodeDefs />
      <div style={css("position:absolute;left:0;right:0;height:120px;pointer-events:none;z-index:1;background:linear-gradient(to bottom,transparent,rgba(74,222,128,.028) 40%,rgba(74,222,128,.028) 60%,transparent);animation:sg-sweep 7s ease-in-out infinite;animation-delay:1.5s;")} />
      <div style={css("position:absolute;inset:0;pointer-events:none;z-index:1;background:repeating-linear-gradient(to bottom,transparent 0 2px,rgba(74,222,128,.012) 2px 4px);")} />

      {/* NEUTRAL SHARED NAV (forced dark) */}
      <nav style={css("position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:24px;padding:13px 32px;background:rgba(5,15,8,.92);border-bottom:1px solid rgba(37,99,235,.42);backdrop-filter:blur(10px);")}>
        <span style={css("font-family:'Lora',Georgia,serif;font-style:italic;font-weight:600;font-size:21px;line-height:1;color:#e8f2ec;padding-bottom:2px;border-bottom:3px solid;border-image:linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1;")}>World Zero</span>
        <div style={css("display:flex;gap:18px;flex:1;")}>
          {["Home", "Tasks", "Praxis", "Players", "Factions", "Updates"].map((l) => (
            <a key={l} style={css("font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;" + (l === "Factions" ? "color:#4ade80;border-bottom:1px solid #4ade80;padding-bottom:3px;" : "color:rgba(96,165,250,.6);"))}>{l}</a>
          ))}
        </div>
        <span style={css("display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(37,99,235,.5);background:rgba(37,99,235,.1);padding:5px 11px;")}><svg width="12" height="12" style={{ color: "#4ade80" }}><use href="#sg-mark" /></svg><span style={css("font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.18em;color:#4ade80;")}>SINGULARITY</span></span>
        <span style={css("font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(96,165,250,.5);border:1px solid rgba(37,99,235,.3);padding:5px 11px;")}>Logout</span>
      </nav>

      <div style={css("position:relative;z-index:2;max-width:1160px;margin:0 auto;padding:30px 32px 84px;")}>

        {/* ① HERO */}
        <header style={css("position:relative;overflow:hidden;background:#050f08;border:1px solid #2563eb;box-shadow:0 0 0 1px rgba(37,99,235,.12),0 24px 60px -28px rgba(0,0,0,.8),0 0 40px -20px rgba(74,222,128,.06);margin-bottom:34px;")}>
          <div style={css("position:absolute;inset:5px;border:1px solid rgba(37,99,235,.1);pointer-events:none;")} />
          <div style={css("position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent,transparent 2px,rgba(74,222,128,.018) 2px,rgba(74,222,128,.018) 4px);")} />
          <svg viewBox="0 0 320 36" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 40, opacity: 0.4 }}><line x1="0" y1="18" x2="320" y2="18" stroke="rgba(37,99,235,.38)" strokeWidth="0.6" strokeDasharray="5 5" /><path d="M0,18 Q10,6 20,18 Q30,30 40,18 Q50,6 60,18 Q70,30 80,18 Q90,7 100,18 Q110,29 120,18 Q130,5 140,18 Q150,31 160,18 Q170,6 180,18 Q190,30 200,18 Q210,8 220,18 Q230,28 240,18 Q250,6 260,18 Q270,30 280,18 Q290,7 300,18 Q310,29 320,18" fill="none" stroke="rgba(74,222,128,.68)" strokeWidth="1.2" /></svg>

          <div style={css("position:relative;z-index:2;display:grid;grid-template-columns:1fr 240px;gap:32px;align-items:center;padding:34px 40px 50px;")}>
            <div>
              <div style={css("font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:.18em;color:rgba(96,165,250,.5);margin-bottom:14px;line-height:1.95;")}>
                <div>&gt; FACTION: SINGULARITY</div>
                <div>&gt; STATUS: ACTIVE · SEVENTH SEASON</div>
                <div>&gt; ARRAYS: 7 ONLINE &nbsp;·&nbsp; THRESHOLD: <span style={css("color:#4ade80;")}>CROSSED</span></div>
              </div>
              <h1 style={css("font-family:'Share Tech Mono',monospace;font-size:60px;line-height:.9;letter-spacing:.04em;color:#4ade80;margin:0;text-transform:uppercase;")}>{data.name}</h1>
              <div style={css("font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:rgba(96,165,250,.6);margin:14px 0 0;")}>{identity.motto}</div>
              <p style={css("font-family:'Share Tech Mono',monospace;font-size:11px;line-height:1.75;color:rgba(74,222,128,.6);max-width:520px;margin:16px 0 0;")}>{identity.blurb}</p>
            </div>
            {/* right column: node sigil + readout on the side */}
            <div style={css("display:flex;flex-direction:column;gap:20px;align-items:center;")}>
              <div style={css("position:relative;width:130px;height:130px;flex-shrink:0;")}>
                <div style={css("position:absolute;inset:-18px;border-radius:50%;background:radial-gradient(circle,rgba(74,222,128,.3),transparent 70%);opacity:.18;animation:sg-pulse 2.6s ease-in-out infinite;")} />
                <svg width="130" height="130" style={{ color: "rgba(74,222,128,.5)", position: "absolute", inset: 0, animation: "sg-rotate 120s linear infinite" }}><use href="#sg-mark" /></svg>
                <svg width="54" height="54" style={{ color: "#4ade80", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", filter: "drop-shadow(0 0 6px rgba(74,222,128,.5))" }}><use href="#sg-mark" /></svg>
              </div>
              <div style={css("align-self:stretch;border:1px solid rgba(37,99,235,.42);background:rgba(37,99,235,.06);")}>
                <div style={css("font-family:'Share Tech Mono',monospace;font-size:7px;letter-spacing:.2em;color:rgba(96,165,250,.55);padding:7px 12px 5px;border-bottom:1px solid rgba(37,99,235,.28);")}>SYSTEM READOUT</div>
                {statList.map((s) => (
                  <div key={s.label} style={css("display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:7px 12px;border-bottom:1px solid rgba(37,99,235,.14);")}>
                    <span style={css("font-family:'Share Tech Mono',monospace;font-size:7.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(96,165,250,.5);")}>{s.label}</span>
                    <span style={css("font-family:'Share Tech Mono',monospace;font-size:20px;line-height:1;color:#4ade80;")}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div style={css("display:grid;grid-template-columns:1fr 322px;gap:32px;align-items:start;")}>
          {/* MAIN COLUMN */}
          <div style={css("display:flex;flex-direction:column;gap:42px;")}>

            {/* ② MANIFEST */}
            <div style={css("position:relative;background:#050f08;border:1px solid rgba(37,99,235,.42);overflow:hidden;padding:22px 26px 24px;")}>
              <div style={css("position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent,transparent 2px,rgba(74,222,128,.012) 2px,rgba(74,222,128,.012) 4px);")} />
              <div style={css("position:relative;font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:.14em;color:rgba(96,165,250,.55);margin-bottom:14px;")}>&gt; cat /faction/manifest.txt</div>
              <div style={css("position:relative;display:flex;flex-direction:column;gap:12px;")}>
                {identity.about.map((para, i) => (
                  <p key={i} style={css("font-family:'Share Tech Mono',monospace;font-size:11.5px;line-height:1.8;color:rgba(74,222,128,.72);margin:0;")}>{para}</p>
                ))}
              </div>
            </div>

            {/* ④ TASKS */}
            <div>
              <div style={css("display:flex;align-items:center;gap:12px;margin-bottom:6px;flex-wrap:wrap;")}>
                <h2 style={css("font-family:'Share Tech Mono',monospace;font-size:28px;letter-spacing:.04em;margin:0;color:#4ade80;text-transform:uppercase;white-space:nowrap;")}>Tasks</h2>
                <span style={css("flex:1;height:1px;background:rgba(37,99,235,.3);min-width:30px;")} />
                <div style={css("display:flex;gap:6px;")}>
                  {filters.map((f) => (
                    <button key={f.label} onClick={() => setFilter(f.label)} style={css(f.chip)}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div style={css("font-family:'Share Tech Mono',monospace;font-size:7.5px;letter-spacing:.24em;text-transform:uppercase;color:rgba(74,222,128,.4);margin-bottom:20px;")}>Open protocols // awaiting nodes</div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:22px;")}>
                {data.openTasks.map((task: FactionTask, i) => {
                  const { head, last } = splitLast(task.title);
                  return (
                    <div key={task.id} style={css("position:relative;overflow:hidden;background:#050f08;border:1px solid #2563eb;display:flex;flex-direction:column;")}>
                      <div style={css("position:absolute;inset:0;pointer-events:none;z-index:2;background:repeating-linear-gradient(to bottom,transparent,transparent 2px,rgba(74,222,128,.022) 2px,rgba(74,222,128,.022) 4px);")} />
                      <div style={css("display:flex;justify-content:space-between;align-items:center;padding:4px 10px;border-bottom:1px solid rgba(37,99,235,.4);")}>
                        {SPROCKETS.map((sp) => <div key={sp} style={css("width:7px;height:5px;border:1px solid rgba(74,222,128,.32);border-radius:1px;")} />)}
                      </div>
                      <div style={css("position:relative;z-index:3;padding:8px 12px 6px;border-bottom:1px solid rgba(37,99,235,.3);")}>
                        <div style={css("display:flex;align-items:center;gap:7px;margin-bottom:4px;")}>
                          <svg width="13" height="13" style={{ color: "#4ade80" }}><use href="#sg-mark" /></svg>
                          <span style={css("font-size:6.5px;letter-spacing:.28em;color:rgba(74,222,128,.5);")}>SINGULARITY</span>
                        </div>
                        <div style={css("font-size:6.5px;color:rgba(96,165,250,.45);letter-spacing:.12em;")}>PROTOCOL // {seqNos[i % seqNos.length]}</div>
                      </div>
                      <div style={css("position:relative;z-index:3;padding:11px 12px 12px;flex:1;display:flex;flex-direction:column;gap:7px;")}>
                        <div style={css("font-size:6.5px;color:rgba(96,165,250,.45);letter-spacing:.14em;")}>&gt; OUTPUT:</div>
                        <div style={css("font-size:16px;line-height:1.15;letter-spacing:.03em;color:#86efac;text-transform:uppercase;")}>{head}<span style={css("color:#60a5fa;")}>{last}</span><span style={css("display:inline-block;width:6px;height:14px;background:#4ade80;margin-left:3px;vertical-align:middle;animation:sg-blink 1.1s step-end infinite;")} /></div>
                        <p style={css("font-size:8px;color:rgba(74,222,128,.55);line-height:1.6;margin:0;")}>{task.description}</p>
                        <div style={css("margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid rgba(37,99,235,.22);")}>
                          <span style={css("font-size:8px;color:rgba(96,165,250,.5);letter-spacing:.1em;")}>LVL <span style={css("color:#4ade80;")}>{task.level}</span></span>
                          <span style={css("font-size:16px;line-height:1;color:#fbbf24;")}>{task.points}<span style={css("font-size:7px;color:rgba(251,191,36,.5);margin-left:3px;")}>CR</span></span>
                        </div>
                      </div>
                      <button style={css("position:relative;z-index:3;background:transparent;color:#4ade80;border:none;border-top:1px solid rgba(37,99,235,.35);font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:.18em;text-transform:uppercase;padding:8px 0;")}>&gt; JOIN PROTOCOL</button>
                      <div style={css("display:flex;justify-content:space-between;align-items:center;padding:4px 10px;border-top:1px solid rgba(37,99,235,.4);")}>
                        {SPROCKETS.map((sp) => <div key={sp} style={css("width:7px;height:5px;border:1px solid rgba(74,222,128,.32);border-radius:1px;")} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ⑤ PRAXIS */}
            <div>
              <div style={css("display:flex;align-items:center;gap:12px;margin-bottom:6px;")}>
                <h2 style={css("font-family:'Share Tech Mono',monospace;font-size:28px;letter-spacing:.04em;margin:0;color:#4ade80;text-transform:uppercase;white-space:nowrap;")}>Praxis</h2>
                <span style={css("flex:1;height:1px;background:rgba(37,99,235,.3);")} />
              </div>
              <div style={css("font-family:'Share Tech Mono',monospace;font-size:7.5px;letter-spacing:.24em;text-transform:uppercase;color:rgba(74,222,128,.4);margin-bottom:18px;")}>Sealed outputs // verified by the array</div>
              <div style={css("display:flex;flex-direction:column;gap:10px;")}>
                {data.recentPraxis.map((px: FactionPraxis, i) => {
                  const { head, last } = splitLast(px.finding);
                  const role = data.members.find((m) => m.name === px.author)?.role ?? "";
                  return (
                    <div key={px.id} style={css("position:relative;border:1px solid rgba(37,99,235,.24);background:rgba(37,99,235,.04);padding:14px 18px;")}>
                      <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px;")}>
                        <div style={css("display:flex;align-items:center;gap:10px;min-width:0;")}>
                          <span style={css("width:32px;height:32px;border-radius:50%;flex-shrink:0;border:1px solid #2563eb;background:rgba(37,99,235,.14);display:flex;align-items:center;justify-content:center;font-size:11px;color:#60a5fa;")}>{initialOf(px.author, "afterUnderscore")}</span>
                          <div style={css("min-width:0;")}>
                            <div style={css("font-size:11px;color:#4ade80;letter-spacing:.04em;")}>{px.author}</div>
                            <div style={css("font-size:7px;color:rgba(96,165,250,.45);letter-spacing:.06em;")}>{role} · sealed {px.sealedAt}</div>
                          </div>
                        </div>
                        <div style={css("display:flex;align-items:center;gap:10px;flex-shrink:0;")}>
                          {i === topIdx && <FdlLaurel size={38} innerBg="#050f08" glyphColor="#4ade80" ringInset={3} shadow="drop-shadow(0 0 4px rgba(74,222,128,.35))" />}
                          <span style={css("font-size:6.5px;letter-spacing:.18em;padding:2px 7px;background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.27);")}>SEALED</span>
                        </div>
                      </div>
                      <div style={css("padding-left:42px;")}>
                        <div style={css("font-size:15px;line-height:1.2;color:#86efac;letter-spacing:.03em;margin-bottom:5px;")}>{head}<span style={css("color:#60a5fa;")}>{last}</span></div>
                        <div style={css("display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:7px;letter-spacing:.08em;")}>
                          <span style={css("color:rgba(96,165,250,.5);")}>{signalIds[i % signalIds.length]}</span>
                          <span style={css("color:rgba(251,191,36,.7);")}>{px.points} CR</span>
                          <span style={css("color:rgba(74,222,128,.45);")}>{px.endorsements} signals confirmed</span>
                        </div>
                        <div style={css("font-size:7.5px;color:rgba(74,222,128,.4);font-style:italic;letter-spacing:.04em;margin-top:6px;")}>from protocol “{px.taskTitle}”</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div style={css("display:flex;flex-direction:column;gap:42px;")}>
            {/* ③ ACCESS */}
            <div style={css("position:relative;background:#050f08;border:1px solid rgba(37,99,235,.42);overflow:hidden;")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between;background:#2563eb;padding:9px 15px;gap:10px;")}>
                <span style={css("font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.92);")}>ACCESS</span>
                <span style={css("font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:.1em;color:rgba(255,255,255,.5);")}>re: you</span>
              </div>
              <div style={css("position:relative;padding:20px 18px;")}>
                <div style={css("position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent,transparent 2px,rgba(74,222,128,.012) 2px,rgba(74,222,128,.012) 4px);")} />
                <div style={css("position:relative;")}>
                  {isMember && (
                    <div>
                      <div style={css("font-size:22px;line-height:1;color:#4ade80;letter-spacing:.04em;")}>NODE ONLINE<span style={css("display:inline-block;width:6px;height:16px;background:#4ade80;margin-left:4px;vertical-align:middle;animation:sg-blink 1.1s step-end infinite;")} /></div>
                      <div style={css("font-size:10px;color:rgba(96,165,250,.6);margin:10px 0 18px;letter-spacing:.04em;")}>array · <span style={css("color:#60a5fa;")}>{viewer.role}</span></div>
                      <button onClick={leave} style={css("width:100%;font-family:'Share Tech Mono',monospace;font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:rgba(96,165,250,.6);background:transparent;border:1px solid rgba(37,99,235,.4);padding:10px;")}>&gt; disconnect node</button>
                    </div>
                  )}
                  {showJoin && (
                    <div>
                      <div style={css("font-size:8px;letter-spacing:.2em;color:rgba(96,165,250,.5);margin-bottom:7px;")}>&gt; ACCESS GRANTED</div>
                      <div style={css("font-size:22px;line-height:1.05;color:#4ade80;letter-spacing:.03em;margin-bottom:10px;")}>JOIN THE ARRAY</div>
                      <div style={css("font-size:10px;line-height:1.65;color:rgba(74,222,128,.6);margin-bottom:18px;")}>Take a node. Run protocols, seal outputs, cast signal into the consensus. The threshold is already behind us.</div>
                      <button onClick={join} style={css("width:100%;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#050f08;background:#4ade80;border:none;padding:12px;box-shadow:0 0 16px rgba(74,222,128,.35);")}>&gt; CONNECT</button>
                    </div>
                  )}
                  {showGate && (
                    <div>
                      <div style={css("font-size:8px;letter-spacing:.2em;color:rgba(96,165,250,.5);margin-bottom:7px;")}>&gt; NODE NOT YET ONLINE</div>
                      <div style={css("font-size:20px;line-height:1.1;color:#4ade80;letter-spacing:.03em;margin-bottom:11px;")}>{viewer.requirement.summary}</div>
                      <div style={css("font-size:10px;line-height:1.7;color:rgba(74,222,128,.6);")}>{viewer.requirement.detail}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ⑥ MEMBERS */}
            <div style={css("display:flex;flex-direction:column;gap:18px;")}>
              {spot && (
                <div style={css("position:relative;overflow:hidden;background:#050f08;border:1px solid #2563eb;box-shadow:0 0 30px -18px rgba(74,222,128,.4);text-align:center;padding:20px 18px 18px;")}>
                  <div style={css("position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent,transparent 2px,rgba(74,222,128,.014) 2px,rgba(74,222,128,.014) 4px);")} />
                  <div style={css("position:relative;font-size:7px;letter-spacing:.28em;color:rgba(74,222,128,.45);margin-bottom:12px;")}>&gt; PRIMARY NODE</div>
                  <div style={css("position:relative;width:72px;height:72px;margin:0 auto 12px;")}>
                    <svg width="72" height="72" style={{ color: "rgba(74,222,128,.45)", position: "absolute", inset: 0, animation: "sg-rotate 120s linear infinite" }}><use href="#sg-mark" /></svg>
                    <div style={css("position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:26px;color:#4ade80;")}>{initialOf(spot.name, "afterUnderscore")}</div>
                  </div>
                  <div style={css("position:relative;font-size:24px;line-height:1;color:#86efac;letter-spacing:.03em;")}>{spot.name}</div>
                  <div style={css("position:relative;font-size:8px;letter-spacing:.1em;color:rgba(96,165,250,.55);margin-top:6px;text-transform:uppercase;")}>{spot.role} · lvl {spot.level} · {fmt(spot.points)} cr</div>
                </div>
              )}
              <div style={css("position:relative;background:#050f08;border:1px solid rgba(37,99,235,.42);padding:16px 16px 12px;overflow:hidden;")}>
                <div style={css("position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent,transparent 2px,rgba(74,222,128,.012) 2px,rgba(74,222,128,.012) 4px);")} />
                <div style={css("position:relative;font-size:7px;letter-spacing:.24em;text-transform:uppercase;color:rgba(74,222,128,.4);margin-bottom:12px;")}>&gt; THE ARRAY</div>
                {others.map((m: FactionMember) => (
                  <div key={m.id} style={css("position:relative;display:flex;align-items:center;gap:11px;padding:8px 0;border-bottom:1px solid rgba(37,99,235,.14);")}>
                    <span style={css("width:30px;height:30px;border-radius:50%;flex-shrink:0;border:1px solid #2563eb;background:rgba(37,99,235,.14);display:flex;align-items:center;justify-content:center;font-size:11px;color:#60a5fa;")}>{initialOf(m.name, "afterUnderscore")}</span>
                    <div style={css("flex:1;min-width:0;")}>
                      <div style={css("font-size:12px;color:#4ade80;line-height:1.1;letter-spacing:.03em;")}>{m.name}</div>
                      <div style={css("font-size:7px;letter-spacing:.06em;text-transform:uppercase;color:rgba(96,165,250,.45);")}>{m.role}</div>
                    </div>
                    <span style={css("font-size:10px;color:#fbbf24;letter-spacing:.04em;")}>lvl {m.level}</span>
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
