import React from "react";

/**
 * Button — World Zero's core action control.
 *
 * Two variants drawn straight from index.css: `primary` (solid ink fill,
 * inverts in dark mode via the cascade) and `outline` (frosted surface +
 * strong border). All-uppercase Courier Prime, wide tracking, no rounding.
 * Hover is a flat opacity drop to 0.85 — never a color shift or shadow.
 *
 * Per World Zero rule: never render a disabled button for a permission gate —
 * hide the control instead. `disabled` is only for in-flight async / form
 * validity.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { fontSize: 7, padding: "2px 8px", letterSpacing: "0.1em" },
    md: { fontSize: 9, padding: "0.5rem 1rem", letterSpacing: "0.12em" },
    lg: { fontSize: 11, padding: "0.6rem 1.4rem", letterSpacing: "0.12em" },
  };

  const base = {
    fontFamily: "var(--font-body)",
    textTransform: "uppercase",
    border: variant === "outline" ? "1px solid var(--color-border-strong)" : "none",
    background:
      variant === "outline" ? "var(--color-bg-surface)" : "var(--color-text-primary)",
    color:
      variant === "outline" ? "var(--color-text-primary)" : "var(--color-bg-page)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "opacity 150ms",
    ...sizes[size],
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={base}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.85";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
