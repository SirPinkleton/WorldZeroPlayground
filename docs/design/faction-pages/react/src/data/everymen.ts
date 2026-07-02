import type { FactionContract } from "../types";

/** The Everymen — union / victory poster (propaganda red + gold + press ink). */
export const everymen: FactionContract = {
  slug: "everymen",
  name: "The Everymen",
  archetype: "union poster",
  established: 2023,
  identity: {
    motto: "UNITED · WE · STAND",
    blurb:
      "Hard-working, down-to-earth, driven. We don't wait to be picked — we pick up the work that's in front of us, do it right, and finish what we start. Anyone willing to put in the shift belongs here.",
    about: [
      "The Everymen are World Zero's working faction — the ones who show up, roll up their sleeves, and get the shared work done. No heroes, no spectators. Just people who saw something that needed doing and did it.",
      "Take a call to mobilize, do the labor, report it as praxis, and let the ranks stamp their approval. The faction lives on what actually holds up.",
    ],
  },
  stats: { memberCount: 1204, seasonRank: 3, praxisFiled: 8640, pointsAwarded: 61800 },
  viewer: {
    state: "prospective",
    eligible: false,
    role: "hand · third shift",
    requirement: {
      summary: "Put in the shift",
      detail:
        "Keep answering the calls to mobilize and reporting your work. The ranks open to anyone who shows up and finishes what they start — no forms, just labor.",
    },
  },
  openTasks: [
    { id: "t1", title: "Break New Ground", description: "Clear a neglected patch of public land and plant something that feeds people.", level: 3, points: 25 },
    { id: "t2", title: "Hold the Line", description: "Keep a shared community resource running for thirty straight days. No gaps, no excuses.", level: 4, points: 50 },
    { id: "t3", title: "Mend What Breaks", description: "Find something broken in a space everyone uses. Fix it properly — the kind of fix that lasts.", level: 2, points: 15 },
    { id: "t4", title: "Raise the Barn", description: "Rally four neighbors and build something none of you could build alone. One afternoon.", level: 1, points: 10 },
  ],
  recentPraxis: [
    { id: "p1", author: "Rivet", taskTitle: "Hold the Line", finding: "Thirty Days, No Gaps", points: 50, endorsements: 214, sealedAt: "2d ago" },
    { id: "p2", author: "Salt", taskTitle: "Break New Ground", finding: "The Lot Feeds Forty", points: 25, endorsements: 96, sealedAt: "3d ago" },
    { id: "p3", author: "Ada Kline", taskTitle: "Mend What Breaks", finding: "The Bridge Rail Holds", points: 15, endorsements: 58, sealedAt: "5d ago" },
  ],
  members: [
    { id: "m1", name: "Rivet", role: "steward · first shift", level: 12, points: 4520, isSpotlight: true },
    { id: "m2", name: "Salt", role: "hand · second shift", level: 9, points: 2980, isSpotlight: false },
    { id: "m3", name: "Ada Kline", role: "hand · second shift", level: 8, points: 2610, isSpotlight: false },
    { id: "m4", name: "Bo Tran", role: "hand · third shift", level: 6, points: 1680, isSpotlight: false },
    { id: "m5", name: "June Okafor", role: "recruit", level: 5, points: 1210, isSpotlight: false },
    { id: "m6", name: "Wells", role: "recruit", level: 3, points: 620, isSpotlight: false },
  ],
};
