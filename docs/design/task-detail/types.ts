/* Shared prop types for the World Zero faction task-detail pages. */

export type FactionSlug =
  | "ua"
  | "wow"
  | "snide"
  | "ephemerists"
  | "singularity"
  | "everymen"
  | "albescent";

/** The task a page is about. */
export interface TaskDetailData {
  title: string;
  points: number;
  level: number;
  /** Display reference / case number, e.g. "0317", "C-19". */
  no?: string;
}

/** A filed praxis (a logged completion of the task that the faction votes on). */
export interface PraxisEntry {
  /** Short label of the task this praxis answers. */
  task: string;
  /** Headline of the finding/submission. */
  finding: string;
  author: string;
  excerpt: string;
  /** 1–5 average rating. */
  rating: number;
  /** How many members voted. */
  marks: number;
  points: number;
  level: number;
  /** Set by the page on the highest-rated entry → renders the ⚜ badge. */
  top?: boolean;
}

/** A discussion post. */
export interface CommentEntry {
  name?: string;
  handle?: string;
  meta: string;
  body: string;
  /** Avatar image URL (or data-URI). */
  avatar: string;
}

/** Common props every faction page accepts. All have built-in demo defaults. */
export interface TaskDetailProps {
  task?: Partial<TaskDetailData>;
  praxis?: PraxisEntry[];
  comments?: CommentEntry[];
  /** Fired when the primary CTA (Matriculate / Report for duty / …) is pressed. */
  onSignUp?: () => void;
}

/** Flag the highest-rated entry so the page can badge it with a fleur-de-lis. */
export function markTop(list: PraxisEntry[]): PraxisEntry[] {
  if (!list.length) return list;
  let best = 0;
  list.forEach((p, i) => {
    if (p.rating > list[best].rating) best = i;
  });
  return list.map((p, i) => ({ ...p, top: i === best }));
}

/** Generate a simple inline-SVG avatar data-URI (demo use only). */
export function makeAvatar(seed: string, bg: string, fg = "#fff"): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">` +
    `<rect width="80" height="80" fill="${bg}"/>` +
    `<text x="50%" y="60%" font-size="34" text-anchor="middle" fill="${fg}" font-family="Georgia,serif">${seed}</text>` +
    `</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
