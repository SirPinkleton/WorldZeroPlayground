import { useEffect, useState } from 'react'
import { listSubmissions, type SubmissionOut } from '../api/submissions'
import { getMessages, type MessageOut } from '../api/messages'
import SubmissionCard from '../components/SubmissionCard'
import { useAuth } from '../auth/AuthContext'
import { extractError } from '../utils/errors'

export default function Updates() {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState<SubmissionOut[]>([])
  const [messages, setMessages] = useState<MessageOut[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      listSubmissions(user?.character ? { character_id: user.character.id } : {}),
      getMessages(),
    ])
      .then(([s, m]) => { setSubmissions(s); setMessages(m) })
      .catch((err) => setFetchError(extractError(err, "Couldn't load your updates.")))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="page font-body text-muted">Loading...</div>

  if (fetchError) return (
    <div className="page">
      <h1 className="page-heading">Updates</h1>
      <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2">
        {fetchError}{' '}
        <button onClick={() => window.location.reload()} className="underline">Try refreshing.</button>
      </p>
    </div>
  )

  return (
    <div className="page">
      <h1 className="page-heading">Updates</h1>

      {messages.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-2xl font-bold mb-3">Messages</h2>
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <div key={m.id} className="card px-4 py-3 flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-body text-sm">{m.body}</p>
                  <p className="font-body text-xs text-muted mt-1">
                    from #{m.from_character_id} · {new Date(m.created_at).toLocaleDateString()}
                    {!m.read_at && <span className="ml-2 text-ua font-bold">new</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl font-bold mb-3">Your Praxis</h2>
        {submissions.length === 0 ? (
          <p className="font-body text-muted">You haven't submitted any praxis yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {submissions.map((s) => <SubmissionCard key={s.id} submission={s} />)}
          </div>
        )}
      </section>
    </div>
  )
}
