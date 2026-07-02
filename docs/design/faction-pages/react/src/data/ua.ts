import type { FactionContract } from "../types";

/** University of Asthmatics — gilt salon (burnt amber + antique gold art academy). */
export const ua: FactionContract = {
  slug: "ua",
  name: "University of Asthmatics",
  archetype: "gilt salon",
  established: 2020,
  identity: {
    motto: "Ars Longa · Spiritus Brevis",
    blurb:
      "World Zero's faction for those who make things — and occasionally need to sit down afterward. We commission work, hang it in the Salon, and subject it to the gentlest possible Critique. All media welcome. Bring an inhaler.",
    about: [
      "The University of Asthmatics keeps World Zero's easels warm. We post commissions, exhibit what comes back, and mark each piece with the kindest honest word we can find. Talent is optional here; showing up with something made is not.",
      "There are no spectators in the Salon, only artists between pieces. Accept a commission, make the work, hang it as praxis, and let the room look — closely, and kindly.",
    ],
  },
  stats: { memberCount: 214, seasonRank: 2, praxisFiled: 1890, pointsAwarded: 47200 },
  viewer: {
    state: "prospective",
    eligible: false,
    role: "exhibiting member · second easel",
    requirement: {
      summary: "Keep making, keep showing",
      detail:
        "Take commissions, hang your work in the Salon, turn up to a critique or two. The room notices who keeps showing up with something made — that's how the door opens.",
    },
  },
  openTasks: [
    { id: "t1", title: "Paint the quad at golden hour", description: "Capture the light before it leaves — any medium, any madness.", level: 3, points: 40 },
    { id: "t2", title: "Sculpt something that wheezes", description: "Kinetic, breathing, or merely dramatic. Critics' choice.", level: 4, points: 60 },
    { id: "t3", title: "Draw 100 hands before breakfast", description: "They will be bad. Draw them anyway. That is the assignment.", level: 2, points: 25 },
    { id: "t4", title: "Self-portrait, eyes closed", description: "No looking, no erasing. Submit the first honest line.", level: 1, points: 15 },
  ],
  recentPraxis: [
    { id: "p1", author: "Margot Sien", taskTitle: "Paint the quad at golden hour", finding: "Golden Hour, Held", points: 40, endorsements: 128, sealedAt: "1d" },
    { id: "p2", author: "Oswin Pell", taskTitle: "Sculpt something that wheezes", finding: "It Breathes", points: 60, endorsements: 74, sealedAt: "2d" },
    { id: "p3", author: "Bea Cortland", taskTitle: "Draw 100 hands before breakfast", finding: "Ninety-Four Hands", points: 25, endorsements: 41, sealedAt: "3d" },
    { id: "p4", author: "Theo Marsh", taskTitle: "Self-portrait, eyes closed", finding: "A Face I Half-Knew", points: 15, endorsements: 58, sealedAt: "5d" },
  ],
  members: [
    { id: "m1", name: "Margot Sien", role: "praeceptor · first easel", level: 12, points: 4210, isSpotlight: true },
    { id: "m2", name: "Oswin Pell", role: "exhibitor · second easel", level: 9, points: 2870, isSpotlight: false },
    { id: "m3", name: "Bea Cortland", role: "exhibitor · second easel", level: 8, points: 2540, isSpotlight: false },
    { id: "m4", name: "Theo Marsh", role: "apprentice", level: 6, points: 1620, isSpotlight: false },
    { id: "m5", name: "Iris Vane", role: "apprentice", level: 5, points: 1180, isSpotlight: false },
    { id: "m6", name: "Cael Roe", role: "novice of the first year", level: 3, points: 640, isSpotlight: false },
  ],
};
