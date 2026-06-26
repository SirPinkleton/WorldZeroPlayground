import type { CSSProperties } from 'react'

/**
 * Singularity full-page backdrop — the page as the terminal itself: a
 * terminal-black field with a faint blue circuit-trace grid, a centered
 * phosphor-green glow, signal blue bleeding from the corners, and fine
 * green scanlines. Singularity is always-dark: its `--faction-singularity-*`
 * tokens are identical in both themes, so this never flips with data-theme.
 * Fixed behind page content at z-index 0.
 */
const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  backgroundColor: 'var(--faction-singularity-card-bg)',
  backgroundImage: [
    // phosphor center glow (green)
    'radial-gradient(55% 45% at 50% 50%, color-mix(in srgb, var(--faction-singularity-card-accent) 5%, transparent) 0%, transparent 68%)',
    // signal blue — top-left origin
    'radial-gradient(44% 38% at 0% 0%, color-mix(in srgb, var(--faction-singularity-card-muted) 9%, transparent), transparent 72%)',
    // signal blue — bottom-right echo
    'radial-gradient(36% 30% at 100% 100%, color-mix(in srgb, var(--faction-singularity-card-muted) 6%, transparent), transparent 72%)',
    // circuit grid — horizontal (blue)
    'repeating-linear-gradient(0deg, color-mix(in srgb, var(--faction-singularity-border-hard) 22%, transparent) 0 1px, transparent 1px 32px)',
    // circuit grid — vertical (blue)
    'repeating-linear-gradient(90deg, color-mix(in srgb, var(--faction-singularity-border-hard) 22%, transparent) 0 1px, transparent 1px 32px)',
    // scanlines (faint phosphor-green over black)
    'repeating-linear-gradient(to bottom, transparent 0 2px, color-mix(in srgb, var(--faction-singularity-card-accent) 4%, transparent) 2px 4px)',
  ].join(', '),
}

export default function SingularityBackdrop() {
  return <div style={backdropStyle} aria-hidden="true" />
}
