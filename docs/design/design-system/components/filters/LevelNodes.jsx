import React from "react";

/**
 * LevelNodes — a row of connected circular nodes for filtering by level.
 * Circles joined by short horizontal bars; the active node fills with ink and
 * scales up slightly. Clicking the active node clears the filter.
 */
export function LevelNodes({ levels = [0, 1, 2, 3, 4, 5], value = "", onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {levels.map((level, index) => {
        const active = value === level;
        return (
          <div key={level} style={{ display: "flex", alignItems: "center" }}>
            {index > 0 && (
              <div style={{ width: 12, height: 2, background: "var(--color-border-strong)" }} />
            )}
            <button
              type="button"
              onClick={() => onChange && onChange(active ? "" : level)}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: `2px solid ${active ? "var(--color-text-primary)" : "var(--color-border-strong)"}`,
                background: active ? "var(--color-text-primary)" : "var(--color-bg-surface)",
                color: active ? "var(--color-bg-page)" : "var(--color-text-tertiary)",
                fontFamily: "var(--font-body)",
                fontSize: 10,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: active ? "scale(1.15)" : "scale(1)",
                transition: "all 120ms",
                padding: 0,
              }}
            >
              {level}+
            </button>
          </div>
        );
      })}
    </div>
  );
}
