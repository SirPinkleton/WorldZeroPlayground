import React, { useState } from "react";
import { factionCssVar } from "../core/factions.js";

/**
 * FactionVoteStamps — World Zero's rating control: five rectangular rubber
 * stamps (1–5) replacing star ratings. The vote MODEL is shared across every
 * faction; what changes per faction is the LANGUAGE of the five rungs and the
 * tint. Pass `faction` to reframe the ramp in that faction's voice:
 *
 *   (none)      → a start · solid · good · excellent · legendary   (generic ramp)
 *   ua          → rough sketch · study · fair hand · fine work · masterwork   (the Critique, burnt amber)
 *   snide       → meh · not bad · rad · sick!! · ANARCHY
 *   ephemerists → apocryphal · disputed · plausible · corroborated · canonical
 *   singularity → noise · weak · signal · clear · verified
 *   everymen    → noted · supported · commended · honored · exemplary
 *   albescent   → unseeing · glimpsed · witnessed · verified · inscribed
 *
 * The faction kits ship their own fully-bespoke vote shapes (wax seals, signal
 * bars, witness circles); this is the shared stamp form, reframed by token.
 */

/** Per-faction rung labels. The 1–5 model is identical; only the words change. */
const FACTION_LABELS = {
  ua: ["rough sketch", "study", "fair hand", "fine work", "masterwork"],
  gestalt: ["a start", "solid", "good", "excellent", "legendary"],
  snide: ["meh", "not bad", "rad", "sick!!", "ANARCHY"],
  ephemerists: ["apocryphal", "disputed", "plausible", "corroborated", "canonical"],
  singularity: ["noise", "weak", "signal", "clear", "verified"],
  everymen: ["noted", "supported", "commended", "honored", "exemplary"],
  albescent: ["unseeing", "glimpsed", "witnessed", "verified", "inscribed"],
};

/** Generic multi-hue ramp (the default, faction-agnostic rendering). */
const GENERIC_COLORS = ["var(--vote-1)", "var(--vote-2)", "var(--vote-3)", "var(--vote-4)", "var(--vote-5)"];
const GENERIC_LABELS = ["a start", "solid", "good", "excellent", "legendary"];

export function FactionVoteStamps({ faction, value = 0, average, totalVotes, onVote }) {
  const [selected, setSelected] = useState(value);

  const labels = faction ? (FACTION_LABELS[faction] ?? GENERIC_LABELS) : GENERIC_LABELS;
  // No faction → the distinct multi-hue ramp. Any faction (incl. ua) → its
  // accent, graded by opacity so the five rungs read as a ramp.
  const useGeneric = !faction;
  const accent = useGeneric ? null : factionCssVar(faction, "card-accent");
  const colorFor = (i) =>
    useGeneric ? GENERIC_COLORS[i] : `color-mix(in srgb, ${accent} ${32 + i * 17}%, transparent)`;
  const labelFont = useGeneric ? "var(--font-body)" : factionCssVar(faction, "card-font");

  const handle = (stars) => {
    setSelected(stars);
    onVote && onVote(stars);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {labels.map((label, i) => {
          const stampValue = i + 1;
          const active = selected === stampValue;
          const color = colorFor(i);
          return (
            <div key={stampValue} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <button
                onClick={() => handle(stampValue)}
                className={active ? "vote-stamp vote-stamp-active" : "vote-stamp"}
                style={{ "--stamp-color": color }}
                aria-label={`Rate ${stampValue} — ${label}`}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      inset: 2,
                      border: "1px dashed color-mix(in srgb, var(--color-text-on-accent) 25%, transparent)",
                      pointerEvents: "none",
                    }}
                  />
                )}
                {stampValue}
              </button>
              <span
                style={{
                  fontFamily: labelFont,
                  fontStyle: useGeneric ? "normal" : "italic",
                  fontSize: useGeneric ? 7 : 9,
                  textTransform: useGeneric ? "uppercase" : "none",
                  letterSpacing: useGeneric ? "0.04em" : 0,
                  color: active ? color : "var(--color-text-tertiary)",
                  maxWidth: 48,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {average !== undefined && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: 9, color: "var(--color-text-secondary)", margin: 0 }}>
          {average.toFixed(1)} avg · {totalVotes ?? 0} votes
        </p>
      )}
    </div>
  );
}
