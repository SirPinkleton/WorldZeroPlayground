import type { FactionOut } from '../../api/factions'
import { factionCssVar } from '../../utils/factions'

/**
 * FactionCard — faction-archetype switcher.
 *
 * Renders a visually distinct card per faction slug, mirroring the task card
 * archetypes but showing faction info (name, description, status, actions).
 */

export interface FactionCardProps {
  faction: FactionOut
  status: string
  onJoin?: () => void
  onLeave?: () => void
  onConfirm?: () => void
  onDecline?: () => void
  confirmPending?: boolean
  leavePending?: boolean
  /** When set, renders a "NEW INVITATION" eyebrow above the card content. */
  invitationNote?: string | null
}

// ─── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status, slug }: { status: string; slug: string }) {
  if (status === 'member') {
    return (
      <span className="eyebrow" style={{ fontSize: 8, color: 'var(--color-success)', letterSpacing: '0.1em' }}>
        MEMBER
      </span>
    )
  }
  if (status === 'invited') {
    return (
      <span className="eyebrow" style={{ fontSize: 8, color: 'var(--color-warning)', letterSpacing: '0.1em' }}>
        INVITED
      </span>
    )
  }
  if (status === 'burned' || status === 'defected') {
    return (
      <span
        className="eyebrow"
        style={{
          fontSize: 8,
          color: factionCssVar(slug, 'card-muted'),
          background: factionCssVar(slug, 'light'),
          border: `1px solid ${factionCssVar(slug, 'border')}`,
          letterSpacing: '0.1em',
          padding: '2px 6px',
        }}
      >
        BURNED
      </span>
    )
  }
  if (status === 'welcome_back' || status === 'can_return') {
    return (
      <span className="eyebrow" style={{ fontSize: 8, color: factionCssVar(slug), letterSpacing: '0.1em' }}>
        WELCOME BACK
      </span>
    )
  }
  return null
}

// ─── Action footer ────────────────────────────────────────────────────────────

function ActionRow({
  faction,
  status,
  onJoin,
  onLeave,
  onConfirm,
  onDecline,
  confirmPending,
  leavePending,
}: Pick<FactionCardProps, 'faction' | 'status' | 'onJoin' | 'onLeave' | 'onConfirm' | 'onDecline' | 'confirmPending' | 'leavePending'>) {
  if (status === 'member') {
    if (!onLeave) return null
    return (
      <button
        onClick={onLeave}
        disabled={leavePending}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: 9,
          color: 'var(--color-text-tertiary)',
          cursor: leavePending ? 'not-allowed' : 'pointer',
          padding: 0,
          fontFamily: "'Courier Prime', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {leavePending ? 'Leaving...' : 'Leave'}
      </button>
    )
  }
  if (status === 'invited') {
    // Explicit Accept/Decline mode (when Factions.tsx wires onConfirm/onDecline)
    if (onConfirm || onDecline) {
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {onConfirm && (
            <button onClick={onConfirm} disabled={confirmPending} className="btn-primary" style={{ fontSize: 9, padding: '3px 10px' }}>
              {confirmPending ? 'Joining...' : 'Accept'}
            </button>
          )}
          {onDecline && (
            <button
              onClick={onDecline}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 9,
                color: 'var(--color-text-tertiary)',
                cursor: 'pointer',
                padding: 0,
                fontFamily: "'Courier Prime', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Decline
            </button>
          )}
        </div>
      )
    }
    // Simple single-button mode (confirmation dialog lives outside the card)
    if (onJoin) {
      return (
        <button onClick={onJoin} className="btn-primary" style={{ fontSize: 9, padding: '3px 10px' }}>
          Join {faction.name}
        </button>
      )
    }
    return null
  }
  if (status === 'eligible' || status === 'can_return' || status === 'welcome_back') {
    if (!onJoin) return null
    return (
      <button onClick={onJoin} className="btn-primary" style={{ fontSize: 9, padding: '3px 10px' }}>
        {status === 'can_return' || status === 'welcome_back' ? `Rejoin ${faction.name}` : `Join ${faction.name}`}
      </button>
    )
  }
  if (status === 'burned' || status === 'defected') {
    return (
      <div
        className="font-body"
        style={{
          fontSize: 10,
          lineHeight: 1.45,
          color: factionCssVar(faction.slug, 'card-muted'),
          fontStyle: 'italic',
        }}
      >
        You defected from {faction.name}. They won't take you back.
      </div>
    )
  }
  // For not_invited with onJoin provided (e.g. needsFactionChoice)
  if (onJoin) {
    return (
      <button onClick={onJoin} className="btn-primary" style={{ fontSize: 9, padding: '3px 10px' }}>
        Join {faction.name}
      </button>
    )
  }
  return null
}

