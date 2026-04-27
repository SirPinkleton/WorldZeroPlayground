import { Link } from "react-router-dom";
import type { TaskOut } from "../../api/tasks";
import LevelPill from "../ui/LevelPill";
import { factionCssVar } from "../../utils/factions";

/**
 * Journeymen — Luggage Tag.
 * Hanging string + eyelet, hazard stripe at top, bordered tag body.
 */

interface Props {
  task: TaskOut;
  displayPoints: number;
  onSignup?: (id: number) => void;
}

export default function TaskCardJourneymen({
  task,
  displayPoints,
  onSignup,
}: Props) {
  return (
    <div
      style={{
        paddingTop: 26,
        position: "relative",
        minWidth: 108,
        maxWidth: 132,
        flex: "0 1 118px",
      }}
    >
      {/* Hanging string */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 0,
            height: 14,
            borderLeft: `2px dashed ${factionCssVar("journeymen", "card-accent")}`,
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            border: `2px solid ${factionCssVar("journeymen", "card-accent")}`,
            background: "var(--color-bg-page)",
          }}
        />
      </div>

      {/* Tag body */}
      <div
        style={{
          border: `2px solid ${factionCssVar("journeymen", "card-accent")}`,
          background: factionCssVar("journeymen", "card-bg"),
          fontFamily: factionCssVar("journeymen", "card-font"),
          color: factionCssVar("journeymen", "card-text"),
          transition: "background 150ms, color 150ms",
        }}
      >
        {/* Hazard stripe */}
        <div
          style={{
            height: 3,
            backgroundImage: `repeating-linear-gradient(90deg, var(--faction-journeymen-stripe-red) 0, var(--faction-journeymen-stripe-red) 8px, ${factionCssVar("journeymen", "card-bg")} 8px, ${factionCssVar("journeymen", "card-bg")} 16px, var(--faction-journeymen-stripe-amber) 16px, var(--faction-journeymen-stripe-amber) 24px, ${factionCssVar("journeymen", "card-bg")} 24px, ${factionCssVar("journeymen", "card-bg")} 32px)`,
          }}
        />

        <div style={{ padding: "8px 10px 10px" }}>
          <div
            className="card-meta"
            style={{ color: factionCssVar("journeymen", "card-accent") }}
          >
            Journeymen · {displayPoints} pts
          </div>

          <Link
            to={`/tasks/${task.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                fontSize: "var(--text-md)",
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: 5,
                overflowWrap: "anywhere",
              }}
            >
              {task.title}
            </div>
          </Link>

          {task.description && (
            <div
              className="card-description"
              style={{ color: factionCssVar("journeymen", "card-muted") }}
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
            <LevelPill level={task.level_required} factionSlug="journeymen" />
            <span style={{ fontSize: "var(--text-base)", fontWeight: 700 }}>
              {displayPoints}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
