/* ────────────────────────────────────────────────────────────────
   World Zero — the canonical, faction-agnostic faction-page contract.

   Every faction page — all seven — renders from ONE object of this
   shape. The backend returns the same keys for UA, S.N.I.D.E.,
   Singularity and the rest. All per-faction decoration (charms,
   sigils, stamps, gilt frames, fonts, colours) is derived CLIENT-SIDE
   from `slug` and is never stored here.

   Mirrors faction-contract.json (the `_doc`/`_items` scaffolding in
   that file is documentation only — the runtime arrays are flat).
   ──────────────────────────────────────────────────────────────── */

export type FactionSlug =
  | "ua"
  | "wow"
  | "snide"
  | "ephemerists"
  | "singularity"
  | "everymen"
  | "albescent";

/** One of the seven physical archetypes each skin renders. */
export type FactionArchetype =
  | "gilt salon"
  | "whimsy.exe"
  | "ransom dispatch"
  | "the discordant map"
  | "terminal printout"
  | "union poster"
  | "vellum correspondence";

/** ① hero + ② about copy. */
export interface FactionIdentity {
  /** Short tagline / motto. */
  motto: string;
  /** One-line hero sentence. */
  blurb: string;
  /** Manifesto paragraphs — render each as its own <p>. */
  about: string[];
}

/** The four canonical hero stats, always all present, in display order. */
export interface FactionStats {
  memberCount: number;
  /** Season standing. `null` for unranked factions (e.g. Albescent). */
  seasonRank: number | null;
  praxisFiled: number;
  pointsAwarded: number;
}

/**
 * Eligibility gate — only meaningful when viewer is prospective and not
 * eligible. `summary` is the headline, `detail` the encouragement.
 *
 * NOTE (per the standardization review): the gate is intentionally soft.
 * It does NOT tell the player an exact join formula or render a progress
 * bar — it just encourages continuing to do tasks. `have`/`needed`/`unit`
 * remain in the contract for factions that still want a quantified gate,
 * but the standardized pages ignore them.
 */
export interface FactionRequirement {
  summary: string;
  detail: string;
  have?: number;
  needed?: number;
  unit?: string;
}

export type ViewerState = "prospective" | "member";

/** ③ Who is looking — drives the Join / Leave / gate block. */
export interface FactionViewer {
  state: ViewerState;
  eligible: boolean;
  /** Set when state === "member". */
  role: string | null;
  requirement: FactionRequirement;
}

/** ④ One open-task card. `level`/`points` are canonical. */
export interface FactionTask {
  id: string;
  title: string;
  description: string;
  level: number;
  points: number;
}

/** ⑤ One filed-praxis (completed-work) entry. */
export interface FactionPraxis {
  id: string;
  author: string;
  taskTitle: string;
  finding: string;
  synopsis?: string;
  points: number;
  /** Faction-neutral social count (whimsy renders it as hearts, etc.). */
  endorsements: number;
  sealedAt: string;
}

/** ⑥ One member. Exactly one entry should carry `isSpotlight`. */
export interface FactionMember {
  id: string;
  name: string;
  role: string;
  level: number;
  points: number;
  isSpotlight: boolean;
}

/** The whole payload one faction page renders from. */
export interface FactionContract {
  slug: FactionSlug;
  name: string;
  archetype: FactionArchetype;
  established: number;
  identity: FactionIdentity;
  stats: FactionStats;
  viewer: FactionViewer;
  openTasks: FactionTask[];
  recentPraxis: FactionPraxis[];
  members: FactionMember[];
}