// ─── Invitation note ──────────────────────────────────────────────────────────

function InvitationNote({ slug, note }: { slug: string; note: string }) {
  return (
    <div
      className="eyebrow"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 8,
        color: factionCssVar(slug),
        background: factionCssVar(slug, 'light'),
        border: `1px solid ${factionCssVar(slug, 'border')}`,
        padding: '2px 6px',
        letterSpacing: '0.12em',
        marginBottom: 6,
      }}
    >
      <span style={{ fontWeight: 700 }}>NEW INVITATION</span>
      <span style={{ opacity: 0.75 }}>· {note}</span>
    </div>
  )
}

// ─── Per-faction archetypes ───────────────────────────────────────────────────

const ROTATIONS = [-2, 1.5, -1, 2.5]

function UACard({ faction, status, invitationNote, ...actions }: FactionCardProps) {
  const rotation = ROTATIONS[faction.slug.length % ROTATIONS.length]
  const desc = faction.description ? faction.description.slice(0, 100) + (faction.description.length > 100 ? '…' : '') : ''
  return (
    <div
      style={{
        width: '100%',
        background: factionCssVar('ua', 'card-bg'),
        clipPath: 'polygon(0 0, 100% 0, 100% 88%, 88% 100%, 0 100%)',
        transform: `rotate(${rotation}deg)`,
        position: 'relative',
        padding: '28px 16px 20px',
        fontFamily: "'Courier Prime', monospace",
        color: factionCssVar('ua', 'card-text'),
        transition: 'background 150ms, color 150ms',
        boxSizing: 'border-box',
      }}
    >
      {/* Push pin */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: factionCssVar('ua', 'card-accent'),
          border: '2px solid rgba(0,0,0,0.25)',
        }}
      />
      {invitationNote && <InvitationNote slug={faction.slug} note={invitationNote} />}
      <div className="card-meta" style={{ color: factionCssVar('ua', 'card-accent'), marginBottom: 6 }}>
        <StatusBadge status={status} slug="ua" />
      </div>
      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>
        {faction.name}
      </div>
      {desc && (
        <div className="card-description" style={{ color: factionCssVar('ua', 'card-muted'), marginBottom: 10 }}>
          {desc}
        </div>
      )}
      <ActionRow faction={faction} status={status} {...actions} />
    </div>
  )
}

function AnalogCard({ faction, status, invitationNote, ...actions }: FactionCardProps) {
  const desc = faction.description ? faction.description.slice(0, 100) + (faction.description.length > 100 ? '…' : '') : ''
  return (
    <div
      style={{
        width: '100%',
        background: factionCssVar('analog', 'card-bg'),
        border: '1px solid var(--color-border)',
        clipPath: 'polygon(0 0, 100% 0, 100% 90%, 92% 100%, 80% 95%, 68% 100%, 56% 93%, 44% 100%, 32% 94%, 20% 100%, 8% 94%, 0 100%)',
        position: 'relative',
        padding: '14px 16px 28px 28px',
        fontFamily: "'Special Elite', serif",
        color: factionCssVar('analog', 'card-text'),
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 17px, rgba(100,140,200,0.08) 17px, rgba(100,140,200,0.08) 18px)',
        transition: 'background 150ms, color 150ms',
        boxSizing: 'border-box',
      }}
    >
      {/* Red margin line */}
      <div style={{ position: 'absolute', left: 22, top: 0, bottom: 0, width: 1, background: 'rgba(220,80,80,0.2)' }} />
      {invitationNote && <InvitationNote slug={faction.slug} note={invitationNote} />}
      <div className="card-meta" style={{ color: factionCssVar('analog', 'card-accent'), fontFamily: "'Courier Prime', monospace", marginBottom: 6 }}>
        <StatusBadge status={status} slug="analog" />
      </div>
      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 400, lineHeight: 1.3, marginBottom: 8 }}>
        {faction.name}
      </div>
      {desc && (
        <div className="card-description" style={{ fontSize: 'var(--text-sm)', color: factionCssVar('analog', 'card-muted'), lineHeight: 1.5, marginBottom: 10 }}>
          {desc}
        </div>
      )}
      <ActionRow faction={faction} status={status} {...actions} />
    </div>
  )
}

