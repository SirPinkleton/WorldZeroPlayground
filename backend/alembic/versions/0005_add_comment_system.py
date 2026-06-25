"""Add the comment system (ADR-0006).

Adds the ``comment`` and ``comment_mention`` tables, generalises ``flag`` to a
two-target (praxis | comment) shape, and adds ``deleted`` to the moderationstatus
enum.

Like 0004, table creates are a no-op only in the sense that they run on a fresh
DB after the squashed baseline — there is no data to migrate.

Revision ID: 0005_add_comment_system
Revises: 0004_rename_faction_slugs
Create Date: 2026-06-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0005_add_comment_system"
down_revision: Union[str, None] = "0004_rename_faction_slugs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

MODERATION_STATUS = postgresql.ENUM(
    "visible",
    "flagged",
    "hidden",
    "failed",
    "deleted",
    name="moderationstatus",
    create_type=False,
)


def upgrade() -> None:
    # New enum value. IF NOT EXISTS keeps it idempotent; not used in this tx, so
    # it is safe inside Alembic's transaction on PG 12+.
    op.execute("ALTER TYPE moderationstatus ADD VALUE IF NOT EXISTS 'deleted'")

    op.create_table(
        "comment",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("praxis_id", sa.Integer(), sa.ForeignKey("praxis.id"), nullable=True),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("task.id"), nullable=True),
        sa.Column(
            "created_by_id",
            sa.Integer(),
            sa.ForeignKey("character.id"),
            nullable=False,
        ),
        sa.Column("body_text", sa.Text(), nullable=False),
        sa.Column(
            "is_edited", sa.Boolean(), nullable=False, server_default=sa.text("false")
        ),
        sa.Column(
            "is_withdrawn",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "moderation_status",
            MODERATION_STATUS,
            nullable=False,
            server_default="visible",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.CheckConstraint(
            "num_nonnulls(praxis_id, task_id) = 1", name="ck_comment_one_target"
        ),
    )

    op.create_table(
        "comment_mention",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "comment_id", sa.Integer(), sa.ForeignKey("comment.id"), nullable=False
        ),
        sa.Column(
            "mentioned_character_id",
            sa.Integer(),
            sa.ForeignKey("character.id"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "comment_id", "mentioned_character_id", name="uq_comment_mention"
        ),
    )

    # Generalise flag: praxis_id becomes nullable, add comment_id, CHECK exactly-one.
    op.alter_column("flag", "praxis_id", existing_type=sa.Integer(), nullable=True)
    op.add_column("flag", sa.Column("comment_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_flag_comment", "flag", "comment", ["comment_id"], ["id"])
    op.create_check_constraint(
        "ck_flag_one_target", "flag", "num_nonnulls(praxis_id, comment_id) = 1"
    )


def downgrade() -> None:
    op.drop_constraint("ck_flag_one_target", "flag", type_="check")
    op.drop_constraint("fk_flag_comment", "flag", type_="foreignkey")
    op.drop_column("flag", "comment_id")
    # Pre-comment flags were all praxis flags, so restoring NOT NULL is safe.
    op.alter_column("flag", "praxis_id", existing_type=sa.Integer(), nullable=False)
    op.drop_table("comment_mention")
    op.drop_table("comment")
    # The 'deleted' enum value is left in place: PostgreSQL cannot DROP an enum
    # value, and re-adding it on a re-upgrade is harmless.
