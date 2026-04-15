import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getPraxis, flagPraxis, withdrawPraxis, resubmitPraxis, type PraxisOut } from '../api/praxis'
import { getVotes, type VoteSummary } from '../api/votes'
import MediaGallery from '../components/MediaGallery'
import { formatTimestamp } from '../utils/dates'
import VoteStamps from '../components/ui/VoteStamps'
import { useAuth } from '../auth/AuthContext'
import { useAdminMode } from '../auth/AdminModeContext'
import { moderatePraxis } from '../api/admin'
import { extractError } from '../utils/errors'
import { mediaUrl } from '../utils/media'

/** Rainbow underline bar colors — 8 segments cycling (Style Guide §12.3) */
const RAINBOW_COLORS = ['#fbbf24', '#be185d', '#4f46e5', '#0e7490', '#16a34a', '#f97316', '#fbbf24', '#be185d']

/** Default accent color when faction is unknown */
const ACCENT = '#be185d'

export default function PraxisDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { adminMode } = useAdminMode()
  const [praxis, setPraxis] = useState<PraxisOut | null>(null)
  const [votes, setVotes] = useState<VoteSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [flagging, setFlagging] = useState(false)
  const [flagError, setFlagError] = useState<string | null>(null)
  const [showFlagConfirm, setShowFlagConfirm] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [adminFailNote, setAdminFailNote] = useState('')
  const [showFailInput, setShowFailInput] = useState(false)
  const [moderating, setModerating] = useState(false)
  const [moderateError, setModerateError] = useState<string | null>(null)

  const showAdminBar = user?.is_admin && adminMode && praxis

  const handleModerate = async (status: string, note?: string) => {
    if (!praxis) return
    setModerating(true)
    setModerateError(null)
    try {
      const updated = await moderatePraxis(praxis.id, status, note)
      setPraxis(updated)
      setShowFailInput(false)
      setAdminFailNote('')
    } catch (err) {
      setModerateError(extractError(err, 'Moderation failed.'))
    } finally {
      setModerating(false)
    }
  }

  useEffect(() => {
    if (!id) return
    const pid = parseInt(id, 10)
    Promise.all([getPraxis(pid), getVotes(pid)])
      .then(([p, v]) => { setPraxis(p); setVotes(v) })
      .catch((err) => setFetchError(extractError(err, "Couldn't load this praxis.")))
      .finally(() => setLoading(false))
  }, [id])

  const handleFlag = async () => {
    if (!praxis) return
    setFlagging(true)
    setFlagError(null)
    try {
      const updated = await flagPraxis(praxis.id, 'Flagged by community member')
      setPraxis(updated)
      setShowFlagConfirm(false)
    } catch (err) {
      setFlagError(extractError(err, 'Could not flag this praxis.'))
    } finally {
      setFlagging(false)
    }
  }

  const { refetch } = useAuth()

  const handleWithdraw = async () => {
    if (!praxis) return
    setWithdrawing(true)
    setWithdrawError(null)
    try {
      const updated = await withdrawPraxis(praxis.id)
      setPraxis(updated)
      setShowWithdrawConfirm(false)
      void refetch()
    } catch (err) {
      setWithdrawError(extractError(err, 'Could not withdraw this praxis.'))
    } finally {
      setWithdrawing(false)
    }
  }

  const handleResubmit = async () => {
    if (!praxis) return
    setWithdrawing(true)
    setWithdrawError(null)
    try {
      const updated = await resubmitPraxis(praxis.id)
      setPraxis(updated)
      void refetch()
    } catch (err) {
      setWithdrawError(extractError(err, 'Could not resubmit.'))
    } finally {
      setWithdrawing(false)
    }
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
  if (!praxis) return <div className="py-8 font-body text-muted">Not found.</div>

  const canFlag = (user?.character?.level ?? 0) >= 4 && user?.character?.id !== praxis.character_id

  return (
    <div className="py-8 max-w-2xl">
      {/* ── Breadcrumb (§12.1) ── */}
      <nav className="font-body mb-4" style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
        <Link to="/tasks" style={{ color: 'inherit', textDecoration: 'none' }}>Tasks</Link>
        {' › '}
        <Link to={`/tasks/${praxis.task_id}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          {praxis.task_title}
        </Link>
        {' › '}
        <span style={{ color: 'var(--color-text-primary)' }}>Praxis</span>
      </nav>

      {/* Withdrawn banner */}
      {praxis.is_withdrawn && (
        <div
          style={{
            background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)',
            borderRadius: 8, padding: '8px 14px', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>⏸</span>
          <span className="font-body" style={{ fontSize: 11, color: '#92400e', fontWeight: 700 }}>
            This praxis has been withdrawn. Points and votes are paused until resubmitted.
          </span>
        </div>
      )}

      {/* Failed banner (visible to author) */}
      {praxis.moderation_status === 'failed' && praxis.admin_note && (
        <div
          style={{
            background: 'rgba(220,38,38,0.05)', border: '2px solid rgba(220,38,38,0.3)',
            borderRadius: 8, padding: '8px 14px', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>&#10007;</span>
          <div>
            <span className="font-body" style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, display: 'block' }}>
              This praxis was marked as failed.
            </span>
            <span className="font-body" style={{ fontSize: 11, color: '#92400e' }}>
              {praxis.admin_note}
            </span>
          </div>
        </div>
      )}

      {/* Admin moderation bar */}
      {showAdminBar && (
        <div
          className="sidebar-card mb-4"
          style={{ padding: '10px 14px' }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="eyebrow" style={{ color: 'var(--color-text-tertiary)', fontSize: 8 }}>
              ADMIN &middot; Status:
            </span>
            <span
              className="eyebrow"
              style={{
                fontSize: 8, padding: '1px 6px',
                border: '1px solid var(--color-border)',
                color: praxis.moderation_status === 'flagged' ? '#dc2626'
                  : praxis.moderation_status === 'hidden' ? 'var(--color-text-tertiary)'
                  : praxis.moderation_status === 'failed' ? '#d97706'
                  : '#16a34a',
              }}
            >
              {praxis.moderation_status}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              {praxis.moderation_status === 'flagged' && (
                <>
                  <button
                    onClick={() => void handleModerate('visible')}
                    disabled={moderating}
                    className="btn-primary text-xs"
                    style={{ padding: '2px 10px', fontSize: 9 }}
                  >
                    approve
                  </button>
                  <button
                    onClick={() => void handleModerate('hidden')}
                    disabled={moderating}
                    className="btn-outline text-xs"
                    style={{ padding: '2px 10px', fontSize: 9, borderColor: 'rgba(220,38,38,0.5)', color: '#dc2626' }}
                  >
                    hide
                  </button>
                  <button
                    onClick={() => setShowFailInput(!showFailInput)}
                    disabled={moderating}
                    className="btn-outline text-xs"
                    style={{ padding: '2px 10px', fontSize: 9, borderColor: 'rgba(245,158,11,0.5)', color: '#d97706' }}
                  >
                    fail
                  </button>
                </>
              )}
              {praxis.moderation_status === 'visible' && (
                <>
                  <button
                    onClick={() => void handleModerate('hidden')}
                    disabled={moderating}
                    className="btn-outline text-xs"
                    style={{ padding: '2px 10px', fontSize: 9, borderColor: 'rgba(220,38,38,0.5)', color: '#dc2626' }}
                  >
                    hide
                  </button>
                  <button
                    onClick={() => setShowFailInput(!showFailInput)}
                    disabled={moderating}
                    className="btn-outline text-xs"
                    style={{ padding: '2px 10px', fontSize: 9, borderColor: 'rgba(245,158,11,0.5)', color: '#d97706' }}
                  >
                    fail
                  </button>
                </>
              )}
              {(praxis.moderation_status === 'hidden' || praxis.moderation_status === 'failed') && (
                <>
                  <button
                    onClick={() => void handleModerate('visible')}
                    disabled={moderating}
                    className="btn-primary text-xs"
                    style={{ padding: '2px 10px', fontSize: 9 }}
                  >
                    restore
                  </button>
                  <button
                    onClick={() => setShowFailInput(!showFailInput)}
                    disabled={moderating}
                    className="btn-outline text-xs"
                    style={{ padding: '2px 10px', fontSize: 9, borderColor: 'rgba(245,158,11,0.5)', color: '#d97706' }}
                  >
                    fail
                  </button>
                </>
              )}
            </div>
          </div>
          {showFailInput && (
            <div className="mt-2 flex gap-2 items-end">
              <textarea
                className="border-2 border-border bg-card px-3 py-1 font-body text-sm focus:outline-none focus:border-ink flex-1 resize-none"
                rows={2}
                placeholder="Reason for failure (visible to player)..."
                value={adminFailNote}
                onChange={(e) => setAdminFailNote(e.target.value)}
              />
              <button
                onClick={() => void handleModerate('failed', adminFailNote)}
                disabled={moderating}
                className="btn-primary text-xs"
                style={{ background: '#d97706', borderColor: '#92400e', fontSize: 9 }}
              >
                confirm
              </button>
            </div>
          )}
          {moderateError && (
            <p className="font-body text-xs mt-1" style={{ color: '#dc2626' }}>{moderateError}</p>
          )}
        </div>
      )}

      {/* ── Byline Block (§12.2) ── */}
      <div
        className="sidebar-card flex items-center gap-3 mb-4"
        style={{ padding: '10px 14px' }}
      >
        <Link to={`/characters/${praxis.character_id}`}>
          {praxis.character_avatar_url ? (
            <img
              src={mediaUrl(praxis.character_avatar_url)}
              alt={praxis.character_display_name}
              className="rounded-full shrink-0 object-cover border-2 border-border"
              style={{ width: 42, height: 42 }}
            />
          ) : (
            <div
              className="rounded-full shrink-0"
              style={{
                width: 42,
                height: 42,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}88)`,
              }}
            />
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/characters/${praxis.character_id}`}
            className="font-display italic block truncate"
            style={{ fontSize: 14, color: ACCENT, textDecoration: 'none' }}
          >
            {praxis.character_display_name || `#${praxis.character_id}`}
          </Link>
          <span className="eyebrow">{formatTimestamp(praxis.created_at)}</span>
        </div>
        {/* Vote score */}
        {votes && votes.total_votes > 0 && (
          <div className="text-right shrink-0">
            <div className="font-display italic" style={{ fontSize: 22, color: 'var(--color-text-primary)' }}>
              {votes.average_stars.toFixed(1)}
            </div>
            <span className="eyebrow">{votes.total_votes} votes</span>
          </div>
        )}
      </div>

      {/* ── Praxis Title (§12.3) ── */}
      <h1
        className="font-display italic font-medium"
        style={{ fontSize: 30, color: 'var(--color-text-primary)', lineHeight: 1.2, marginBottom: 4 }}
      >
        {praxis.title}
      </h1>
      {/* Rainbow underline bar — 8 equal segments */}
      <div style={{ display: 'flex', height: 4, marginBottom: 16 }}>
        {RAINBOW_COLORS.map((color, index) => (
          <div key={index} style={{ flex: 1, background: color }} />
        ))}
      </div>

      {/* Author actions */}
      {user?.character?.id === praxis.character_id && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Link
            to={`/praxes/${praxis.id}/edit`}
            className="font-body eyebrow hover:underline"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            edit this praxis
          </Link>
          {praxis.is_withdrawn ? (
            <button
              onClick={handleResubmit}
              disabled={withdrawing}
              style={{
                background: '#14532d', color: 'white',
                fontFamily: "'Courier Prime', monospace",
                fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '4px 12px', border: 'none', cursor: 'pointer', borderRadius: 0,
                opacity: withdrawing ? 0.5 : 1,
              }}
            >
              {withdrawing ? '...' : 'Resubmit'}
            </button>
          ) : !showWithdrawConfirm ? (
            <button
              onClick={() => setShowWithdrawConfirm(true)}
              className="font-body eyebrow"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
            >
              unsubmit
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="eyebrow" style={{ color: 'var(--color-text-tertiary)' }}>Sure? Points & votes will pause.</span>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                style={{
                  background: 'rgba(220,38,38,0.1)', border: '1.5px solid #dc2626', color: '#dc2626',
                  fontFamily: "'Courier Prime', monospace", fontSize: 9, textTransform: 'uppercase',
                  padding: '3px 10px', cursor: 'pointer', borderRadius: 0,
                }}
              >
                {withdrawing ? '...' : 'Yes, unsubmit'}
              </button>
              <button
                onClick={() => setShowWithdrawConfirm(false)}
                className="btn-outline" style={{ fontSize: 9, padding: '3px 10px' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      {withdrawError && (
        <p className="font-body text-xs mb-3" style={{ color: '#dc2626' }}>{withdrawError}</p>
      )}

      {/* ── Task Context Strip (§12.4) ── */}
      <div
        className="sidebar-card mb-5"
        style={{
          borderLeft: `4px solid ${ACCENT}`,
          borderRadius: '0 8px 8px 0',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span className="eyebrow" style={{ fontSize: 8 }}>Completing task</span>
        <Link
          to={`/tasks/${praxis.task_id}`}
          className="font-body"
          style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', textDecoration: 'none' }}
        >
          {praxis.task_title}
        </Link>
        <span className="font-body" style={{ fontSize: 9, color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
          {praxis.task_point_value} pts
        </span>
      </div>

      {/* ── Media Gallery (§12.5) ── */}
      {praxis.media.length > 0 && (
        <div className="mb-5">
          <MediaGallery media={praxis.media} />
        </div>
      )}

      {/* ── Body Text (§12.6) — uses ReactMarkdown for rich content ── */}
      {praxis.body_text && (
        <div
          className="font-display mb-6 markdown-preview"
          style={{ fontSize: 15, lineHeight: 1.75, color: '#2a1e10' }}
        >
          <ReactMarkdown>{praxis.body_text}</ReactMarkdown>
        </div>
      )}

      {/* ── Voting (§13 preview — full redesign in Phase 8) ── */}
      <div className="sidebar-card mb-4" style={{ padding: '14px 16px' }}>
        <div className="flex items-baseline justify-between mb-3">
          <span className="eyebrow">Points earned from votes</span>
          {votes && (
            <span className="font-display italic" style={{ fontSize: 22, color: 'var(--color-text-primary)' }}>
              {votes.total_score}
              <span className="eyebrow" style={{ marginLeft: 4 }}>pts</span>
            </span>
          )}
        </div>
        <VoteStamps
          praxisId={praxis.id}
          averageStars={votes?.average_stars}
          totalVotes={votes?.total_votes}
        />
      </div>

      {/* ── Meta ── */}
      <div className="flex items-center gap-4 eyebrow mb-4">
        <span>Submitted {formatTimestamp(praxis.created_at)}</span>
        {praxis.moderation_status === 'flagged' && (
          <span style={{ border: '1px solid rgba(220,38,38,0.4)', color: '#dc2626', padding: '1px 6px', fontSize: 8 }}>
            flagged
          </span>
        )}
      </div>

      {/* ── Flag Block (§13.3) ── */}
      {canFlag && !praxis.moderation_status === 'flagged' && (
        <div
          className="sidebar-card flex items-center gap-3"
          style={{ padding: '10px 14px' }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1.5px solid rgba(220,38,38,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: 'rgba(220,38,38,0.5)',
              flexShrink: 0,
            }}
          >
            ⚑
          </div>
          <div className="flex-1">
            <p className="font-body" style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Flag this praxis
            </p>
            <p className="font-body" style={{ fontSize: 8, color: 'var(--color-text-tertiary)' }}>
              If this content is inappropriate or violates the rules, flag it for admin review.
            </p>
          </div>
          {!showFlagConfirm ? (
            <button
              onClick={() => setShowFlagConfirm(true)}
              style={{
                background: 'none',
                border: '1.5px solid rgba(220,38,38,0.25)',
                color: 'rgba(220,38,38,0.6)',
                fontFamily: "'Courier Prime', monospace",
                fontSize: 9,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '4px 10px',
                cursor: 'pointer',
                borderRadius: 0,
                transition: 'all 120ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#dc2626'
                e.currentTarget.style.borderColor = 'rgba(220,38,38,0.5)'
                e.currentTarget.style.background = 'rgba(220,38,38,0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(220,38,38,0.6)'
                e.currentTarget.style.borderColor = 'rgba(220,38,38,0.25)'
                e.currentTarget.style.background = 'none'
              }}
            >
              ⚑ Flag
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleFlag}
                disabled={flagging}
                style={{
                  background: 'rgba(220,38,38,0.1)',
                  border: '1.5px solid #dc2626',
                  color: '#dc2626',
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: 9,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  borderRadius: 0,
                }}
              >
                {flagging ? '...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowFlagConfirm(false)}
                className="btn-outline"
                style={{ fontSize: 9, padding: '4px 10px' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      {flagError && (
        <p className="font-body text-xs mt-2" style={{ color: '#dc2626' }}>{flagError}</p>
      )}
    </div>
  )
}
