import { useState, type CSSProperties } from "react";
import type { FactionSlug, ViewerState } from "./index";
import { FactionPage, ALL_FACTIONS } from "./index";
import { FACTION_ORDER } from "./data";

/* Demo harness: a faction switcher + viewer-state controls so you can
   see all seven skins and every membership state from one screen.
   This is scaffolding for the handoff — not part of the shipped UI. */

const LABELS: Record<FactionSlug, string> = {
  ua: "UA",
  wow: "Whimsy",
  snide: "S.N.I.D.E.",
  ephemerists: "Ephemerists",
  singularity: "Singularity",
  everymen: "Everymen",
  albescent: "Albescent",
};

export default function Demo() {
  const [slug, setSlug] = useState<FactionSlug>("ua");
  const [state, setState] = useState<ViewerState>("prospective");
  const [eligible, setEligible] = useState(false);

  const base = ALL_FACTIONS[slug];
  const data = { ...base, viewer: { ...base.viewer, state, eligible } };

  const btn = (on: boolean): CSSProperties => ({
    font: "12px ui-monospace,monospace",
    padding: "5px 10px",
    borderRadius: 6,
    border: "1px solid " + (on ? "#111" : "#ccc"),
    background: on ? "#111" : "#fff",
    color: on ? "#fff" : "#333",
    cursor: "pointer",
  });

  return (
    <div>
      <div style={{ position: "fixed", zIndex: 999, top: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", padding: 8, background: "rgba(255,255,255,.9)", border: "1px solid #ddd", borderRadius: 10, boxShadow: "0 6px 20px rgba(0,0,0,.12)", maxWidth: "96vw" }}>
        {FACTION_ORDER.map((s) => (
          <button key={s} style={btn(s === slug)} onClick={() => setSlug(s)}>{LABELS[s]}</button>
        ))}
        <span style={{ width: 1, background: "#ddd", margin: "0 4px" }} />
        <button style={btn(state === "prospective" && !eligible)} onClick={() => { setState("prospective"); setEligible(false); }}>gate</button>
        <button style={btn(state === "prospective" && eligible)} onClick={() => { setState("prospective"); setEligible(true); }}>join</button>
        <button style={btn(state === "member")} onClick={() => setState("member")}>member</button>
      </div>
      <FactionPage key={slug} data={data} />
    </div>
  );
}
