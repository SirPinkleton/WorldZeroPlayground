"""Add faction defection history, invitation letter, and analog double dipper tables.

Revision ID: 0002_faction_models
Revises: 0001_squashed
Create Date: 2026-04-14 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_faction_models"
down_revision: Union[str, None] = "0001_squashed"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "faction_defection_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=False),
        sa.Column("faction_slug", sa.String(), nullable=False),
        sa.Column("era_id", sa.Integer(), nullable=False),
        sa.Column(
            "defected_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["character_id"], ["character.id"]),
        sa.ForeignKeyConstraint(["faction_slug"], ["faction.slug"]),
        sa.ForeignKeyConstraint(["era_id"], ["era.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("character_id", "faction_slug", "era_id"),
    )

    op.create_table(
        "invitation_letter",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("character_id", sa.Integer(), nullable=False),
        sa.Column("faction_slug", sa.String(), nullable=False),
        sa.Column("era_id", sa.Integer(), nullable=False),
        sa.Column(
            "delivered_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["character_id"], ["character.id"]),
        sa.ForeignKeyConstraint(["faction_slug"], ["faction.slug"]),
        sa.ForeignKeyConstraint(["era_id"], ["era.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("character_id", "faction_slug", "era_id"),
    )

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


def downgrade() -> None:
    op.drop_table("analog_double_dipper")
    op.drop_table("invitation_letter")
    op.drop_table("faction_defection_history")
