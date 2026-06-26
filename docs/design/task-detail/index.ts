/* World Zero — faction task-detail pages. */

export * from "./types";

export { UATaskDetail } from "./UATaskDetail";
export { WhimsyTaskDetail } from "./WhimsyTaskDetail";
export { SnideTaskDetail } from "./SnideTaskDetail";
export { EphemeristsTaskDetail } from "./EphemeristsTaskDetail";
export { SingularityTaskDetail } from "./SingularityTaskDetail";
export { EverymenTaskDetail } from "./EverymenTaskDetail";
export { AlbescentTaskDetail } from "./AlbescentTaskDetail";

import { UATaskDetail } from "./UATaskDetail";
import { WhimsyTaskDetail } from "./WhimsyTaskDetail";
import { SnideTaskDetail } from "./SnideTaskDetail";
import { EphemeristsTaskDetail } from "./EphemeristsTaskDetail";
import { SingularityTaskDetail } from "./SingularityTaskDetail";
import { EverymenTaskDetail } from "./EverymenTaskDetail";
import { AlbescentTaskDetail } from "./AlbescentTaskDetail";
import type { FactionSlug, TaskDetailProps } from "./types";
import type React from "react";

/** Resolve a faction slug → its task-detail page component. */
export const TASK_DETAIL_BY_FACTION: Record<FactionSlug, React.FC<TaskDetailProps>> = {
  ua: UATaskDetail,
  wow: WhimsyTaskDetail,
  snide: SnideTaskDetail,
  ephemerists: EphemeristsTaskDetail,
  singularity: SingularityTaskDetail,
  everymen: EverymenTaskDetail,
  albescent: AlbescentTaskDetail,
};
