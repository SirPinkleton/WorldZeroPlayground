import type { CSSProperties } from 'react'

/**
 * Albescent full-page backdrop (#232) — a cream cotton-paper wall
 * (`--faction-albescent-page`) lifted by a soft white highlight and ruled with
 * faint horizontal ledger lines, like a standing record sheet. Albescent is
 * always-light: its `--faction-albescent-*` tokens are identical in both themes,
 * so this never flips with data-theme. Fixed behind page content at z-index 0.
 * Ported from docs/design/albescent-kit/albescent.css `.al-backdrop`.
 */
const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  backgroundColor: 'var(--faction-albescent-page)',
  backgroundImage: [
    // soft white highlight, centred and high
    'radial-gradient(ellipse 72% 58% at 50% 38%, rgba(255,255,255,0.58) 0%, transparent 100%)',
    // faint ruled ledger lines (neutral ink, no hue)
    'repeating-linear-gradient(to bottom, transparent 0 27px, rgba(0,0,0,0.016) 27px 28px)',
  ].join(', '),
}

export default function AlbescentBackdrop() {
  return <div style={backdropStyle} aria-hidden="true" />
}
