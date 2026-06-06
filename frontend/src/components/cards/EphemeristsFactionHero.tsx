import { EphSeal, LapisLastWord } from "./ephemeristsAtoms";

/**
 * The Ephemerists faction-page hero — a codex frontispiece. A lapis celestial
 * field behind ghost survey grids + astrolabe rings, the sigil seal, a Cinzel
 * wordmark with one word in the blue, the motto, a running gloss, and a
 * gold-ruled stat band. Colors via the --eph-* tokens (theme-aware).
 *
 * Takes raw counts and labels them in the faction's own voice — the page stays
 * vocabulary-agnostic (see FactionHeroProps in FactionDetail).
 */
function HeroGrids() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }} aria-hidden="true">
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.14,
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--eph-parchment) 0 1px, transparent 1px 26px), repeating-linear-gradient(90deg, var(--eph-parchment) 0 1px, transparent 1px 26px)",
        }}
      />
      <svg viewBox="0 0 1000 320" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.16 }}>
        <g stroke="var(--eph-gold-light)" strokeWidth="0.6" fill="none">
          {Array.from({ length: 21 }).map((_, i) => (
            <line key={i} x1={i * 50} y1="320" x2="820" y2="20" />
          ))}
        </g>
      </svg>
      <svg viewBox="0 0 1000 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }}>
        <g stroke="var(--eph-gold-light)" strokeWidth="0.7" fill="none">
          {[60, 130, 210, 300].map((r, i) => (
            <circle key={i} cx="820" cy="150" r={r} />
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function EphemeristsFactionHero({
  name,
  description,
  members,
  tasks,
  praxes,
}: {
  name: string;
  description?: string | null;
  members: number;
  tasks: number;
  praxes: number;
}) {
  // The faction labels its own counts — page passes raw numbers only.
  const stats = [
    { value: members, label: "ephemerists" },
    { value: tasks, label: "open truths" },
    { value: praxes, label: "sealed lately" },
  ];
  return (
    <header
      style={{
        position: "relative",
        overflow: "hidden",
        marginBottom: 24,
        border: "2px solid var(--eph-gold)",
        background:
          "radial-gradient(120% 140% at 82% 0%, var(--eph-lapis), var(--eph-field-deep) 60%, #05131c 100%)",
        color: "var(--eph-parchment)",
        boxShadow: "0 0 0 3px var(--eph-vellum), 0 0 0 4px var(--eph-ink)",
      }}
    >
      <HeroGrids />
      <div style={{ height: 5, background: "var(--eph-gold)", position: "relative", zIndex: 2 }} />
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 28, padding: "26px 32px 24px", flexWrap: "wrap" }}>
        <EphSeal size={104} bg="var(--eph-vellum)" eye="var(--eph-lapis)" />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div
            style={{
              fontFamily: "var(--eph-serif)",
              fontSize: 10,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--eph-gold-light)",
              marginBottom: 6,
            }}
          >
            World Zero · Faction №5 — the road's keepers
          </div>
          <h1
            style={{
              fontFamily: "var(--eph-display)",
              fontWeight: 800,
              fontSize: 52,
              lineHeight: 0.88,
              letterSpacing: "0.02em",
              margin: 0,
              color: "var(--eph-parchment)",
              textShadow: "2px 2px 0 var(--eph-field-deep)",
            }}
          >
            <LapisLastWord text={name} />
          </h1>
          <div
            style={{
              display: "inline-block",
              marginTop: 12,
              background: "var(--eph-ink)",
              color: "var(--eph-gold-light)",
              fontFamily: "var(--eph-display)",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "0.26em",
              padding: "5px 16px",
              border: "1px solid var(--eph-gold-deep)",
            }}
          >
            OMNIA · TRANSEUNT
          </div>
          <p
            style={{
              fontFamily: "var(--eph-serif)",
              fontSize: 13.5,
              lineHeight: 1.6,
              maxWidth: 580,
              margin: "14px 0 0",
              color: "color-mix(in srgb, var(--eph-parchment) 92%, transparent)",
            }}
          >
            {description ?? "Wanderers who set down what is true before it passes."}
            <span
              style={{
                display: "block",
                fontFamily: "var(--eph-script)",
                fontStyle: "italic",
                fontSize: 11.5,
                color: "color-mix(in srgb, var(--eph-parchment) 62%, transparent)",
                marginTop: 8,
              }}
            >
              † nothing keeps. we keep the record anyway — <span style={{ color: "var(--eph-gold-light)" }}>see †</span>
            </span>
          </p>
        </div>
      </div>
      {/* stat band */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          background: "var(--eph-field-deep)",
          borderTop: "2px solid var(--eph-gold)",
          padding: "13px 32px",
        }}
      >
        {stats.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <div style={{ width: 1, height: 30, margin: "0 24px", background: "color-mix(in srgb, var(--eph-gold) 40%, transparent)" }} />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontFamily: "var(--eph-display)", fontWeight: 700, fontSize: 30, lineHeight: 0.85, color: "var(--eph-gold-light)" }}>
                {s.value}
              </span>
              <span style={{ fontFamily: "var(--eph-serif)", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--eph-parchment)", opacity: 0.82 }}>
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
