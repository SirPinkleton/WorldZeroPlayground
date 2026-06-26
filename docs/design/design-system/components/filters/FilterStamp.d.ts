/**
 * A rectangular rubber-stamp toggle for status filters — hard corners, inner
 * dashed border, solid ink when active.
 */
export interface FilterStampProps {
  /** Label text (rendered uppercase). */
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function FilterStamp(props: FilterStampProps): JSX.Element;
