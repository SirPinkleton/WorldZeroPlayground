import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { getTask, getMyTasks, signupTask, dropTask, getTaskSignups, type TaskOut, type TaskSignupOut } from '../api/tasks'
import { listSubmissions, type SubmissionOut } from '../api/submissions'
import { listRelationships } from '../api/relationships'
import { listCharacters, type CharacterOut } from '../api/characters'
import { getMetaTasks, type MetaTaskOut } from '../api/metaTasks'
import SubmissionCard from '../components/SubmissionCard'
import LevelPill from '../components/ui/LevelPill'
import PageTitle from '../components/ui/PageTitle'
import FeedBadge from '../components/feed/FeedBadge'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { factionColor, factionName } from '../utils/factions'
import { extractError } from '../utils/errors'
import { mediaUrl } from '../utils/media'

const MAX_TASK_SLOTS = 20
const VISIBLE_SIGNUPS = 4

type CollabMode = 'solo' | 'collab' | 'duel'

interface InvitedPartner {
  id: number
  name: string
  faction_slug: string | null
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const [task, setTask] = useState<TaskOut | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionOut[]>([])
  const [signups, setSignups] = useState<TaskSignupOut[]>([])
  const [metaTasks, setMetaTasks] = useState<MetaTaskOut[]>([])
  const [isInProgress, setIsInProgress] = useState(false)
  const [taskSlotCount, setTaskSlotCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)

  // Friend/foe lookup sets
  const [friends, setFriends] = useState<Set<number>>(new Set())
  const [foes, setFoes] = useState<Set<number>>(new Set())

