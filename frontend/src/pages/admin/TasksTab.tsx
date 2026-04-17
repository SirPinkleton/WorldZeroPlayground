import { useEffect, useState } from 'react'
import { getAllTasks, updateTaskStatus, adminPatchTask } from '../../api/admin'
import type { TaskOut } from '../../api/tasks'
import { extractError } from '../../utils/errors'

type StatusFilter = 'all' | 'pending' | 'active' | 'retired'

const STATUS_FILTERS: StatusFilter[] = ['all', 'pending', 'active', 'retired']

interface EditState {
  title: string
  description: string
  point_value: string
  level_required: string
}

export default function TasksTab() {
  const [tasks, setTasks] = useState<TaskOut[]>([])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)

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

  const openEdit = (t: TaskOut) => {
    setEditingId(t.id)
    setEditState({
      title: t.title,
      description: t.description,
      point_value: String(t.point_value),
      level_required: String(t.level_required),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditState(null)
  }

  const handleSaveEdit = async (taskId: number) => {
    if (!editState) return
    setSaving(true)
    setActionError(null)
    try {
      await adminPatchTask(taskId, {
        title: editState.title || undefined,
        description: editState.description,
        point_value: editState.point_value !== '' ? Number(editState.point_value) : undefined,
        level_required: editState.level_required !== '' ? Number(editState.level_required) : undefined,
      })
      setEditingId(null)
      setEditState(null)
      refresh()
    } catch (err) {
      setActionError(extractError(err, 'Could not save task edits.'))
    } finally {
      setSaving(false)
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
            <div key={t.id} className="card px-4 py-3 flex flex-col gap-3">
              {editingId === t.id && editState ? (
                /* Inline edit form */
                <div className="flex flex-col gap-2">
                  <input
                    className="font-body text-sm border border-border bg-surface px-2 py-1"
                    value={editState.title}
                    onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                    placeholder="Title"
                  />
                  <textarea
                    className="font-body text-sm border border-border bg-surface px-2 py-1 resize-y"
                    rows={4}
                    value={editState.description}
                    onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                    placeholder="Description"
                  />
                  <div className="flex gap-3">
                    <label className="font-body text-xs text-muted flex items-center gap-1">
                      Points
                      <input
                        type="number"
                        min={1}
                        className="font-body text-sm border border-border bg-surface px-2 py-1 w-20"
                        value={editState.point_value}
                        onChange={(e) => setEditState({ ...editState, point_value: e.target.value })}
                      />
                    </label>
                    <label className="font-body text-xs text-muted flex items-center gap-1">
                      Level req.
                      <input
                        type="number"
                        min={0}
                        max={8}
                        className="font-body text-sm border border-border bg-surface px-2 py-1 w-16"
                        value={editState.level_required}
                        onChange={(e) => setEditState({ ...editState, level_required: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => void handleSaveEdit(t.id)}
                      disabled={saving}
                      className="btn-primary text-xs"
                    >
                      {saving ? 'saving…' : 'save'}
                    </button>
                    <button onClick={cancelEdit} className="btn-outline text-xs">
                      cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Read view */
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-lg font-bold">{t.title}</p>
                      <span
                        className="eyebrow"
                        style={{
                          fontSize: 8,
                          padding: '1px 6px',
                          border: '1px solid var(--color-border)',
                          color: t.status === 'active' ? 'var(--color-success)'
                            : t.status === 'pending' ? 'var(--color-warning)'
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
                    {(t.status === 'pending' || t.status === 'retired') && (
                      <button
                        onClick={() => openEdit(t)}
                        className="btn-outline text-xs"
                      >
                        edit
                      </button>
                    )}
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
