"""
Seed script for World Zero — production bootstrap.

Prerequisites: run `alembic upgrade head` first.
Migrations handle schema + faction rows. This script adds:
  - Era 1 row
  - Pixie admin account + character + admin role
  - All live tasks (from the real task list)

Run from /backend:
    python seed.py               # dev (default)
    python seed.py --env prod --yes
"""

import argparse
import asyncio
import sys

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from sqlalchemy import func, select, text

from game_config import ERA_1
from script_utils import add_env_argument, get_settings
from models.account import Account, OAuthProvider
from models.character import Character
from models.character_stats import CharacterStats
from models.era import Era
from models.roles import AccountRole, Role
from models.task import Task, TaskStatus


# ---------------------------------------------------------------------------
# Tasks (from CSV — corrections applied inline)
#
# Corrections:
#   anolog      → analog        (Permaculture Shock, Lacunae, A Very Human Thing,
#                                Improv Fixture, Depth through Repetition)
#   us_masters  → ua_masters    (Creating Fun)
#   (empty)     → singularity   (The Rotation Of Cubes In Your Mind)
#   ? / ?       → level=4, pts=40 (One of many Cultural Bridges)
#
# Format: (title, description, faction_slug, level_required, point_value)
# ---------------------------------------------------------------------------

TASKS_DEF = [
    (
        "Contribute to Shahid's Strigiformic Sketchbook",
        'From Shahid\'s diary:\n"Wednesday, October the fourteenth.  #812 had the finest feathers ever drawn.  Still it was spurned..."\nShahid fell in love three years ago with a woman who refused to give him any attention because he presented her with a "subpar" drawing of a Eurasian eagle-owl. Since then, Shahid has tried again and again to draw her a suitable owl, only to be continually rejected.\nHelp Shahid find new inspiration by hand-drawing an owl of any species in any circumstances, especially with unusual style.',
        "ua", 1, 5,
    ),
    (
        "Permaculture Shock",
        'Install a community garden (ideally in secret, or somewhere a garden may not be expected).\nTo qualify for the "community" modifier prefix, it must be in an area where you can share its bounty and responsibility, though you need not involve anyone else in its care if you believe your own thumbs to be the greenest.\nCrop variety and size is your choice, but it must yield a harvest to feed at least 3 people one meal.\nPlayers: 1 to 20',
        "analog", 6, 100,
    ),
    (
        "Somewhere No One Needs To Be",
        "There are many places people have physically passed through: along a path, in a store, on a game field. There are also many places people have not passed through in quite some time: the bark dust beside a building, the inside of a sewer, a random patch of grass \nHow long did a human last occupy these spaces? What could it mean for a place to exist beside humanity, not dangerous or necessarily forbidden, but ordinary and nondescript, without humanities touch for so long? What does it mean, to you?\nin a large and empty field.\nExist somewhere no one has existed in for a long time, and consider what that means.",
        "journeymen", 1, 10,
    ),
    (
        "Lacunae",
        "Share something which exemplifies emptiness.\nSee also: https://en.wikipedia.org/wiki/4%E2%80%B233%E2%80%B3",
        "analog", 2, 10,
    ),
    (
        "Knowledge Is Free",
        "You have skills and knowledge. This is true even if you don't know it, whether by way of your unique experience of the world or by the time you've spent on something that someone else hasn't. There's more to do and know than there are years for anyone to learn it all, so everyone brings with themselves a piece of truth looking to be more whole.\nVolunteer your time teaching someone or someone's something. A skill, a practice, some amount of a field of knowledge, etc.\nLibraries are a good place for this, as a place of knowledge and creativity most libraries support workshops and other learning opportunities, which you can have a hand in leading.",
        "gestalt", 4, 40,
    ),
    (
        "The L Word",
        "Find someone you love. Tell them you love them.",
        "gestalt", 1, 5,
    ),
    (
        "The Rotation Of Cubes In Your Mind",
        "Recall one of the many cubes you've no doubt experienced in your long life.\nDescribe what the cube was, what it meant, and where it came from.\nQualifying cube examples:\nRubiks Cube, The Companion Cube, Cube 2: Hypercube on DVD, Gamecube, Gateway2000s Cow Cube, a 6 sided die, a laundry machine, a poorly designed car, half a brick, several full bricks stacked into a cube, etc...\nThe object need not be perfectly cubic, so long as it embodies cubehood.\nPlayers: 1 to 2",
        "singularity", 2, 10,
    ),
    (
        "Feed the Animals",
        "Find some animals and feed them. Human is an acceptable type of animal.",
        "gestalt", 1, 5,
    ),
    (
        "It's for all of us",
        "Make something more accessible.\nInstalling a ramp where one is missing, place/install a seat/bench somewhere, make signage larger and easier to read, install a sign where one is missing, update software with color blind options. The world is an oyster.",
        "gestalt", 5, 75,
    ),
    (
        "A little something special",
        "Install/place artwork in public",
        "ua", 2, 10,
    ),
    (
        "You can learn anything",
        "Spend 30 minutes learning a new skill/craft",
        "ua", 2, 10,
    ),
    (
        "Beauty through limitation",
        "Make a piece of art that's small. 7.5cm canvas square, 50x50 pixel digital image",
        "ua", 1, 5,
    ),
    (
        "Stronger Together",
        "Start a Union.",
        "gestalt", 7, 500,
    ),
    (
        "The Seed",
        "Think about something you think you know about, but haven't actually looked into. Research that assumption, and report back what you've found. Minimum 250 words.",
        "ua", 1, 5,
    ),
    (
        "The Sprout",
        "Think about something you think you know about, but haven't actually looked into. Research that assumption, and report back what you've found. Minimum 1000 words",
        "ua", 2, 10,
    ),
    (
        "The Bud",
        "Think about something you think you know about, but haven't actually looked into. Research that assumption, and report back what you've found. Minimum 5,000 words",
        "ua", 3, 25,
    ),
    (
        "The Bloom",
        "Think about something you think you know about, but haven't actually looked into. Research that assumption, and report back what you've found. Minimum 10,000 words",
        "ua_masters", 4, 50,
    ),
    (
        "The Bush",
        "Think about something you think you know about, but haven't actually looked into. Research that assumption, and report back what you've found. Minimum 15,000 words",
        "ua_masters", 5, 75,
    ),
    (
        "The Thicket",
        "Think about something you think you know about, but haven't actually looked into. Research that assumption, and report back what you've found. Minimum 25,000 words",
        "ua_masters", 6, 100,
    ),
    (
        "The Forest",
        "Think about something you think you know about, but haven't actually looked into. Research that assumption, and report back what you've found. Minimum 40,000 words",
        "ua_masters", 7, 500,
    ),
    (
        "Communication is arbitrary",
        "Invent a language. Write a paragraph in that language.",
        "snide", 5, 75,
    ),
    (
        '"DO A KICKFLIP"',
        "Do a kickflip. Bonus if you don't use a skateboard.",
        "snide", 2, 25,
    ),
    (
        "There",
        "Pick some place to travel to at random (dart thrown at a map, random wikipedia article selection, etc.). Travel there.",
        "journeymen", 4, 50,
    ),
    (
        "Invisible White Elephant",
        "Give someone a gift, anonymously.",
        "gestalt", 2, 10,
    ),
    (
        "What if the curtains were red",
        "Mod a game.",
        "singularity", 3, 25,
    ),
    (
        "Creating Fun",
        "Make a game.",
        "ua_masters", 4, 50,
    ),
    (
        "You deserve it.",
        "Forgive yourself.",
        "gestalt", 1, 5,
    ),
    (
        "Patron of the arts",
        "Commission art from an artist",
        "gestalt", 3, 25,
    ),
    (
        "Expanding your world",
        "Learn a stranger's name",
        "gestalt", 1, 5,
    ),
    (
        "Closer, together",
        "learn about and share a friend's hobby",
        "gestalt", 2, 10,
    ),
    (
        "Become a Villager",
        "Advertise and provide a skill or good to your community",
        "gestalt", 4, 50,
    ),
    (
        "One of many Cultural Bridges",
        "Learn a new language",
        "gestalt", 4, 40,
    ),
    (
        "Trash Transformation",
        "Find some trash in a public place. Make it into something else.",
        "ua", 1, 5,
    ),
    (
        "When The Sun Blinks",
        "Experience a Solar Eclipse. Write about your experience.",
        "journeymen", 3, 25,
    ),
    (
        "A Very Human Thing",
        "Create a ritual to be kind to yourself. Document it.",
        "analog", 1, 5,
    ),
    (
        "Understanding through Data",
        "Perform a census. On anything, of anything. Provide your details, and consider what your data says",
        "singularity", 3, 25,
    ),
    (
        "Create a spell.",
        "Create a spell.",
        "albescent", 1, 5,
    ),
    (
        "Make it your own",
        "Remove the branding from something you own, and replace it with something else.",
        "snide", 1, 5,
    ),
    (
        "Improv Fixture",
        "Take an item with a logo or brand on it that you use every day. Study the item, and how it was made. Compare it to other, similar interpretations of that item made by other people. After this, throw it away and make your own version of the item.",
        "analog", 3, 25,
    ),
    (
        "Why did you do that",
        "break something. Write down your thoughts (what did you break, why did you choose to break it, do you feel better or worse for breaking it, is it worth fixing or replacing or putting behind you, etc.)",
        "journeymen", 2, 10,
    ),
    (
        "Why do I even have this actually",
        "you have a pile somewhere in your house. The pile of things has a proper place, but it is in that pile instead. Consider why that pile exists, why those items ended up in that pile, where they are meant to go and why (is The Place convenient? Next other other Like things? Is that the righr place for such things?). Then, take an action: redefine where \"the right place\" is for that pile of things, and thrn make things right. Or, unpack the pile to the place where it's meant to go.",
        "ua", 2, 10,
    ),
    (
        "A key to many locks",
        "If you don't have a passport already, get one.",
        "journeymen", 2, 10,
    ),
    (
        "Tierlist of Me",
        "Score your living space, according to a rubric you yourself come up with. Justify your grading.",
        "singularity", 2, 10,
    ),
    (
        "Cultural Exchange",
        "Interview someone from another country",
        "gestalt", 3, 25,
    ),
    (
        "Depth through Repetition",
        "Have a meal, and try to identify each ingredient. Then, make that meal yourself, and then try again to identify each ingredient again",
        "analog", 2, 10,
    ),
]