function GestaltCard({ faction, status, invitationNote, ...actions }: FactionCardProps) {
  const desc = faction.description ? faction.description.slice(0, 100) + (faction.description.length > 100 ? '…' : '') : ''
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 140 }}>
      {/* Back scrap 2 (deepest) */}
      <div style={{ position: 'absolute', top: 10, left: -4, right: -4, height: 24, background: 'var(--faction-gestalt-scrap-deep)', border: '1.5px solid rgba(0,0,0,0.12)', transform: 'rotate(-4deg)', borderRadius: 1 }} />
      {/* Back scrap 1 */}
      <div style={{ position: 'absolute', top: 4, left: -2, right: -2, height: 36, background: 'var(--faction-gestalt-scrap-mid)', border: '1.5px solid rgba(0,0,0,0.12)', transform: 'rotate(3deg)', borderRadius: 1 }} />
      {/* Front scrap (main content) */}
      <div
        style={{
          position: 'relative',
          background: factionCssVar('gestalt', 'card-bg'),
          border: '1.5px solid rgba(0,0,0,0.12)',
          transform: 'rotate(-2deg)',
          padding: '22px 14px 16px',
          fontFamily: "'Courier Prime', monospace",
          color: factionCssVar('gestalt', 'card-text'),
          zIndex: 2,
          transition: 'background 150ms, color 150ms',
          boxSizing: 'border-box',
        }}
      >
        {/* Scotch tape strip */}
        <div style={{ position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%) rotate(-1deg)', width: 48, height: 14, background: 'var(--faction-gestalt-tape)', borderRadius: 1 }} />
        {invitationNote && <InvitationNote slug={faction.slug} note={invitationNote} />}
        <div className="card-meta" style={{ color: factionCssVar('gestalt', 'card-accent'), marginBottom: 6 }}>
          <StatusBadge status={status} slug="gestalt" />
        </div>
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>
          {faction.name}
        </div>
        {desc && (
          <div className="card-description" style={{ color: factionCssVar('gestalt', 'card-muted'), marginBottom: 10 }}>
            {desc}
          </div>
        )}
        <ActionRow faction={faction} status={status} {...actions} />
      </div>
    </div>
  )
}

const SNIDE_TORN_CLIP = 'polygon(0% 0%, 4% 100%, 8% 20%, 12% 90%, 16% 10%, 20% 80%, 24% 0%, 28% 100%, 32% 15%, 36% 85%, 40% 5%, 44% 95%, 48% 20%, 52% 80%, 56% 0%, 60% 100%, 64% 15%, 68% 90%, 72% 5%, 76% 85%, 80% 0%, 84% 100%, 88% 20%, 92% 80%, 96% 10%, 100% 0%)'

function SnideCard({ faction, status, invitationNote, ...actions }: FactionCardProps) {
  const desc = faction.description ? faction.description.slice(0, 100) + (faction.description.length > 100 ? '…' : '') : ''
  const words = desc.split(' ')
  const mid = Math.ceil(words.length / 2)
  const col1 = words.slice(0, mid).join(' ')
  const col2 = words.slice(mid).join(' ')
  return (
    <div
      style={{
        width: '100%',
        background: factionCssVar('snide', 'card-bg'),
        position: 'relative',
        padding: '14px 14px 16px',
        fontFamily: "'Special Elite', serif",
        color: factionCssVar('snide', 'card-text'),
        transition: 'background 150ms, color 150ms',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 6, background: 'var(--color-bg-page)', clipPath: SNIDE_TORN_CLIP }} />
      <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 6, background: 'var(--color-bg-page)', clipPath: SNIDE_TORN_CLIP }} />
      <div style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.25em', color: factionCssVar('snide', 'card-muted'), borderBottom: `1.5px solid ${factionCssVar('snide', 'card-accent')}`, paddingBottom: 3, marginBottom: 6 }}>
        The Daily Snide Gazette
      </div>
      {invitationNote && <InvitationNote slug={faction.slug} note={invitationNote} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>{faction.name}</div>
        <StatusBadge status={status} slug="snide" />
      </div>
      {desc && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 4, marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: factionCssVar('snide', 'card-muted'), lineHeight: 1.5 }}>{col1}</div>
          <div style={{ background: 'var(--color-border)' }} />
          <div style={{ fontSize: 8, color: factionCssVar('snide', 'card-muted'), lineHeight: 1.5 }}>{col2}</div>
        </div>
      )}
      <ActionRow faction={faction} status={status} {...actions} />
    </div>
  )
}

