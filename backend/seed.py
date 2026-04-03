"""
Seed script for World Zero — creates factions, accounts, characters, tasks,
submissions (praxis), and votes with correct point/level totals.

Run from /backend:
    python seed.py

Scoring formula (ERA_1):
    submission_score = avg_stars * task.point_value
    character.score  = sum of all their submission scores
    level thresholds = (0, 10, 70, 170, 330, 610, 1090, 1840, 3040)
    vote_budget      = 100 + floor(2.0 * score)
"""

import asyncio
from math import floor

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from config import settings
from game_config import ERA_1
from models.account import Account, OAuthProvider
from models.character import Character
from models.faction import Faction
from models.submission import Submission
from models.task import Task, TaskStatus, CharacterTask, CharacterTaskStatus
from models.vote import Vote


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def compute_level(score: int) -> int:
    for level, threshold in reversed(list(enumerate(ERA_1.level_thresholds))):
        if score >= threshold:
            return level
    return 0


def compute_vote_budget(score: int) -> int:
    return ERA_1.vote_budget_base + floor(ERA_1.vote_budget_multiplier * score)


# ---------------------------------------------------------------------------
# Seed data definitions
# ---------------------------------------------------------------------------

FACTIONS = [
    ("ua",           "UA",               "The default starting faction. Full points on all tasks. Must leave at level 3."),
    ("ua_masters",   "UA Masters",        "Veterans who aged out of UA. Can sign up for any task at reduced points."),
    ("snide",        "Snide",             "Specialists in one-on-one competition. Bonus points for winning duels."),
    ("gestalt",      "Gestalt",           "Collective-minded. Excel at their own faction's tasks; reduced elsewhere."),
    ("journeymen",   "Journeymen",        "Explorers with access to select retired tasks (Task Vision ability)."),
    ("analog",       "Analog",            "Depth over breadth. Can repeat one task per level for points (Double Dipper)."),
    ("singularity",  "Singularity",       "TBD"),
    ("albescent",    "/Albescent",        "Full points and any meta tasks from any group. Unlock-only."),
    ("aged_out",     "AgedOutOfUA",       "Placeholder faction for characters who hit level 3 while offline."),
]

# (username, display_name, bio, faction_slug, email)
CHARACTERS_DEF = [
    ("corvus_king",  "Corvus King",   "Veteran player. Been here since day one. Journeymen for life.",         "journeymen",  "corvus@example.com"),
    ("sable_ink",    "Sable Ink",     "Competitive by nature. Snide suits me perfectly.",                       "snide",       "sable@example.com"),
    ("terra_nova",   "Terra Nova",    "Gestalt collective mindset. Stronger together.",                          "gestalt",     "terra@example.com"),
    ("pixel_drift",  "Pixel Drift",   "Analog through and through. Depth over breadth, always.",                "analog",      "pixel@example.com"),
    ("echo_field",   "Echo Field",    "Still figuring out my faction. UA for now.",                             "ua",          "echo@example.com"),
    ("marble_run",   "Marble Run",    "Gestalt resonates with me — community over everything.",                  "gestalt",     "marble@example.com"),
    ("flux_state",   "Flux State",    "New here. Excited to see what this is all about.",                       "ua",          "flux@example.com"),
    ("ghost_mile",   "Ghost Mile",    "Joined recently. Journeymen called to me.",                              "journeymen",  "ghost@example.com"),
]

