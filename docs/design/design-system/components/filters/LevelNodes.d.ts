/**
 * A row of connected circular nodes for filtering by level. Active node fills
 * with ink and scales up; clicking it again clears the filter.
 */
export interface LevelNodesProps {
  /** Level values to show. Default [0,1,2,3,4,5]. */
  levels?: number[];
  /** Currently-selected level, or "" for none. */
  value?: number | "";
  /** Called with the new level, or "" when cleared. */
  onChange?: (level: number | "") => void;
}

export function LevelNodes(props: LevelNodesProps): JSX.Element;
