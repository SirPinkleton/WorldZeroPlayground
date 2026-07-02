import type { FactionContract } from "../types";

/** Albescent — vellum correspondence (pure white, no colour, quiet secret order). */
export const albescent: FactionContract = {
  slug: "albescent",
  name: "Albescent",
  archetype: "vellum correspondence",
  established: 2022,
  identity: {
    motto: "We keep the record",
    blurb:
      "An unranked order that keeps what others let slip. We tend, we index, we witness — quietly, and without leaving a trace of ourselves in the work. The record is the point; we are not.",
    about: [
      "Albescent sits outside the rainbow, and outside the standings. We are World Zero's quiet order — keepers who retrieve, restore, and return, asking only that the record survive us. There is no leaderboard here worth minding, and no applause we would accept.",
      "There are no members here, only keepers. Take up a duty, attend it well, enter what you found into the record as praxis, and let the houses bear witness to how completely it was kept.",
    ],
  },
  // Albescent is unranked by design — seasonRank is null.
  stats: { memberCount: 88, seasonRank: null, praxisFiled: 1290, pointsAwarded: 21400 },
  viewer: {
    state: "prospective",
    eligible: false,
    role: "keeper · Third House",
    requirement: {
      summary: "Attend, and be seen attending",
      detail:
        "Keep taking up the quiet duties and returning them well. The Order extends its hand to those who tend the record without needing to be thanked — no petition, only practice.",
    },
  },
  openTasks: [
    { id: "t1", title: "Tend the Archive in Silence", description: "Retrieve, restore, and return. No record of your work need remain.", level: 3, points: 40 },
    { id: "t2", title: "Walk the Perimeter at Dusk", description: "Complete the circuit before darkness settles. Do not mark the path.", level: 2, points: 20 },
    { id: "t3", title: "Index the Unmarked Volumes", description: "Catalogue what has not been named. Add only what is necessary.", level: 4, points: 60 },
    { id: "t4", title: "Count the Objects Without Touching", description: "Account for every item. Disturb nothing. Report the number.", level: 1, points: 15 },
  ],
  recentPraxis: [
    { id: "p1", author: "Keeper Vane", taskTitle: "Tend the Archive in Silence", finding: "All Volumes Restored", points: 40, endorsements: 212, sealedAt: "1d ago" },
    { id: "p2", author: "Keeper Orin", taskTitle: "Index the Unmarked Volumes", finding: "Seventeen, Now Named", points: 60, endorsements: 148, sealedAt: "2d ago" },
    { id: "p3", author: "Keeper Marsh", taskTitle: "Walk the Perimeter at Dusk", finding: "The Circuit Holds", points: 20, endorsements: 74, sealedAt: "5d ago" },
  ],
  members: [
    { id: "m1", name: "Keeper Vane", role: "first keeper · Third House", level: 12, points: 3120, isSpotlight: true },
    { id: "m2", name: "Keeper Orin", role: "keeper · First House", level: 9, points: 2210, isSpotlight: false },
    { id: "m3", name: "Keeper Sel", role: "keeper · Second House", level: 8, points: 1980, isSpotlight: false },
    { id: "m4", name: "Keeper Marsh", role: "keeper · Fourth House", level: 6, points: 1240, isSpotlight: false },
    { id: "m5", name: "Keeper Wren", role: "attendant", level: 4, points: 720, isSpotlight: false },
    { id: "m6", name: "Keeper Ilse", role: "novice of the Order", level: 2, points: 280, isSpotlight: false },
  ],
};
