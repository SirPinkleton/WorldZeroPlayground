"""Rename faction slugs to match identity + cut ua_masters from Era 1 (ADR-0004).

Renames the faction.slug PKs ``gestalt→wow``, ``analog→everymen``,
``journeymen→ephemerists``, cascading the five FK columns, and merges the
retired ``ua_masters`` faction into ``ua`` (reassign references, drop the row).

slug is a string PK with FK children and no ON UPDATE CASCADE, so each rename
copies the row under the new slug, repoints the children, then drops the old
row. This is a **no-op on a fresh database**: faction rows are seeded *after*
``alembic upgrade head`` (see start.sh / seed.py), so at migration time the
table is empty on CI and new installs. Only pre-existing dev/staging DBs that
were seeded under the legacy slugs get rewritten.

Revision ID: 0004_rename_faction_slugs
Revises: 0003_add_praxis_submitted_at
Create Date: 2026-06-24
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0004_rename_faction_slugs"
down_revision: Union[str, None] = "0003_add_praxis_submitted_at"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# (old_slug, new_slug, new_name) — name is set on rename because seed.py is
# add-only and would not correct an existing row's display name.
RENAMES: list[tuple[str, str, str]] = [
    ("gestalt", "wow", "Warriors of Whimsy"),
    ("analog", "everymen", "Everymen"),
    ("journeymen", "ephemerists", "The Ephemerists"),
]

# Every column that FKs faction.slug, as ("table", "column").
FK_COLUMNS: list[tuple[str, str]] = [
    ("character", "faction_slug"),
    ("task", "primary_faction_slug"),
    ("task", "metatask_faction_slug"),
    ("faction_defection_history", "faction_slug"),
    ("invitation_letter", "faction_slug"),
]

# Child tables with a (character_id, faction_slug, era_id) uniqueness that can
# collide when two slugs merge into one (only ua_masters→ua here).
UNIQUE_TRIPLE_TABLES: list[str] = ["faction_defection_history", "invitation_letter"]


def _repoint_children(old_slug: str, new_slug: str) -> None:
    for table, column in FK_COLUMNS:
        op.execute(
            sa.text(f'UPDATE "{table}" SET {column} = :new WHERE {column} = :old')
            .bindparams(old=old_slug, new=new_slug)
        )


def upgrade() -> None:
    # --- 1. Rename gestalt/analog/journeymen (new slug does not yet exist) ---
    for old_slug, new_slug, new_name in RENAMES:
        op.execute(
            sa.text(
                "INSERT INTO faction (slug, name, description, status, created_at, updated_at) "
                "SELECT :new, :name, description, status, created_at, updated_at "
                "FROM faction WHERE slug = :old "
                "ON CONFLICT (slug) DO NOTHING"
            ).bindparams(old=old_slug, new=new_slug, name=new_name)
        )
        _repoint_children(old_slug, new_slug)
        op.execute(sa.text("DELETE FROM faction WHERE slug = :old").bindparams(old=old_slug))

    # --- 2. Merge ua_masters into ua (ua already exists) ---
    # Drop rows that would violate the (character_id, faction_slug, era_id)
    # uniqueness once ua_masters collapses onto an existing ua row.
    for table in UNIQUE_TRIPLE_TABLES:
        op.execute(sa.text(
            f'DELETE FROM "{table}" a '
            "WHERE a.faction_slug = 'ua_masters' "
            f'AND EXISTS (SELECT 1 FROM "{table}" b '
            "WHERE b.character_id = a.character_id AND b.era_id = a.era_id "
            "AND b.faction_slug = 'ua')"
        ))
    _repoint_children("ua_masters", "ua")
    op.execute(sa.text("DELETE FROM faction WHERE slug = 'ua_masters'"))


def downgrade() -> None:
    # Best-effort: reverse the three renames. The ua_masters→ua merge is not
    # reversible (the original assignments are gone); recreate an empty row so
    # the FK target exists again.
    for old_slug, new_slug, _new_name in RENAMES:
        op.execute(
            sa.text(
                "INSERT INTO faction (slug, name, description, status, created_at, updated_at) "
                "SELECT :old, :name, description, status, created_at, updated_at "
                "FROM faction WHERE slug = :new "
                "ON CONFLICT (slug) DO NOTHING"
            ).bindparams(old=old_slug, new=new_slug, name=old_slug.capitalize())
        )
        _repoint_children(new_slug, old_slug)
        op.execute(sa.text("DELETE FROM faction WHERE slug = :new").bindparams(new=new_slug))

    op.execute(sa.text(
        "INSERT INTO faction (slug, name, description, status) "
        "VALUES ('ua_masters', 'UA Masters', '', 'visible') "
        "ON CONFLICT (slug) DO NOTHING"
    ))
