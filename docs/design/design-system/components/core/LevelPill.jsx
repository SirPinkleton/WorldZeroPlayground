import React from "react";
import { factionCssVar } from "./factions.js";

/**
 * LevelPill — the small dark capsule showing a task's level requirement.
 * Shared by every faction card. Pass `factionSlug` to tint it with that
 * faction's card accent; omit for the neutral ink/paper pill.
 */
export function LevelPill({ level, factionSlug }) {
  const bg = factionSlug
    ? factionCssVar(factionSlug, "card-accent")
    : "var(--color-text-primary)";
  const fg = factionSlug
    ? factionCssVar(factionSlug, "card-bg")
    : "var(--color-bg-page)";

  return (
    <span
      style={{
        background: bg,
        color: fg,
        fontSize: 7,
        padding: "1px 6px",
        borderRadius: 6,
        textTransform: "uppercase",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.08em",
      }}
    >
      lvl {level}
    </span>
  );
}