function JourneymenCard({ faction, status, invitationNote, ...actions }: FactionCardProps) {
  const desc = faction.description ? faction.description.slice(0, 100) + (faction.description.length > 100 ? '…' : '') : ''
  return (
    <div style={{ paddingTop: 26, position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      {/* Hanging string */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 0, height: 14, borderLeft: `2px dashed ${factionCssVar('journeymen', 'card-accent')}` }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${factionCssVar('journeymen', 'card-accent')}`, background: 'var(--color-bg-page)' }} />
      </div>
      {/* Tag body */}
      <div
        style={{
          border: `2px solid ${factionCssVar('journeymen', 'card-accent')}`,
          background: factionCssVar('journeymen', 'card-bg'),
          fontFamily: "'Courier Prime', monospace",
          color: factionCssVar('journeymen', 'card-text'),
          transition: 'background 150ms, color 150ms',
        }}
      >
        {/* Hazard stripe */}
        <div style={{ height: 4, backgroundImage: `repeating-linear-gradient(90deg, var(--faction-journeymen-stripe-red) 0, var(--faction-journeymen-stripe-red) 8px, ${factionCssVar('journeymen', 'card-bg')} 8px, ${factionCssVar('journeymen', 'card-bg')} 16px, var(--faction-journeymen-stripe-amber) 16px, var(--faction-journeymen-stripe-amber) 24px, ${factionCssVar('journeymen', 'card-bg')} 24px, ${factionCssVar('journeymen', 'card-bg')} 32px)` }} />
        <div style={{ padding: '10px 14px 14px' }}>
          {invitationNote && <InvitationNote slug={faction.slug} note={invitationNote} />}
          <div className="card-meta" style={{ color: factionCssVar('journeymen', 'card-accent'), marginBottom: 4 }}>
            <StatusBadge status={status} slug="journeymen" />
          </div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>
            {faction.name}
          </div>
          {desc && (
            <div className="card-description" style={{ color: factionCssVar('journeymen', 'card-muted'), marginBottom: 10 }}>
              {desc}
            </div>
          )}
          <ActionRow faction={faction} status={status} {...actions} />
        </div>
      </div>
    </div>
  )
}

function SingularityHoles() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '4px 0' }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          style={{
            width: 6,
            height: 4,
            background: 'rgba(10,26,14)',
            border: '1px solid var(--faction-singularity-card-accent, var(--faction-singularity-border-hard))',
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  )
}

function SingularityCard({ faction, status, invitationNote, ...actions }: FactionCardProps) {
  const desc = faction.description ? faction.description.slice(0, 100) + (faction.description.length > 100 ? '…' : '') : ''
  return (
    <div
      style={{
        width: '100%',
        background: 'var(--faction-singularity-card-bg)',
        border: '1px solid var(--faction-singularity-border-hard)',
        position: 'relative',
        fontFamily: "'Share Tech Mono', monospace",
        color: 'var(--faction-singularity-card-text)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(74,222,128,0.015) 2px, rgba(74,222,128,0.015) 4px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* Corner brackets */}
      <div style={{ position: 'absolute', top: 3, left: 3, width: 10, height: 10, borderTop: '1px solid var(--faction-singularity-card-text)', borderLeft: '1px solid var(--faction-singularity-card-text)' }} />
      <div style={{ position: 'absolute', top: 3, right: 3, width: 10, height: 10, borderTop: '1px solid var(--faction-singularity-card-text)', borderRight: '1px solid var(--faction-singularity-card-text)' }} />
      <div style={{ position: 'absolute', bottom: 3, left: 3, width: 10, height: 10, borderBottom: '1px solid var(--faction-singularity-card-text)', borderLeft: '1px solid var(--faction-singularity-card-text)' }} />
      <div style={{ position: 'absolute', bottom: 3, right: 3, width: 10, height: 10, borderBottom: '1px solid var(--faction-singularity-card-text)', borderRight: '1px solid var(--faction-singularity-card-text)' }} />
      <SingularityHoles />
      <div style={{ padding: '6px 16px 12px', position: 'relative', zIndex: 2 }}>
        {invitationNote && <InvitationNote slug={faction.slug} note={invitationNote} />}
        <div style={{ fontSize: 8, color: 'var(--faction-singularity-card-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
          singularity protocol
          <span
            style={{
              display: 'inline-block',
              width: 5,
              height: 9,
              background: 'var(--faction-singularity-card-text)',
              marginLeft: 3,
              verticalAlign: 'middle',
              animation: 'blink 1s step-end infinite',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ fontSize: 'var(--text-md)', lineHeight: 1.3 }}>
            {'> '}{faction.name}
          </div>
          <StatusBadge status={status} slug="singularity" />
        </div>
        {desc && (
          <div style={{ fontSize: 9, color: 'var(--faction-singularity-card-muted)', lineHeight: 1.5, marginBottom: 10 }}>
            {desc}
          </div>
        )}
        <div style={{ borderTop: '1px solid var(--faction-singularity-border-hard)', paddingTop: 8 }}>
          <ActionRow faction={faction} status={status} {...actions} />
        </div>
      </div>
      <SingularityHoles />
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  )
}

function UAMastersCard({ faction, status, invitationNote, ...actions }: FactionCardProps) {
  const desc = faction.description ? faction.description.slice(0, 100) + (faction.description.length > 100 ? '…' : '') : ''
  const words = desc.split(' ')
  const mid = Math.ceil(words.length / 2)
  const col1 = words.slice(0, mid).join(' ')
  const col2 = words.slice(mid).join(' ')
  return (
    <div
      style={{
        width: '100%',
        background: factionCssVar('ua_masters', 'card-bg'),
        border: '1px solid var(--color-border)',
        clipPath: 'polygon(0 0, 98% 0, 100% 2%, 100% 98%, 98% 100%, 2% 100%, 0 98%, 0 2%)',
        padding: '12px 14px 16px',
        fontFamily: "'Special Elite', serif",
        color: factionCssVar('ua_masters', 'card-text'),
        transition: 'background 150ms, color 150ms',
        boxSizing: 'border-box',
      }}
    >
      {/* Masthead */}
      <div style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.2em', color: factionCssVar('ua_masters', 'card-muted'), borderBottom: `2px solid ${factionCssVar('ua_masters', 'card-accent')}`, paddingBottom: 4, marginBottom: 6 }}>
        The UA Masters Gazette
      </div>
      {invitationNote && <InvitationNote slug={faction.slug} note={invitationNote} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div style={{ fontSize: 'var(--text-lg)', lineHeight: 1.2 }}>{faction.name}</div>
        <StatusBadge status={status} slug="ua_masters" />
      </div>
      <div style={{ fontSize: 8, fontStyle: 'italic', color: factionCssVar('ua_masters', 'card-muted'), marginBottom: 8 }}>
        UA Masters Chronicle
      </div>
      {desc && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 4, marginBottom: 10 }}>
          <div style={{ fontSize: 8, color: factionCssVar('ua_masters', 'card-muted'), lineHeight: 1.5 }}>{col1}</div>
          <div style={{ background: 'var(--color-border)' }} />
          <div style={{ fontSize: 8, color: factionCssVar('ua_masters', 'card-muted'), lineHeight: 1.5 }}>{col2}</div>
        </div>
      )}
      <ActionRow faction={faction} status={status} {...actions} />
    </div>
  )
}

// ─── Switcher ─────────────────────────────────────────────────────────────────

export default function FactionCard(props: FactionCardProps) {
  switch (props.faction.slug) {
    case 'ua':
      return <UACard {...props} />
    case 'analog':
      return <AnalogCard {...props} />
    case 'gestalt':
      return <GestaltCard {...props} />
    case 'snide':
      return <SnideCard {...props} />
    case 'journeymen':
      return <JourneymenCard {...props} />
    case 'singularity':
      return <SingularityCard {...props} />
    case 'ua_masters':
      return <UAMastersCard {...props} />
    default:
      // Fallback: generic styled card using faction CSS vars
      return (
        <div
          style={{
            width: '100%',
            background: 'var(--color-bg-card)',
            border: `2px solid ${factionCssVar(props.faction.slug, 'border')}`,
            padding: '14px 16px',
            fontFamily: "'Courier Prime', monospace",
            color: 'var(--color-text-primary)',
            boxSizing: 'border-box',
          }}
        >
          {props.invitationNote && <InvitationNote slug={props.faction.slug} note={props.invitationNote} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: factionCssVar(props.faction.slug) }}>
              {props.faction.name}
            </div>
            <StatusBadge status={props.status} slug={props.faction.slug} />
          </div>
          {props.faction.description && (
            <div className="card-description" style={{ marginBottom: 10 }}>
              {props.faction.description.slice(0, 100)}
            </div>
          )}
          <ActionRow faction={props.faction} status={props.status} onJoin={props.onJoin} onLeave={props.onLeave} onConfirm={props.onConfirm} onDecline={props.onDecline} confirmPending={props.confirmPending} leavePending={props.leavePending} />
        </div>
      )
  }
}
