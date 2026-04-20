import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  getPraxis,
  createPraxis,
  updatePraxis,
  deletePraxis,
  submitPraxis,
  uploadPraxisMedia,
  deletePraxisMedia,
  inviteToPraxis,
  applyMetatask,
  removeMetatask,
  type MediaItemOut,
  type PraxisOut,
  type PraxisType,
} from '../api/praxis'
import { getTask, type TaskOut } from '../api/tasks'
import { listCharacters, type CharacterOut } from '../api/characters'
import { listMetatasks } from '../api/metaTasks'
import LevelPill from '../components/ui/LevelPill'
import { useAuth } from '../auth/AuthContext'
import { factionCssVar, factionName } from '../utils/factions'
import { extractError } from '../utils/errors'
import PageTitle from '../components/ui/PageTitle'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const RAINBOW_COLORS = ['var(--underline-1)', 'var(--underline-2)', 'var(--underline-3)', 'var(--underline-4)', 'var(--underline-5)', 'var(--underline-6)', 'var(--underline-1)', 'var(--underline-2)']

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export default function EditPraxis() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, refetch } = useAuth()

  // Core praxis state
  const [praxis, setPraxis] = useState<PraxisOut | null>(null)
  const [task, setTask] = useState<TaskOut | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [media, setMedia] = useState<MediaItemOut[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fileError, setFileError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Metatasks — full eligible list, plus which we've applied locally
  const [metaTasks, setMetaTasks] = useState<TaskOut[]>([])
  const [appliedMetatasks, setAppliedMetatasks] = useState<Set<number>>(new Set())
  const [applyingMetatask, setApplyingMetatask] = useState<number | null>(null)

  // Collab/duel invite UI
  const [inviteQuery, setInviteQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CharacterOut[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [inviting, setInviting] = useState(false)

  // Mode-switch confirmation (delete + recreate)
  const [switchingMode, setSwitchingMode] = useState<PraxisType | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const incoming = Array.from(e.target.files)
    const tooLarge = incoming.filter((f) => f.size > MAX_FILE_SIZE)
    if (tooLarge.length > 0) {
      setFileError(`File${tooLarge.length > 1 ? 's' : ''} too large (50 MB limit): ${tooLarge.map((f) => f.name).join(', ')}`)
    } else {
      setFileError('')
    }
    const valid = incoming.filter((f) => f.size <= MAX_FILE_SIZE)
    if (valid.length > 0) setNewFiles((prev) => [...prev, ...valid])
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (!id) return
    const praxisId = parseInt(id, 10)
    getPraxis(praxisId)
      .then(async (p) => {
        if (user?.character?.id !== p.created_by_id) {
          navigate(`/praxes/${id}`, { replace: true })
          return
        }
        setPraxis(p)
        setTitle(p.title ?? '')
        setBody(p.body_text ?? '')
        setMedia(p.media_items)
        // Load task for allowed_modes + faction + point value
        try {
          const t = await getTask(p.task_id)
          setTask(t)
        } catch { /* non-fatal */ }
        // Load metatasks (only eligible for this viewer)
        try {
          const all = await listMetatasks()
          setMetaTasks(all.filter((mt) => mt.eligible_for_current_user))
        } catch { /* non-fatal */ }
      })
      .catch(() => setError("Couldn't load this praxis."))
      .finally(() => setLoading(false))
  }, [id, user, navigate])

  const handleRemoveMedia = async (mediaItem: MediaItemOut) => {
    if (!id) return
    try {
      await deletePraxisMedia(parseInt(id, 10), mediaItem.id)
      setMedia((previous) => previous.filter((item) => item.id !== mediaItem.id))
    } catch (err) {
      setError(extractError(err, 'Could not remove media item.'))
    }
  }

  // ----- Save / Publish -----
  const persistEdits = async (praxisId: number): Promise<void> => {
    await updatePraxis(praxisId, { title, body_text: body || undefined })
    for (const file of newFiles) {
      const uploaded = await uploadPraxisMedia(praxisId, file)
      setMedia((previous) => [...previous, uploaded])
    }
    setNewFiles([])
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id || !title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    setError('')
    try {
      const praxisId = parseInt(id, 10)
      await persistEdits(praxisId)
      navigate(`/praxes/${id}`)
    } catch (err) {
      setError(extractError(err, 'Could not save changes.'))
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!id || !title.trim()) { setError('Title is required.'); return }
    if (title.length > 200) { setError('Title must be 200 characters or fewer.'); return }
    setSubmitting(true)
    setError('')
    try {
      const praxisId = parseInt(id, 10)
      await persistEdits(praxisId)
      await submitPraxis(praxisId)
      await refetch()
      navigate(`/praxes/${id}`)
    } catch (err) {
      setError(extractError(err, 'Could not publish proof.'))
    } finally {
      setSubmitting(false)
    }
  }

  // ----- Mode switching (delete + recreate) -----
  const hasDraftContent = (): boolean => {
    if (title.trim().length > 0) return true
    if (body.trim().length > 0) return true
    if (media.length > 0) return true
    if (newFiles.length > 0) return true
    if (appliedMetatasks.size > 0) return true
    return false
  }

  const performModeSwitch = async (newType: PraxisType) => {
    if (!praxis) return
    setError('')
    setSwitchingMode(newType)
    try {
      const taskId = praxis.task_id
      // Destroy the empty/near-empty praxis and recreate with chosen type.
      await deletePraxis(praxis.id)
      const fresh = await createPraxis({ task_id: taskId, type: newType })
      navigate(`/praxes/${fresh.id}/edit`, { replace: true })
    } catch (err) {
      setError(extractError(err, 'Could not change mode.'))
      setSwitchingMode(null)
    }
  }

  const handleModeChange = async (newType: PraxisType) => {
    if (!praxis || praxis.type === newType) return
    if (praxis.members.length > 1) {
      setError('Mode is locked once co-authors have joined.')
      return
    }
    if (hasDraftContent()) {
      const confirmed = window.confirm(
        'Changing mode will discard your current draft (title, body, media, metatasks). Continue?',
      )
      if (!confirmed) return
    }
    await performModeSwitch(newType)
  }

  // ----- Partner search / invite -----
  const handleInviteSearch = useCallback(async (query: string) => {
    setInviteQuery(query)
    if (query.length < 2 || !praxis) {
      setSearchResults([])
      setShowSearch(false)
      return
    }
    try {
      const results = await listCharacters({ search: query, limit: 8 })
      const memberIds = new Set(praxis.members.map((m) => m.character_id))
      const pendingInviteIds = new Set(
        praxis.invites.filter((i) => i.status === 'pending').map((i) => i.invitee_id),
      )
      const filtered = results.filter(
        (c) =>
          c.id !== user?.character?.id &&
          !memberIds.has(c.id) &&
          !pendingInviteIds.has(c.id),
      )
      setSearchResults(filtered)
      setShowSearch(filtered.length > 0)
    } catch {
      setSearchResults([])
    }
  }, [praxis, user])

  const handleSendInvite = async (character: CharacterOut) => {
    if (!praxis) return
    setInviting(true)
    setError('')
    setInviteQuery('')
    setShowSearch(false)
    setSearchResults([])
    try {
      await inviteToPraxis(praxis.id, character.id)
      // Refresh praxis to pull new invite row
      const refreshed = await getPraxis(praxis.id)
      setPraxis(refreshed)
    } catch (err) {
      setError(extractError(err, `Could not invite ${character.display_name}.`))
    } finally {
      setInviting(false)
    }
  }

  // ----- Metatask apply / remove -----
  const toggleMetatask = async (metatask: TaskOut) => {
    if (!praxis) return
    if (applyingMetatask !== null) return
    setApplyingMetatask(metatask.id)
    setError('')
    try {
      if (appliedMetatasks.has(metatask.id)) {
        await removeMetatask(praxis.id, metatask.id)
        setAppliedMetatasks((prev) => {
          const next = new Set(prev)
          next.delete(metatask.id)
          return next
        })
      } else {
        await applyMetatask(praxis.id, metatask.id)
        setAppliedMetatasks((prev) => new Set(prev).add(metatask.id))
      }
    } catch (err) {
      setError(extractError(err, 'Could not update metatask.'))
    } finally {
      setApplyingMetatask(null)
    }
  }

  if (loading) return <div className="py-8 font-body text-muted">Loading...</div>
  if (!praxis) {
    return (
      <div className="py-8 font-body text-sm" style={{ color: 'var(--color-danger)' }}>
        {error || "Couldn't load this praxis."}
      </div>
    )
  }

  // Locked/finalized states — hide all mode/collab/metatask controls
  const isPublished = praxis.status === 'submitted'
  const isModerated = praxis.moderation_status === 'hidden' || praxis.moderation_status === 'failed'
  const controlsLocked = isPublished || isModerated || praxis.is_withdrawn

  const color = factionCssVar(task?.primary_faction_slug)
  const fname = factionName(task?.primary_faction_slug)
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

  const showCollabInvite = !controlsLocked && (praxis.type === 'collab' || praxis.type === 'duel')
  const duelSlotFull = praxis.type === 'duel' && praxis.members.length + praxis.invites.filter((i) => i.status === 'pending').length >= 2
  const showMetatasks = !controlsLocked && praxis.type === 'solo' && metaTasks.length > 0
  const modeIsLocked = controlsLocked || praxis.members.length > 1

  return (
    <div className="py-8" style={{ maxWidth: 720, margin: '0 auto' }}>
      <PageTitle title="Edit Praxis" />

      {/* Breadcrumb */}
      <nav className="font-body mb-4" style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
        <Link to="/tasks" style={{ color: 'inherit', textDecoration: 'none' }}>Tasks</Link>
        {' › '}
        <Link to={`/tasks/${praxis.task_id}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>{praxis.task_title}</Link>
        {' › '}
        <Link to={`/praxes/${id}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Praxis</Link>
        {' › '}
        <span style={{ color: 'var(--color-text-primary)' }}>Edit</span>
      </nav>

      {/* Task context header */}
      <div
        className="sidebar-card mb-5"
        style={{ borderLeft: `4px solid ${factionCssVar(task?.primary_faction_slug, 'border')}`, padding: '12px 16px' }}
      >
        <span className="eyebrow" style={{ marginBottom: 4, display: 'block' }}>Proving completion of</span>
        <Link
          to={`/tasks/${praxis.task_id}`}
          className="font-display italic"
          style={{ fontSize: 18, color, textDecoration: 'none', display: 'block', marginBottom: 6 }}
        >
          {praxis.task_title}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {task && (
            <span
              className="pennant-shape"
              style={{
                background: color, color: 'var(--color-text-on-accent)',
                fontFamily: "'Courier Prime', monospace",
                fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.07em', padding: '2px 10px',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {fname}
            </span>
          )}
          {task && <span className="eyebrow">{task.point_value} pts</span>}
          {task && <LevelPill level={task.level_required} />}
          {praxis.type !== 'solo' && (
            <span
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                padding: '2px 8px', borderRadius: 3,
                background: praxis.type === 'duel' ? 'var(--color-danger)' : 'var(--color-success)',
                color: 'var(--color-text-on-accent)',
              }}
            >
              {praxis.type === 'duel' ? 'Duel' : 'Collab'}
            </span>
          )}
          {isPublished && (
            <span
              className="eyebrow"
              style={{
                fontSize: 8, background: 'var(--color-bg-surface-alt)',
                border: '1px solid var(--color-border)', padding: '2px 8px',
                color: 'var(--color-text-secondary)',
              }}
            >
              Submitted
            </span>
          )}
        </div>
      </div>

      {/* Mode selector — hidden once controls are locked. Locked visually when
          co-authors exist (switching would unseat members). */}
      {!controlsLocked && task && (
        <div className="sidebar-card mb-5" style={{ padding: '16px 18px', borderRadius: 12 }}>
          <p className="eyebrow mb-3">How do you want to do this?</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: modeIsLocked ? 0 : 10 }}>
            {([
              { mode: 'solo' as PraxisType, eyebrowLabel: 'SOLO', label: 'Solo', desc: 'Just you. All points are yours.' },
              { mode: 'collab' as PraxisType, eyebrowLabel: 'COLLAB', label: 'Collaboration', desc: 'Invite others. Everyone earns full points.' },
              { mode: 'duel' as PraxisType, eyebrowLabel: 'DUEL', label: 'Duel', desc: 'Challenge one player. Winner takes the points.' },
            ])
              .filter(({ mode }) => task.allowed_modes.includes(mode))
              .map(({ mode, eyebrowLabel, label, desc }) => {
                const active = praxis.type === mode
                const disabled = modeIsLocked || switchingMode !== null
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { if (!disabled) handleModeChange(mode) }}
                    disabled={disabled && !active}
                    style={{
                      flex: 1,
                      position: 'relative',
                      border: `2.5px solid ${active ? 'var(--color-text-primary)' : 'var(--color-border)'}`,
                      borderRadius: 0,
                      background: active ? 'var(--color-text-primary)' : 'var(--color-bg-surface-alt)',
                      color: active ? 'var(--color-bg-page)' : 'var(--color-text-primary)',
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.08em', padding: '10px 8px',
                      cursor: disabled && !active ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      opacity: disabled && !active ? 0.5 : 1,
                    }}
                  >
                    {active && <span style={{ position: 'absolute', inset: 2, border: '1px dashed var(--stamp-active-dashed)', pointerEvents: 'none' }} />}
                    <span className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>{eyebrowLabel}</span>
                    <span style={{ display: 'block', marginBottom: 2 }}>{label}</span>
                    <span style={{ display: 'block', fontSize: 7, fontWeight: 400, opacity: 0.7, textTransform: 'none', letterSpacing: '0.02em' }}>{desc}</span>
                  </button>
                )
              })}
          </div>
          {modeIsLocked && (
            <p className="eyebrow" style={{ marginTop: 10, fontSize: 8, color: 'var(--color-text-tertiary)' }}>
              Mode is locked once co-authors join.
            </p>
          )}
        </div>
      )}

      {/* Collab / duel invite UI — hidden once duel slot is full */}
      {showCollabInvite && !(praxis.type === 'duel' && duelSlotFull) && (
        <div className="sidebar-card mb-5" style={{ padding: '16px 18px', borderRadius: 12 }}>
          <p className="eyebrow mb-3">
            {praxis.type === 'duel' ? 'Invite your opponent' : 'Invite collaborators'}
          </p>

          <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
            <input
              type="text"
              value={inviteQuery}
              onChange={(e) => handleInviteSearch(e.target.value)}
              placeholder="player name or @handle"
              style={{
                flex: 1,
                fontFamily: "'Courier Prime', monospace",
                fontSize: 12, padding: '8px 12px',
                background: 'var(--color-bg-page)',
                color: 'var(--color-text-primary)',
                border: '2px solid var(--color-border)',
                outline: 'none',
              }}
              onFocus={() => { if (searchResults.length > 0) setShowSearch(true) }}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            />
            {showSearch && (
              <div
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  maxHeight: 200, overflowY: 'auto',
                }}
              >
                {searchResults.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    disabled={inviting}
                    onMouseDown={() => handleSendInvite(character)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '8px 12px',
                      background: 'transparent', border: 'none',
                      cursor: inviting ? 'wait' : 'pointer', textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${factionCssVar(character.faction_slug, 'light')}, ${factionCssVar(character.faction_slug)})`,
                        flexShrink: 0,
                      }}
                    />
                    <span className="font-body" style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {character.display_name}
                    </span>
                    <span className="eyebrow" style={{ marginLeft: 'auto' }}>
                      {factionName(character.faction_slug)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Members + pending invites summary */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {praxis.members.filter((m) => m.character_id !== user?.character?.id).map((member) => (
              <span
                key={member.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'var(--color-success)',
                  border: '1px solid var(--color-success)',
                  color: 'var(--color-text-on-accent)',
                  padding: '2px 8px',
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9,
                }}
              >
                {member.character_display_name}
                <span className="eyebrow" style={{ color: 'var(--color-text-on-accent)', fontSize: 7 }}>joined</span>
              </span>
            ))}
            {praxis.invites.filter((inv) => inv.status === 'pending').map((invite) => (
              <span
                key={invite.id}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'var(--color-bg-surface-alt)',
                  border: '1px dashed var(--color-border-strong)',
                  padding: '2px 8px',
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9,
                }}
              >
                {invite.invitee_display_name}
                <span className="eyebrow" style={{ fontSize: 7 }}>pending</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metatask selector (solo, in-progress, eligible metatasks exist) */}
      {showMetatasks && (
        <div className="sidebar-card mb-5" style={{ padding: '16px 18px' }}>
          <p className="eyebrow mb-3">Optional meta task bonus</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {metaTasks.map((mt, index) => {
              const selected = appliedMetatasks.has(mt.id)
              const busy = applyingMetatask === mt.id
              return (
                <button
                  key={mt.id}
                  type="button"
                  onClick={() => toggleMetatask(mt)}
                  disabled={busy}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    borderTop: index === 0 ? 'none' : '1px dashed var(--color-border)',
                    background: selected ? factionCssVar(mt.metatask_faction_slug, 'light') : 'transparent',
                    border: selected ? `1.5px solid ${factionCssVar(mt.metatask_faction_slug, 'border')}` : 'none',
                    borderRadius: selected ? 4 : 0,
                    cursor: busy ? 'wait' : 'pointer', textAlign: 'left', width: '100%',
                    marginBottom: selected ? 2 : 0,
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: selected ? factionCssVar(mt.metatask_faction_slug) : 'var(--color-border)',
                    flexShrink: 0, transition: 'background 120ms',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="font-body" style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)', display: 'block' }}>
                      {mt.title}
                    </span>
                    {mt.description && (
                      <span className="font-body" style={{ fontSize: 9, color: 'var(--color-text-secondary)' }}>
                        {mt.description}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 11, fontWeight: 700,
                    color: selected ? 'var(--color-success)' : 'var(--color-text-tertiary)',
                    whiteSpace: 'nowrap',
                  }}>
                    +{mt.point_value} pts
                  </span>
                  {mt.level_required > 0 && <LevelPill level={mt.level_required} />}
                </button>
              )
            })}
          </div>
          {appliedMetatasks.size > 0 && (
            <p className="eyebrow" style={{ marginTop: 8, fontSize: 8, color: 'var(--color-text-tertiary)' }}>
              Click again to remove
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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
              borderBottom: `2px solid ${title ? color : 'var(--color-border-strong)'}`,
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
            style={{ fontSize: 7, marginTop: 4, display: 'block', textAlign: 'right', color: title.length >= 180 ? 'var(--color-danger)' : undefined }}
          >
            {title.length}/200
          </span>
          {title.length >= 200 && (
            <span className="font-body" style={{ fontSize: 10, color: 'var(--color-danger)', display: 'block', marginTop: 2 }}>
              Title must be 200 characters or fewer.
            </span>
          )}
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
                      style={{ fontSize: 8, color: 'var(--color-danger)', cursor: 'pointer', background: 'none', border: 'none', flexShrink: 0 }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span className="eyebrow">Add media</span>
            <span className="font-body" style={{ fontSize: 8, fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>photos, video, audio</span>
          </div>

          {newFiles.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: 8 }}>
              {newFiles.map((file, index) => (
                <div
                  key={index}
                  style={{
                    aspectRatio: '4/3', borderRadius: 6,
                    border: '1.5px solid var(--color-border)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'var(--color-bg-surface-alt)',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  <span className="font-body truncate" style={{ fontSize: 8, color: 'var(--color-text-tertiary)', padding: '0 6px', maxWidth: '100%' }}>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="eyebrow"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-text-tertiary)', marginTop: 2,
                    }}
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
              padding: '8px 14px',
              background: 'var(--color-bg-surface-alt)',
              border: '2px dashed var(--color-border-strong)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
          >
            + Add files
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <span className="eyebrow" style={{ display: 'block', marginTop: 6 }}>Images, video, audio · max 50mb per file</span>
          {fileError && (
            <p className="font-body" style={{ fontSize: 10, color: 'var(--color-danger)', marginTop: 6 }}>{fileError}</p>
          )}
        </div>

        {error && (
          <div
            className="font-body"
            style={{
              fontSize: 11, color: 'var(--color-danger)', marginTop: 8,
              padding: '8px 12px',
              background: 'rgba(220,38,38,0.06)',
              border: '1px solid rgba(220,38,38,0.2)',
            }}
          >
            {error}
          </div>
        )}

        {/* Submit buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={saving || submitting || switchingMode !== null}
            style={{
              background: 'var(--color-bg-surface)', color: 'var(--color-text-primary)',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', padding: '10px 24px',
              border: '1px solid var(--color-border)', cursor: (saving || submitting) ? 'wait' : 'pointer',
              position: 'relative',
            }}
          >
            {saving ? 'Saving...' : 'Save draft'}
          </button>
          {!isPublished && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={saving || submitting || switchingMode !== null}
              style={{
                background: color, color: 'var(--color-text-on-accent)',
                fontFamily: "'Courier Prime', monospace",
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.12em', padding: '10px 24px',
                border: 'none', cursor: (saving || submitting) ? 'wait' : 'pointer',
                position: 'relative',
              }}
            >
              <span style={{ position: 'absolute', inset: 3, border: '1px dashed rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
              {submitting ? 'Publishing...' : 'Publish proof'}
            </button>
          )}
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
