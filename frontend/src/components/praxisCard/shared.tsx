import type { CSSProperties, MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { PraxisCardOut } from "../../api/praxis";

/**
 * Praxis-card shared building blocks.
 *
 * Each faction's praxis card owns a bespoke FRAME (tilted memo, ruled paper,
 * scrap collage, torn evidence, vellum leaf, terminal, gazette…) but the
 * CONTENT inside used to be a single monolithic `PraxisContent`, so the cards
 * "read flat" below the chrome (SPEC §1 #2). These exports break the content
 * into independently-placeable structural slots — `PraxisTitle`,
 * `PraxisTaskLink`, `PraxisByline` — so an archetype can arrange (or replace)
 * its own content layout instead of only re-coloring one fixed block.
 *
 * `PraxisContent` is the DEFAULT composition of those slots, byte-identical to
 * the original; archetypes that want the standard layout keep calling it, and
 * the dispatch stays a true per-faction dispatch rather than chrome-only.
 */

export interface ContentProps {
  praxis: PraxisCardOut;
  titleStyle?: CSSProperties;
  metaStyle?: CSSProperties;
}

/** Slot: the praxis title, linked to the praxis detail page. */
export function PraxisTitle({
  praxis,
  style,
}: {
  praxis: PraxisCardOut;
  style?: CSSProperties;
}) {
  return (
    <Link to={`/praxes/${praxis.id}`}>
      <h3
        className="font-display font-semibold leading-tight hover:underline"
        style={{ fontSize: "var(--text-lg)", marginBottom: 6, ...style }}
      >
        {praxis.title}
      </h3>
    </Link>
  );
}

/** Slot: the task this praxis completes, linked to the task detail page. */
export function PraxisTaskLink({
  praxis,
  style,
}: {
  praxis: PraxisCardOut;
  style?: CSSProperties;
}) {
  return (
    <Link
      to={`/tasks/${praxis.task_id}`}
      className="font-body hover:underline"
      style={{ fontSize: "var(--text-xs)", ...style }}
    >
      {praxis.task_title}
    </Link>
  );
}

/** Slot: the author + score footer row (dashed rule on top). */
export function PraxisByline({
  praxis,
  style,
}: {
  praxis: PraxisCardOut;
  style?: CSSProperties;
}) {
  return (
    <div
      className="flex justify-between items-center font-body"
      style={{
        fontSize: "var(--text-xs)",
        marginTop: 8,
        paddingTop: 6,
        borderTop: "1px dashed rgba(128,128,128,0.3)",
        ...style,
      }}
    >
      <Link
        to={`/characters/${praxis.created_by_id}`}
        className="hover:underline"
      >
        {praxis.created_by_display_name || `#${praxis.created_by_id}`}
      </Link>
      {praxis.score !== null && (
        <span
          className="font-display font-bold"
          style={{ fontSize: "var(--text-sm)", color: "inherit" }}
        >
          {praxis.score.toFixed(1)}
        </span>
      )}
    </div>
  );
}

/**
 * Slot: the score "seal" — the hero of a completed praxis, a stamped badge
 * showing the vote-weighted score instead of the buried byline number.
 *
 * ponytail: placeholder hero, shows the computed `score`; the canonical
 * per-faction cards replace it with the faction's vote reframe (Concordance,
 * heart ramp, ink stamps) at the rated tier — swap out when those land.
 */
export function PraxisSeal({
  praxis,
  color,
  border,
  label = "sealed",
}: {
  praxis: PraxisCardOut;
  color?: string;
  border?: string;
  label?: string;
}) {
  if (praxis.score === null || praxis.score === undefined) return null;
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        minWidth: 50,
        padding: "5px 8px",
        border: `2px solid ${border ?? "currentColor"}`,
        borderRadius: 4,
        transform: "rotate(-3deg)",
        color: color ?? "inherit",
        lineHeight: 1,
      }}
    >
      <span className="font-display" style={{ fontWeight: 800, fontSize: "var(--text-lg)" }}>
        {praxis.score.toFixed(0)}
      </span>
      <span
        style={{
          fontSize: 7,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginTop: 3,
          opacity: 0.8,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/** Slot: base points + collaboration mode — a compact stat line. */
export function PraxisStats({
  praxis,
  style,
}: {
  praxis: PraxisCardOut;
  style?: CSSProperties;
}) {
  const collaborators = praxis.member_count - 1;
  const submittedDate = praxis.submitted_at
    ? new Date(praxis.submitted_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;
  return (
    <div
      className="flex items-center gap-2 font-body"
      style={{ fontSize: "var(--text-xs)", ...style }}
    >
      {praxis.task_level_required > 0 && (
        <>
          <span style={{ fontWeight: 600, opacity: 0.75 }}>L{praxis.task_level_required}</span>
          <span aria-hidden>·</span>
        </>
      )}
      <span style={{ fontWeight: 700 }}>{praxis.task_point_value} pts</span>
      <span aria-hidden>·</span>
      <span>{collaborators > 0 ? `+${collaborators} crew` : "solo"}</span>
      {submittedDate && (
        <>
          <span aria-hidden>·</span>
          <span style={{ opacity: 0.65 }}>{submittedDate}</span>
        </>
      )}
    </div>
  );
}

/**
 * Default content composition — title, task link, byline. Visually identical to
 * the pre-refactor `PraxisContent`. An archetype that wants a different content
 * structure composes the slots above directly instead of calling this.
 */
export function PraxisContent({ praxis, titleStyle, metaStyle }: ContentProps) {
  return (
    <>
      <PraxisTitle praxis={praxis} style={titleStyle} />
      <PraxisTaskLink praxis={praxis} style={metaStyle} />
      <PraxisByline praxis={praxis} style={metaStyle} />
    </>
  );
}

// ─── Admin overlay ────────────────────────────────────────────────────────────

export interface AdminProps {
  praxis: PraxisCardOut;
  showAdminControls: boolean;
  onHide: (e: MouseEvent) => void;
  onFail: (e: MouseEvent) => void;
  moderateError: string | null;
}

/** Moderation status badge + hide/fail controls, shared by every archetype. */
export function AdminOverlay({
  praxis,
  showAdminControls,
  onHide,
  onFail,
  moderateError,
}: AdminProps) {
  return (
    <>
      {praxis.moderation_status === "flagged" && (
        <span
          className="eyebrow"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 7,
            padding: "1px 5px",
            border: "1px solid rgba(220,38,38,0.4)",
            color: "var(--color-danger)",
            background: "rgba(220,38,38,0.05)",
          }}
        >
          under review
        </span>
      )}
      {praxis.moderation_status === "failed" && (
        <span
          className="eyebrow"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 7,
            padding: "1px 5px",
            border: "1px solid rgba(245,158,11,0.4)",
            color: "var(--color-warning)",
            background: "rgba(245,158,11,0.05)",
          }}
        >
          failed
        </span>
      )}
      {praxis.moderation_status === "hidden" && (
        <span
          className="eyebrow"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: 7,
            padding: "1px 5px",
            border: "1px solid rgba(107,114,128,0.4)",
            color: "var(--color-text-secondary)",
            background: "rgba(107,114,128,0.05)",
          }}
        >
          hidden
        </span>
      )}
      {moderateError && (
        <p
          className="font-body"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-danger)",
            marginBottom: 4,
          }}
        >
          {moderateError}
        </p>
      )}
      {showAdminControls && praxis.moderation_status === "visible" && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            gap: 4,
          }}
        >
          <button
            onClick={onHide}
            className="eyebrow"
            style={{
              fontSize: 7,
              padding: "1px 5px",
              border: "1px solid rgba(220,38,38,0.3)",
              color: "var(--color-danger)",
              background: "rgba(220,38,38,0.05)",
              cursor: "pointer",
            }}
          >
            hide
          </button>
          <button
            onClick={onFail}
            className="eyebrow"
            style={{
              fontSize: 7,
              padding: "1px 5px",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "var(--color-warning)",
              background: "rgba(245,158,11,0.05)",
              cursor: "pointer",
            }}
          >
            fail
          </button>
        </div>
      )}
    </>
  );
}
