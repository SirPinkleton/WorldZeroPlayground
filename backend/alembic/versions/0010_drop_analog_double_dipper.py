"""Drop the unused ``analog_double_dipper`` table.

The Analog Double Dipper feature was created in ``0001_squashed`` but the
service functions (``designate_double_dipper`` / ``get_double_dipper_for_level``)
had zero callers and were removed along with the ORM class. This migration
drops the now-orphaned table so the schema matches the models — without it,
``Base.metadata.drop_all`` (used in tests) can no longer drop ``task`` because
the orphaned ``analog_double_dipper_task_id_fkey`` still depends on it.

The downgrade recreates the original schema so we can bisect across this
revision (the table was always empty in practice, so no DML is needed).

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
    op.execute(sa.text("DROP TABLE IF EXISTS analog_double_dipper"))


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
