"""Retire the vestigial ``aged_out`` faction row (ADR-0030, #428).

``aged_out`` is a leftover placeholder from the retired auto-UA / must-leave-at-
level-3 model; no code path ever assigns it (era reset now defaults to ``na``).
This repoints any stray FK references off ``aged_out`` — expected to be none —
then drops the faction row.

``faction.slug`` is a string PK with FK children and no ON UPDATE CASCADE, so we
repoint the children first, then delete the row. This is a **no-op on a fresh
database**: faction rows are seeded *after* ``alembic upgrade head`` (see
start.sh / seed.py), so at migration time the table is empty on CI and new
installs. Only pre-existing dev/staging DBs seeded under the legacy config get
rewritten.

Revision ID: 0012_retire_aged_out_faction
Revises: 0011_account_albescent_revealed
Create Date: 2026-07-03
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0012_retire_aged_out_faction"
down_revision: Union[str, None] = "0011_account_albescent_revealed"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Live membership repoints to the unaffiliated sentinel; history rows are dropped
# (repointing a defection/invitation record to ``na`` would be meaningless).
REPOINT_TO_NA: list[tuple[str, str]] = [
    ("character", "faction_slug"),
    ("task", "primary_faction_slug"),
    ("task", "metatask_faction_slug"),
]
DROP_HISTORY: list[tuple[str, str]] = [
    ("faction_defection_history", "faction_slug"),
    ("invitation_letter", "faction_slug"),
]


def upgrade() -> None:
    for table, column in REPOINT_TO_NA:
        op.execute(
            sa.text(f'UPDATE "{table}" SET {column} = \'na\' WHERE {column} = \'aged_out\'')
        )
    for table, column in DROP_HISTORY:
        op.execute(
            sa.text(f'DELETE FROM "{table}" WHERE {column} = \'aged_out\'')
        )
    op.execute(sa.text("DELETE FROM faction WHERE slug = 'aged_out'"))


def downgrade() -> None:
    # Best-effort: recreate an empty hidden aged_out row so the FK target exists
    # again. The original assignments are gone and cannot be restored.
    op.execute(sa.text(
        "INSERT INTO faction (slug, name, description, status) "
        "VALUES ('aged_out', 'AgedOutOfUA', 'Placeholder faction.', 'hidden') "
        "ON CONFLICT (slug) DO NOTHING"
    ))
