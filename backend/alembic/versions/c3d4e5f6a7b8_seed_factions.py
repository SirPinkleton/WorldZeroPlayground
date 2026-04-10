"""seed faction rows

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-04-09 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

FACTIONS = [
    ("ua",          "UA",           "The default starting faction. Full points on all tasks. Must leave at level 3."),
    ("ua_masters",  "UA Masters",   "Veterans who aged out of UA. Can sign up for any task at reduced points."),
    ("snide",       "Snide",        "Specialists in one-on-one competition. Bonus points for winning duels."),
    ("gestalt",     "Gestalt",      "Collective-minded. Excel at their own faction's tasks; reduced elsewhere."),
    ("journeymen",  "Journeymen",   "Explorers with access to select retired tasks (Task Vision ability)."),
    ("analog",      "Analog",       "Depth over breadth. Can repeat one task per level for points (Double Dipper)."),
    ("singularity", "Singularity",  "TBD"),
    ("albescent",   "/Albescent",   "Full points and any meta tasks from any group. Unlock-only."),
    ("aged_out",    "AgedOutOfUA",  "Placeholder faction for characters who hit level 3 while offline."),
]


def upgrade() -> None:
    conn = op.get_bind()
    for slug, name, desc in FACTIONS:
        conn.execute(
            sa.text(
                "INSERT INTO faction (slug, name, description) "
                "VALUES (:slug, :name, :desc) "
                "ON CONFLICT (slug) DO NOTHING"
            ),
            {"slug": slug, "name": name, "desc": desc},
        )


def downgrade() -> None:
    conn = op.get_bind()
    slugs = [f[0] for f in FACTIONS]
    conn.execute(
        sa.text("DELETE FROM faction WHERE slug = ANY(:slugs)"),
        {"slugs": slugs},
    )
