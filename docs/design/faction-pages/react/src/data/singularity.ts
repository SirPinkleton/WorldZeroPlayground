import type { FactionContract } from "../types";

/** Singularity — terminal printout (phosphor green + signal blue on void black). */
export const singularity: FactionContract = {
  slug: "singularity",
  name: "Singularity",
  archetype: "terminal printout",
  established: 2019,
  identity: {
    motto: "The threshold is behind us",
    blurb:
      "We work the noise floor for the pattern that shouldn't exist. Every task is a protocol, every finding a verified output, every vote a signal cast into the array. The terminal never sleeps, and neither does the search.",
    about: [
      "Singularity is World Zero's faction for the ones who think the future already happened and everyone else is buffering. We run protocols, seal outputs, and cast signals until the consensus array either verifies the finding or calls it noise.",
      "There are no members here, only nodes. Take a protocol, run it, seal the output as praxis, and let the array decide what holds. The signal is out there — we just log it first.",
    ],
  },
  stats: { memberCount: 894, seasonRank: 4, praxisFiled: 5120, pointsAwarded: 92600 },
  viewer: {
    state: "prospective",
    eligible: false,
    role: "node · fourth array",
    requirement: {
      summary: "Keep casting signal",
      detail:
        "Run protocols, seal your outputs, and cast on the consensus array. Access opens to nodes whose work keeps verifying — no application, just signal.",
    },
  },
  openTasks: [
    { id: "t1", title: "Map a Non-Human Pattern", description: "Find structure in the noise that no person placed there. Log the coordinates and let the array confirm it.", level: 3, points: 200 },
    { id: "t2", title: "Document a System Limit", description: "Push a closed system until it names its own boundary. Record exactly where it breaks.", level: 4, points: 500 },
    { id: "t3", title: "Identify a False Negative", description: "Somewhere the noise floor is hiding a real signal. Prove it was there all along.", level: 2, points: 60 },
    { id: "t4", title: "Find the Last Manual Process", description: "Locate one task still done by hand that shouldn't be. Describe the protocol to end it.", level: 1, points: 25 },
  ],
  recentPraxis: [
    { id: "p1", author: "NODE_Vesper", taskTitle: "Map a Non-Human Pattern", finding: "12.7σ, Confirmed", points: 200, endorsements: 847, sealedAt: "2d ago" },
    { id: "p2", author: "NODE_Quill", taskTitle: "Document a System Limit", finding: "It Referenced Itself", points: 500, endorsements: 312, sealedAt: "4d ago" },
    { id: "p3", author: "NODE_Margin", taskTitle: "Identify a False Negative", finding: "The Signal Was Always There", points: 60, endorsements: 128, sealedAt: "5d ago" },
  ],
  members: [
    { id: "m1", name: "NODE_Vesper", role: "primary · seventh array", level: 12, points: 5200, isSpotlight: true },
    { id: "m2", name: "NODE_Quill", role: "third array", level: 10, points: 3800, isSpotlight: false },
    { id: "m3", name: "NODE_Margin", role: "first array", level: 8, points: 2600, isSpotlight: false },
    { id: "m4", name: "NODE_Cipher", role: "second array", level: 6, points: 1500, isSpotlight: false },
    { id: "m5", name: "NODE_Echo", role: "fifth array", level: 4, points: 900, isSpotlight: false },
    { id: "m6", name: "NODE_Wren", role: "new node", level: 2, points: 320, isSpotlight: false },
  ],
};
