import React from "react";
import { factionCssVar } from "../core/factions.js";

/**
 * FactionPennant — a diagonal banner/pennant tab in a faction's full-saturation
 * color, used for faction filters. Pennants are ALWAYS full color (never
 * desaturated); inactive simply drops opacity to 0.85.
 */
export function FactionPennant({ slug, name, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: factionCssVar(slug),
        color: "var(--color-text-on-accent)",
        fontFamily: "var(--font-body)",
        fontSize: 9,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        padding: "4px 12px",
        cursor: "pointer",
        border: "none",
        borderRadius: 0,
        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
        opacity: active ? 1 : 0.85,
        clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)",
        transition: "all 120ms",
      }}
    >
      {name}
    </button>
  );
}
