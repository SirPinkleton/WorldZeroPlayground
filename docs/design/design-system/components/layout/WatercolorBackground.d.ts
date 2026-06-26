import React from "react";

/**
 * World Zero's full-bleed watercolor backdrop — blurred SVG paint blobs in all
 * four corners. Render once behind page content; dims automatically in dark mode.
 */
export interface WatercolorBackgroundProps {
  /** position:fixed (default) vs absolute, for use inside a relative container. */
  fixed?: boolean;
  style?: React.CSSProperties;
}

export function WatercolorBackground(props: WatercolorBackgroundProps): JSX.Element;
