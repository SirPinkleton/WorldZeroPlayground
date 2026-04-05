import { useEffect, useState } from 'react'
import { listTasks, signupTask, type TaskOut } from '../api/tasks'
import TaskCard from '../components/TaskCard'

const STATUS_FILTERS = ['All', 'active', 'pending', 'retired']
const FACTION_FILTERS = [
  { slug: 'ua', label: 'UA' },
  { slug: 'journeymen', label: 'Journeymen' },
  { slug: 'gestalt', label: 'Gestalt' },
  { slug: 'geo', label: 'Analog' },
  { slug: 'snide', label: 'S.N.I.D.E.' },
  { slug: 'cm', label: 'Creative Masters' },
]
const LEVEL_FILTERS = [0, 1, 2, 3, 4, 5]

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskOut[]>([])
  const [status, setStatus] = useState('All')
  const [faction, setFaction] = useState('')
  const [level, setLevel] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listTasks({
      status: status === 'All' ? undefined : status,
      faction: faction || undefined,
      level: level === '' ? undefined : level,
    })
      .then(setTasks)
      .finally(() => setLoading(false))
  }, [status, faction, level])

  const handleSignup = async (id: number) => {
    try {
      await signupTask(id)
      alert('Signed up!')
    } catch {
      alert('Could not sign up — make sure you are logged in.')
    }
  }

  return (
    <div className="page">
      <div className="flex items-baseline gap-3 mb-5 border-b-2 border-border pb-2">
        <h1 className="font-display text-4xl font-bold">Tasks</h1>
        <span className="font-body text-sm text-muted">{tasks.length} shown</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center mb-6">
        <span className="font-body text-xs text-muted">status:</span>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`chip ${status === s ? 'chip-active' : ''}`}
          >
            {s}
          </button>
        ))}

        <div className="w-px h-5 bg-border/30 mx-1" />

        <span className="font-body text-xs text-muted">faction:</span>
        {FACTION_FILTERS.map((f) => (
          <button
            key={f.slug}
            onClick={() => setFaction(faction === f.slug ? '' : f.slug)}
            className={`chip ${faction === f.slug ? 'chip-active' : ''}`}
          >
            {f.label}
          </button>
        ))}

        <div className="w-px h-5 bg-border/30 mx-1" />

        <span className="font-body text-xs text-muted">level:</span>
        {LEVEL_FILTERS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(level === l ? '' : l)}
            className={`chip ${level === l ? 'chip-active' : ''}`}
          >
            {l}+
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-body text-muted">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="font-body text-muted">No tasks match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} onSignup={handleSignup} />
          ))}
        </div>
      )}
    </div>
  )
}
