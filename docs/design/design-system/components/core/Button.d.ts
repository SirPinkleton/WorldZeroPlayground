import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  /** Solid ink fill (`primary`) or frosted bordered (`outline`). Default `primary`. */
  variant?: "primary" | "outline";
  /** `sm` is the tiny in-card sign-up size; `md` is default; `lg` for hero CTAs. */
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  /** Only for in-flight async / form validity — never for permission gates. */
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
}

/**
 * World Zero's core action control — uppercase Courier Prime, no rounding,
 * flat opacity hover.
 */
export function Button(props: ButtonProps): JSX.Element;
