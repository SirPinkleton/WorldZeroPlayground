"""Replace is_flagged/is_deleted with moderation_status enum, add admin_note and is_archived

Revision ID: i9j0k1l2m3n4
Revises: h8i9j0k1l2m3
Create Date: 2026-04-13 16:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "i9j0k1l2m3n4"
down_revision: Union[str, None] = "h8i9j0k1l2m3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

MODERATION_STATUS_ENUM = sa.Enum(
    "visible", "flagged", "hidden", "failed",
    name="moderationstatus",
)


def upgrade() -> None:
    # 1. Create the enum type
    MODERATION_STATUS_ENUM.create(op.get_bind(), checkfirst=True)

    # 2. Add moderation_status column with default
    op.add_column(
        "submission",
        sa.Column(
            "moderation_status",
            MODERATION_STATUS_ENUM,
            nullable=False,
            server_default="visible",
        ),
    )

    # 3. Migrate existing data — flagged takes precedence over deleted
    op.execute(
        "UPDATE submission SET moderation_status = 'flagged' WHERE is_flagged = true"
    )
    op.execute(
        "UPDATE submission SET moderation_status = 'hidden' "
        "WHERE is_deleted = true AND is_flagged = false"
    )

    # 4. Drop old boolean columns
    op.drop_column("submission", "is_flagged")
    op.drop_column("submission", "is_deleted")

    # 5. Add admin_note column for failed submissions
    op.add_column(
        "submission",
        sa.Column("admin_note", sa.Text(), nullable=True),
    )

    # 6. Add is_archived to contact_messages
    op.add_column(
        "contact_messages",
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    # Reverse: re-add booleans, migrate data back, drop new columns
    op.add_column(
        "submission",
        sa.Column("is_flagged", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.add_column(
        "submission",
        sa.Column("is_deleted", sa.Boolean(), nullable=False, server_default="false"),
    )

    op.execute(
        "UPDATE submission SET is_flagged = true WHERE moderation_status = 'flagged'"
    )
    op.execute(
        "UPDATE submission SET is_deleted = true WHERE moderation_status = 'hidden'"
    )

    op.drop_column("submission", "moderation_status")
    op.drop_column("submission", "admin_note")
    op.drop_column("contact_messages", "is_archived")

    MODERATION_STATUS_ENUM.drop(op.get_bind(), checkfirst=True)
