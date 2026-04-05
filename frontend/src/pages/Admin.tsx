import { useEffect, useState } from 'react'
import { getPendingTasks, approveTask, retireTask, getFlaggedSubmissions } from '../api/admin'
import type { TaskOut } from '../api/tasks'
import type { SubmissionOut } from '../api/submissions'
import { deleteSubmission } from '../api/admin'

export default function Admin() {
  const [pending, setPending] = useState<TaskOut[]>([])
  const [flagged, setFlagged] = useState<SubmissionOut[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    Promise.all([getPendingTasks(), getFlaggedSubmissions()])
      .then(([p, f]) => { setPending(p); setFlagged(f) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const handleApprove = async (id: number) => {
    await approveTask(id)
    refresh()
  }

  const handleRetire = async (id: number) => {
    await retireTask(id)
    refresh()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this submission?')) return
    await deleteSubmission(id)
    refresh()
  }

  if (loading) return <div className="page font-body text-muted">Loading...</div>

  return (
    <div className="page">
      <h1 className="page-heading">Admin</h1>

      {/* Pending tasks */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-bold mb-3 border-b-2 border-border pb-1">
          Pending Tasks <span className="text-muted text-lg">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <p className="font-body text-sm text-muted">No pending tasks.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((t) => (
              <div key={t.id} className="card px-4 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-display text-lg font-bold">{t.title}</p>
                  <p className="font-body text-xs text-muted">
                    {t.point_value} pts · lvl {t.level_required}+ · {t.primary_faction_slug ?? 'unaffiliated'}
                  </p>
                </div>
                <button onClick={() => void handleApprove(t.id)} className="btn-primary text-xs">approve</button>
                <button onClick={() => void handleRetire(t.id)} className="btn-outline text-xs">retire</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Flagged submissions */}
      <section>
        <h2 className="font-display text-2xl font-bold mb-3 border-b-2 border-border pb-1">
          Flagged Submissions <span className="text-muted text-lg">({flagged.length})</span>
        </h2>
        {flagged.length === 0 ? (
          <p className="font-body text-sm text-muted">No flagged submissions.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {flagged.map((s) => (
              <div key={s.id} className="card px-4 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-display text-lg font-bold">{s.title}</p>
                  <p className="font-body text-xs text-muted">by #{s.character_id}</p>
                </div>
                <button onClick={() => void handleDelete(s.id)} className="btn-primary text-xs bg-red-700 border-red-900">
                  delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
