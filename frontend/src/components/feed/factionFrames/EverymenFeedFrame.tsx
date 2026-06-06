import type { FactionFeedFrameProps } from '../FactionFeedFrame'

/**
 * Everymen activity-feed frame — wraps a feed row in a red dispatch spine with
 * a notched edge and warm paper field, evoking a union work-order slip.
 */
export default function EverymenFeedFrame({ children }: FactionFeedFrameProps) {
  return (
    <div
      style={{
        display: 'flex',
        background: 'var(--everymen-paper)',
        color: 'var(--everymen-paper-text)',
        border: '1.5px solid var(--everymen-ink)',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          flex: '0 0 8px',
          background:
            'repeating-linear-gradient(var(--everymen-red) 0 9px, color-mix(in srgb, var(--everymen-cream) 70%, transparent) 9px 13px)',
          borderRight: '1px solid var(--everymen-ink)',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}
