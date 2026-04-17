import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  getSubmission,
  updateSubmission,
  addMedia,
  deleteMedia,
  type MediaItemOut,
} from '../api/submissions'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { factionColor, factionName } from '../utils/factions'
import { extractError } from '../utils/errors'
import PageTitle from '../components/ui/PageTitle'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const RAINBOW_COLORS = ['var(--underline-1)', 'var(--underline-2)', 'var(--underline-3)', 'var(--underline-4)', 'var(--underline-5)', 'var(--underline-6)', 'var(--underline-1)', 'var(--underline-2)']

export default function EditPraxis() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const [taskId, setTaskId] = useState<number | null>(null)
  const [taskTitle, setTaskTitle] = useState<string>('')
  const [taskFactionSlug, setTaskFactionSlug] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [media, setMedia] = useState<MediaItemOut[]>([])
  const [newFiles, setNewFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fileError, setFileError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const incoming = Array.from(e.target.files)
    const tooLarge = incoming.filter((f) => f.size > MAX_FILE_SIZE)
    if (tooLarge.length > 0) {
      setFileError(`File${tooLarge.length > 1 ? 's' : ''} too large (50 MB limit): ${tooLarge.map((f) => f.name).join(', ')}`)
      const dt = new DataTransfer()
      incoming.filter((f) => f.size <= MAX_FILE_SIZE).forEach((f) => dt.items.add(f))
      e.target.files = dt.files
      setNewFiles(dt.files.length > 0 ? dt.files : null)
    } else {
      setFileError('')
      setNewFiles(e.target.files)
    }
  }

  useEffect(() => {
    if (!id) return
    getSubmission(parseInt(id, 10))
      .then((praxis) => {
        if (user?.character?.id !== praxis.character_id) {
          navigate(`/praxes/${id}`, { replace: true })
          return
        }
        setTaskId(praxis.task_id)
        setTaskTitle(praxis.task_title)
        setTaskFactionSlug(praxis.task_faction_slug)
        setTitle(praxis.title ?? '')
        setBody(praxis.body_text ?? '')
        setMedia(praxis.media)
      })
      .catch(() => setError("Couldn't load this praxis."))
      .finally(() => setLoading(false))
  }, [id, user])

  const handleRemoveMedia = async (mediaItem: MediaItemOut) => {
    if (!id) return
    try {
      await deleteMedia(parseInt(id, 10), mediaItem.id)
      setMedia((previous) => previous.filter((item) => item.id !== mediaItem.id))
    } catch (err) {
      setError(extractError(err, 'Could not remove media item.'))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id || !title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    setError('')
    try {
      const praxisId = parseInt(id, 10)
      await updateSubmission(praxisId, { title, body_text: body || undefined })
      if (newFiles) {
        for (const file of Array.from(newFiles)) {
          const uploaded = await addMedia(praxisId, file)
          setMedia((previous) => [...previous, uploaded])
        }
      }
      navigate(`/praxes/${id}`)
    } catch (err) {
      setError(extractError(err, 'Could not save changes.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-8 font-body text-muted">Loading...</div>

  const color = factionColor(taskFactionSlug)
  const fname = factionName(taskFactionSlug)
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

  return (
    <div className="py-8" style={{ maxWidth: 720, margin: '0 auto' }}>
      <PageTitle title="Edit Praxis" />

      {/* Breadcrumb */}
      <nav className="font-body mb-4" style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
        <Link to="/tasks" style={{ color: 'inherit', textDecoration: 'none' }}>Tasks</Link>
        {taskId && taskTitle && (
          <>
            {' › '}
            <Link to={`/tasks/${taskId}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>{taskTitle}</Link>
          </>
        )}
        {' › '}
        <Link to={`/praxes/${id}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Praxis</Link>
        {' › '}
        <span style={{ color: 'var(--color-text-primary)' }}>Edit</span>
      </nav>

      {/* Task context header */}
      {taskTitle && (
        <div className="sidebar-card mb-5" style={{ borderLeft: `4px solid ${color}`, padding: '12px 16px' }}>
          <span className="eyebrow" style={{ marginBottom: 4, display: 'block' }}>Editing proof of completion for</span>
          <Link
            to={`/tasks/${taskId}`}
            className="font-display italic"
            style={{ fontSize: 18, color, textDecoration: 'none', display: 'block', marginBottom: 4 }}
          >
            {taskTitle}
          </Link>
          {fname && (
            <span className="eyebrow" style={{ fontSize: 8, color: 'var(--color-text-tertiary)' }}>{fname}</span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        {/* Title */}
        <div className="sidebar-card" style={{ padding: '16px 18px', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span className="eyebrow">Title</span>
            <span className="font-body" style={{ fontSize: 8, fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>required</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you do?"
            maxLength={200}
            style={{
              width: '100%',
              fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 24,
              color: 'var(--color-text-primary)',
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${title ? color : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')}`,
              outline: 'none', paddingBottom: 6,
              transition: 'border-color 150ms',
            }}
            onFocus={(e) => { e.currentTarget.style.borderBottomColor = color }}
            onBlur={(e) => { if (!title) e.currentTarget.style.borderBottomColor = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}
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
            <span className="eyebrow">The proof</span>
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
                fontFamily: "'Lora', serif", fontSize: 14, color: 'var(--color-text-primary)',
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
              <div className="markdown-preview font-display" style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--color-text-primary)' }}>
                <ReactMarkdown>{body}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Existing media */}
        {media.length > 0 && (
          <div className="sidebar-card" style={{ padding: '16px 18px', borderRadius: 12 }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 10 }}>Attached media</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {media.map((item) => {
                const src = `${BASE_URL}/media/${item.file_path}`
                const filename = item.file_path.split('/').pop() ?? item.file_path
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px',
                      background: 'var(--color-bg-surface-alt)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {item.type === 'image' && (
                      <img src={src} alt="" style={{ height: 48, width: 48, objectFit: 'cover', border: '1px solid var(--color-border)', flexShrink: 0 }} />
                    )}
                    {item.type === 'video' && (
                      <video src={src} style={{ height: 48, width: 48, objectFit: 'cover', border: '1px solid var(--color-border)', flexShrink: 0 }} />
                    )}
                    {item.type === 'audio' && (
                      <div style={{ height: 48, width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', flexShrink: 0, background: 'var(--color-bg-surface)' }}>
                        <span className="eyebrow" style={{ fontSize: 7 }}>audio</span>
                      </div>
                    )}
                    <span className="font-body" style={{ fontSize: 10, color: 'var(--color-text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filename}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(item)}
                      className="eyebrow"
                      style={{ fontSize: 8, color: '#dc2626', cursor: 'pointer', background: 'none', border: 'none', flexShrink: 0 }}
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Add new media */}
        <div className="sidebar-card" style={{ padding: '16px 18px', borderRadius: 12 }}>
          <span className="eyebrow" style={{ display: 'block', marginBottom: 8 }}>Add media</span>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileChange}
            className="font-body text-sm"
          />
          {fileError && (
            <p className="font-body" style={{ fontSize: 10, color: '#dc2626', marginTop: 6 }}>{fileError}</p>
          )}
        </div>

        {error && (
          <p className="font-body text-sm" style={{ color: '#dc2626' }}>{error}</p>
        )}

        {/* Submit buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: color, color: '#fff',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', padding: '10px 24px',
              border: 'none', cursor: saving ? 'wait' : 'pointer',
              position: 'relative',
            }}
          >
            <span style={{ position: 'absolute', inset: 3, border: '1px dashed rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
            {saving ? 'Saving...' : 'Save proof'}
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
