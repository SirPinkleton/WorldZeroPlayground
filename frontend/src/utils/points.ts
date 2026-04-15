import type { FactionConfigOut } from '../api/gameConfig'

/**
 * Compute the display point value for a task given the viewing player's faction.
 *
 * Rules (from era_1.py):
 * - If the player has no faction, return the raw base value (no multiplier).
 * - If the task has no faction, treat it as "other" (use other_task_modifier).
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

  const modifier =
    taskFactionSlug && taskFactionSlug === playerFactionSlug
      ? playerFaction.own_task_modifier
      : playerFaction.other_task_modifier

  return Math.round(basePoints * modifier)
}
