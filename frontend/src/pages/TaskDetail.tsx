import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTask, signupTask, type TaskOut } from '../api/tasks'
import { listSubmissions, type SubmissionOut } from '../api/submissions'
import SubmissionCard from '../components/SubmissionCard'
import { useAuth } from '../auth/AuthContext'

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [task, setTask] = useState<TaskOut | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionOut[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const taskId = parseInt(id, 10)
    Promise.all([getTask(taskId), listSubmissions({ task_id: taskId })])
      .then(([t, s]) => { setTask(t); setSubmissions(s) })
      .finally(() => setLoading(false))
  }, [id])

  const handleSignup = async () => {
    if (!task) return
    try {
      await signupTask(task.id)
      alert('Signed up!')
    } catch {
      alert('Could not sign up.')
    }
  }

  if (loading) return <div className="page font-body text-muted">Loading...</div>
  if (!task) return <div className="page font-body text-muted">Task not found.</div>

  return (
    <div className="page">
      <Link to="/tasks" className="font-body text-xs text-muted hover:underline">← back to tasks</Link>

      <div className="card p-5 my-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-body text-xs text-muted uppercase tracking-widest mb-1">
              {task.primary_faction_slug ?? 'Unaffiliated'} · {task.point_value} pts · lvl {task.level_required}+
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight">{task.title}</h1>
          </div>
          {user && (
            <button onClick={handleSignup} className="btn-primary shrink-0">sign up</button>
          )}
        </div>

        {task.description && (
          <p className="font-body text-base text-muted mt-4 leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-baseline gap-3 mt-8 mb-4 border-b-2 border-border pb-2">
        <h2 className="font-display text-2xl font-bold">Praxis</h2>
        <span className="font-body text-sm text-muted">{submissions.length} submissions</span>
        {user && (
          <Link to={`/tasks/${task.id}/submit`} className="btn-primary ml-auto text-sm">
            Submit Proof
          </Link>
        )}
      </div>

      {submissions.length === 0 ? (
        <p className="font-body text-muted">No submissions yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissions.map((s) => <SubmissionCard key={s.id} submission={s} />)}
        </div>
      )}
    </div>
  )
}
