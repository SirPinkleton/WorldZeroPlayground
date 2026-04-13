import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getSubmission, flagSubmission, withdrawSubmission, resubmitSubmission, type SubmissionOut } from '../api/submissions'
import { getVotes, type VoteSummary } from '../api/votes'
import MediaGallery from '../components/MediaGallery'
import { formatTimestamp } from '../utils/dates'
import VoteStamps from '../components/ui/VoteStamps'
import { useAuth } from '../auth/AuthContext'
import { extractError } from '../utils/errors'

/** Rainbow underline bar colors — 8 segments cycling (Style Guide §12.3) */
const RAINBOW_COLORS = ['#fbbf24', '#be185d', '#4f46e5', '#0e7490', '#16a34a', '#f97316', '#fbbf24', '#be185d']

/** Default accent color when faction is unknown */
const ACCENT = '#be185d'

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [submission, setSubmission] = useState<SubmissionOut | null>(null)
  const [votes, setVotes] = useState<VoteSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [flagging, setFlagging] = useState(false)
  const [flagError, setFlagError] = useState<string | null>(null)
  const [showFlagConfirm, setShowFlagConfirm] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const sid = parseInt(id, 10)
    Promise.all([getSubmission(sid), getVotes(sid)])
      .then(([s, v]) => { setSubmission(s); setVotes(v) })
      .catch((err) => setFetchError(extractError(err, "Couldn't load this submission.")))
      .finally(() => setLoading(false))
  }, [id])

  const handleFlag = async () => {
    if (!submission) return
    setFlagging(true)
    setFlagError(null)
    try {
      const updated = await flagSubmission(submission.id, 'Flagged by community member')
      setSubmission(updated)
      setShowFlagConfirm(false)
    } catch (err) {
      setFlagError(extractError(err, 'Could not flag this submission.'))
    } finally {
      setFlagging(false)
    }
  }

  const { refetch } = useAuth()

  const handleWithdraw = async () => {
    if (!submission) return
    setWithdrawing(true)
    setWithdrawError(null)
    try {
      const updated = await withdrawSubmission(submission.id)
      setSubmission(updated)
      setShowWithdrawConfirm(false)
      void refetch()
    } catch (err) {
      setWithdrawError(extractError(err, 'Could not withdraw this submission.'))
    } finally {
      setWithdrawing(false)
    }
  }

  const handleResubmit = async () => {
    if (!submission) return
    setWithdrawing(true)
    setWithdrawError(null)
    try {
      const updated = await resubmitSubmission(submission.id)
      setSubmission(updated)
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
  if (!submission) return <div className="py-8 font-body text-muted">Not found.</div>

  const canFlag = (user?.character?.level ?? 0) >= 4 && user?.character?.id !== submission.character_id

  return (
    <div className="py-8 max-w-2xl">
      {/* ── Breadcrumb (§12.1) ── */}
      <nav className="font-body mb-4" style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-tertiary)' }}>
        <Link to="/tasks" style={{ color: 'inherit', textDecoration: 'none' }}>Tasks</Link>
        {' › '}
        <Link to={`/tasks/${submission.task_id}`} style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          {submission.task_title}
        </Link>
        {' › '}
        <span style={{ color: 'var(--color-text-primary)' }}>Praxis</span>
      </nav>

      {/* Withdrawn banner */}
      {submission.is_withdrawn && (
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

      {/* ── Byline Block (§12.2) ── */}
      <div
        className="sidebar-card flex items-center gap-3 mb-4"
        style={{ padding: '10px 14px' }}
      >
        <Link to={`/characters/${submission.character_id}`}>
          <div
            className="rounded-full shrink-0"
            style={{
              width: 42,
              height: 42,
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}88)`,
            }}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/characters/${submission.character_id}`}
            className="font-display italic block truncate"
            style={{ fontSize: 14, color: ACCENT, textDecoration: 'none' }}
          >
            {submission.character_display_name || `#${submission.character_id}`}
          </Link>
          <span className="eyebrow">{formatTimestamp(submission.created_at)}</span>
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
        {submission.title}
      </h1>
      {/* Rainbow underline bar — 8 equal segments */}
      <div style={{ display: 'flex', height: 4, marginBottom: 16 }}>
        {RAINBOW_COLORS.map((color, index) => (
          <div key={index} style={{ flex: 1, background: color }} />
        ))}
      </div>

      {/* Author actions */}
      {user?.character?.id === submission.character_id && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Link
            to={`/submissions/${submission.id}/edit`}
            className="font-body eyebrow hover:underline"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            edit this praxis
          </Link>
          {submission.is_withdrawn ? (
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
          to={`/tasks/${submission.task_id}`}
          className="font-body"
          style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', textDecoration: 'none' }}
        >
          {submission.task_title}
        </Link>
        <span className="font-body" style={{ fontSize: 9, color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
          {submission.task_point_value} pts
        </span>
      </div>

      {/* ── Media Gallery (§12.5) ── */}
      {submission.media.length > 0 && (
        <div className="mb-5">
          <MediaGallery media={submission.media} />
        </div>
      )}

      {/* ── Body Text (§12.6) — uses ReactMarkdown for rich content ── */}
      {submission.body_text && (
        <div
          className="font-display mb-6 markdown-preview"
          style={{ fontSize: 15, lineHeight: 1.75, color: '#2a1e10' }}
        >
          <ReactMarkdown>{submission.body_text}</ReactMarkdown>
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
          submissionId={submission.id}
          averageStars={votes?.average_stars}
          totalVotes={votes?.total_votes}
        />
      </div>

      {/* ── Meta ── */}
      <div className="flex items-center gap-4 eyebrow mb-4">
        <span>Submitted {formatTimestamp(submission.created_at)}</span>
        {submission.is_flagged && (
          <span style={{ border: '1px solid rgba(220,38,38,0.4)', color: '#dc2626', padding: '1px 6px', fontSize: 8 }}>
            flagged
          </span>
        )}
      </div>

      {/* ── Flag Block (§13.3) ── */}
      {canFlag && !submission.is_flagged && (
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
