import { useEffect, useState } from 'react'
import { getFlaggedPraxes, getMessages, moderatePraxis, archiveMessage } from '../../api/admin'
import type { ContactMessageOut } from '../../api/admin'
import type { PraxisOut } from '../../api/praxis'
import { formatTimestamp } from '../../utils/dates'
import { extractError } from '../../utils/errors'

export default function ModerationTab() {
  const [flagged, setFlagged] = useState<PraxisOut[]>([])
  const [messages, setMessages] = useState<ContactMessageOut[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Fail note state: submission id -> note text
  const [failNoteTarget, setFailNoteTarget] = useState<number | null>(null)
  const [failNote, setFailNote] = useState('')

  const refresh = () => {
    setError(null)
    Promise.all([getFlaggedPraxes(), getMessages(showArchived)])
      .then(([f, m]) => { setFlagged(f); setMessages(m) })
      .catch((err) => setError(extractError(err, "Couldn't load moderation data.")))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [showArchived])

  const handleModerate = async (id: number, status: string, adminNote?: string) => {
    setActionError(null)
    try {
      await moderatePraxis(id, status, adminNote)
      setFailNoteTarget(null)
      setFailNote('')
      refresh()
    } catch (err) {
      setActionError(extractError(err, 'Moderation action failed.'))
    }
  }

  const handleArchive = async (id: number) => {
    setActionError(null)
    try {
      await archiveMessage(id)
      refresh()
    } catch (err) {
      setActionError(extractError(err, 'Could not archive message.'))
    }
  }

  if (loading) return <div className="font-body text-muted text-sm">Loading...</div>
  if (error) return <p className="font-body text-sm text-red-600">{error}</p>

  return (
    <div className="flex flex-col gap-8">
      {actionError && (
        <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2">
          {actionError}
        </p>
      )}

      {/* Flagged Praxis */}
      <section>
        <h3 className="font-display text-xl font-bold mb-3 border-b-2 border-border pb-1">
          Flagged Praxis <span className="text-muted text-base">({flagged.length})</span>
        </h3>
        {flagged.length === 0 ? (
          <p className="font-body text-sm text-muted">No flagged submissions.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {flagged.map((s) => (
              <div key={s.id} className="card px-4 py-3">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="font-display text-lg font-bold">{s.title}</p>
                    <p className="font-body text-xs text-muted">
                      by {s.character_display_name || `#${s.character_id}`} &middot; {formatTimestamp(s.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => void handleModerate(s.id, 'visible')}
                      className="btn-primary text-xs"
                    >
                      approve
                    </button>
                    <button
                      onClick={() => void handleModerate(s.id, 'hidden')}
                      className="btn-outline text-xs"
                      style={{ borderColor: 'rgba(220,38,38,0.5)', color: '#dc2626' }}
                    >
                      hide
                    </button>
                    <button
                      onClick={() => setFailNoteTarget(failNoteTarget === s.id ? null : s.id)}
                      className="btn-outline text-xs"
                      style={{ borderColor: 'rgba(245,158,11,0.5)', color: '#d97706' }}
                    >
                      fail
                    </button>
                  </div>
                </div>
                {failNoteTarget === s.id && (
                  <div className="mt-3 flex gap-2 items-end">
                    <textarea
                      className="border-2 border-border bg-card px-3 py-1 font-body text-sm focus:outline-none focus:border-ink flex-1 resize-none"
                      rows={2}
                      placeholder="Reason for failure (visible to player)..."
                      value={failNote}
                      onChange={(e) => setFailNote(e.target.value)}
                    />
                    <button
                      onClick={() => void handleModerate(s.id, 'failed', failNote)}
                      className="btn-primary text-xs"
                      style={{ background: '#d97706', borderColor: '#92400e' }}
                    >
                      confirm fail
                    </button>
                    <button
                      onClick={() => { setFailNoteTarget(null); setFailNote('') }}
                      className="btn-outline text-xs"
                    >
                      cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact Messages */}
      <section>
        <div className="flex items-center gap-4 mb-3 border-b-2 border-border pb-1">
          <h3 className="font-display text-xl font-bold">
            Messages <span className="text-muted text-base">({messages.length})</span>
          </h3>
          <label className="font-body text-xs text-muted flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            show archived
          </label>
        </div>
        {messages.length === 0 ? (
          <p className="font-body text-sm text-muted">
            {showArchived ? 'No archived messages.' : 'No messages.'}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className="card px-4 py-3"
                style={{ opacity: m.is_archived ? 0.6 : 1 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-display text-lg font-bold">{m.name}</p>
                    <p className="font-body text-xs text-muted">
                      {m.email} &middot; {formatTimestamp(m.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => void handleArchive(m.id)}
                    className="btn-outline text-xs shrink-0"
                  >
                    {m.is_archived ? 'unarchive' : 'archive'}
                  </button>
                </div>
                <p className="font-body text-sm text-ink mt-2 whitespace-pre-wrap">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
