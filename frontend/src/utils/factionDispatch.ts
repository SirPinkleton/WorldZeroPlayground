/**
 * Faction archetype dispatch — the single place that turns a faction slug into a
 * bespoke component, falling back to a default when no variant is registered.
 *
 * Before this helper, ~10 dispatchers (TaskCard, PraxisCard, EditPraxis,
 * TaskDetail, VoteUI, Progression, FactionAvatar, FactionBackdrop,
 * FactionFeedFrame, FactionDetail heroes) each spelled "look up slug, else
 * default" three different ways and none of them handled the albescent /
 * aged_out aliases. Routing every dispatcher through `pickVariant` makes
 * slug-normalization, alias handling, and unknown-slug behaviour live in one
 * place, and means a new page dispatcher is one map + one call.
 */
import type { ComponentType } from 'react'

/**
 * Faction-identity aliases: members of a derived/retired faction render with
 * their canonical faction's archetype. Mirrors the albescent / aged_out → ua
 * rows of CSS_KEY in utils/factions.ts (kept local because that map also encodes
 * unrelated CSS-key hyphenation, which dispatch doesn't care about).
 */
const SLUG_ALIASES: Record<string, string> = {
  albescent: 'ua',
  aged_out: 'ua',
}

/**
 * Resolve a faction slug to its archetype component.
 *
 * Lookup order: an explicit entry for the slug wins; then its alias's entry
 * (so albescent/aged_out inherit ua's variant without a duplicate map row);
 * then the supplied fallback. A null/undefined/empty slug goes straight to the
 * fallback.
 */
export function pickVariant<P>(
  map: Record<string, ComponentType<P>>,
  slug: string | null | undefined,
  fallback: ComponentType<P>,
): ComponentType<P> {
  if (!slug) return fallback
  const alias = SLUG_ALIASES[slug]
  return map[slug] ?? (alias ? map[alias] : undefined) ?? fallback
}
