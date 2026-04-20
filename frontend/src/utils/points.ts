import type { FactionConfigOut } from '../api/gameConfig'

/** Sentinel slug for tasks with no specific faction affiliation (see backend `UNAFFILIATED_FACTION_SLUG`). */
const UNAFFILIATED_FACTION_SLUG = 'na'

/**
 * Compute the display point value for a task given the viewing player's faction.
 *
 * Mirrors `compute_faction_multiplier` in backend/services/scoring.py:
 * - If the player has no faction / unknown faction, return the raw base value.
 * - Tasks with no faction or the `na` sentinel are treated as own-faction
 *   (no penalty) — matches backend behavior.
 * - If the task faction matches the player's faction, use own_task_modifier.
 * - Otherwise use other_task_modifier.
 *
 * Returns a rounded integer.
 */
export function computeDisplayPoints(
  basePoints: number,
  playerFactionSlug: string | null | undefined,
  taskFactionSlug: string | null | undefined,
  factionConfigs: FactionConfigOut[],
): number {
  if (!playerFactionSlug) return basePoints

  const playerFaction = factionConfigs.find((f) => f.slug === playerFactionSlug)
  if (!playerFaction) return basePoints

  const isOwnFaction =
    !taskFactionSlug
    || taskFactionSlug === playerFactionSlug
    || taskFactionSlug === UNAFFILIATED_FACTION_SLUG

  const modifier = isOwnFaction
    ? playerFaction.own_task_modifier
    : playerFaction.other_task_modifier

  return Math.round(basePoints * modifier)
}
