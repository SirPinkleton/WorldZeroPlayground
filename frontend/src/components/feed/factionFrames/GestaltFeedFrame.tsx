import type { FactionFeedFrameProps } from '../FactionFeedFrame'

/**
 * Gestalt activity-feed frame — wraps a feed row in a lo-fi ".exe" window
 * (title bar with dots + "gestalt.exe", dotted body) so the coven's updates
 * read as little desktop windows.
 */
export default function GestaltFeedFrame({ children }: FactionFeedFrameProps) {
  return (
    <div
      style={{
        border: '2px solid var(--faction-gestalt-win-border)',
        borderRadius: 11,
        overflow: 'hidden',
        background: 'var(--faction-gestalt-body-bg)',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '5px 9px',
          background:
            'linear-gradient(180deg, var(--faction-gestalt-title-from), var(--faction-gestalt-title-to))',
          borderBottom: '2px solid var(--faction-gestalt-win-border)',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fb7aa8' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f6c75e' }} />
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#86cfa6' }} />
        <span
          style={{
            marginLeft: 4,
            fontFamily: 'var(--font-body)',
            fontSize: 9,
            letterSpacing: '0.04em',
            color: 'var(--faction-gestalt-title-text)',
          }}
        >
          gestalt.exe
        </span>
      </div>
      <div
        style={{
          padding: 2,
          backgroundImage:
            'radial-gradient(var(--faction-gestalt-dot) 1.2px, transparent 1.2px)',
          backgroundSize: '13px 13px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
