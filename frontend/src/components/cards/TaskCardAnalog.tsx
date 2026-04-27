import { Link } from "react-router-dom";
import type { TaskOut } from "../../api/tasks";
import LevelPill from "../ui/LevelPill";
import { factionCssVar } from "../../utils/factions";

/**
 * Analog — Torn Field Journal Page.
 * Yellowed paper, red margin rule on left, horizontal ruled lines, torn bottom edge.
 */

interface Props {
  task: TaskOut;
  displayPoints: number;
  onSignup?: (id: number) => void;
}

export default function TaskCardAnalog({
  task,
  displayPoints,
  onSignup,
}: Props) {
  return (
    <div
      style={{
        minWidth: 124,
        maxWidth: 150,
        flex: "0 1 136px",
        background: factionCssVar("analog", "card-bg"),
        border: "1px solid var(--color-border)",
        clipPath:
          "polygon(0 0, 100% 0, 100% 90%, 92% 100%, 80% 95%, 68% 100%, 56% 93%, 44% 100%, 32% 94%, 20% 100%, 8% 94%, 0 100%)",
        position: "relative",
        padding: "12px 12px 18px 24px",
        fontFamily: factionCssVar("analog", "card-font"),
        color: factionCssVar("analog", "card-text"),
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent, transparent 17px, rgba(100,140,200,0.08) 17px, rgba(100,140,200,0.08) 18px)",
        transition: "background 150ms, color 150ms",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 20,
          top: 0,
          bottom: 0,
          width: 1,
          background: "rgba(220,80,80,0.2)",
        }}
      />

      <div
        className="card-meta"
        style={{
          color: factionCssVar("analog", "card-accent"),
          fontFamily: "'Courier Prime', monospace",
        }}
      >
        Analog · {displayPoints} pts
      </div>

      <Link
        to={`/tasks/${task.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 400,
            lineHeight: 1.3,
            marginBottom: 6,
            overflowWrap: "anywhere",
          }}
        >
          {task.title}
        </div>
      </Link>

      {task.description && (
        <div
          className="card-description"
          style={{
            fontSize: "var(--text-sm)",
            color: factionCssVar("analog", "card-muted"),
            lineHeight: 1.5,
          }}
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

      <div className="card-footer">
        <LevelPill level={task.level_required} factionSlug="analog" />
        <span
          style={{
            fontSize: "var(--text-base)",
            fontWeight: 700,
            fontFamily: "'Courier Prime', monospace",
          }}
        >
          {displayPoints}
        </span>
      </div>
    </div>
  );
}
