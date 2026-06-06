"""One-off: sync the journeymen Faction DB row's name + description from the
live era config (the Ephemerists reskin). The seed only inserts-if-absent, so
an already-seeded DB keeps the old display name until this runs.

Run from /backend:  python -m scripts.sync_journeymen_faction_row [--env dev]
"""

import argparse
import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from game_config import CURRENT_ERA
from models.faction import Faction
from script_utils import add_env_argument, get_settings

SLUG = "journeymen"


async def main(env: str) -> None:
    settings = get_settings(env)
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine, expire_on_commit=False)
    config = CURRENT_ERA.factions[SLUG]
    async with Session() as session:
        row = (
            await session.execute(select(Faction).where(Faction.slug == SLUG))
        ).scalar_one_or_none()
        if row is None:
            print(f"No '{SLUG}' Faction row found — nothing to update.")
            return
        before = (row.name, row.description)
        row.name = config.name
        row.description = config.description
        await session.commit()
        print(f"Updated '{SLUG}': {before} -> {(config.name, config.description)}")
    await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    add_env_argument(parser)
    args = parser.parse_args()
    asyncio.run(main(args.env))