# (title, description, faction_slug, point_value, level_required, status, created_by_username)
TASKS_DEF = [
    # Level 0 — active
    ("Write a Letter to Your Past Self",
     "Write a thoughtful letter to yourself from five years ago. What would you tell them? What do you wish you had known? Post a photo or typed excerpt as proof.",
     "ua", 10, 0, "active", "corvus_king"),

    ("Take a 30-Minute Walk Outdoors",
     "Get outside and walk for at least 30 consecutive minutes. No headphones required — just you and the world. Post a photo from somewhere along the way.",
     "journeymen", 8, 0, "active", "corvus_king"),

    ("Cook a Meal From Scratch",
     "Prepare a full meal using at least five fresh ingredients. No pre-made sauces, no shortcuts. Post a photo of the finished dish.",
     "analog", 12, 0, "active", "pixel_drift"),

    ("Tell a Story Through a Single Photo",
     "Take one photograph that communicates a complete narrative without any caption. Submit the photo and a one-sentence explanation of what you intended the viewer to feel.",
     "gestalt", 10, 0, "active", "terra_nova"),

    ("Introduce Yourself to a Stranger",
     "Strike up a genuine conversation with someone you have never met. Could be a neighbour, someone at a café, or anyone in public. Write a short account of how it went.",
     "snide", 10, 0, "active", "sable_ink"),

    # Level 1 — active
    ("Run a 5K",
     "Complete a 5-kilometre run outdoors or on a track. Post your time and a screenshot or photo of your route/result.",
     "journeymen", 20, 1, "active", "corvus_king"),

    ("Learn 10 Words in a New Language",
     "Pick a language you do not speak and learn ten vocabulary words well enough to use them in a sentence. Record yourself or write the sentences as proof.",
     "analog", 15, 1, "active", "pixel_drift"),

    ("Attend a Community Event",
     "Go to any event organised for your local community — a town hall, sports match, open mic, festival, or similar. Post a photo and two sentences about what you experienced.",
     "gestalt", 18, 1, "active", "terra_nova"),

    # Level 2 — active
    ("Volunteer for 4 Hours",
     "Give four hours of your time to an organisation, cause, or neighbour who needs help. Document it with a photo and a brief description of what you did.",
     "ua", 30, 2, "active", "sable_ink"),

    ("Teach Someone a Skill You Have",
     "Identify a skill you are genuinely good at and teach it to another person in a structured session. Minimum 30 minutes. Post evidence of the session.",
     "gestalt", 25, 2, "active", "terra_nova"),

    # Level 3 — active
    ("Complete a 30-Day Habit Challenge",
     "Choose one habit and do it every single day for 30 days. Log each day (photo, note, or tracker screenshot). Submit the full log at the end.",
     "analog", 50, 3, "active", "corvus_king"),

    # Level 3 — retired
    ("Organise a Neighbourhood Cleanup",
     "Rally at least three people (including yourself) to clean a shared outdoor space. Post before-and-after photos.",
     "journeymen", 40, 3, "retired", "echo_field"),

    # Level 0 — pending (proposed, not yet approved)
    ("Read a Book Outside Your Usual Genre",
     "Pick up a book from a genre you would normally never read and finish it. Post the cover and a short review.",
     "ua", 10, 0, "pending", "echo_field"),

    ("Host a Game Night with Friends",
     "Organise and host a board game or card game night with at least three other people. Photo proof required.",
     "gestalt", 12, 0, "pending", "marble_run"),
]


# Votes: (submission_index, voter_username, stars)
# submission_index refers to the position in SUBMISSIONS_DEF below.
# Voter must be on a DIFFERENT account than the submission author.
#
# Scoring verification:
#   corvus_king:  50+40+60+100+150+250 = 650  >Level 5
#   sable_ink:    45+100+135+100       = 380  >Level 4
#   terra_nova:   50+81+75             = 206  >Level 3
#   pixel_drift:  60+60+50+100         = 270  >Level 3
#   echo_field:   40+40+30             = 110  >Level 2
#   marble_run:   45+63                = 108  >Level 2
#   flux_state:   30                   = 30   >Level 1
#   ghost_mile:   16                   = 16   >Level 1

