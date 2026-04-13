import type { TaskOut } from '../api/tasks'
import TaskCardUA from './cards/TaskCardUA'
import TaskCardAnalog from './cards/TaskCardAnalog'
import TaskCardGestalt from './cards/TaskCardGestalt'
import TaskCardSNIDE from './cards/TaskCardSNIDE'
import TaskCardJourneymen from './cards/TaskCardJourneymen'
import TaskCardSingularity from './cards/TaskCardSingularity'
import TaskCardUAMasters from './cards/TaskCardUAMasters'
import type { ComponentType } from 'react'

interface CardProps {
  task: TaskOut
  onSignup?: (id: number) => void
}

/** Map faction slugs to their unique card archetype (Style Guide §6). */
const CARD_COMPONENTS: Record<string, ComponentType<CardProps>> = {
  ua: TaskCardUA,
  analog: TaskCardAnalog,
  gestalt: TaskCardGestalt,
  snide: TaskCardSNIDE,
  journeymen: TaskCardJourneymen,
  singularity: TaskCardSingularity,
  ua_masters: TaskCardUAMasters,
}

/** Fallback to UA sticky note for unknown factions */
const DEFAULT_CARD = TaskCardUA

/**
 * Router component: picks the correct faction card archetype based on task.primary_faction_slug.
 */
export default function TaskCard({ task, onSignup }: CardProps) {
  const Card = CARD_COMPONENTS[task.primary_faction_slug ?? ''] ?? DEFAULT_CARD
  return <Card task={task} onSignup={onSignup} />
}
