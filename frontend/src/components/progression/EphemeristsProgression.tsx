import type { ProgressionProps } from "./Progression";
import { toRoman } from "../cards/ephemeristsAtoms";

/**
 * The Ephemerists progression indicator — a "grade" cartouche. An ink field
 * with a gold-leaf top rule and the level set as a Cinzel roman numeral, the
 * way the faction grades its tasks (grade I…V). Colors via the --eph-* tokens.
 */
export default function EphemeristsProgression({ level }: ProgressionProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 5,
        background: "var(--eph-ink)",
        color: "var(--eph-parchment)",
        padding: "2px 9px",
        borderTop: "2px solid var(--eph-gold)",
        fontFamily: "var(--eph-serif)",
        fontSize: 8,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
      }}
    >
      Grade
      <span
        style={{
          fontFamily: "var(--eph-display)",
          fontWeight: 700,
          fontSize: 15,
          lineHeight: 1,
          color: "var(--eph-gold-light)",
        }}
      >
        {toRoman(level)}
      </span>
    </span>
  );
}
