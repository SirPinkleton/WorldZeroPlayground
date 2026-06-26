/**
 * Faction config + CSS-variable helpers for World Zero components.
 * Mirrors frontend/src/utils/factions.ts. The CSS custom properties in
 * tokens/colors.css are the parallel source of truth — these two must stay
 * in sync. Use factionCssVar() in inline styles so dark mode resolves
 * automatically through the cascade.
 *
 * The roster is SEVEN factions — the six-faction rainbow spine plus
 * Albescent, an always-light "vellum correspondence" faction that sits
 * outside the rainbow (no hue — near-black ink on white). (Analog and UA
 * Masters were retired; the Journeymen were rebranded as the Ephemerists;
 * Gestalt was renamed the Warriors of Whimsy (slug `wow`); the Everymen
 * were added to claim the rainbow's missing red; Albescent was added as
 * the unranked secret society.)
 */

/**
 * Renamed / legacy slugs → their live canonical slug. Old data, old links,
 * and component switches resolve through this first.
 *   gestalt    → wow         (Gestalt renamed the Warriors of Whimsy)
 *   journeymen → ephemerists (Journeymen rebranded the Ephemerists)
 *   aged_out   → ua
 */
export const SLUG_ALIAS = {
  gestalt: "wow",
  journeymen: "ephemerists",
  aged_out: "ua",
};

/** Resolve any slug (including a renamed/legacy alias) to its canonical slug. */
export function canonicalSlug(slug) {
  return SLUG_ALIAS[slug ?? ""] ?? slug ?? "";
}

/**
 * Canonical slug → CSS key. The CSS custom-property prefix can differ from
 * the slug when a faction is renamed but keeps its existing token names —
 * e.g. `wow` still draws on the historical `--faction-gestalt-*` / `--gestalt-*`
 * palette, so its CSS key stays "gestalt".
 */
const CSS_KEY = {
  ua: "ua",
  wow: "gestalt",
  snide: "snide",
  ephemerists: "ephemerists",
  singularity: "singularity",
  everymen: "everymen",
  albescent: "albescent",
};

/** Display registry — name + light-mode hex (for canvas/SVG only; prefer CSS vars). */
export const FACTIONS = {
  ua: { slug: "ua", name: "UA", color: "#c2541f", archetype: "Gilt Salon" },
  wow: { slug: "wow", name: "Warriors of Whimsy", color: "#be185d", archetype: "Whimsy.exe Desktop" },
  snide: { slug: "snide", name: "S.N.I.D.E.", color: "#16a34a", archetype: "Ransom Dispatch" },
  ephemerists: { slug: "ephemerists", name: "The Ephemerists", color: "#1d6e72", archetype: "Discordant Map" },
  singularity: { slug: "singularity", name: "Singularity", color: "#2563eb", archetype: "Terminal Printout" },
  everymen: { slug: "everymen", name: "The Everymen", color: "#c1272d", archetype: "Union Poster" },
  albescent: { slug: "albescent", name: "Albescent", color: "#1c1c1a", archetype: "Vellum Correspondence" },
};

/** Ordered list of the seven selectable/displayed factions. */
export const FACTION_ORDER = [
  "ua",
  "wow",
  "snide",
  "ephemerists",
  "singularity",
  "everymen",
  "albescent",
];

/**
 * CSS variable reference for a faction property.
 * Suffixes: (none)=primary, 'light', 'border', 'card-bg', 'card-text',
 * 'card-accent', 'card-muted', 'card-font'.
 */
export function factionCssVar(slug, suffix) {
  const key = CSS_KEY[canonicalSlug(slug)] ?? "ua";
  const prop = suffix ? `--faction-${key}-${suffix}` : `--faction-${key}`;
  return `var(${prop})`;
}

/** Raw light-mode hex by slug (canvas/SVG use only). */
export function factionColor(slug) {
  return FACTIONS[canonicalSlug(slug)]?.color ?? "#6b6a7a";
}

/** Display name by slug. */
export function factionName(slug) {
  return FACTIONS[canonicalSlug(slug)]?.name ?? "Unaffiliated";
}
