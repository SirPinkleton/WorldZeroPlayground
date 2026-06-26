import React from "react";

/**
 * WatercolorBackground — World Zero's full-bleed paint-bleed backdrop.
 * Blurred SVG ellipses in all four corners with turbulence distortion. Opacity
 * is driven by the --wc-opacity-* tokens so dark mode dims it automatically.
 * Render it once, fixed behind page content (zIndex 0).
 */
export function WatercolorBackground({ fixed = true, style = {} }) {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: fixed ? "fixed" : "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        transition: "opacity 300ms",
        ...style,
      }}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="wc-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <filter id="wc-distort" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="26" result="blur" />
          <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3" result="turb" />
          <feDisplacementMap in="blur" in2="turb" scale="18" />
        </filter>
        <filter id="wc-droplet" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      {/* Top-left: blue / indigo / violet */}
      <ellipse cx="8%" cy="10%" rx="14%" ry="18%" fill="#4f46e5" opacity="var(--wc-opacity-blob)" filter="url(#wc-distort)" />
      <ellipse cx="14%" cy="6%" rx="10%" ry="12%" fill="#7c3aed" opacity="var(--wc-opacity-blob)" filter="url(#wc-blur)" />
      <ellipse cx="4%" cy="18%" rx="6%" ry="8%" fill="#be185d" opacity="var(--wc-opacity-blob)" filter="url(#wc-blur)" />
      <circle cx="18%" cy="14%" r="1.5%" fill="#4f46e5" opacity="var(--wc-opacity-drip)" filter="url(#wc-droplet)" />
      <circle cx="6%" cy="24%" r="1%" fill="#7c3aed" opacity="var(--wc-opacity-drop)" filter="url(#wc-droplet)" />

      {/* Top-right: orange / amber / lime */}
      <ellipse cx="90%" cy="8%" rx="12%" ry="16%" fill="#b45309" opacity="var(--wc-opacity-blob)" filter="url(#wc-distort)" />
      <ellipse cx="85%" cy="14%" rx="10%" ry="10%" fill="#d97706" opacity="var(--wc-opacity-blob)" filter="url(#wc-blur)" />
      <ellipse cx="95%" cy="4%" rx="8%" ry="10%" fill="#16a34a" opacity="var(--wc-opacity-blob)" filter="url(#wc-blur)" />
      <circle cx="82%" cy="6%" r="1.2%" fill="#d97706" opacity="var(--wc-opacity-drip)" filter="url(#wc-droplet)" />

      {/* Bottom-left: rose / pink / violet */}
      <ellipse cx="10%" cy="90%" rx="14%" ry="14%" fill="#9f1239" opacity="var(--wc-opacity-blob)" filter="url(#wc-distort)" />
      <ellipse cx="6%" cy="85%" rx="8%" ry="12%" fill="#7c3aed" opacity="var(--wc-opacity-blob)" filter="url(#wc-blur)" />
      <circle cx="16%" cy="86%" r="1.3%" fill="#9f1239" opacity="var(--wc-opacity-drip)" filter="url(#wc-droplet)" />

      {/* Bottom-right: teal / cyan / sky */}
      <ellipse cx="88%" cy="88%" rx="12%" ry="16%" fill="#0f766e" opacity="var(--wc-opacity-blob)" filter="url(#wc-distort)" />
      <ellipse cx="94%" cy="92%" rx="10%" ry="10%" fill="#0e7490" opacity="var(--wc-opacity-blob)" filter="url(#wc-blur)" />
      <circle cx="84%" cy="94%" r="1%" fill="#0e7490" opacity="var(--wc-opacity-drop)" filter="url(#wc-droplet)" />
    </svg>
  );
}
