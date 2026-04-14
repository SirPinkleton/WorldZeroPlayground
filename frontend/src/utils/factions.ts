/**
 * Shared faction configuration — single source of truth for faction display data (JS side).
 *
 * CSS variables in index.css are the parallel source of truth for the cascade.
 * These two files MUST stay in sync. If you change a faction color here,
 * update the matching --faction-* variable in index.css (and vice versa).
 *
 * CSS variables handle dark mode automatically via [data-theme="dark"] overrides.
 * Use factionCssVar() when you need the CSS variable reference (preferred for styles).
 * Use factionColor() when you need the raw hex value in JS (canvas, SVG generation, etc.).
 *
 * TODO: Replace with API response from GET /factions once the backend returns
 * color fields. Until then, these must be kept in sync manually.
 */

export interface FactionConfig {
  slug: string
  name: string
  /** Primary faction color (light mode value — use factionCssVar for theme-aware styles) */
  color: string
}

export const FACTIONS: Record<string, FactionConfig> = {
  ua:          { slug: 'ua',          name: 'UA',          color: '#6b6a7a' },
  analog:      { slug: 'analog',      name: 'Analog',      color: '#15803d' },
  gestalt:     { slug: 'gestalt',     name: 'Gestalt',     color: '#14532d' },
  snide:       { slug: 'snide',       name: 'S.N.I.D.E.',  color: '#8a6a20' },
  journeymen:  { slug: 'journeymen',  name: 'Journeymen',  color: '#c49a3a' },
  singularity: { slug: 'singularity', name: 'Singularity',  color: '#7c3aed' },
  ua_masters:  { slug: 'ua_masters',  name: 'UA Masters',   color: '#555555' },
  albescent:   { slug: 'albescent',   name: '/Albescent',   color: '#6b6a7a' },
  aged_out:    { slug: 'aged_out',    name: 'Aged Out',     color: '#6b6a7a' },
}

/**
 * Slug-to-CSS-variable-key mapping.
 * Faction slugs use underscores in the DB but CSS variables use hyphens.
 */
const CSS_KEY: Record<string, string> = {
  ua:          'ua',
  analog:      'analog',
  gestalt:     'gestalt',
  snide:       'snide',
  journeymen:  'journeymen',
  singularity: 'singularity',
  ua_masters:  'ua-masters',
  albescent:   'ua',
  aged_out:    'ua',
}

/**
 * Get a CSS variable reference for a faction property.
 * Use this in inline styles: `style={{ background: factionCssVar('analog', 'card-bg') }}`
 *
 * Available suffixes:
 *   (none)       — primary color
 *   'light'      — background tint
 *   'border'     — border color
 *   'card-bg'    — card background
 *   'card-text'  — card text
 *   'card-accent' — card accent (meta text, decorations)
 *   'card-muted' — card secondary/description text
 */
export function factionCssVar(slug: string | null | undefined, suffix?: string): string {
  const key = CSS_KEY[slug ?? ''] ?? 'ua'
  const prop = suffix ? `--faction-${key}-${suffix}` : `--faction-${key}`
  return `var(${prop})`
}

/** Get faction color by slug, with fallback (raw hex — light mode only) */
export function factionColor(slug: string | null | undefined): string {
  return FACTIONS[slug ?? '']?.color ?? '#6b6a7a'
}

/** Get faction display name by slug, with fallback */
export function factionName(slug: string | null | undefined): string {
  return FACTIONS[slug ?? '']?.name ?? 'Unaffiliated'
}
