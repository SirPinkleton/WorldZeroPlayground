import React from "react";

const UNDERLINE_COLORS = [
  "var(--underline-1)",
  "var(--underline-2)",
  "var(--underline-3)",
  "var(--underline-4)",
  "var(--underline-5)",
  "var(--underline-6)",
];

/**
 * PageTitle — Lora italic heading where every letter gets its own colored
 * underline bar, cycling through the six-color title palette. Spaces render
 * as gaps with no bar. This is World Zero's signature page header.
 */
export function PageTitle({ title, eyebrow }) {
  let colorIndex = 0;
  return (
    <div style={{ marginBottom: 24 }}>
      {eyebrow && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--color-text-tertiary)",
            marginBottom: 4,
          }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 500,
          lineHeight: 1.15,
          fontSize: "var(--text-4xl)",
          color: "var(--color-text-primary)",
          margin: 0,
        }}
      >
        {title.split("").map((char, index) => {
          if (char === " ") {
            return (
              <span key={index} style={{ display: "inline-block", width: "0.3em" }} />
            );
          }
          const color = UNDERLINE_COLORS[colorIndex % UNDERLINE_COLORS.length];
          colorIndex++;
          return (
            <span
              key={index}
              style={{ borderBottom: `4px solid ${color}`, paddingBottom: 2 }}
            >
              {char}
            </span>
          );
        })}
      </h1>
    </div>
  );
}
