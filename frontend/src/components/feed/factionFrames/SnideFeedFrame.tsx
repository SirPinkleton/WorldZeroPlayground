import type { FactionFeedFrameProps } from '../FactionFeedFrame'

/**
 * S.N.I.D.E. activity-feed frame — wraps a feed row as a photocopier dispatch
 * slip: ink stock with an acid masthead bar and a faint halftone screen, so the
 * collective's updates read as torn flyposted notices. Mirrors the other faction
 * frames in completeness; registered but not yet adopted at a call site.
 */
export default function SnideFeedFrame({ children }: FactionFeedFrameProps) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--faction-snide-ink)',
        color: 'var(--faction-snide-card-text)',
        overflow: 'hidden',
        boxShadow: '3px 4px 0 rgba(0,0,0,0.28)',
      }}
    >
      <div
        className="ht-dots"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          color: 'rgba(182,255,46,0.08)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 9px',
          borderBottom: '2px solid var(--faction-snide-acid)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--faction-snide-font-cond)',
            fontSize: 11,
            letterSpacing: '0.22em',
            color: 'var(--faction-snide-acid)',
          }}
        >
          S.N.I.D.E.
        </span>
        <span
          style={{
            fontSize: 7,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--faction-snide-card-muted)',
          }}
        >
          dispatch
        </span>
      </div>
      <div style={{ position: 'relative', padding: 2 }}>{children}</div>
    </div>
  )
}
