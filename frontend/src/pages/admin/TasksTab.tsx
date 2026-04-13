import { useEffect, useState } from 'react'
import { getAllTasks, updateTaskStatus } from '../../api/admin'
import type { TaskOut } from '../../api/tasks'
import { extractError } from '../../utils/errors'

type StatusFilter = 'all' | 'pending' | 'active' | 'retired'

const STATUS_FILTERS: StatusFilter[] = ['all', 'pending', 'active', 'retired']

export default function TasksTab() {
  const [tasks, setTasks] = useState<TaskOut[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const refresh = () => {
    setError(null)
    getAllTasks()
      .then(setTasks)
      .catch((err) => setError(extractError(err, "Couldn't load tasks.")))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    setActionError(null)
    try {
      await updateTaskStatus(taskId, newStatus)
      refresh()
    } catch (err) {
      setActionError(extractError(err, 'Could not update task status.'))
    }
  }

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  if (loading) return <div className="font-body text-muted text-sm">Loading...</div>
  if (error) return <p className="font-body text-sm text-red-600">{error}</p>

  return (
    <div>
      {actionError && (
        <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2 mb-4">
          {actionError}
        </p>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 mb-4">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={filter === s ? 'chip-active' : 'chip'}
          >
            {s}
            {s !== 'all' && (
              <span className="ml-1 text-xs">
                ({tasks.filter((t) => t.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      {filtered.length === 0 ? (
        <p className="font-body text-sm text-muted">No {filter} tasks.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((t) => (
            <div key={t.id} className="card px-4 py-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg font-bold">{t.title}</p>
                  <span
                    className="eyebrow"
                    style={{
                      fontSize: 8,
                      padding: '1px 6px',
                      border: '1px solid var(--color-border)',
                      color: t.status === 'active' ? '#16a34a'
                        : t.status === 'pending' ? '#d97706'
                        : 'var(--color-text-tertiary)',
                    }}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="font-body text-xs text-muted">
                  {t.point_value} pts &middot; lvl {t.level_required}+ &middot; {t.primary_faction_slug ?? 'cross-faction'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {t.status === 'pending' && (
                  <>
                    <button
                      onClick={() => void handleStatusChange(t.id, 'active')}
                      className="btn-primary text-xs"
                    >
                      activate
                    </button>
                    <button
                      onClick={() => void handleStatusChange(t.id, 'retired')}
                      className="btn-outline text-xs"
                    >
                      retire
                    </button>
                  </>
                )}
                {t.status === 'active' && (
                  <button
                    onClick={() => void handleStatusChange(t.id, 'retired')}
                    className="btn-outline text-xs"
                  >
                    retire
                  </button>
                )}
                {t.status === 'retired' && (
                  <button
                    onClick={() => void handleStatusChange(t.id, 'active')}
                    className="btn-primary text-xs"
                  >
                    reactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
