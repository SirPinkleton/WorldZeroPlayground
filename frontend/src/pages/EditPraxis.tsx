import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  getPraxis,
  editPraxis,
  uploadMedia,
  deleteMedia,
  type MediaItemOut,
} from '../api/praxis'
import { useAuth } from '../auth/AuthContext'
import { extractError } from '../utils/errors'
import PageTitle from '../components/ui/PageTitle'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function EditPraxis() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [taskId, setTaskId] = useState<number | null>(null)
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
      // Build a DataTransfer with only valid files
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
    getPraxis(parseInt(id, 10))
      .then((praxis) => {
        if (user?.character?.id !== praxis.character_id) {
          navigate(`/praxes/${id}`, { replace: true })
          return
        }
        setTaskId(praxis.task_id)
        setTitle(praxis.title)
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
      await editPraxis(praxisId, { task_id: taskId!, title, body_text: body || undefined })
      if (newFiles) {
        for (const file of Array.from(newFiles)) {
          const uploaded = await uploadMedia(praxisId, file)
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

  return (
    <div className="py-8 max-w-6xl">
      <PageTitle title="Edit Praxis" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm font-bold">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="border-2 border-border px-3 py-2 font-body text-sm bg-card focus:outline-none"
          />
          <span className={`font-body text-xs self-end ${title.length >= 180 ? 'text-red-600' : 'text-muted'}`}>{title.length}/200</span>
        </div>

        {/* Split pane: editor + preview */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-body text-sm font-bold">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className="border-2 border-border px-3 py-2 font-body text-sm bg-card focus:outline-none resize-none h-full min-h-64"
              placeholder="Describe what you did... (supports **markdown**)"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="font-body text-sm font-bold text-muted">Preview</label>
            <div className="border-2 border-border px-4 py-3 bg-card min-h-64 overflow-auto font-body text-sm markdown-preview">
              {body.trim() ? (
                <ReactMarkdown>{body}</ReactMarkdown>
              ) : (
                <p className="text-muted italic">Preview will appear here...</p>
              )}
            </div>
          </div>
        </div>

        {/* Existing media */}
        {media.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="font-body text-sm font-bold">Attached Media</label>
            <div className="flex flex-col gap-3">
              {media.map((item) => {
                const src = `${BASE_URL}/media/${item.file_path}`
                const filename = item.file_path.split('/').pop() ?? item.file_path
                return (
                  <div key={item.id} className="flex items-center gap-3 border-2 border-border p-2 bg-card">
                    {item.type === 'image' && (
                      <img src={src} alt="" className="h-16 w-16 object-cover border border-border shrink-0" />
                    )}
                    {item.type === 'video' && (
                      <video src={src} className="h-16 w-16 object-cover border border-border shrink-0" />
                    )}
                    {item.type === 'audio' && (
                      <div className="h-16 w-16 flex items-center justify-center border border-border shrink-0 bg-muted/10 font-body text-xs text-muted">
                        audio
                      </div>
                    )}
                    <span className="font-body text-xs text-ink flex-1 truncate">{filename}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(item)}
                      className="font-body text-xs text-red-600 hover:underline shrink-0"
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
        <div className="flex flex-col gap-1">
          <label className="font-body text-sm font-bold">Add Media</label>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileChange}
            className="font-body text-sm"
          />
          {fileError && <p className="font-body text-xs text-red-600 mt-1">{fileError}</p>}
        </div>

        {error && <p className="font-body text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(`/praxes/${id}`)} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