# ---------------------------------------------------------------------------
# Main seed function
# ---------------------------------------------------------------------------

async def seed(env: str, yes: bool) -> None:
    settings = get_settings(env)
    db_host = settings.DATABASE_URL.split("@")[-1]

    print(f"Environment : {env}")
    print(f"Database    : {db_host}\n")

    if env == "prod" and not yes:
        print("WARNING: You are about to seed a PRODUCTION database.")
        print(f"Target: {db_host}\n")
        answer = input("Type 'yes' to continue: ").strip()
        if answer != "yes":
            print("Aborted.")
            sys.exit(0)

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:

        # Check what's already present
        pixie_result = await session.execute(
            select(Account).where(Account.email == "pixieofhugs@gmail.com")
        )
        pixie_acc = pixie_result.scalar_one_or_none()

        task_count = (await session.execute(select(func.count()).select_from(Task))).scalar()

        if pixie_acc and task_count > 0:
            print("Database already fully seeded (pixie account + tasks exist). Nothing to do.")
            await engine.dispose()
            return

        print("Seeding World Zero...\n")
        print("  (Factions seeded by Alembic migrations — skipping)")

        # ------------------------------------------------------------------
        # 1. Pixie account + character (skip if already exists)
        # ------------------------------------------------------------------
        if pixie_acc:
            print("  >Pixie account already exists — skipping account/era/admin setup")
            pixie_char_result = await session.execute(
                select(Character).where(Character.account_id == pixie_acc.id).limit(1)
            )
            pixie_char = pixie_char_result.scalar_one()
        else:
            print("  >Pixie account")
            pixie_acc = Account(email="pixieofhugs@gmail.com")
            session.add(pixie_acc)
            await session.flush()

            session.add(OAuthProvider(
                account_id=pixie_acc.id,
                provider="google",
                provider_user_id="google_pixie",
                access_token="seed_token",
            ))

            pixie_char = Character(
                account_id=pixie_acc.id,
                username="pixie",
                display_name="Pixie",
                bio="",
                faction_slug="ua",
            )
            session.add(pixie_char)
            await session.flush()

            # ------------------------------------------------------------------
            # Era
            # ------------------------------------------------------------------
            print("  >Era 1")
            era_row = Era(
                name=ERA_1.name,
                config_key=ERA_1.config_key,
                started_by=pixie_acc.id,
            )
            session.add(era_row)
            await session.flush()

            # ------------------------------------------------------------------
            # Admin role + grant
            # ------------------------------------------------------------------
            print("  >Admin role -> pixie")
            admin_role = Role(name="admin", description="Full administrative access")
            session.add(admin_role)
            await session.flush()

            session.add(AccountRole(
                account_id=pixie_acc.id,
                role_id=admin_role.id,
                granted_by=pixie_acc.id,
            ))

            # ------------------------------------------------------------------
            # CharacterStats (pixie starts at zero)
            # ------------------------------------------------------------------
            session.add(CharacterStats(
                character_id=pixie_char.id,
                era_id=era_row.id,
                score=0,
                all_time_score=0,
                level=0,
                votes_available=ERA_1.vote_budget_base,
            ))
            await session.flush()

        # ------------------------------------------------------------------
        # Tasks (only if missing)
        # ------------------------------------------------------------------
        if task_count == 0:
            print(f"  >Tasks ({len(TASKS_DEF)})")
            for title, desc, faction_slug, level_req, pts in TASKS_DEF:
                session.add(Task(
                    title=title,
                    description=desc,
                    point_value=pts,
                    level_required=level_req,
                    status=TaskStatus.active,
                    created_by=pixie_char.id,
                    primary_faction_slug=faction_slug,
                    is_task_vision_eligible=False,
                ))
        else:
            print(f"  >Tasks already exist ({task_count}) — skipping")

        await session.commit()
        print("\nSeed complete!\n")
        print(f"  pixie account  : pixieofhugs@gmail.com")
        print(f"  pixie character: @pixie (admin)")
        print(f"  tasks          : {len(TASKS_DEF)}")

    await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the World Zero database.")
    add_env_argument(parser)
    parser.add_argument(
        "--yes", "-y",
        action="store_true",
        help="Skip confirmation prompt when targeting production.",
    )
    args = parser.parse_args()
    asyncio.run(seed(args.env, args.yes))
