import type { TaskOut } from '../api/tasks'
import { useAuth } from '../auth/AuthContext'
import { useAdminMode } from '../auth/AdminModeContext'
import { updateTaskStatus } from '../api/admin'
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
  displayPoints: number
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
 * When admin mode is on, adds inline status controls.
 */
export default function TaskCard({ task, displayPoints, onSignup }: CardProps) {
  const { user } = useAuth()
  const { adminMode } = useAdminMode()
  const showAdminControls = user?.is_admin && adminMode

  const handleStatusChange = async (newStatus: string) => {
    await updateTaskStatus(task.id, newStatus)
    window.location.reload()
  }

  const Card = CARD_COMPONENTS[task.primary_faction_slug ?? ''] ?? DEFAULT_CARD
  return (
    <div style={{ position: 'relative' }}>
      <Card task={task} displayPoints={displayPoints} onSignup={onSignup} />
      {showAdminControls && (
        <div
          style={{
            position: 'absolute', bottom: 4, right: 4,
            display: 'flex', gap: 3, zIndex: 10,
          }}
        >
          {task.status === 'active' && (
            <button
              onClick={() => void handleStatusChange('retired')}
              className="eyebrow"
              style={{
                fontSize: 7, padding: '1px 5px',
                border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626',
                background: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
              }}
            >
              retire
            </button>
          )}
          {task.status === 'retired' && (
            <button
              onClick={() => void handleStatusChange('active')}
              className="eyebrow"
              style={{
                fontSize: 7, padding: '1px 5px',
                border: '1px solid rgba(22,163,106,0.3)', color: '#16a34a',
                background: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
              }}
            >
              activate
            </button>
          )}
          {task.status === 'pending' && (
            <>
              <button
                onClick={() => void handleStatusChange('active')}
                className="eyebrow"
                style={{
                  fontSize: 7, padding: '1px 5px',
                  border: '1px solid rgba(22,163,106,0.3)', color: '#16a34a',
                  background: 'rgba(255,255,255,0.9)',
                  cursor: 'pointer',
                }}
              >
                activate
              </button>
              <button
                onClick={() => void handleStatusChange('retired')}
                className="eyebrow"
                style={{
                  fontSize: 7, padding: '1px 5px',
                  border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626',
                  background: 'rgba(255,255,255,0.9)',
                  cursor: 'pointer',
                }}
              >
                retire
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
