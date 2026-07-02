import type { CSSProperties } from "react";
import { css } from "./css";

/* ────────────────────────────────────────────────────────────────
   FdlLaurel — the Faction Distinction Laurel.

   The ONE cross-faction mark: a rainbow conic-gradient medallion with a
   laurel glyph, awarded to the single highest-scoring praxis on every
   faction page (the "high-score indicator", per the standardization
   review). Each skin only recolours the medallion's inner disc and the
   glyph to sit on its own paper.
   ──────────────────────────────────────────────────────────────── */

export interface FdlLaurelProps {
  /** Overall medallion diameter, px. */
  size?: number;
  /** Fill of the inner disc — set to the card's paper colour. */
  innerBg?: string;
  /** Laurel glyph colour — set to the card's ink colour. */
  glyphColor?: string;
  /** Ring inset from the edge, px (the coloured rainbow band width). */
  ringInset?: number;
  /** Optional rotation, e.g. "-8deg". */
  rotate?: string;
  /** Optional drop-shadow filter string. */
  shadow?: string;
  style?: CSSProperties;
}

const RAINBOW =
  "conic-gradient(from 90deg,#fbbf24,#f97316,#be185d,#4f46e5,#0e7490,#16a34a,#fbbf24)";

export function FdlLaurel({
  size = 44,
  innerBg = "#ffffff",
  glyphColor = "#1c1c1a",
  ringInset = 4,
  rotate,
  shadow,
  style,
}: FdlLaurelProps) {
  const glyph = Math.round(size * 0.42);
  return (
    <span
      title="Faction Distinction Laurel — top praxis"
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
        transform: rotate ? `rotate(${rotate})` : undefined,
        filter: shadow,
        ...style,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: RAINBOW,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,.2)",
        }}
      />
      <span
        style={{
          position: "absolute",
          inset: ringInset,
          borderRadius: "50%",
          background: innerBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,.12)",
        }}
      >
        <svg
          viewBox="0 0 40 48"
          width={glyph * (40 / 48)}
          height={glyph}
          style={{ display: "block", color: glyphColor }}
        >
          <g fill="currentColor">
            <path d="M20 1 C16 10 16 17 20 24 C24 17 24 10 20 1 Z" />
            <path d="M20 22 C14 15 8 15 6 21 C4.6 25 8 29 13.5 27.6 C10.5 25 12.5 21 20 22 Z" />
            <path d="M20 22 C26 15 32 15 34 21 C35.4 25 32 29 26.5 27.6 C29.5 25 27.5 21 20 22 Z" />
            <rect x="11" y="26" width="18" height="4.5" rx="2.2" />
            <path d="M20 30 C17.5 37 16 41 20 47 C24 41 22.5 37 20 30 Z" />
          </g>
        </svg>
      </span>
    </span>
  );
}

/** Return the index of the single top-scoring praxis (first max), or -1. */
export function topPraxisIndex(points: number[]): number {
  if (!points.length) return -1;
  const max = Math.max(...points);
  return points.indexOf(max);
}

export { css };
