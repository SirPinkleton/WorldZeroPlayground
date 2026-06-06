/**
 * S.N.I.D.E. full-page backdrop — a flyposted wall: warm xerox stock plastered
 * with a faint acid sunburst, screen-print halftone, a scratched crosshatch, and
 * acid/pink light bleeding from the corners. Theme-aware via the `.snide-backdrop`
 * rule in index.css (darkens to a moody concrete wall). Fixed behind page content
 * at z-index 0.
 */
export default function SnideBackdrop() {
  return <div className="snide-backdrop" aria-hidden="true" />
}
