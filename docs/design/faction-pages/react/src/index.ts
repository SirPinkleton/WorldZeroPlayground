/* Public API for the faction-pages package. */

export * from "./types";
export { FactionPage } from "./FactionPage";

// Individual skins (import directly if you don't want the slug router).
export { UaFactionPage } from "./factions/UaFactionPage";
export { WowFactionPage } from "./factions/WowFactionPage";
export { SnideFactionPage } from "./factions/SnideFactionPage";
export { EphemeristsFactionPage } from "./factions/EphemeristsFactionPage";
export { SingularityFactionPage } from "./factions/SingularityFactionPage";
export { EverymenFactionPage } from "./factions/EverymenFactionPage";
export { AlbescentFactionPage } from "./factions/AlbescentFactionPage";

// Shared logic + helpers (the real reusable core).
export { useFactionMembership } from "./lib/useFactionMembership";
export type { Membership } from "./lib/useFactionMembership";
export { FdlLaurel, topPraxisIndex } from "./lib/FdlLaurel";
export { css, cssm } from "./lib/css";
export { fmt, kfmt, roman, splitLast, initialOf } from "./lib/format";

// Sample data (one FactionContract per faction).
export { ua } from "./data/ua";
export { wow } from "./data/wow";
export { snide } from "./data/snide";
export { ephemerists } from "./data/ephemerists";
export { singularity } from "./data/singularity";
export { everymen } from "./data/everymen";
export { albescent } from "./data/albescent";
export { ALL_FACTIONS } from "./data";
