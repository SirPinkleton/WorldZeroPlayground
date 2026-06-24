import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import MediaGallery from '../../../components/MediaGallery'
import { formatTimestamp } from '../../../utils/dates'
import VoteUI from '../../../components/vote/VoteUI'
import { factionCssVar } from '../../../utils/factions'
import type { PraxisDetailState } from '../usePraxisDetail'

/** Style Guide §12.3 */
const RAINBOW_COLORS = ['var(--underline-1)', 'var(--underline-2)', 'var(--underline-3)', 'var(--underline-4)', 'var(--underline-5)', 'var(--underline-6)', 'var(--underline-1)', 'var(--underline-2)']

/**
 * Default praxis-detail archetype — the original universal layout, now consuming
 * the shared {@link PraxisDetailState}. Any faction without a bespoke archetype
 * falls through to this, so it must stay visually identical to the pre-refactor
 * page.
 */
export default function DefaultPraxisDetail({
  state,
}: {
  state: PraxisDetailState
}) {
  const {
    praxis,
    votes,
    isOwner,
    showAdminBar,
    withdrawing,
    showWithdrawConfirm,
    setShowWithdrawConfirm,
    withdrawError,
    adminFailNote,
    setAdminFailNote,
    showFailInput,
    setShowFailInput,
    moderating,
    moderateError,
    showFlagForm,
    setShowFlagForm,
    flagReason,
    setFlagReason,
    flagging,
    flagError,
    setFlagError,
    flagSubmitted,
    handleModerate,
    handleWithdraw,
    handleResubmit,
    handleFlag,
  } = state

  // Guarded non-null by the dispatcher.
  if (!praxis) return null

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

      {/* Editing banner */}
      {praxis.status === 'in_progress' && (
        <div
          style={{
            background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)',
            borderRadius: 8, padding: '8px 14px', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span className="eyebrow">IN EDITING</span>
          <span className="font-body" style={{ fontSize: 11, color: 'var(--color-warning)', fontWeight: 700 }}>
            This praxis is in editing mode. Points and votes are paused until submitted.
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
            <span className="font-body" style={{ fontSize: 11, color: 'var(--color-danger)', fontWeight: 700, display: 'block' }}>
              This praxis was marked as failed.
            </span>
            <span className="font-body" style={{ fontSize: 11, color: 'var(--color-warning)' }}>
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
                color: praxis.moderation_status === 'flagged' ? 'var(--color-danger)'
                  : praxis.moderation_status === 'hidden' ? 'var(--color-text-tertiary)'
                  : praxis.moderation_status === 'failed' ? 'var(--color-warning)'
                  : 'var(--color-success)',
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
                    style={{ padding: '2px 10px', fontSize: 9, borderColor: 'rgba(220,38,38,0.5)', color: 'var(--color-danger)' }}
                  >
                    hide
                  </button>
                  <button
                    onClick={() => setShowFailInput(!showFailInput)}
                    disabled={moderating}
                    className="btn-outline text-xs"
                    style={{ padding: '2px 10px', fontSize: 9, borderColor: 'rgba(245,158,11,0.5)', color: 'var(--color-warning)' }}
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
                    style={{ padding: '2px 10px', fontSize: 9, borderColor: 'rgba(220,38,38,0.5)', color: 'var(--color-danger)' }}
                  >
                    hide
                  </button>
                  <button
                    onClick={() => setShowFailInput(!showFailInput)}
                    disabled={moderating}
                    className="btn-outline text-xs"
                    style={{ padding: '2px 10px', fontSize: 9, borderColor: 'rgba(245,158,11,0.5)', color: 'var(--color-warning)' }}
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
                    style={{ padding: '2px 10px', fontSize: 9, borderColor: 'rgba(245,158,11,0.5)', color: 'var(--color-warning)' }}
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
                style={{ background: 'var(--color-warning)', borderColor: 'var(--color-warning)', fontSize: 9 }}
              >
                confirm
              </button>
            </div>
          )}
          {moderateError && (
            <p className="font-body text-xs mt-1" style={{ color: 'var(--color-danger)' }}>{moderateError}</p>
          )}
        </div>
      )}

      {/* ── Byline Block (§12.2) ── */}
      <div
        className="sidebar-card flex items-center gap-3 mb-4"
        style={{ padding: '10px 14px' }}
      >
        <Link to={`/characters/${praxis.created_by_id}`}>
          <div
            className="rounded-full shrink-0"
            style={{
              width: 42,
              height: 42,
              background: `linear-gradient(135deg, ${factionCssVar(null, 'card-accent')}, ${factionCssVar(null, 'card-bg')})`,
            }}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/characters/${praxis.created_by_id}`}
            className="font-display italic block truncate"
            style={{ fontSize: 14, color: factionCssVar(null, 'card-accent'), textDecoration: 'none' }}
          >
            {praxis.created_by_display_name || `#${praxis.created_by_id}`}
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
      {isOwner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Link
            to={`/praxes/${praxis.id}/edit`}
            className="font-body eyebrow hover:underline"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            edit this praxis
          </Link>
          {praxis.status === 'in_progress' ? (
            <button
              onClick={handleResubmit}
              disabled={withdrawing}
              style={{
                background: 'var(--color-success)', color: 'var(--color-text-on-accent)',
                fontFamily: "'Courier Prime', monospace",
                fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '4px 12px', border: 'none', cursor: 'pointer', borderRadius: 0,
                opacity: withdrawing ? 0.5 : 1,
              }}
            >
              {withdrawing ? '...' : 'Submit'}
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
                  background: 'rgba(220,38,38,0.1)', border: '1.5px solid var(--color-danger)', color: 'var(--color-danger)',
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
        <p className="font-body text-xs mb-3" style={{ color: 'var(--color-danger)' }}>{withdrawError}</p>
      )}

      {/* ── Task Context Strip (§12.4) ── */}
      <div
        className="sidebar-card mb-5"
        style={{
          borderLeft: `4px solid ${factionCssVar(null, 'card-accent')}`,
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
      {praxis.media_items.length > 0 && (
        <div className="mb-5">
          <MediaGallery media={praxis.media_items} />
        </div>
      )}

      {/* ── Body Text (§12.6) — uses ReactMarkdown for rich content ── */}
      {praxis.body_text && (
        <div
          className="font-display mb-6 markdown-preview"
          style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--color-text-primary)' }}
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
        <VoteUI
          factionSlug={praxis.task_faction_slug}
          praxisId={praxis.id}
          averageStars={votes?.average_stars}
          totalVotes={votes?.total_votes}
        />
      </div>

      {/* ── Meta ── */}
      <div className="flex items-center gap-4 eyebrow mb-4">
        <span>Submitted {formatTimestamp(praxis.created_at)}</span>
        {praxis.moderation_status === 'flagged' && (
          <span style={{ border: '1px solid rgba(220,38,38,0.4)', color: 'var(--color-danger)', padding: '1px 6px', fontSize: 8 }}>
            flagged
          </span>
        )}
      </div>

      {/* ── Flag Block (§13.3) ──
          Hidden entirely when the viewer can't flag (not level 4+, own praxis,
          anonymous) or after the viewer successfully flagged it this session. */}
      {flagSubmitted ? (
        <div
          className="sidebar-card flex items-center gap-3"
          style={{ padding: '10px 14px' }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1.5px solid var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="eyebrow" style={{ color: 'var(--color-success)' }}>OK</span>
          </div>
          <div className="flex-1">
            <p className="font-body" style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
              Flagged for admin review
            </p>
            <p className="font-body" style={{ fontSize: 8, color: 'var(--color-text-tertiary)' }}>
              Thanks — an admin will take a look shortly.
            </p>
          </div>
        </div>
      ) : praxis.can_flag && praxis.moderation_status !== 'flagged' && (
        <div
          className="sidebar-card"
          style={{ padding: '10px 14px' }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1.5px solid rgba(220,38,38,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="eyebrow">FLAG</span>
            </div>
            <div className="flex-1">
              <p className="font-body" style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                Flag this praxis
              </p>
              <p className="font-body" style={{ fontSize: 8, color: 'var(--color-text-tertiary)' }}>
                If this content is inappropriate or violates the rules, flag it for admin review.
              </p>
            </div>
            {!showFlagForm && (
              <button
                onClick={() => {
                  setShowFlagForm(true)
                  setFlagError(null)
                }}
                className="btn-outline"
                style={{
                  fontSize: 9,
                  padding: '4px 12px',
                  borderColor: 'rgba(220,38,38,0.5)',
                  color: 'var(--color-danger)',
                }}
              >
                Flag
              </button>
            )}
          </div>
          {showFlagForm && (
            <div style={{ marginTop: 10 }}>
              <textarea
                className="border-2 border-border bg-card px-3 py-2 font-body text-sm focus:outline-none focus:border-ink w-full resize-none"
                rows={3}
                placeholder="Describe the issue (at least 10 characters)..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                disabled={flagging}
              />
              <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
                <button
                  onClick={() => void handleFlag()}
                  disabled={flagging}
                  className="btn-primary"
                  style={{
                    fontSize: 9,
                    padding: '4px 12px',
                    background: 'var(--color-danger)',
                    borderColor: 'var(--color-danger)',
                  }}
                >
                  {flagging ? '...' : 'Submit flag'}
                </button>
                <button
                  onClick={() => {
                    setShowFlagForm(false)
                    setFlagReason('')
                    setFlagError(null)
                  }}
                  disabled={flagging}
                  className="btn-outline"
                  style={{ fontSize: 9, padding: '4px 12px' }}
                >
                  Cancel
                </button>
              </div>
              {flagError && (
                <p className="font-body text-xs" style={{ color: 'var(--color-danger)', marginTop: 6 }}>
                  {flagError}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* -- Metatask Panel -- */}
      {(() => {
        if (!state.praxis || !state.user?.character) return null;

        const character = state.user.character;
        const isMember = state.praxis.members.some(
          (m) => m.character_id === character.id
        );
        if (!isMember) return null;

        const level = character.level ?? 0;
        const isAlbescent = character.faction_slug === "albescent";
        const canEdit = isAlbescent || level >= 7;
        const canSee = level >= 6 || isAlbescent;
        if (!canSee) return null;

        const appliedIds = new Set(
          (state.praxis.applied_metatasks ?? []).map((t) => t.id)
        );
        const available = state.metatasks.filter(
          (t) =>
            !appliedIds.has(t.id) &&
            (isAlbescent || t.metatask_faction_slug === character.faction_slug)
        );

        return (
          <div className="sidebar-card mb-4" style={{ padding: "14px 16px" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="eyebrow">Metatasks</span>
              {state.metataskLoading && (
                <span className="eyebrow" style={{ fontSize: 8 }}>loading...</span>
              )}
            </div>

            {/* Applied metatasks */}
            {state.praxis.applied_metatasks && state.praxis.applied_metatasks.length > 0 ? (
              <div style={{ marginBottom: canEdit ? 12 : 0 }}>
                <span className="eyebrow" style={{ fontSize: 8, display: "block", marginBottom: 6 }}>Applied</span>
                {state.praxis.applied_metatasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 mb-1" style={{ padding: "4px 8px", background: "var(--color-surface-soft)", fontSize: 11 }}>
                    <span className="flex-1 font-body">{t.title}</span>
                    <span className="eyebrow" style={{ fontSize: 8 }}>+{t.point_value} pts</span>
                    {canEdit && (
                      <button
                        onClick={() => void state.handleRemoveMetatask(t.id)}
                        disabled={state.removingMetataskId === t.id}
                        style={{ background: "none", border: "1px solid rgba(220,38,38,0.3)", color: "var(--color-danger)", fontSize: 8, padding: "1px 6px", cursor: "pointer", opacity: state.removingMetataskId === t.id ? 0.5 : 1 }}
                      >
                        {state.removingMetataskId === t.id ? "..." : "remove"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body" style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: canEdit ? 12 : 0 }}>
                No metatasks applied yet.
              </p>
            )}

            {/* Available metatasks */}
            {canEdit && (
              <>
                <span className="eyebrow" style={{ fontSize: 8, display: "block", marginBottom: 6 }}>Available</span>
                {state.metataskError && (
                  <p className="font-body" style={{ fontSize: 9, color: "var(--color-danger)", marginBottom: 6 }}>
                    {state.metataskError}
                  </p>
                )}
                {available.length === 0 && !state.metataskLoading ? (
                  <p className="font-body" style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>
                    No eligible metatasks available.
                  </p>
                ) : (
                  available.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 mb-1" style={{ padding: "4px 8px", background: "var(--color-surface-soft)", fontSize: 11 }}>
                      <span className="flex-1 font-body">{t.title}</span>
                      <span className="eyebrow" style={{ fontSize: 8 }}>+{t.point_value} pts</span>
                      <button
                        onClick={() => void state.handleApplyMetatask(t.id)}
                        disabled={state.applyingMetataskId === t.id}
                        style={{ background: "none", border: "1px solid var(--color-accent)", color: "var(--color-accent)", fontSize: 8, padding: "1px 6px", cursor: "pointer", opacity: state.applyingMetataskId === t.id ? 0.5 : 1 }}
                      >
                        {state.applyingMetataskId === t.id ? "..." : "apply"}
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Read-only note */}
            {!canEdit && canSee && (
              <p className="font-body" style={{ fontSize: 9, color: "var(--color-text-tertiary)", fontStyle: "italic" }}>
                Reach level 7 to apply metatasks.
              </p>
            )}
          </div>
        );
      })()}

      {/* -- end Metatask Panel -- */}
    </div>
  )
}
