import { useState } from "react";
import type { FactionContract, FactionTask, FactionPraxis, FactionMember } from "../types";
import { ephemerists } from "../data/ephemerists";
import { css } from "../lib/css";
import { fmt, kfmt, roman, splitLast } from "../lib/format";
import { useFactionMembership } from "../lib/useFactionMembership";
import { useHead } from "../lib/useHead";
import { FdlLaurel, topPraxisIndex } from "../lib/FdlLaurel";

/* ════════════════════════════════════════════════════════════════
   The Ephemerists — the discordant map (illuminated codex).
   Vellum + iron-gall ink, lapis + gold leaf, rubrication red, Cinzel /
   EB Garamond / Cormorant. Task cards are a "contested field": three
   disagreeing coordinate grids over one disputed point. Levels &
   points read as Roman numerals ("pvncta"). Stats stack beside the seal.
   ════════════════════════════════════════════════════════════════ */

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&display=swap";
const KEYFRAMES = `@keyframes eph-twinkle{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.25)}}`;

function EyeDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="eph-eye" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeWidth="1.4">
          <ellipse cx="12" cy="12" rx="11" ry="4.4" transform="rotate(-24 12 12)" />
          <path d="M4 12 C7.5 8.2 16.5 8.2 20 12 C16.5 15.8 7.5 15.8 4 12 Z" />
          <circle cx="12" cy="12" r="2.7" />
        </g>
        <circle cx="12" cy="12" r="0.7" fill="currentColor" />
      </symbol>
    </svg>
  );
}
const Eye = ({ size, color }: { size: number; color: string }) => (
  <svg width={size} height={size} style={{ color }}><use href="#eph-eye" /></svg>
);

/** The contested-field map — three disagreeing survey grids over one gold point. */
function ContestedField() {
  return (
    <div style={css("position:relative;flex:1;min-height:172px;margin:2px 5px;border:1px solid #8a6622;overflow:hidden;")}>
      <div style={css("position:absolute;inset:0;opacity:.5;background-image:repeating-linear-gradient(0deg,rgba(42,29,18,.26) 0 1px,transparent 1px 16px),repeating-linear-gradient(90deg,rgba(42,29,18,.26) 0 1px,transparent 1px 16px);")} />
      <svg viewBox="0 0 200 172" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.7 }}><g stroke="#1d4f6e" strokeWidth="0.9" fill="none"><line x1="0" y1="172" x2="122" y2="36" /><line x1="20" y1="172" x2="122" y2="36" /><line x1="40" y1="172" x2="122" y2="36" /><line x1="60" y1="172" x2="122" y2="36" /><line x1="80" y1="172" x2="122" y2="36" /><line x1="100" y1="172" x2="122" y2="36" /><line x1="120" y1="172" x2="122" y2="36" /><line x1="140" y1="172" x2="122" y2="36" /><line x1="160" y1="172" x2="122" y2="36" /><line x1="180" y1="172" x2="122" y2="36" /><line x1="200" y1="172" x2="122" y2="36" /><line x1="0" y1="56" x2="200" y2="56" /><line x1="0" y1="88" x2="200" y2="88" /><line x1="0" y1="114" x2="200" y2="114" /><line x1="0" y1="136" x2="200" y2="136" /><line x1="0" y1="154" x2="200" y2="154" /></g></svg>
      <svg viewBox="0 0 200 172" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.72 }}><g stroke="#9c3622" strokeWidth="0.8" fill="none"><circle cx="122" cy="82" r="16" /><circle cx="122" cy="82" r="34" /><circle cx="122" cy="82" r="54" /><circle cx="122" cy="82" r="76" /><line x1="122" y1="82" x2="202" y2="82" /><line x1="122" y1="82" x2="191.3" y2="122" /><line x1="122" y1="82" x2="162" y2="151.3" /><line x1="122" y1="82" x2="122" y2="162" /><line x1="122" y1="82" x2="82" y2="151.3" /><line x1="122" y1="82" x2="52.7" y2="122" /><line x1="122" y1="82" x2="42" y2="82" /><line x1="122" y1="82" x2="52.7" y2="42" /><line x1="122" y1="82" x2="82" y2="12.7" /><line x1="122" y1="82" x2="122" y2="2" /><line x1="122" y1="82" x2="162" y2="12.7" /><line x1="122" y1="82" x2="191.3" y2="42" /></g></svg>
      <div style={css("position:absolute;left:61%;top:47%;transform:translate(-50%,-50%);z-index:4;")}><div style={css("width:9px;height:9px;border-radius:50%;background:#d4ab55;box-shadow:0 0 10px 3px rgba(212,171,85,.7);animation:eph-twinkle 2.4s ease-in-out infinite;")} /></div>
      <div style={css("position:absolute;top:7%;left:6%;font-size:7.5px;letter-spacing:.04em;color:#2a1d12;background:rgba(233,220,191,.82);padding:1px 4px;")}>x 14 · y <span style={css("text-decoration:line-through;opacity:.65;")}>8</span> <span style={css("color:#1d4f6e;font-style:italic;")}>9</span></div>
      <div style={css("position:absolute;top:79%;left:52%;font-size:7.5px;letter-spacing:.04em;color:#9c3622;background:rgba(233,220,191,.82);padding:1px 4px;")}>r 47 · θ 31°</div>
      <div style={css("position:absolute;top:5%;left:66%;font-size:7.5px;letter-spacing:.04em;color:#1d4f6e;background:rgba(233,220,191,.82);padding:1px 4px;")}>∞ · vanishing</div>
      <div style={css("position:absolute;left:2px;bottom:7px;transform-origin:left bottom;transform:rotate(-90deg);white-space:nowrap;font-size:6px;letter-spacing:.05em;color:#6f5c3e;opacity:.85;")}>¼″ wider within than without †</div>
    </div>
  );
}

