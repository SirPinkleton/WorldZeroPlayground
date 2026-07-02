import type { CSSProperties } from "react";

/* ────────────────────────────────────────────────────────────────
   css() — parse a CSS declaration string into a React style object.

   These faction pages were authored as HTML design references with
   inline `style="…"` strings. Rather than hand-transcribe every
   declaration into a camelCased object (error-prone), we keep the
   EXACT strings from the mocks and convert them at render time. This
   keeps the React reference visually faithful to the HTML source.

   In your production app you'll likely migrate these to your own
   styling system (CSS Modules, Tailwind, styled-components, vanilla-
   extract, …). Treat css() as a fidelity bridge, not a house style.
   ──────────────────────────────────────────────────────────────── */

const cache = new Map<string, CSSProperties>();

function toCamel(prop: string): string {
  const p = prop.trim();
  // Custom property (--foo) passes through untouched.
  if (p.startsWith("--")) return p;
  // -webkit-mask → WebkitMask ; background-image → backgroundImage
  return p
    .replace(/^-ms-/, "ms-")
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function css(decl: string): CSSProperties {
  const hit = cache.get(decl);
  if (hit) return hit;

  const out: Record<string, string> = {};
  for (const chunk of decl.split(";")) {
    const seg = chunk.trim();
    if (!seg) continue;
    const idx = seg.indexOf(":"); // split on FIRST colon only
    if (idx === -1) continue;
    const prop = seg.slice(0, idx);
    const value = seg.slice(idx + 1).trim();
    if (!prop || !value) continue;
    out[toCamel(prop)] = value;
  }

  const frozen = out as CSSProperties;
  cache.set(decl, frozen);
  return frozen;
}

/** Merge a base declaration string with extra style object(s). */
export function cssm(
  decl: string,
  ...extra: (CSSProperties | undefined)[]
): CSSProperties {
  return Object.assign({}, css(decl), ...extra.filter(Boolean));
}
