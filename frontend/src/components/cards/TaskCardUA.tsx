import { Link } from "react-router-dom";
import type { TaskOut } from "../../api/tasks";
import LevelPill from "../ui/LevelPill";

/**
 * UA — Gilt salon placard (the University of Asthmatics archetype).
 * A small gold-framed acquisition plate on the salon wall: gilt-gradient
 * frame, parchment ground, Marcellus small-caps regalia, burnt-amber accent.
 * Matches the UA praxis-read sheet + UAVote. All colors via --ua-* tokens
 * (never hardcode hex — CLAUDE.md); the salon is always-light, so tokens read
 * identically in both themes.
 */

const REGALIA = "'Marcellus SC', serif";
const DISPLAY = "'Playfair Display', serif";
const SERIF = "'EB Garamond', serif";

interface Props {
  task: TaskOut;
  displayPoints: number;
  onSignup?: (id: number) => void;
}

export default function TaskCardUA({ task, displayPoints, onSignup }: Props) {
  return (
    // Gilt frame: gold-leaf gradient border, then the parchment plate.
    <div
      style={{
        minWidth: 130,
        maxWidth: 150,
        flex: "0 1 135px",
        padding: 3,
        background: "var(--ua-gilt)",
        boxShadow:
          "0 8px 18px color-mix(in srgb, var(--ua-ink) 18%, transparent), inset 0 0 0 1px color-mix(in srgb, white 40%, transparent)",
      }}
    >
      <div
        style={{
          background: "var(--ua-paper)",
          border: "1px solid var(--ua-line-soft)",
          padding: "12px 12px 10px",
          color: "var(--ua-ink)",
        }}
      >
        <div
          className="card-meta"
          style={{
            fontFamily: REGALIA,
            letterSpacing: "0.12em",
            color: "var(--ua-gold)",
          }}
        >
          UA · {displayPoints} pts
        </div>

        <Link
          to={`/tasks/${task.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: "var(--text-md)",
              lineHeight: 1.2,
              margin: "4px 0 6px",
              overflowWrap: "anywhere",
            }}
          >
            {task.title}
          </div>
        </Link>

        {task.description && (
          <div
            className="card-description"
            style={{ fontFamily: SERIF, color: "var(--ua-sub)" }}
          >
            {task.description}
          </div>
        )}

        {onSignup && (
          <button
            onClick={() => onSignup(task.id)}
            className="btn-primary"
            style={{ fontSize: 7, padding: "2px 8px", marginBottom: 6 }}
          >
            sign up
          </button>
        )}

        <div
          className="card-footer"
          style={{ borderTop: "1px solid var(--ua-line-soft)" }}
        >
          <LevelPill level={task.level_required} factionSlug="ua" />
          <span
            style={{
              fontFamily: DISPLAY,
              fontStyle: "italic",
              fontSize: "var(--text-base)",
              fontWeight: 700,
              color: "var(--ua-orange)",
            }}
          >
            {displayPoints}
          </span>
        </div>
      </div>
    </div>
  );
}
