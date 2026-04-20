"""Drop the unused ``task_faction`` join table.

The table was created in ``0001_squashed`` as a placeholder for "future
multi-faction task support" and never used by any service, router, or test.
CLAUDE.md forbids YAGNI scaffolding, so the table (and the matching ORM
class) are being removed together.

The downgrade path recreates the table with the original schema so we can
bisect across this revision without data loss (the table was always empty
in practice, so no DML is needed in either direction).

Revision ID: 0008_drop_task_faction
Revises: 0007_moderation_status_enum
Create Date: 2026-04-20
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0008_drop_task_faction"
down_revision: Union[str, None] = "0007_moderation_status_enum"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS task_faction"))


def downgrade() -> None:
    op.create_table(
        "task_faction",
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("task.id"), primary_key=True),
        sa.Column(
            "faction_slug",
            sa.String(),
            sa.ForeignKey("faction.slug"),
            primary_key=True,
        ),
        sa.Column("is_primary", sa.Boolean(), nullable=False),
    )