export function EphemeristsFactionPage({ data = ephemerists }: { data?: FactionContract }) {
  useHead("ephemerists", FONT_HREF, KEYFRAMES);
  const { isMember, showJoin, showGate, join, leave } = useFactionMembership(data.viewer);
  const [filter, setFilter] = useState("All");

  const { stats, identity, viewer } = data;
  const statList = [
    { value: fmt(stats.memberCount), label: "keepers" },
    { value: stats.seasonRank ? "#" + stats.seasonRank : "—", label: "season rank" },
    { value: fmt(stats.praxisFiled), label: "exhibits filed" },
    { value: kfmt(stats.pointsAwarded), label: "pvncta" },
  ];

  const chipBase =
    "font-family:'EB Garamond',serif;font-style:italic;font-size:11px;letter-spacing:.06em;padding:6px 13px;transition:all 120ms;white-space:nowrap;";
  const filters = ["All", "Open to me"].map((label) => ({
    label,
    chip:
      chipBase +
      (filter === label
        ? "background:#1d4f6e;color:#f1e8cf;border:1px solid #1d4f6e;"
        : "background:#efe4c8;color:#1d4f6e;border:1px solid #c9a955;"),
  }));

  const concordFor = (e: number) => (e >= 300 ? "canonical" : e >= 150 ? "corroborated" : "plausible");
  const topIdx = topPraxisIndex(data.recentPraxis.map((p) => p.points));
  const spot = data.members.find((m) => m.isSpotlight);
  const others = data.members.filter((m) => !m.isSpotlight);

  return (
    <div style={css("min-height:100vh;font-family:'EB Garamond',Georgia,serif;color:#2a1d12;background:#e4d8ba;background-image:radial-gradient(60% 50% at 12% 0%,rgba(29,79,110,.05),transparent 70%),radial-gradient(50% 50% at 100% 6%,rgba(176,134,58,.07),transparent 70%),radial-gradient(rgba(42,29,18,.04) 1px,transparent 1px);background-size:auto,auto,7px 7px;")}>
      <EyeDefs />

      {/* NEUTRAL SHARED NAV */}
      <nav style={css("position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:22px;padding:13px 32px;background:rgba(233,220,191,.9);border-bottom:1px solid #c9b483;backdrop-filter:blur(8px);")}>
        <span style={css("font-family:'Cinzel',serif;font-weight:700;font-size:19px;line-height:1;letter-spacing:.06em;padding-bottom:2px;border-bottom:3px solid;border-image:linear-gradient(90deg,#fbbf24,#be185d,#4f46e5,#0e7490,#16a34a,#f97316) 1;")}>World Zero</span>
        <div style={css("display:flex;gap:18px;flex:1;")}>
          {["Home", "Tasks", "Praxis", "Players", "Factions", "Updates"].map((l) => (
            <a key={l} style={css("font-family:'EB Garamond',serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;" + (l === "Factions" ? "color:#1d4f6e;border-bottom:1px solid #1d4f6e;padding-bottom:3px;" : "color:#6f5c3e;"))}>{l}</a>
          ))}
        </div>
        <span style={css("display:inline-flex;align-items:center;gap:7px;background:#1d4f6e;color:#f1e8cf;font-family:'Cinzel',serif;font-weight:600;font-size:10px;letter-spacing:.14em;text-transform:uppercase;padding:5px 11px;box-shadow:inset 0 0 0 1px #b0863a;")}><Eye size={13} color="#d4ab55" />Ephemerists</span>
        <span style={css("font-family:'EB Garamond',serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6f5c3e;border:1px solid #c9b483;padding:5px 11px;")}>Logout</span>
      </nav>

      <div style={css("max-width:1140px;margin:0 auto;padding:30px 32px 84px;")}>

        {/* ① HERO */}
        <header style={css("position:relative;overflow:hidden;border:2px solid #b0863a;background:radial-gradient(120% 140% at 82% 0%,#1d4f6e,#143b54 60%,#05131c 100%);color:#f1e8cf;box-shadow:0 0 0 3px #e9dcbf,0 0 0 4px #2a1d12,0 18px 44px rgba(20,40,50,.35);margin-bottom:40px;")}>
          <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.13;background-image:repeating-linear-gradient(0deg,#f1e8cf 0 1px,transparent 1px 26px),repeating-linear-gradient(90deg,#f1e8cf 0 1px,transparent 1px 26px);")} />
          <svg viewBox="0 0 1000 340" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15, pointerEvents: "none" }}><g stroke="#d4ab55" strokeWidth="0.6" fill="none">{[0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 820, 920].map((x) => <line key={x} x1={x} y1="340" x2="820" y2="20" />)}</g></svg>
          <svg viewBox="0 0 1000 340" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12, pointerEvents: "none" }}><g stroke="#d4ab55" strokeWidth="0.7" fill="none"><circle cx="820" cy="150" r="60" /><circle cx="820" cy="150" r="130" /><circle cx="820" cy="150" r="210" /><circle cx="820" cy="150" r="300" /></g></svg>

          <div style={css("height:5px;background:#b0863a;position:relative;z-index:2;")} />
          <div style={css("position:relative;z-index:2;display:grid;grid-template-columns:1fr 232px;gap:32px;align-items:center;padding:32px 40px 32px;")}>
            <div>
              <div style={css("font-family:'EB Garamond',serif;font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:#d4ab55;margin-bottom:8px;")}>World Zero · faction no. 5 · the road's keepers</div>
              <h1 style={css("font-family:'Cinzel',serif;font-weight:800;font-size:60px;line-height:.9;letter-spacing:.02em;margin:0;color:#f1e8cf;text-shadow:2px 2px 0 #143b54;")}>{data.name}</h1>
              <div style={css("display:inline-block;margin-top:14px;background:#2a1d12;color:#d4ab55;font-family:'Cinzel',serif;font-weight:600;font-size:14px;letter-spacing:.26em;padding:5px 16px;border:1px solid #8a6622;")}>{identity.motto}</div>
              <p style={css("font-family:'EB Garamond',serif;font-size:13.5px;line-height:1.65;max-width:520px;margin:16px 0 0;color:rgba(241,232,207,.92);")}>{identity.blurb}<span style={css("display:block;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12px;color:rgba(241,232,207,.62);margin-top:8px;")}>† nothing keeps. we keep the record anyway.</span></p>
            </div>
            {/* right column: eye seal + stats on the side */}
            <div style={css("display:flex;flex-direction:column;gap:22px;align-items:center;")}>
              <div style={css("position:relative;width:118px;height:118px;border-radius:50%;flex-shrink:0;background:#e9dcbf;box-shadow:0 0 0 2px #b0863a,0 0 0 5px #2a1d12,inset 0 0 0 4px rgba(176,134,58,.5);display:flex;align-items:center;justify-content:center;")}>
                <div style={css("position:absolute;inset:0;border-radius:50%;background:repeating-conic-gradient(from 0deg,#8a6622 0deg .7deg,transparent .7deg 10deg);-webkit-mask:radial-gradient(transparent 60%,#000 62% 74%,transparent 76%);mask:radial-gradient(transparent 60%,#000 62% 74%,transparent 76%);")} />
                <Eye size={54} color="#1d4f6e" />
              </div>
              <div style={css("align-self:stretch;border:1px solid rgba(212,171,85,.4);background:rgba(20,40,50,.35);")}>
                {statList.map((s) => (
                  <div key={s.label} style={css("display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:9px 14px;border-bottom:1px solid rgba(212,171,85,.18);")}>
                    <span style={css("font-family:'EB Garamond',serif;font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:rgba(241,232,207,.75);")}>{s.label}</span>
                    <span style={css("font-family:'Cinzel',serif;font-weight:700;font-size:22px;line-height:.9;color:#d4ab55;")}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div style={css("display:grid;grid-template-columns:1fr 322px;gap:34px;align-items:start;")}>
          {/* MAIN COLUMN */}
          <div style={css("display:flex;flex-direction:column;gap:46px;")}>

            {/* ② THE APPARATUS */}
            <div style={css("position:relative;background:#efe4c8;border:1px solid #c9a955;box-shadow:0 6px 20px rgba(42,29,18,.1);padding:26px 30px 28px;overflow:hidden;")}>
              <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:multiply;background-image:radial-gradient(9px 6px at 18% 22%,rgba(42,29,18,.12),transparent 70%),radial-gradient(6px 5px at 82% 30%,rgba(138,102,34,.14),transparent 70%),radial-gradient(11px 7px at 66% 84%,rgba(42,29,18,.09),transparent 70%);")} />
              <div style={css("position:relative;display:flex;align-items:center;gap:12px;margin-bottom:16px;")}>
                <Eye size={15} color="#9c3622" />
                <span style={css("font-family:'Cinzel',serif;font-weight:600;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#8a6622;")}>The Apparatus</span>
                <span style={css("flex:1;height:1px;background:linear-gradient(90deg,#b0863a,transparent);")} />
              </div>
              <div style={css("position:relative;display:flex;flex-direction:column;gap:12px;")}>
                {identity.about.map((para, i) => (
                  <p key={i} style={css("font-family:'EB Garamond',serif;font-size:14.5px;line-height:1.78;color:#3a2a17;margin:0;")}>{para}</p>
                ))}
              </div>
            </div>

            {/* ④ TASKS */}
            <div>
              <div style={css("display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:6px;flex-wrap:wrap;")}>
                <h2 style={css("font-family:'Cinzel',serif;font-weight:700;font-size:30px;letter-spacing:.03em;margin:0;color:#2a1d12;")}>Tasks</h2>
                <div style={css("display:flex;gap:7px;")}>
                  {filters.map((f) => (
                    <button key={f.label} onClick={() => setFilter(f.label)} style={css(f.chip)}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:#6f5c3e;margin-bottom:20px;")}>Surveys awaiting a hand to triangulate them</div>
              <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:24px;")}>
                {data.openTasks.map((task: FactionTask) => {
                  const { head, last } = splitLast(task.title);
                  return (
                    <div key={task.id} style={css("position:relative;overflow:hidden;background:#e9dcbf;color:#2a1d12;border:1.5px solid #2a1d12;display:flex;flex-direction:column;")}>
                      <div style={css("position:relative;z-index:5;padding:9px 0 5px;text-align:center;")}>
                        <div style={css("display:flex;align-items:center;justify-content:center;gap:5px;color:#8a6622;")}>
                          <Eye size={11} color="#8a6622" />
                          <span style={css("font-family:'Cinzel',serif;font-weight:600;font-size:8.5px;letter-spacing:.24em;")}>THE EPHEMERISTS</span>
                        </div>
                        <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-size:8.5px;color:#6f5c3e;margin-top:1px;")}>exhibit · no single here</div>
                      </div>
                      <ContestedField />
                      <div style={css("position:relative;z-index:5;padding:8px 14px 10px;text-align:center;")}>
                        <div style={css("font-family:'Cinzel',serif;font-weight:700;font-size:20px;line-height:.98;")}>{head}<span style={css("color:#1d4f6e;")}>{last}</span><sup style={css("font-family:'EB Garamond',serif;font-size:9px;color:#1d4f6e;font-weight:400;")}>†</sup></div>
                        <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11.5px;line-height:1.4;color:#6f5c3e;margin:5px 0 8px;")}>{task.description}</div>
                        <div style={css("display:flex;align-items:center;justify-content:center;gap:8px;font-size:8px;")}>
                          <span style={css("color:#2a1d12;letter-spacing:.04em;")}>▦ grade {roman(task.level)}</span>
                          <span style={css("color:#8a6622;")}>·</span>
                          <span style={css("font-family:'Cinzel',serif;font-weight:700;font-size:13px;color:#9c3622;")}>{task.points} pvncta</span>
                        </div>
                      </div>
                      <button style={css("width:100%;background:#2a1d12;color:#f1e8cf;border:none;font-family:'EB Garamond',serif;font-style:italic;font-size:11px;letter-spacing:.1em;padding:8px;")}>Triangulate the truth ▸</button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ⑤ PRAXIS */}
            <div>
              <h2 style={css("font-family:'Cinzel',serif;font-weight:700;font-size:30px;letter-spacing:.03em;margin:0;color:#2a1d12;")}>Praxis</h2>
              <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:#6f5c3e;margin:4px 0 18px;")}>Truths filed to the codex &amp; weighed for concordance</div>
              <div style={css("display:flex;flex-direction:column;gap:14px;")}>
                {data.recentPraxis.map((px: FactionPraxis, i) => (
                  <div key={px.id} style={css("position:relative;display:flex;gap:16px;align-items:center;background:#efe4c8;color:#2a1d12;border:1px solid #c9a955;box-shadow:0 4px 14px rgba(42,29,18,.08);padding:16px 18px;overflow:hidden;")}>
                    <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.4;mix-blend-mode:multiply;background-image:radial-gradient(7px 5px at 20% 30%,rgba(42,29,18,.12),transparent 70%),radial-gradient(9px 6px at 78% 74%,rgba(138,102,34,.12),transparent 70%);")} />
                    <div style={css("position:relative;flex-shrink:0;width:46px;height:46px;border-radius:50%;background:#e9dcbf;box-shadow:0 0 0 1.5px #b0863a,0 0 0 3.5px #2a1d12;display:flex;align-items:center;justify-content:center;")}>
                      <Eye size={24} color="#1d4f6e" />
                    </div>
                    <div style={css("position:relative;flex:1;min-width:0;")}>
                      <div style={css("font-family:'EB Garamond',serif;font-style:italic;font-size:13px;color:#3a2a17;margin-bottom:2px;")}>{px.author} · filed {px.sealedAt}</div>
                      <div style={css("font-family:'Cinzel',serif;font-weight:700;font-size:19px;line-height:1;color:#2a1d12;")}>{px.finding}</div>
                      <div style={css("font-size:9px;letter-spacing:.03em;color:#6f5c3e;margin-top:6px;")}>from “{px.taskTitle}” · {px.points} pvncta · marked <span style={css("color:#9c3622;font-style:italic;")}>{concordFor(px.endorsements)}</span> · {px.endorsements} marks filed</div>
                    </div>
                    <div style={css("position:relative;flex-shrink:0;")}>
                      {i === topIdx && <FdlLaurel size={44} innerBg="#efe4c8" glyphColor="#2a1d12" shadow="drop-shadow(1.5px 2px 0 rgba(42,29,18,.28))" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div style={css("display:flex;flex-direction:column;gap:46px;")}>
            {/* ③ THE ROAD */}
            <div style={css("position:relative;background:#efe4c8;border:1px solid #c9a955;box-shadow:0 8px 24px rgba(42,29,18,.12);overflow:hidden;")}>
              <div style={css("background:#1d4f6e;color:#f1e8cf;padding:9px 16px;font-family:'Cinzel',serif;font-weight:600;font-size:12px;letter-spacing:.2em;text-transform:uppercase;box-shadow:inset 0 -2px 0 #b0863a;")}>The Road</div>
              <div style={css("position:relative;padding:22px 20px;")}>
                <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.4;mix-blend-mode:multiply;background-image:radial-gradient(8px 6px at 22% 26%,rgba(42,29,18,.12),transparent 70%),radial-gradient(6px 5px at 80% 78%,rgba(138,102,34,.13),transparent 70%);")} />
                <div style={css("position:relative;")}>
                  {isMember && (
                    <div>
                      <div style={css("font-family:'Cinzel',serif;font-weight:700;font-size:22px;line-height:1.02;color:#2a1d12;")}>Your name is in the codex</div>
                      <div style={css("font-family:'EB Garamond',serif;font-size:13px;color:#6f5c3e;margin:10px 0 18px;")}>Standing · <span style={css("font-style:italic;color:#9c3622;")}>{viewer.role}</span></div>
                      <button onClick={leave} style={css("width:100%;font-family:'EB Garamond',serif;font-style:italic;font-size:12px;letter-spacing:.08em;color:#6f5c3e;background:transparent;border:1px solid #c9b483;padding:10px;")}>Leave the road</button>
                    </div>
                  )}
                  {showJoin && (
                    <div>
                      <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:#8a6622;margin-bottom:5px;")}>The codex lies open —</div>
                      <div style={css("font-family:'Cinzel',serif;font-weight:700;font-size:23px;line-height:1.02;color:#2a1d12;margin-bottom:10px;")}>Walk with the keepers</div>
                      <div style={css("font-family:'EB Garamond',serif;font-size:13px;line-height:1.6;color:#3a2a17;margin-bottom:18px;")}>Take a survey, triangulate what you find, and file it to the record. The road is long and forks often.</div>
                      <button onClick={join} style={css("width:100%;font-family:'Cinzel',serif;font-weight:600;font-size:13px;letter-spacing:.14em;color:#f1e8cf;background:#1d4f6e;border:none;padding:12px;box-shadow:inset 0 0 0 1px #b0863a,0 6px 16px rgba(20,50,70,.3);")}>TAKE THE ROAD ▸</button>
                    </div>
                  )}
                  {showGate && (
                    <div>
                      <div style={css("font-family:'Cormorant Garamond',serif;font-style:italic;font-size:13px;color:#8a6622;margin-bottom:5px;")}>Not yet in the codex —</div>
                      <div style={css("font-family:'Cinzel',serif;font-weight:700;font-size:21px;line-height:1.08;color:#2a1d12;margin-bottom:11px;")}>{viewer.requirement.summary}</div>
                      <div style={css("font-family:'EB Garamond',serif;font-size:13px;line-height:1.65;color:#3a2a17;")}>{viewer.requirement.detail}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ⑥ MEMBERS */}
            <div style={css("display:flex;flex-direction:column;gap:20px;")}>
              {spot && (
                <div style={css("position:relative;overflow:hidden;background:radial-gradient(120% 130% at 50% 0%,#1d4f6e,#143b54 70%);color:#f1e8cf;border:2px solid #b0863a;box-shadow:0 0 0 3px #e9dcbf,0 0 0 4px #2a1d12;text-align:center;padding:20px 18px 18px;")}>
                  <div style={css("position:absolute;inset:0;pointer-events:none;opacity:.12;background-image:repeating-linear-gradient(0deg,#d4ab55 0 1px,transparent 1px 20px),repeating-linear-gradient(90deg,#d4ab55 0 1px,transparent 1px 20px);")} />
                  <div style={css("position:relative;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;letter-spacing:.06em;color:#d4ab55;margin-bottom:12px;")}>Keeper of the road</div>
                  <div style={css("position:relative;width:72px;height:72px;border-radius:50%;margin:0 auto 12px;background:#e9dcbf;box-shadow:0 0 0 2px #b0863a,0 0 0 4px #143b54;display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:700;font-size:30px;color:#1d4f6e;")}>{spot.name[0]}</div>
                  <div style={css("position:relative;font-family:'Cinzel',serif;font-weight:700;font-size:22px;line-height:1;color:#f1e8cf;")}>{spot.name}</div>
                  <div style={css("position:relative;font-family:'EB Garamond',serif;font-style:italic;font-size:12px;color:#d4ab55;margin-top:6px;")}>{spot.role}</div>
                  <div style={css("position:relative;font-family:'EB Garamond',serif;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(241,232,207,.7);margin-top:6px;")}>grade {roman(spot.level)} · {fmt(spot.points)} pvncta</div>
                </div>
              )}
              <div style={css("position:relative;background:#efe4c8;border:1px solid #c9a955;box-shadow:0 4px 14px rgba(42,29,18,.08);padding:18px 20px 14px;overflow:hidden;")}>
                <div style={css("position:relative;font-family:'Cinzel',serif;font-weight:600;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8a6622;margin-bottom:12px;")}>The keepers</div>
                {others.map((m: FactionMember) => (
                  <div key={m.id} style={css("position:relative;display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #d8c48f;")}>
                    <span style={css("width:32px;height:32px;border-radius:50%;flex-shrink:0;background:#e9dcbf;box-shadow:0 0 0 1px #b0863a;display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-weight:700;font-size:14px;color:#1d4f6e;")}>{m.name[0]}</span>
                    <div style={css("flex:1;min-width:0;")}>
                      <div style={css("font-family:'EB Garamond',serif;font-size:15px;color:#2a1d12;line-height:1.1;")}>{m.name}</div>
                      <div style={css("font-family:'EB Garamond',serif;font-size:8px;letter-spacing:.06em;text-transform:uppercase;color:#6f5c3e;")}>{m.role}</div>
                    </div>
                    <span style={css("font-family:'Cinzel',serif;font-weight:600;font-size:11px;color:#9c3622;")}>grade {roman(m.level)}</span>
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
