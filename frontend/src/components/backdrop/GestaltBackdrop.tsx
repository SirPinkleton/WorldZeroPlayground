/**
 * Gestalt full-page backdrop — a lo-fi pastel "desktop": soft pink field with a
 * dotted grid and a gentle corner glow. Theme-aware via the `.gestalt-backdrop`
 * rule in index.css. Fixed behind page content at z-index 0.
 */
export default function GestaltBackdrop() {
  return <div className="gestalt-backdrop" aria-hidden="true" />
}
