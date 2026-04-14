"""backend gaps: relationship status, submission collab mode, taunt_message table

Revision ID: g7h8i9j0k1l2
Revises: f6a7b8c9d0e1
Create Date: 2026-04-13 00:00:00.000000

Schema changes:
- relationship.status enum: pending|accepted|blocked -> active|blocked
  (existing pending/accepted rows migrate to active)
- submission: add collaboration_mode enum column + partner_character_id FK
- new taunt_message table for foe taunt system
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "g7h8i9j0k1l2"
down_revision: Union[str, None] = "f6a7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _enum_exists(name: str) -> bool:
    """Check if a PostgreSQL enum type already exists."""
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT 1 FROM pg_type WHERE typname = :name"), {"name": name})
    return result.fetchone() is not None


def _table_exists(name: str) -> bool:
    """Check if a PostgreSQL table already exists."""
    conn = op.get_bind()
    result = conn.execute(
        sa.text("SELECT 1 FROM information_schema.tables WHERE table_name = :name"),
        {"name": name},
    )
    return result.fetchone() is not None


def _column_exists(table: str, column: str) -> bool:
    """Check if a column already exists on a table."""
    conn = op.get_bind()
    result = conn.execute(
        sa.text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name = :table AND column_name = :column"
        ),
        {"table": table, "column": column},
    )
    return result.fetchone() is not None


def upgrade() -> None:
    # -- 1. Alter relationship.status enum: pending|accepted|blocked -> active|blocked --
    # Only run if the old enum values still exist (migration not yet applied)
    if not _enum_exists("relationshipstatus_new"):
        conn = op.get_bind()
        # Check if the current enum still has 'pending' (old schema)
        result = conn.execute(
            sa.text(
                "SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid "
                "WHERE t.typname = 'relationshipstatus' AND e.enumlabel = 'pending'"
            )
        )
        if result.fetchone():
            op.execute("CREATE TYPE relationshipstatus_new AS ENUM ('active', 'blocked')")
            op.execute(
                "ALTER TABLE relationship "
                "ALTER COLUMN status TYPE relationshipstatus_new "
                "USING CASE "
                "  WHEN status::text IN ('pending', 'accepted') THEN 'active'::relationshipstatus_new "
                "  ELSE status::text::relationshipstatus_new "
                "END"
            )
            op.execute("DROP TYPE relationshipstatus")
            op.execute("ALTER TYPE relationshipstatus_new RENAME TO relationshipstatus")

    # -- 2. Add collaboration_mode enum + columns to submission --
    if not _enum_exists("collaborationmode"):
        op.execute("CREATE TYPE collaborationmode AS ENUM ('solo', 'collab', 'duel')")

    if not _column_exists("submission", "collaboration_mode"):
        op.add_column(
            "submission",
            sa.Column(
                "collaboration_mode",
                sa.Enum("solo", "collab", "duel", name="collaborationmode", create_type=False),
                nullable=False,
                server_default="solo",
            ),
        )

    if not _column_exists("submission", "partner_character_id"):
        op.add_column(
            "submission",
            sa.Column("partner_character_id", sa.Integer(), nullable=True),
        )
        op.create_foreign_key(
            "fk_submission_partner_character",
            "submission",
            "character",
            ["partner_character_id"],
            ["id"],
        )

    # -- 3. Create taunt_message table --
    if not _enum_exists("taunttriggertype"):
        op.execute("CREATE TYPE taunttriggertype AS ENUM ('score_overtake', 'level_up', 'submission_complete')")

    if not _table_exists("taunt_message"):
        op.create_table(
            "taunt_message",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("from_character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
            sa.Column("to_character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column(
                "trigger_type",
                sa.Enum("score_overtake", "level_up", "submission_complete", name="taunttriggertype", create_type=False),
                nullable=False,
            ),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )


def downgrade() -> None:
    # -- Reverse 3: drop taunt_message table --
    op.drop_table("taunt_message")
    op.execute("DROP TYPE taunttriggertype")

    # -- Reverse 2: drop submission collab columns --
    op.drop_constraint("fk_submission_partner_character", "submission", type_="foreignkey")
    op.drop_column("submission", "partner_character_id")
    op.drop_column("submission", "collaboration_mode")
    op.execute("DROP TYPE collaborationmode")

    # -- Reverse 1: restore relationship.status enum --
    op.execute("CREATE TYPE relationshipstatus_new AS ENUM ('pending', 'accepted', 'blocked')")
    op.execute(
        "ALTER TABLE relationship "
        "ALTER COLUMN status TYPE relationshipstatus_new "
        "USING CASE "
        "  WHEN status::text = 'active' THEN 'accepted'::relationshipstatus_new "
        "  ELSE status::text::relationshipstatus_new "
        "END"
    )
    op.execute("DROP TYPE relationshipstatus")
    op.execute("ALTER TYPE relationshipstatus_new RENAME TO relationshipstatus")
