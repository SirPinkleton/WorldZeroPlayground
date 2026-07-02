import type { FactionContract, FactionSlug } from "../types";
import { ua } from "./ua";
import { wow } from "./wow";
import { snide } from "./snide";
import { ephemerists } from "./ephemerists";
import { singularity } from "./singularity";
import { everymen } from "./everymen";
import { albescent } from "./albescent";

/** Every sample contract, keyed by slug. */
export const ALL_FACTIONS: Record<FactionSlug, FactionContract> = {
  ua,
  wow,
  snide,
  ephemerists,
  singularity,
  everymen,
  albescent,
};

/** The rainbow spine order (Albescent sits outside it, last). */
export const FACTION_ORDER: FactionSlug[] = [
  "ua",
  "wow",
  "snide",
  "ephemerists",
  "singularity",
  "everymen",
  "albescent",
];