# (task_title, character_username, submission_title, body_text)
SUBMISSIONS_DEF = [
    # --- corvus_king (target 650 pts) ---
    # Sub 0: "Write a Letter..." × 10 pts, avg 5.0 → 50 pts
    ("Write a Letter to Your Past Self", "corvus_king",
     "Dear Twenty-Year-Old Me",
     "I sat down with a mug of tea and wrote three pages to my younger self. Told him to stop waiting for permission. Told him the anxiety gets quieter. Told him the friendships he's about to lose were not his fault. Strange how clearly you can see things from a distance."),

    # Sub 1: "Take a 30-Minute Walk..." × 8 pts, avg 5.0 → 40 pts
    ("Take a 30-Minute Walk Outdoors", "corvus_king",
     "Canal Walk at Golden Hour",
     "Left my phone in my pocket for the first 20 minutes. Just walked. The canal was glassy and there was a heron standing perfectly still on the far bank. I nearly missed it because I was looking at my feet. Glad I looked up."),

    # Sub 2: "Cook a Meal From Scratch" × 12 pts, avg 5.0 → 60 pts
    ("Cook a Meal From Scratch", "corvus_king",
     "Lamb Tagine With Seven Vegetables",
     "Ras el hanout from scratch, lamb shoulder braised for three hours, seven vegetables chopped small. The house smelled incredible. Served with couscous and a yoghurt sauce I improvised. Ate it over two days and it got better each time."),

    # Sub 3: "Run a 5K" × 20 pts, avg 5.0 → 100 pts
    ("Run a 5K", "corvus_king",
     "5K in the Rain — 24:17",
     "Did not want to go. Went anyway. Rained the whole time and I felt incredible for the last kilometre. 24:17 — not fast, but consistent. Screenshot attached. Will aim for sub-24 next time."),

    # Sub 4: "Volunteer for 4 Hours" × 30 pts, avg 5.0 → 150 pts
    ("Volunteer for 4 Hours", "corvus_king",
     "Four Hours at the Food Bank",
     "Sorted donations, packed boxes, stacked shelves. The woman running it has been doing this every Saturday for eleven years. Put my four hours into perspective pretty quickly. Will go back."),

    # Sub 5: "Complete a 30-Day Habit Challenge" × 50 pts, avg 5.0 → 250 pts
    ("Complete a 30-Day Habit Challenge", "corvus_king",
     "30 Days of Cold Showers — Full Log",
     "Day 1 was awful. Day 7 was less awful. By day 15 I was annoyed when the hot kicked in first. By day 30 I had stopped thinking about it entirely. Full daily log attached — each entry is one sentence. The habit stuck. Still going."),

    # --- sable_ink (target 380 pts) ---
    # Sub 6: "Introduce Yourself..." × 10 pts, avg 4.5 → 45 pts
    ("Introduce Yourself to a Stranger", "sable_ink",
     "The Man Waiting for the Same Bus",
     "He was reading a physical newspaper — actually reading it, not just holding it. I asked what was worth reading these days. We talked for twenty minutes. He recommended a documentary. I watched it that night. 10/10 task."),

    # Sub 7: "Run a 5K" × 20 pts, avg 5.0 → 100 pts
    ("Run a 5K", "sable_ink",
     "First Sub-22 — 21:54",
     "PR. Not going to write a lot. 21:54. I've been chasing this for eight months. The last 800m I wanted to stop and then I didn't. Photo of watch attached."),

    # Sub 8: "Volunteer for 4 Hours" × 30 pts, avg 4.5 → 135 pts
    ("Volunteer for 4 Hours", "sable_ink",
     "Coaching Junior Football — Saturday Morning",
     "Helped a friend coach the under-10s for a full Saturday morning session. Four and a half hours including setup and cleanup. These kids are chaotic and wonderful. Three of them scored their first ever goals. Would do this every week if I could."),

    # Sub 9: "Teach Someone a Skill You Have" × 25 pts, avg 4.0 → 100 pts
    ("Teach Someone a Skill You Have", "sable_ink",
     "Teaching My Sister to Pick a Lock (for emergencies)",
     "Yes, legally. We sat at the kitchen table with a practice lock and a set of picks for two hours. By the end she could open it in under four minutes. Taught her the single-pin method. We also talked about why I know how to do this, which was a longer conversation."),

    # --- terra_nova (target 206 pts) ---
    # Sub 10: "Tell a Story..." × 10 pts, avg 5.0 → 50 pts
    ("Tell a Story Through a Single Photo", "terra_nova",
     "Intention: Waiting",
     "Took this at a train station at 6am. An elderly man sitting alone with a single suitcase, perfectly upright, looking at nothing. I wanted to feel: anticipation mixed with loneliness. I think it works."),

    # Sub 11: "Attend a Community Event" × 18 pts, avg 4.5 → 81 pts
    ("Attend a Community Event", "terra_nova",
     "Local Council Open Forum",
     "Did not expect to stay for the whole thing. Did. A proposal about cycle lanes turned into a two-hour conversation about what kind of place people wanted to live in. I spoke once, badly, but I spoke. Glad I went."),

    # Sub 12: "Teach Someone a Skill You Have" × 25 pts, avg 3.0 → 75 pts
    ("Teach Someone a Skill You Have", "terra_nova",
     "An Hour of Bouldering Basics",
     "Took a friend who had never climbed before to the local wall. We did 45 minutes of technique on the slab — footwork, weight distribution, reading the route before touching it. They topped their first V1 by the end. I am not a great teacher but they were patient with me."),

    # --- pixel_drift (target 270 pts) ---
    # Sub 13: "Cook a Meal From Scratch" × 12 pts, avg 5.0 → 60 pts
    ("Cook a Meal From Scratch", "pixel_drift",
     "Miso-Glazed Aubergine With Pickled Cucumber",
     "Made the miso glaze, roasted the aubergines until they collapsed, quick-pickled cucumber with rice vinegar and sesame. Served over short-grain rice. It looked better than anything I have ordered in a restaurant this year."),

    # Sub 14: "Learn 10 Words in a New Language" × 15 pts, avg 4.0 → 60 pts
    ("Learn 10 Words in a New Language", "pixel_drift",
     "10 Japanese Words I Will Actually Use",
     "Chose Japanese. Focused on words for texture and sensation because that felt useful. Learned: nameraka, zarazara, fuwa-fuwa, karimeri, tsuru-tsuru, and five more. Said them out loud 50 times each. Recorded myself — attached. My accent is rough but I know what they mean."),

    # Sub 15: "Write a Letter to Your Past Self" × 10 pts, avg 5.0 → 50 pts
    ("Write a Letter to Your Past Self", "pixel_drift",
     "Hey, Sixteen",
     "Kept it short. Told them three things: the thing you are most ashamed of right now will seem very small later. Stop performing confidence, it is exhausting. Also: learn to cook earlier, you will wish you had."),

    # Sub 16: "Complete a 30-Day Habit Challenge" × 50 pts, avg 2.0 → 100 pts
    ("Complete a 30-Day Habit Challenge", "pixel_drift",
     "30 Days of Drawing — Partial Log",
     "I committed to drawing for 15 minutes every day. I made it 30 days but some of the work is genuinely bad. Posting anyway. The log has 30 entries — days 11-15 are particularly rough. I think that is the point. Growth is ugly in the middle."),

    # --- echo_field (target 110 pts) ---
    # Sub 17: "Take a 30-Minute Walk..." × 8 pts, avg 5.0 → 40 pts
    ("Take a 30-Minute Walk Outdoors", "echo_field",
     "Walking Without a Destination",
     "Picked a direction at my front door and walked for 35 minutes. Ended up in a part of my neighbourhood I have lived near for three years and never visited. Found a small park with a very old oak tree. Sat under it for five minutes. Walked back."),

    # Sub 18: "Tell a Story Through a Single Photo" × 10 pts, avg 4.0 → 40 pts
    ("Tell a Story Through a Single Photo", "echo_field",
     "Intention: Aftermath",
     "Photo of an empty kitchen table after a dinner party. Glasses half-finished, one chair pushed back at an angle, a tea towel abandoned in the middle. Wanted to suggest a specific kind of warmth — the feeling after people you love have just left."),

    # Sub 19: "Introduce Yourself to a Stranger" × 10 pts, avg 3.0 → 30 pts
    ("Introduce Yourself to a Stranger", "echo_field",
     "Coffee Queue Conversation",
     "Spoke to the person behind me while waiting for coffee. We talked about whether it is weird to go to films alone (it is not). It lasted maybe four minutes. Not every conversation has to be profound. This one was just fine, and fine is good."),

    # --- marble_run (target 108 pts) ---
    # Sub 20: "Tell a Story Through a Single Photo" × 10 pts, avg 4.5 → 45 pts
    ("Tell a Story Through a Single Photo", "marble_run",
     "Intention: Transition",
     "A child's bicycle leaning against a wall, alone, with a shadow twice its size. Wanted to suggest growth — something becoming more than itself. The shadow does most of the work."),

    # Sub 21: "Attend a Community Event" × 18 pts, avg 3.5 → 63 pts
    ("Attend a Community Event", "marble_run",
     "The Street Market and What I Learned",
     "Went to a local farmers' market for the first time. Talked to four stallholders for more than thirty seconds each. Learned how difficult the economics are for small producers. Came home with a jar of honey and a lot to think about."),

    # --- flux_state (target 30 pts) ---
    # Sub 22: "Write a Letter..." × 10 pts, avg 3.0 → 30 pts
    ("Write a Letter to Your Past Self", "flux_state",
     "To the Me Who Was Scared",
     "Short letter. Mostly I told myself: you were not wrong to be scared, you were just wrong about what the scary thing was. Things got complicated in a different direction than I feared. That somehow made it easier."),

    # --- ghost_mile (target 16 pts) ---
    # Sub 23: "Take a 30-Minute Walk..." × 8 pts, avg 2.0 → 16 pts
    ("Take a 30-Minute Walk Outdoors", "ghost_mile",
     "First Task Done",
     "Went for a walk. It was fine. 32 minutes. I took a photo of a pigeon. I am not sure what I am doing yet but I am here."),
]


