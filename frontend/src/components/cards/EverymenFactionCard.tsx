import type { FactionCardProps } from "./FactionCard";

/**
 * EverymenFactionCard — the Everymen faction-SELECTION card.
 *
 * A union "ENLIST" recruitment poster: a masthead with the faction name in a
 * big Bebas headline, the motto/blurb pulled from faction.description, and an
 * enlist CTA wired to the real join/leave/accept/decline handlers.
 *
 * Self-contained: the SVG poster atoms (CogMark sigil, Halftone, Sunburst) are
 * declared locally so this file has no external dependencies beyond the
 * FactionCardProps contract.
 */

// ─── SVG atoms ────────────────────────────────────────────────────────────────

function CogMark({ size = 58, color = "var(--everymen-red)" }: { size?: number; color?: string }) {
  const teeth = 10;
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const angle = (Math.PI / teeth) * i;
    const radius = i % 2 === 0 ? 50 : 40;
    points.push(`${50 + radius * Math.cos(angle)},${50 + radius * Math.sin(angle)}`);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <polygon points={points.join(" ")} fill={color} />
      <circle cx={50} cy={50} r={22} fill="var(--everymen-cream)" />
      <circle cx={50} cy={50} r={11} fill={color} />
    </svg>
  );
}

function Halftone({ color = "var(--everymen-cream)", opacity = 0.08 }: { color?: string; opacity?: number }) {
  const id = "em-halftone";
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={id} width={10} height={10} patternUnits="userSpaceOnUse">
          <circle cx={2} cy={2} r={1.4} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </svg>
  );
}

function Sunburst({
  color = "var(--everymen-field-deep)",
  from = "50% 32%",
  opacity = 0.55,
  step = 7.5,
}: {
  color?: string;
  from?: string;
  opacity?: number;
  step?: number;
}) {
  const stops: string[] = [];
  for (let angle = 0; angle < 360; angle += step * 2) {
    stops.push(`${color} ${angle}deg`, `${color} ${angle + step}deg`);
    stops.push(`transparent ${angle + step}deg`, `transparent ${angle + step * 2}deg`);
  }
  return (
    <div
      style={
        {
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity,
          pointerEvents: "none",
          background: `conic-gradient(from 0deg at ${from}, ${stops.join(", ")})`,
        } as React.CSSProperties
      }
      aria-hidden="true"
    />
  );
}

// ─── Enlist action footer ──────────────────────────────────────────────────────

const ENLIST_STATES = new Set(["eligible", "can_return", "welcome_back", "invited", "not_invited"]);

function EnlistAction({
  faction,
  status,
  onJoin,
  onLeave,
  onConfirm,
  onDecline,
  confirmPending,
  leavePending,
}: Pick<
  FactionCardProps,
  | "faction"
  | "status"
  | "onJoin"
  | "onLeave"
  | "onConfirm"
  | "onDecline"
  | "confirmPending"
  | "leavePending"
>) {
  const enlistButton = (label: string, onClick: () => void, pending?: boolean) => (
    <button
      onClick={onClick}
      disabled={pending}
      style={
        {
          marginTop: 26,
          width: "100%",
          maxWidth: 380,
          border: "2px solid var(--everymen-ink)",
          cursor: pending ? "not-allowed" : "pointer",
          fontFamily: "var(--faction-everymen-card-font)",
          fontSize: 26,
          letterSpacing: "0.12em",
          padding: "12px",
          background: "var(--everymen-gold)",
          color: "var(--everymen-ink)",
          transition: "background 150ms",
        } as React.CSSProperties
      }
    >
      {label}
    </button>
  );

  // Already enlisted — show member state + a quiet "stand down" (leave).
  if (status === "member") {
    return (
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 11 }}>
        <div
          style={
            {
              display: "inline-block",
              background: "var(--everymen-olive)",
              border: "2px solid var(--everymen-ink)",
              color: "var(--everymen-ink)",
              fontFamily: "var(--faction-everymen-card-font)",
              fontSize: 22,
              letterSpacing: "0.12em",
              padding: "10px 22px",
            } as React.CSSProperties
          }
        >
          ✓ ON THE LINE
        </div>
        {onLeave && (
          <button
            onClick={onLeave}
            disabled={leavePending}
            style={{
              background: "transparent",
              border: "none",
              fontFamily: "var(--font-body)",
              fontSize: 9.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--everymen-cream)",
              opacity: 0.8,
              cursor: leavePending ? "not-allowed" : "pointer",
              padding: 0,
            }}
          >
            {leavePending ? "Standing down…" : "Stand down"}
          </button>
        )}
      </div>
    );
  }

  // Explicit invitation: accept/decline wired to onConfirm/onDecline.
  if (status === "invited" && (onConfirm || onDecline)) {
    return (
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 11 }}>
        {onConfirm && enlistButton(confirmPending ? "ENLISTING…" : "ENLIST NOW ▸", onConfirm, confirmPending)}
        {onDecline && (
          <button
            onClick={onDecline}
            style={{
              background: "transparent",
              border: "none",
              fontFamily: "var(--font-body)",
              fontSize: 9.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--everymen-cream)",
              opacity: 0.8,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Not this time
          </button>
        )}
      </div>
    );
  }

  // Eligible / returning / open enlistment — single ENLIST button → onJoin.
  if (ENLIST_STATES.has(status) && onJoin) {
    const rejoining = status === "can_return" || status === "welcome_back";
    return enlistButton(rejoining ? "RE-ENLIST ▸" : "ENLIST NOW ▸", onJoin);
  }

  // Defected/burned — the line is closed to them.
  if (status === "burned" || status === "defected") {
    return (
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          fontStyle: "italic",
          lineHeight: 1.5,
          color: "var(--everymen-muted)",
          margin: "22px auto 0",
          maxWidth: 380,
        }}
      >
        You walked off the {faction.name} line. They won't sign you back on.
      </p>
    );
  }

  return null;
}

