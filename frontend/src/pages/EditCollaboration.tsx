import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  getPraxis,
  updatePraxis,
  type PraxisOut,
} from '../api/praxis'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { extractError } from '../utils/errors'

const RAINBOW_COLORS = ['#fbbf24', '#be185d', '#4f46e5', '#0e7490', '#16a34a', '#f97316', '#fbbf24', '#be185d']

export default function EditCollaboration() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const [collab, setCollab] = useState<PraxisOut | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const praxisId = id ? parseInt(id, 10) : null

  useEffect(() => {
    if (!praxisId) return
    getPraxis(praxisId)
      .then((data) => {
        const myCharacterId = user?.character?.id
        const isMember = data.members.some((m) => m.character_id === myCharacterId)
        if (!isMember) {
          navigate(`/praxes/${id}`, { replace: true })
          return
        }
        if (data.status === 'submitted') {
          navigate(`/praxes/${id}`, { replace: true })
          return
        }
        setCollab(data)
        setTitle(data.title ?? '')
        setBody(data.body_text ?? '')
      })
      .catch(() => setError("Couldn't load this collaboration."))
      .finally(() => setLoading(false))
  }, [praxisId, user])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!praxisId) return
    setSaving(true)
    setError('')
    try {
      await updatePraxis(praxisId, { title: title || undefined, body_text: body || undefined })
      navigate(`/praxes/${id}`)
    } catch (err) {
      setError(extractError(err, 'Could not save changes.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-8 font-body text-muted">Loading...</div>
  if (error && !collab) return <div className="py-8 font-body text-sm" style={{ color: '#dc2626' }}>{error}</div>
  if (!collab) return null

  const isDuel = collab.type === 'duel'
  const modeLabel = isDuel ? 'Duel' : 'Collaboration'
  const modeColor = isDuel ? '#dc2626' : '#15803d'
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

  return (
    <div className="py-8" style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <nav className="font-body mb-4" style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
        <Link to="/tasks" style={{ color: 'inherit', textDecoration: 'none' }}>Tasks</Link>
        {' › '}
        <Link to={`/tasks/${collab.task_id}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>{collab.task_title}</Link>
        {' › '}
        <Link to={`/praxes/${id}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>{modeLabel}</Link>
        {' › '}
        <span style={{ color: 'var(--color-text-primary)' }}>Edit</span>
      </nav>

      {/* Context header */}
      <div className="sidebar-card mb-5" style={{ padding: '16px 20px', borderLeft: `4px solid ${modeColor}` }}>
        <div style={{ flex: 1 }}>
          <span
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', padding: '2px 8px',
              background: modeColor, color: '#fff',
              marginBottom: 6, display: 'inline-block',
            }}
          >
            {modeLabel}
          </span>
          <Link
            to={`/tasks/${collab.task_id}`}
            className="font-display italic"
            style={{ fontSize: 18, color: modeColor, textDecoration: 'none', display: 'block', marginBottom: 4 }}
          >
            {collab.task_title}
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {/* Title */}
        <div className="sidebar-card" style={{ padding: '16px 18px', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span className="eyebrow">Title</span>
            <span className="font-body" style={{ fontSize: 8, fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>optional</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a title..."
            maxLength={200}
            style={{
              width: '100%',
              fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 24,
              color: 'var(--color-text-primary)',
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${title ? modeColor : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')}`,
              outline: 'none', paddingBottom: 6,
              transition: 'border-color 150ms',
            }}
          />
          {title && (
            <div style={{ display: 'flex', height: 3, marginTop: 4, opacity: 0.6 }}>
              {RAINBOW_COLORS.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
            </div>
          )}
          <span
            className="eyebrow"
            style={{ fontSize: 7, marginTop: 4, display: 'block', textAlign: 'right', color: title.length >= 180 ? '#dc2626' : undefined }}
          >
            {title.length}/200
          </span>
        </div>

        {/* Body */}
        <div className="sidebar-card" style={{ padding: '16px 18px', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span className="eyebrow">Document / Notes</span>
            <span className="font-body" style={{ fontSize: 8, fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>supports markdown</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder="Describe what you did..."
              style={{
                width: '100%',
                fontFamily: "'Lora', serif", fontSize: 14, color: dark ? '#e8dcc8' : '#2a1e10',
                lineHeight: 1.75, minHeight: 180,
                background: 'transparent', border: 'none', outline: 'none',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="eyebrow">{wordCount} words</span>
            </div>
          </div>
          {body.trim() && (
            <div style={{ borderTop: '1px dashed var(--color-border)', marginTop: 10, paddingTop: 10 }}>
              <span className="eyebrow" style={{ marginBottom: 6, display: 'block' }}>Preview</span>
              <div className="markdown-preview font-display" style={{ fontSize: 14, lineHeight: 1.75, color: dark ? '#e8dcc8' : '#2a1e10' }}>
                <ReactMarkdown>{body}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="font-body text-sm" style={{ color: '#dc2626' }}>{error}</p>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: modeColor, color: '#fff',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', padding: '10px 24px',
              border: 'none', cursor: saving ? 'wait' : 'pointer',
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', inset: 3, border: '1px dashed rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/praxes/${id}`)}
            style={{
              background: 'transparent',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', padding: '10px 24px',
              border: '1px solid var(--color-border)',
              cursor: 'pointer', color: 'var(--color-text-secondary)',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
