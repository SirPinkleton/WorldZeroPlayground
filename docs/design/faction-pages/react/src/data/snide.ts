import type { FactionContract } from "../types";

/** S.N.I.D.E. — ransom dispatch (acid green + hot pink photocopier punk). */
export const snide: FactionContract = {
  slug: "snide",
  name: "S.N.I.D.E.",
  archetype: "ransom dispatch",
  established: 2020,
  identity: {
    motto: "Nothing matters — do it anyway.",
    blurb:
      "We're the rainbow's loose thread. Pointless? Obviously. But if nothing matters, you might as well do a kickflip off the system. We make trouble that's funny, mostly harmless, and impossible to ignore.",
    about: [
      "S.N.I.D.E. is where World Zero keeps its menaces. No leaderboards we respect, no missions we take seriously, no skateboard required. We do small, loud, gleeful things that make the world 4% weirder and nobody any poorer.",
      "There are no members here, only accomplices. Take a job, cause a scene, seal the evidence as praxis, and let the rest of us pretend we don't know you.",
    ],
  },
  stats: { memberCount: 1337, seasonRank: 7, praxisFiled: 8088, pointsAwarded: 74200 },
  viewer: {
    state: "prospective",
    eligible: false,
    role: "accomplice · in too deep",
    requirement: {
      summary: "Nice try. Not yet.",
      detail:
        "Cause a little more trouble. Get seen breaking one (1) minor rule. The door was never locked — you just have to actually want in.",
    },
  },
  openTasks: [
    { id: "t1", title: "DO A KICKFLIP", description: "Do a kickflip. Bonus if you don't use a skateboard. Double if nobody asked you to.", level: 2, points: 25 },
    { id: "t2", title: "FIX A SIGN", description: "Borrow the letters off a public sign. Spell something kinder. Put it back by dawn.", level: 3, points: 40 },
    { id: "t3", title: "SPREAD A LIE", description: "Start a flattering, false rumor about yourself. Tell exactly one person, then walk away.", level: 1, points: 10 },
    { id: "t4", title: "SILENT RIOT", description: "Gather five accomplices. Be absolutely furious about something. Make no sound at all.", level: 4, points: 60 },
  ],
  recentPraxis: [
    { id: "p1", author: "Static", taskTitle: "FIX A SIGN", finding: "It Now Reads BE KIND", points: 40, endorsements: 212, sealedAt: "3h ago" },
    { id: "p2", author: "Doomscroll", taskTitle: "SPREAD A LIE", finding: "I Invented Tuesdays", points: 10, endorsements: 88, sealedAt: "1d ago" },
    { id: "p3", author: "Glitter Riot", taskTitle: "SILENT RIOT", finding: "Five Of Us, Furious, Silent", points: 60, endorsements: 341, sealedAt: "2d ago" },
  ],
  members: [
    { id: "m1", name: "Static", role: "ringleader · wanted", level: 11, points: 3900, isSpotlight: true },
    { id: "m2", name: "Doomscroll", role: "instigator", level: 8, points: 2410, isSpotlight: false },
    { id: "m3", name: "Glitter Riot", role: "accomplice", level: 7, points: 2080, isSpotlight: false },
    { id: "m4", name: "Void", role: "lookout", level: 5, points: 1240, isSpotlight: false },
    { id: "m5", name: "Hex", role: "fresh menace", level: 3, points: 560, isSpotlight: false },
    { id: "m6", name: "Muddle", role: "fresh menace", level: 2, points: 300, isSpotlight: false },
  ],
};
