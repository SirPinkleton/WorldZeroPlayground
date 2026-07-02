import type { FactionContract } from "../types";

/** The Ephemerists — the discordant map (illuminated codex: vellum + lapis + gold). */
export const ephemerists: FactionContract = {
  slug: "ephemerists",
  name: "The Ephemerists",
  archetype: "the discordant map",
  established: 2018,
  identity: {
    motto: "NOTHING · KEEPS",
    blurb:
      "World Zero's cartographers of the impermanent — keepers of a record that outlives the thing recorded. Every road forks, every map lies a little, and still we file the truth as we found it.",
    about: [
      "The Ephemerists walk the roads that don't stay put and chart the places that won't hold still. We take a survey, triangulate the disagreement between what a thing is and where it was, and file the finding to the codex before the world revises it.",
      "There are no members here, only keepers of the road. Take a survey, reconcile its three addresses, seal the truth as praxis, and let the codex weigh how well it holds.",
    ],
  },
  stats: { memberCount: 642, seasonRank: 5, praxisFiled: 3400, pointsAwarded: 58900 },
  viewer: {
    state: "prospective",
    eligible: false,
    role: "keeper · second road",
    requirement: {
      summary: "Keep filing the record",
      detail:
        "Walk the roads, triangulate what you find, and file it as praxis. The codex opens to those who keep the record — no petition, just pages.",
    },
  },
  openTasks: [
    { id: "t1", title: "Map a Place That Moved", description: "Chart somewhere that isn't where it was. Reconcile the three addresses — or prove you can't.", level: 3, points: 40 },
    { id: "t2", title: "Record a Vanishing", description: "Find something on its way out of the world. Document it before the world forgets.", level: 4, points: 60 },
    { id: "t3", title: "Walk a Road to Its End", description: "Follow a path until it stops being a path. Note precisely where the meaning gives out.", level: 2, points: 25 },
    { id: "t4", title: "Copy a Truth by Hand", description: "Transcribe one small fact so it survives you. Errors and all — those are the record too.", level: 1, points: 15 },
  ],
  recentPraxis: [
    { id: "p1", author: "Sabine Marchetti", taskTitle: "Map a Place That Moved", finding: "The House Was Never There", points: 40, endorsements: 341, sealedAt: "1d ago" },
    { id: "p2", author: "Corvin Ash", taskTitle: "Record a Vanishing", finding: "The Last Ferry, Logged", points: 60, endorsements: 208, sealedAt: "3d ago" },
    { id: "p3", author: "Lune Devereaux", taskTitle: "Walk a Road to Its End", finding: "It Ended in a Field", points: 25, endorsements: 96, sealedAt: "4d ago" },
  ],
  members: [
    { id: "m1", name: "Sabine Marchetti", role: "archivist · first road", level: 12, points: 4380, isSpotlight: true },
    { id: "m2", name: "Corvin Ash", role: "keeper · second road", level: 9, points: 2910, isSpotlight: false },
    { id: "m3", name: "Lune Devereaux", role: "keeper · second road", level: 8, points: 2540, isSpotlight: false },
    { id: "m4", name: "Bram Ostro", role: "wayfarer", level: 6, points: 1600, isSpotlight: false },
    { id: "m5", name: "Perpetua Vane", role: "wayfarer", level: 5, points: 1150, isSpotlight: false },
    { id: "m6", name: "Nix Halloran", role: "novice of the road", level: 3, points: 610, isSpotlight: false },
  ],
};