# Votes: (sub_index, voter_username, stars)
VOTES_DEF = [
    # corvus_king's submissions (subs 0-5)
    # Sub 0 "Write a Letter" — avg 5.0 → 50 pts
    (0, "sable_ink",   5),
    (0, "terra_nova",  5),
    (0, "pixel_drift", 5),
    (0, "echo_field",  5),
    (0, "marble_run",  5),

    # Sub 1 "Take a Walk" — avg 5.0 → 40 pts
    (1, "sable_ink",   5),
    (1, "terra_nova",  5),
    (1, "echo_field",  5),
    (1, "marble_run",  5),

    # Sub 2 "Cook a Meal" — avg 5.0 → 60 pts
    (2, "sable_ink",   5),
    (2, "terra_nova",  5),
    (2, "pixel_drift", 5),
    (2, "echo_field",  5),
    (2, "marble_run",  5),

    # Sub 3 "Run a 5K" — avg 5.0 → 100 pts
    (3, "sable_ink",   5),
    (3, "terra_nova",  5),
    (3, "pixel_drift", 5),
    (3, "echo_field",  5),
    (3, "marble_run",  5),

    # Sub 4 "Volunteer 4h" — avg 5.0 → 150 pts
    (4, "sable_ink",   5),
    (4, "terra_nova",  5),
    (4, "pixel_drift", 5),
    (4, "echo_field",  5),
    (4, "marble_run",  5),

    # Sub 5 "30-Day Habit" — avg 5.0 → 250 pts
    (5, "sable_ink",   5),
    (5, "terra_nova",  5),
    (5, "pixel_drift", 5),
    (5, "echo_field",  5),
    (5, "marble_run",  5),

    # sable_ink's submissions (subs 6-9)
    # Sub 6 "Introduce Yourself" — avg 4.5 → 45 pts  (5+4+4+5)/4=4.5
    (6, "corvus_king", 5),
    (6, "terra_nova",  4),
    (6, "pixel_drift", 4),
    (6, "echo_field",  5),

    # Sub 7 "Run a 5K" — avg 5.0 → 100 pts
    (7, "corvus_king", 5),
    (7, "terra_nova",  5),
    (7, "pixel_drift", 5),
    (7, "marble_run",  5),

    # Sub 8 "Volunteer 4h" — avg 4.5 → 135 pts  (5+4+4+5)/4=4.5
    (8, "corvus_king", 5),
    (8, "terra_nova",  4),
    (8, "pixel_drift", 4),
    (8, "echo_field",  5),

    # Sub 9 "Teach Someone" — avg 4.0 → 100 pts
    (9, "corvus_king", 4),
    (9, "terra_nova",  4),
    (9, "pixel_drift", 4),
    (9, "echo_field",  4),

    # terra_nova's submissions (subs 10-12)
    # Sub 10 "Tell a Story" — avg 5.0 → 50 pts
    (10, "corvus_king", 5),
    (10, "sable_ink",   5),
    (10, "pixel_drift", 5),
    (10, "echo_field",  5),
    (10, "marble_run",  5),

    # Sub 11 "Attend Community Event" — avg 4.5 → 81 pts  (5+4+4+5)/4=4.5
    (11, "corvus_king", 5),
    (11, "sable_ink",   4),
    (11, "pixel_drift", 4),
    (11, "marble_run",  5),

    # Sub 12 "Teach Someone" — avg 3.0 → 75 pts
    (12, "corvus_king", 3),
    (12, "sable_ink",   3),
    (12, "pixel_drift", 3),
    (12, "echo_field",  3),

    # pixel_drift's submissions (subs 13-16)
    # Sub 13 "Cook a Meal" — avg 5.0 → 60 pts
    (13, "corvus_king", 5),
    (13, "sable_ink",   5),
    (13, "terra_nova",  5),
    (13, "echo_field",  5),
    (13, "marble_run",  5),

    # Sub 14 "Learn 10 Words" — avg 4.0 → 60 pts
    (14, "corvus_king", 4),
    (14, "sable_ink",   4),
    (14, "terra_nova",  4),
    (14, "echo_field",  4),

    # Sub 15 "Write a Letter" — avg 5.0 → 50 pts
    (15, "corvus_king", 5),
    (15, "sable_ink",   5),
    (15, "terra_nova",  5),
    (15, "marble_run",  5),

    # Sub 16 "30-Day Habit" — avg 2.0 → 100 pts
    (16, "corvus_king", 2),
    (16, "sable_ink",   2),
    (16, "terra_nova",  2),
    (16, "echo_field",  2),

    # echo_field's submissions (subs 17-19)
    # Sub 17 "Take a Walk" — avg 5.0 → 40 pts
    (17, "corvus_king", 5),
    (17, "sable_ink",   5),
    (17, "terra_nova",  5),
    (17, "pixel_drift", 5),

    # Sub 18 "Tell a Story" — avg 4.0 → 40 pts
    (18, "corvus_king", 4),
    (18, "sable_ink",   4),
    (18, "terra_nova",  4),
    (18, "pixel_drift", 4),

    # Sub 19 "Introduce Yourself" — avg 3.0 → 30 pts
    (19, "corvus_king", 3),
    (19, "sable_ink",   3),
    (19, "terra_nova",  3),
    (19, "pixel_drift", 3),

    # marble_run's submissions (subs 20-21)
    # Sub 20 "Tell a Story" — avg 4.5 → 45 pts  (4+5+5+4)/4=4.5
    (20, "corvus_king", 4),
    (20, "sable_ink",   5),
    (20, "terra_nova",  5),
    (20, "pixel_drift", 4),

    # Sub 21 "Attend Community Event" — avg 3.5 → 63 pts  (3+4+4+3)/4=3.5
    (21, "corvus_king", 3),
    (21, "sable_ink",   4),
    (21, "terra_nova",  4),
    (21, "pixel_drift", 3),

    # flux_state's submissions (sub 22)
    # Sub 22 "Write a Letter" — avg 3.0 → 30 pts
    (22, "corvus_king", 3),
    (22, "sable_ink",   3),
    (22, "terra_nova",  3),

    # ghost_mile's submissions (sub 23)
    # Sub 23 "Take a Walk" — avg 2.0 → 16 pts
    (23, "corvus_king", 2),
    (23, "sable_ink",   2),
]


