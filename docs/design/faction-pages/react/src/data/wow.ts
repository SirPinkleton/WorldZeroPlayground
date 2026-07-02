import type { FactionContract } from "../types";

/** Warriors of Whimsy — whimsy.exe (magenta computer-witch bulletin board). */
export const wow: FactionContract = {
  slug: "wow",
  name: "Warriors of Whimsy",
  archetype: "whimsy.exe",
  established: 2021,
  identity: {
    motto: "A little magic, a lot of mischief.",
    blurb:
      "We make meaning from fragments — small acts of love, attention, and everyday enchantment. Cut, paste, and conjure something whole.",
    about: [
      "Warriors of Whimsy is World Zero's coven for the soft and the strange. We believe the smallest gestures — a jar of moonwater, a secret name for a stray cat, a flower pressed and forgotten — are the real magic.",
      "There are no spectators here, only witches mid-spell. Take a quest, do the tiny brave thing, seal what you made as praxis, and let the circle cheer you on.",
    ],
  },
  stats: { memberCount: 2418, seasonRank: 3, praxisFiled: 1890, pointsAwarded: 47200 },
  viewer: {
    state: "prospective",
    eligible: false,
    role: "witch · first circle",
    requirement: {
      summary: "The circle isn't open to you… yet",
      detail:
        "Keep doing whimsy quests. Bathe in moonlight. Whisper your name to a stray cat. The coven opens when it opens ✦",
    },
  },
  openTasks: [
    { id: "t1", title: "The L Word", description: "Find someone you love. Tell them you love them.", level: 1, points: 5 },
    { id: "t2", title: "Moonwater", description: "Leave a jar of water out under tonight's moon. Drink it at dawn.", level: 1, points: 5 },
    { id: "t3", title: "Pressed", description: "Press a flower in a book you'll forget about. Find it again next year.", level: 2, points: 10 },
    { id: "t4", title: "Trade Secret", description: "Swap something small with a stranger. A button, a stone, a wish.", level: 3, points: 25 },
  ],
  recentPraxis: [
    { id: "p1", author: "Pixie", taskTitle: "The L Word", finding: "I Told My Landlord", points: 6, endorsements: 88, sealedAt: "1d ago" },
    { id: "p2", author: "m0th", taskTitle: "Moonwater", finding: "Drank the Moon", points: 5, endorsements: 54, sealedAt: "2d ago" },
    { id: "p3", author: "Sprite", taskTitle: "Pressed", finding: "Found It Nine Years Later", points: 10, endorsements: 121, sealedAt: "4d ago" },
  ],
  members: [
    { id: "m1", name: "Pixie", role: "witch · first circle", level: 12, points: 4210, isSpotlight: true },
    { id: "m2", name: "m0th", role: "witch · second circle", level: 9, points: 2870, isSpotlight: false },
    { id: "m3", name: "Sprite", role: "witch · second circle", level: 8, points: 2540, isSpotlight: false },
    { id: "m4", name: "B4ndit", role: "apprentice", level: 6, points: 1620, isSpotlight: false },
    { id: "m5", name: "Willow", role: "apprentice", level: 5, points: 1180, isSpotlight: false },
    { id: "m6", name: "Cricket", role: "initiate", level: 3, points: 640, isSpotlight: false },
  ],
};