  // Collab/duel state
  const [selectedMode, setSelectedMode] = useState<CollabMode>('solo')
  const [invitedPartners, setInvitedPartners] = useState<InvitedPartner[]>([])
  const [inviteQuery, setInviteQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CharacterOut[]>([])
  const [showSearch, setShowSearch] = useState(false)

  // Submission sort
  const [submissionSort, setSubmissionSort] = useState<'score' | 'recent'>('score')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setIsInProgress(false)
    const taskId = parseInt(id, 10)

    const fetches: Promise<unknown>[] = [
      getTask(taskId),
      listSubmissions({ task_id: taskId }),
      getTaskSignups(taskId),
      getMetaTasks(taskId).catch(() => []),
    ]
    if (user) {
      fetches.push(getMyTasks('in_progress'))
      fetches.push(
        listRelationships({ type: 'friend' }).then((rels) =>
          new Set(rels.filter((r) => r.status === 'active').map((r) => r.to_character_id))
        ).catch(() => new Set<number>())
      )
      fetches.push(
        listRelationships({ type: 'foe' }).then((rels) =>
          new Set(rels.filter((r) => r.status === 'active').map((r) => r.to_character_id))
        ).catch(() => new Set<number>())
      )
    }

    Promise.all(fetches)
      .then(([t, s, sg, mt, myTasks, friendSet, foeSet]) => {
        setTask(t as TaskOut)
        setSubmissions(s as SubmissionOut[])
        setSignups(sg as TaskSignupOut[])
        setMetaTasks(mt as MetaTaskOut[])
        if (myTasks) {
          const tasks = myTasks as { task: { id: number } }[]
          setIsInProgress(tasks.some((ct) => ct.task.id === taskId))
          setTaskSlotCount(tasks.length)
        }
        if (friendSet) setFriends(friendSet as Set<number>)
        if (foeSet) setFoes(foeSet as Set<number>)
      })
      .catch((err) => setFetchError(extractError(err, "Couldn't load this task.")))
      .finally(() => setLoading(false))
  }, [id, location.key])

  // Re-fetch submissions when sort changes
  useEffect(() => {
    if (!id) return
    listSubmissions({ task_id: parseInt(id, 10) })
      .then((s) => setSubmissions(s))
      .catch(() => {})
  }, [submissionSort, id])

  const mySubmission = user?.character
    ? submissions.find((s) => s.character_id === user.character!.id)
    : undefined

  const handleSignup = async () => {
    if (!task) return
    setSignupError(null)
    try {
      await signupTask(task.id)
      navigate(`/tasks/${task.id}/submit`, {
        state: {
          mode: selectedMode,
          partners: invitedPartners,
        },
      })
    } catch (err) {
      setSignupError(extractError(err, 'Could not sign up for this task.'))
    }
  }

  const handleDrop = async () => {
    if (!task || !window.confirm('Drop this task? You can sign up again later.')) return
    setSignupError(null)
    try {
      await dropTask(task.id)
      setIsInProgress(false)
    } catch (err) {
      setSignupError(extractError(err, 'Could not drop this task.'))
    }
  }

  // Partner search
  const handleInviteSearch = useCallback(async (query: string) => {
    setInviteQuery(query)
    if (query.length < 2) { setSearchResults([]); setShowSearch(false); return }
    try {
      const results = await listCharacters({ search: query, limit: 8 })
      const filtered = results.filter((c) =>
        c.id !== user?.character?.id && !invitedPartners.some((p) => p.id === c.id)
      )
      setSearchResults(filtered)
      setShowSearch(filtered.length > 0)
    } catch {
      setSearchResults([])
    }
  }, [user, invitedPartners])

  const addPartner = (character: CharacterOut) => {
    if (selectedMode === 'duel' && invitedPartners.length >= 1) return
    setInvitedPartners((prev) => [...prev, { id: character.id, name: character.display_name, faction_slug: character.faction_slug }])
    setInviteQuery('')
    setShowSearch(false)
    setSearchResults([])
  }

  const removePartner = (characterId: number) => {
    setInvitedPartners((prev) => prev.filter((p) => p.id !== characterId))
  }

  if (loading) return <div className="py-8 font-body text-muted">Loading...</div>
  if (fetchError) return (
    <div className="py-8">
      <p className="font-body text-sm text-red-600 border-2 border-red-300 px-3 py-2">
        {fetchError}{' '}
        <button onClick={() => window.location.reload()} className="underline">Try refreshing.</button>
      </p>
    </div>
  )
  if (!task) return <div className="py-8 font-body text-muted">Task not found.</div>

  const color = factionColor(task.primary_faction_slug)
  const fname = factionName(task.primary_faction_slug)
  const canSignUp = user && !mySubmission && !isInProgress && (user.character?.level ?? 0) >= task.level_required
  const meetsLevel = (user?.character?.level ?? 0) >= task.level_required
  const slotsOpen = MAX_TASK_SLOTS - taskSlotCount
  const avgVote = submissions.length > 0
    ? (submissions.reduce((sum, s) => sum + (s.score ?? 0), 0) / submissions.length).toFixed(1)
    : '—'

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (submissionSort === 'score') return (b.score ?? 0) - (a.score ?? 0)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="py-8">
      {/* ── Breadcrumb ── */}
      <PageTitle title="Task" eyebrow="Tasks · Detail" />
      <nav className="font-body mb-4" style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
        <Link to="/tasks" style={{ color: '#c49a3a', textDecoration: 'none' }}>Tasks</Link>
        {' › '}
        <span style={{ color: 'var(--color-text-primary)' }}>{task.title}</span>
      </nav>

      {/* ── Two-Column Layout ── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* ── Main Column ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── Task Hero Block ── */}
          <div
            className="sidebar-card mb-5"
            style={{ borderLeft: `4px solid ${color}`, padding: '18px 22px' }}
          >
            {/* Faction pennant + status + level */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  display: 'inline-block',
                  clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
                  background: color, color: 'white',
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.07em', padding: '3px 14px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {fname}
              </span>
              <span
                className="font-body"
                style={{
                  fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em',
                  padding: '2px 8px', borderRadius: 4,
                  background: task.status === 'active' ? (dark ? 'rgba(74,222,128,0.15)' : 'rgba(21,128,61,0.1)') : 'var(--color-bg-surface-alt)',
                  color: task.status === 'active' ? '#15803d' : 'var(--color-text-tertiary)',
                }}
              >
                {task.status}
              </span>
              <LevelPill level={task.level_required} />
            </div>

            {/* Title */}
            <h1
              className="font-display italic font-medium"
              style={{ fontSize: 28, color: 'var(--color-text-primary)', lineHeight: 1.2, marginBottom: 12 }}
            >
              {task.title}
            </h1>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Base Pts', value: task.point_value },
                { label: 'Completed', value: submissions.length },
                { label: 'In Progress', value: signups.length },
                { label: 'Avg Vote', value: avgVote },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center py-2"
                  style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}
                >
                  <div className="font-body font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                    {stat.value}
                  </div>
                  <div className="eyebrow" style={{ fontSize: 7 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {task.description && (
              <p
                className="font-body"
                style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}
              >
                {task.description}
              </p>
            )}
          </div>

          {/* ── Mode Selector + Signup Block ── */}
          {user && !mySubmission && !isInProgress && (
            <div className="sidebar-card mb-5" style={{ padding: '16px 20px' }}>
              <p className="eyebrow mb-3">How do you want to do this?</p>

              {/* Mode cards */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {([
                  { mode: 'solo' as CollabMode, icon: '◎', label: 'Solo', desc: 'Just you. All points are yours.' },
                  { mode: 'collab' as CollabMode, icon: '⬡', label: 'Collaboration', desc: 'Invite others. Everyone earns full points.' },
                  { mode: 'duel' as CollabMode, icon: '⚔', label: 'Duel', desc: 'Challenge one player. Winner takes the points.' },
                ]).map(({ mode, icon, label, desc }) => {
                  const active = selectedMode === mode
                  return (
                    <button
                      key={mode}
                      onClick={() => { setSelectedMode(mode); if (mode === 'solo') setInvitedPartners([]) }}
                      style={{
                        flex: 1,
                        position: 'relative',
                        border: `2.5px solid ${active ? (dark ? '#f0e6d0' : '#1a1209') : 'var(--color-border)'}`,
                        borderRadius: 0,
                        background: active ? (dark ? '#f0e6d0' : '#1a1209') : 'var(--color-bg-surface-alt)',
                        color: active ? (dark ? '#13121a' : '#F7F4EE') : 'var(--color-text-primary)',
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.08em', padding: '10px 8px',
                        cursor: 'pointer', textAlign: 'center',
                      }}
                    >
                      {active && <span style={{ position: 'absolute', inset: 2, border: '1px dashed rgba(255,255,255,0.2)', pointerEvents: 'none' }} />}
                      <span style={{ display: 'block', fontSize: 18, marginBottom: 4 }}>{icon}</span>
                      <span style={{ display: 'block', marginBottom: 2 }}>{label}</span>
                      <span style={{ display: 'block', fontSize: 7, fontWeight: 400, opacity: 0.7, textTransform: 'none', letterSpacing: '0.02em' }}>{desc}</span>
                    </button>
                  )
                })}
              </div>

              {/* Invite input (shown for collab/duel) */}
              {selectedMode !== 'solo' && (
                <div style={{ marginBottom: 14 }}>
                  <span className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>Invite</span>
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
                        background: dark ? '#1a1209' : '#F7F4EE',
                        color: 'var(--color-text-primary)',
                        border: '2px solid var(--color-border)',
                        outline: 'none',
                      }}
                      onFocus={() => { if (searchResults.length > 0) setShowSearch(true) }}
                      onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                    />
                    <button
                      type="button"
                      disabled={!inviteQuery.trim()}
                      style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                        padding: '8px 14px',
                        background: 'var(--color-bg-surface-alt)',
                        border: '2px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer',
                      }}
                    >
                      + Add
                    </button>

                    {/* Search dropdown */}
                    {showSearch && (
                      <div
                        style={{
                          position: 'absolute', top: '100%', left: 0, right: 60, zIndex: 10,
                          background: 'var(--color-bg-surface)',
                          border: '1px solid var(--color-border)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          maxHeight: 200, overflowY: 'auto',
                        }}
                      >
                        {searchResults.map((character) => (
                          <button
                            key={character.id}
                            onMouseDown={() => addPartner(character)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              width: '100%', padding: '8px 12px',
                              background: 'transparent', border: 'none',
                              cursor: 'pointer', textAlign: 'left',
                            }}
                          >
                            <div
                              style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: `linear-gradient(135deg, ${factionColor(character.faction_slug)}, ${factionColor(character.faction_slug)}88)`,
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

                  {/* Invited chips */}
                  {invitedPartners.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="eyebrow">Invited:</span>
                      {invitedPartners.map((partner) => (
                        <span
                          key={partner.id}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: 'var(--color-bg-surface-alt)',
                            border: '1px solid var(--color-border)',
                            padding: '2px 8px',
                            fontFamily: "'Courier Prime', monospace",
                            fontSize: 9,
                          }}
                        >
                          <span style={{ width: 6, height: 6, background: factionColor(partner.faction_slug), display: 'inline-block' }} />
                          {partner.name}
                          <button
                            onClick={() => removePartner(partner.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontSize: 10, padding: 0 }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sign up button */}
              {canSignUp ? (
                <button
                  onClick={handleSignup}
                  style={{
                    width: '100%',
                    background: color, color: 'white',
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.15em', padding: '10px 20px',
                    border: 'none', cursor: 'pointer', position: 'relative',
                  }}
                >
                  <span style={{ position: 'absolute', inset: 3, border: '1px dashed rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                  Sign up · earn up to {task.point_value} pts
                </button>
              ) : (
                <button
                  disabled
                  style={{
                    width: '100%',
                    background: 'var(--color-bg-surface-alt)',
                    color: 'var(--color-text-tertiary)',
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: 11, textTransform: 'uppercase',
                    letterSpacing: '0.1em', padding: '10px 20px',
                    border: 'none', cursor: 'not-allowed',
                  }}
                >
                  {!meetsLevel ? `Level ${task.level_required} required` : 'Sign up'}
                </button>
              )}

              <div className="eyebrow" style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>You have {slotsOpen} of {MAX_TASK_SLOTS} task slots open</span>
                <span>Level {task.level_required} required {meetsLevel ? '✓' : ''}</span>
              </div>

              {signupError && (
                <p className="font-body" style={{ fontSize: 9, color: '#dc2626', marginTop: 6 }}>{signupError}</p>
              )}
            </div>
          )}

          {/* Already signed up / submitted states */}
          {user && mySubmission && (
            <div className="sidebar-card mb-5" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  background: `${color}18`, border: `1.5px solid ${color}40`,
                  borderRadius: 8, padding: '8px 16px',
                  display: 'flex', alignItems: 'center', gap: 8, flex: 1,
                }}
              >
                <span style={{ color, fontSize: 16 }}>✓</span>
                <span className="font-body" style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>
                  You've submitted praxis for this task
                </span>
              </div>
              <Link to={`/submissions/${mySubmission.id}/edit`} className="btn-outline" style={{ fontSize: 8, padding: '4px 12px' }}>
                edit
              </Link>
            </div>
          )}

          {user && !mySubmission && isInProgress && (
            <div className="sidebar-card mb-5" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  background: `${color}18`, border: `1.5px solid ${color}40`,
                  borderRadius: 8, padding: '8px 16px',
                  display: 'flex', alignItems: 'center', gap: 8, flex: 1,
                }}
              >
                <span style={{ color, fontSize: 12 }}>◎</span>
                <span className="font-body" style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>You're on this task</span>
              </div>
              <Link
                to={`/tasks/${task.id}/submit`}
                style={{
                  background: color, color: 'white',
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.12em', padding: '8px 18px',
                  textDecoration: 'none', position: 'relative',
                }}
              >
                <span style={{ position: 'absolute', inset: 3, border: '1px dashed rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
                Submit proof
              </Link>
              <button onClick={handleDrop} className="eyebrow" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>
                drop
              </button>
            </div>
          )}

          {/* ── Meta Tasks Panel ── */}
          {metaTasks.length > 0 && (
            <div className="sidebar-card mb-5" style={{ padding: '16px 20px' }}>
              <p className="eyebrow mb-3">Meta tasks available for this task</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {metaTasks.map((mt) => {
                  const mtColor = factionColor(mt.faction_slug)
                  const bonusLabel = mt.bonus_type === 'percentage' ? `+${mt.bonus_value}%` : `+${mt.bonus_value} flat`
                  return (
                    <div
                      key={mt.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 0',
                        borderTop: '1px dashed var(--color-border)',
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: mtColor, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="font-body" style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)', display: 'block' }}>
                          {mt.name}
                        </span>
                        <span className="font-body" style={{ fontSize: 9, color: 'var(--color-text-secondary)' }}>
                          {mt.description}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Courier Prime', monospace",
                          fontSize: 10, fontWeight: 700,
                          color: '#15803d',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {bonusLabel}
                      </span>
                      {mt.level_required > 0 && <LevelPill level={mt.level_required} />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Completed Praxis Section ── */}
          <div className="mt-2">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="eyebrow">{submissions.length} Completed Praxis</span>
              <div style={{ display: 'flex', gap: 0 }}>
                {(['score', 'recent'] as const).map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSubmissionSort(sort)}
                    style={{
                      fontFamily: "'Courier Prime', monospace",
                      fontSize: 8, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.1em', padding: '4px 10px',
                      background: submissionSort === sort ? (dark ? '#f0e6d0' : '#1a1209') : 'transparent',
                      color: submissionSort === sort ? (dark ? '#13121a' : '#F7F4EE') : 'var(--color-text-tertiary)',
                      border: `1px solid ${submissionSort === sort ? 'transparent' : 'var(--color-border)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {sort === 'score' ? 'Top Rated' : 'Recent'}
                  </button>
                ))}
              </div>
            </div>

            {sortedSubmissions.length === 0 ? (
              <p className="font-body text-muted">No submissions yet. Be the first.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedSubmissions.slice(0, 4).map((s) => <SubmissionCard key={s.id} submission={s} />)}
                </div>
                {submissions.length > 4 && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link
                      to={`/submissions?task_id=${task.id}`}
                      style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.1em', color: '#c49a3a',
                        textDecoration: 'none',
                      }}
                    >
                      View all {submissions.length} praxis &rarr;
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Right Sidebar Column ── */}
        <div style={{ width: 240, flexShrink: 0 }}>
          {/* Players in Progress */}
          <div className="sidebar-card mb-3">
            <p className="eyebrow mb-2">{signups.length} Players in Progress</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {signups.slice(0, VISIBLE_SIGNUPS).map((signup) => {
                const signupColor = factionColor(signup.faction_slug)
                const isFriend = friends.has(signup.character_id)
                const isFoe = foes.has(signup.character_id)
                return (
                  <div
                    key={signup.character_id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '4px 0',
                    }}
                  >
                    <Link to={`/characters/${signup.character_id}`}>
                      {signup.avatar_url ? (
                        <img
                          src={mediaUrl(signup.avatar_url)}
                          alt={signup.display_name}
                          style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${signupColor}, ${signupColor}88)`,
                          }}
                        />
                      )}
                    </Link>
                    <Link
                      to={`/characters/${signup.character_id}`}
                      className="font-body"
                      style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-primary)', textDecoration: 'none', flex: 1 }}
                    >
                      {signup.display_name}
                    </Link>
                    {isFriend && <FeedBadge type="friend" label="Friend" />}
                    {isFoe && <FeedBadge type="duel" label="Foe" />}
                  </div>
                )
              })}
            </div>
            {signups.length > VISIBLE_SIGNUPS && (
              <p className="eyebrow" style={{ marginTop: 6, color: 'var(--color-text-tertiary)' }}>
                +{signups.length - VISIBLE_SIGNUPS} more &rarr;
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
