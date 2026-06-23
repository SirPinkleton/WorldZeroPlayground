"""Drop the orphaned ``analog_double_dipper`` table.

PR #147 deleted the ``analog_double_dipper`` model as dead code but left the
table behind: the squashed baseline (``0001``) still creates it, so a fresh
``alembic upgrade head`` produces a table with no model. Because nothing maps
it onto ``Base.metadata`` anymore, the integration suite's
``Base.metadata.drop_all`` teardown skips it, and the lingering
``analog_double_dipper_task_id_fkey`` then blocks ``DROP TABLE task`` —
failing CI on a teardown error.

Forward migration on top of head (the baseline is intentionally untouched —
see ADR-0004 / issue #145). Drops the table; ``downgrade`` recreates it from
the original ``0001`` definition for reversibility.

Revision ID: 0010_drop_analog_double_dipper
Revises: 0009_nullability_alignment
Create Date: 2026-06-23
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0010_drop_analog_double_dipper"
down_revision: Union[str, None] = "0009_nullability_alignment"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("analog_double_dipper")


def downgrade() -> None:
    op.create_table(
        "analog_double_dipper",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=False),
        sa.Column("level_tier", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["character_id"], ["character.id"]),
        sa.ForeignKeyConstraint(["task_id"], ["task.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("character_id", "level_tier"),
    )
