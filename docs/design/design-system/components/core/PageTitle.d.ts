/**
 * World Zero's signature page header — Lora italic with a per-letter rainbow
 * underline cycling through the six title-underline colors.
 */
export interface PageTitleProps {
  /** Heading text. Each non-space character gets its own colored underline. */
  title: string;
  /** Optional small uppercase eyebrow above the title (era name, item count). */
  eyebrow?: string;
}

export function PageTitle(props: PageTitleProps): JSX.Element;
