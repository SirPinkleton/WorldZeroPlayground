import { useEffect, useState } from 'react'
import { listTasks, signupTask, type TaskOut } from '../api/tasks'
import TaskCard from '../components/TaskCard'
import { extractError } from '../utils/errors'

const STATUS_FILTERS = ['All', 'active', 'pending', 'retired']
const FACTION_FILTERS = [
  { slug: 'ua', label: 'UA' },
  { slug: 'ua_masters', label: 'UA Masters' },
  { slug: 'journeymen', label: 'Journeymen' },
  { slug: 'gestalt', label: 'Gestalt' },
  { slug: 'analog', label: 'Analog' },
  { slug: 'snide', label: 'S.N.I.D.E.' },
  { slug: 'singularity', label: 'Singularity' },
]
const LEVEL_FILTERS = [0, 1, 2, 3, 4, 5]

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskOut[]>([])
  const [status, setStatus] = useState('All')
  const [faction, setFaction] = useState('')
  const [level, setLevel] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [signupMsg, setSignupMsg] = useState<{ id: number; msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    setLoading(true)
    setFetchError(null)
    listTasks({
      status: status === 'All' ? undefined : status,
      faction: faction || undefined,
      level: level === '' ? undefined : level,
    })
      .then(setTasks)
      .catch((err) => setFetchError(extractError(err, "Couldn't load tasks.")))
      .finally(() => setLoading(false))
  }, [status, faction, level])

  const handleSignup = async (id: number) => {
    setSignupMsg(null)
    try {
      await signupTask(id)
      setSignupMsg({ id, msg: "You're signed up!", ok: true })
    } catch (err) {
      setSignupMsg({ id, msg: extractError(err, 'Could not sign up — make sure you are logged in.'), ok: false })
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

      {signupMsg && (
        <p className={`font-body text-sm mb-4 border-2 px-3 py-2 ${signupMsg.ok ? 'border-border text-ink' : 'border-red-300 text-red-600'}`}>
          {signupMsg.msg}
        </p>
      )}

      {loading ? (
        <p className="font-body text-muted">Loading tasks...</p>
      ) : fetchError ? (
        <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2">
          {fetchError}{' '}
          <button onClick={() => window.location.reload()} className="underline">Try refreshing.</button>
        </p>
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