# Expected final scores (for verification output)
EXPECTED_SCORES = {
    "corvus_king": 650,   # Level 5
    "sable_ink":   380,   # Level 4
    "terra_nova":  206,   # Level 3
    "pixel_drift": 270,   # Level 3
    "echo_field":  110,   # Level 2
    "marble_run":  108,   # Level 2
    "flux_state":   30,   # Level 1
    "ghost_mile":   16,   # Level 1
}


# ---------------------------------------------------------------------------
# Main seed function
# ---------------------------------------------------------------------------

async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        print("Seeding World Zero...\n")

        # ------------------------------------------------------------------
        # 1. Factions
        # ------------------------------------------------------------------
        print("  >Factions")
        factions = []
        for slug, name, desc in FACTIONS:
            f = Faction(slug=slug, name=name, description=desc)
            session.add(f)
            factions.append(f)
        await session.flush()

        # ------------------------------------------------------------------
        # 2. Accounts + Characters (first pass — score=0, level=0)
        # ------------------------------------------------------------------
        print("  >Accounts & Characters")
        char_map: dict[str, Character] = {}
        account_map: dict[str, Account] = {}

        for username, display_name, bio, faction_slug, email in CHARACTERS_DEF:
            acc = Account(email=email, is_active=True)
            session.add(acc)
            await session.flush()

            # Dummy OAuth provider row so the account looks legitimate
            oauth = OAuthProvider(
                account_id=acc.id,
                provider="google",
                provider_user_id=f"google_{username}",
                access_token="seed_token",
            )
            session.add(oauth)

            char = Character(
                account_id=acc.id,
                username=username,
                display_name=display_name,
                bio=bio,
                faction_slug=faction_slug,
                level=0,
                score=0,
                all_time_score=0,
                votes_available=ERA_1.vote_budget_base,
            )
            session.add(char)
            await session.flush()

            char_map[username] = char
            account_map[username] = acc

        # ------------------------------------------------------------------
        # 3. Tasks
        # ------------------------------------------------------------------
        print("  >Tasks")
        task_map: dict[str, Task] = {}   # keyed by title

        for title, desc, faction_slug, pts, level_req, status_str, creator_username in TASKS_DEF:
            task = Task(
                title=title,
                description=desc,
                point_value=pts,
                level_required=level_req,
                status=TaskStatus[status_str],
                created_by=char_map[creator_username].id,
                primary_faction_slug=faction_slug,
                is_task_vision_eligible=False,
            )
            session.add(task)
            await session.flush()
            task_map[title] = task

        # ------------------------------------------------------------------
        # 4. Submissions
        # ------------------------------------------------------------------
        print("  >Submissions")
        submissions: list[Submission] = []

        for task_title, char_username, sub_title, body in SUBMISSIONS_DEF:
            task = task_map[task_title]
            char = char_map[char_username]

            # Mark the character as having submitted this task
            ct = CharacterTask(
                character_id=char.id,
                task_id=task.id,
                status=CharacterTaskStatus.submitted,
            )
            session.add(ct)

            sub = Submission(
                task_id=task.id,
                character_id=char.id,
                title=sub_title,
                body_text=body,
            )
            session.add(sub)
            await session.flush()
            submissions.append(sub)

        # ------------------------------------------------------------------
        # 5. Votes
        # ------------------------------------------------------------------
        print("  >Votes")
        for sub_idx, voter_username, stars in VOTES_DEF:
            sub = submissions[sub_idx]
            voter = char_map[voter_username]

            # Safety check: voter must not be the submission author
            sub_author = next(
                c for c in char_map.values() if c.id == sub.character_id
            )
            if sub_author.account_id == voter.account_id:
                print(f"    [SKIP] Self-vote guard: {voter_username} on sub {sub_idx}")
                continue

            vote = Vote(
                submission_id=sub.id,
                voter_character_id=voter.id,
                voter_account_id=voter.account_id,
                stars=stars,
            )
            session.add(vote)

        await session.flush()

        # ------------------------------------------------------------------
        # 6. Calculate and apply correct scores + levels
        # ------------------------------------------------------------------
        print("  >Calculating scores")

        # Accumulate submission scores per character
        char_scores: dict[str, float] = {u: 0.0 for u in char_map}

        for sub_idx, (task_title, char_username, sub_title, _) in enumerate(SUBMISSIONS_DEF):
            task = task_map[task_title]
            # Gather votes for this submission
            sub_votes = [(vi, vu, vs) for vi, vu, vs in VOTES_DEF if vi == sub_idx]
            if sub_votes:
                avg_stars = sum(vs for _, _, vs in sub_votes) / len(sub_votes)
                sub_score = avg_stars * task.point_value
                char_scores[char_username] += sub_score

        # Apply to characters
        for username, score in char_scores.items():
            score_int = round(score)
            level = compute_level(score_int)
            vote_budget = compute_vote_budget(score_int)
            char = char_map[username]
            char.score = score_int
            char.all_time_score = score_int
            char.level = level
            char.votes_available = vote_budget

            expected = EXPECTED_SCORES.get(username, "?")
            match = "OK" if score_int == expected else f"MISMATCH (expected {expected})"
            print(f"    {username:15s}  score={score_int:4d}  level={level}  budget={vote_budget}  {match}")

        await session.commit()
        print("\nSeed complete!\n")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
