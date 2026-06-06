/**
 * The Ephemerists full-page backdrop — the page as a sheet of the ephemeris:
 * aged vellum, faint foxing, astrolabe rings bleeding from opposite corners,
 * and ghost scribe-lines. Theme-aware via the `.eph-backdrop` rule in
 * index.css. Fixed behind page content at z-index 0.
 */
export default function EphemeristsBackdrop() {
  return <div className="eph-backdrop" aria-hidden="true" />;
}
