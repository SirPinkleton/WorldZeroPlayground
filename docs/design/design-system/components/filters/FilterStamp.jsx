import React from "react";

/**
 * FilterStamp — a rectangular rubber-stamp toggle used for status filters.
 * Hard corners (no radius), bold uppercase Courier Prime, and an inner dashed
 * border that inverts with the active state. Active = solid ink fill.
 */
export function FilterStamp({ label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        border: `2px solid ${active ? "var(--color-text-primary)" : "var(--color-border-strong)"}`,
        borderRadius: 0,
        background: active ? "var(--color-text-primary)" : "var(--color-bg-surface)",
        color: active ? "var(--color-bg-page)" : "var(--color-text-primary)",
        fontFamily: "var(--font-body)",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        padding: "5px 10px",
        cursor: "pointer",
        transition: "all 120ms",
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 2,
          border: `1px dashed ${active ? "var(--stamp-active-dashed)" : "var(--stamp-inactive-dashed)"}`,
          pointerEvents: "none",
        }}
      />
      {label}
    </button>
  );
}
