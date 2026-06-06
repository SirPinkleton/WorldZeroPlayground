import type { FactionFeedFrameProps } from "../FactionFeedFrame";

/**
 * The Ephemerists activity-feed frame — wraps a feed row as a torn leaf from
 * the faction's ephemeris: a lapis binding spine with gold notches against a
 * foxed vellum field. Colors via the --eph-* tokens (theme-aware).
 */
export default function EphemeristsFeedFrame({ children }: FactionFeedFrameProps) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--eph-vellum)",
        color: "var(--eph-vellum-text)",
        border: "1px solid color-mix(in srgb, var(--eph-vellum-text) 30%, transparent)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          flex: "0 0 8px",
          background:
            "repeating-linear-gradient(var(--eph-lapis) 0 9px, color-mix(in srgb, var(--eph-gold) 70%, transparent) 9px 13px)",
          borderRight: "1px solid var(--eph-gold-deep)",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