// ─── Card ──────────────────────────────────────────────────────────────────────

export default function EverymenCard({
  faction,
  status,
  invitationNote,
  ...actions
}: FactionCardProps) {
  const blurb =
    faction.description ??
    "No tricks, no inner circle, no waiting to be chosen. The Everymen do the work in front of them and finish what they start.";

  const perks = [
    "Honest tasks with honest points",
    "A faction that finishes what it starts",
    "Your work stamped by the people beside you",
  ];

  return (
    <div
      style={
        {
          position: "relative",
          overflow: "hidden",
          border: "3px solid var(--everymen-ink)",
          background: "var(--everymen-field)",
          color: "var(--everymen-cream)",
          boxShadow: "0 0 0 4px var(--everymen-paper), 0 0 0 6px var(--everymen-ink)",
          fontFamily: "var(--font-body)",
        } as React.CSSProperties
      }
    >
      <Sunburst color="var(--everymen-field-deep)" from="50% 32%" opacity={0.55} step={7.5} />
      <Halftone color="var(--everymen-cream)" opacity={0.09} />

      {/* gold top rule + kicker */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "var(--everymen-ink)",
          color: "var(--everymen-gold)",
          textAlign: "center",
          fontFamily: "var(--faction-everymen-card-font)",
          fontSize: 15,
          letterSpacing: "0.34em",
          padding: "7px 0",
        }}
      >
        {invitationNote ? `NEW SUMMONS · ${invitationNote.toUpperCase()}` : "THE EVERYMEN WANT YOU"}
      </div>
      <div style={{ height: 4, background: "var(--everymen-gold)", position: "relative", zIndex: 2 }} />

      <div style={{ position: "relative", zIndex: 2, padding: "30px 34px 32px", textAlign: "center" }}>
        {/* sigil seal */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "var(--everymen-cream)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 4px var(--everymen-ink), inset 0 0 0 6px var(--everymen-red)",
            }}
          >
            <CogMark size={58} color="var(--everymen-red)" />
          </div>
        </div>

        {/* World Zero · Faction eyebrow */}
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "var(--everymen-gold)",
            marginBottom: 8,
          }}
        >
          World Zero · Faction
        </div>

        {/* big Bebas headline = faction name */}
        <h1
          style={{
            fontFamily: "var(--faction-everymen-card-font)",
            fontSize: 60,
            lineHeight: 0.84,
            letterSpacing: "0.01em",
            margin: 0,
            color: "var(--everymen-cream)",
            textShadow: "3px 3px 0 var(--everymen-ink)",
          }}
        >
          {faction.name}
        </h1>

        {/* motto plaque */}
        <div
          style={{
            display: "inline-block",
            marginTop: 16,
            background: "var(--everymen-ink)",
            color: "var(--everymen-gold)",
            fontFamily: "var(--faction-everymen-card-font)",
            fontSize: 16,
            letterSpacing: "0.2em",
            padding: "4px 16px",
            whiteSpace: "nowrap",
          }}
        >
          UNITED · WE · STAND
        </div>

        {/* blurb from description */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            lineHeight: 1.65,
            maxWidth: 420,
            margin: "18px auto 0",
            color: "var(--everymen-cream)",
          }}
        >
          {blurb}
        </p>

        {/* what you get */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            maxWidth: 380,
            margin: "22px auto 0",
            textAlign: "left",
          }}
        >
          {perks.map((perk) => (
            <div
              key={perk}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderTop: "1px dashed color-mix(in srgb, var(--everymen-cream) 35%, transparent)",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  background: "var(--everymen-gold)",
                  color: "var(--everymen-ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--faction-everymen-card-font)",
                  fontSize: 14,
                }}
              >
                ✓
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--everymen-cream)" }}>
                {perk}
              </span>
            </div>
          ))}
        </div>

        {/* enlist CTA — wired to the real handlers */}
        <EnlistAction faction={faction} status={status} {...actions} />
      </div>
    </div>
  );
}
