"""Rename submission → praxis throughout the schema.

Revision ID: 0004_rename_submission_to_praxis
Revises: 0003_merge
Create Date: 2026-04-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004_rename_submission_to_praxis"
down_revision: Union[str, None] = "0003_merge"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename main table
    op.rename_table("submission", "praxis")

    # Rename junction table
    op.rename_table("submission_meta_task", "praxis_meta_task")

    # Rename submission_id → praxis_id in media_item
    op.alter_column("media_item", "submission_id", new_column_name="praxis_id")

    # Rename submission_id → praxis_id in vote
    op.alter_column("vote", "submission_id", new_column_name="praxis_id")

    # Rename submission_id → praxis_id in flag
    op.alter_column("flag", "submission_id", new_column_name="praxis_id")

    # Rename submission_id → praxis_id in praxis_meta_task (already renamed above)
    op.alter_column("praxis_meta_task", "submission_id", new_column_name="praxis_id")

    # Update the TauntTriggerType enum value
    # PostgreSQL requires explicit enum value rename
    op.execute(
        "ALTER TYPE taunttriggertype RENAME VALUE 'submission_complete' TO 'praxis_complete'"
    )


def downgrade() -> None:
    # Reverse the enum rename
    op.execute(
        "ALTER TYPE taunttriggertype RENAME VALUE 'praxis_complete' TO 'submission_complete'"
    )

    # Reverse column renames
    op.alter_column("praxis_meta_task", "praxis_id", new_column_name="submission_id")
    op.alter_column("flag", "praxis_id", new_column_name="submission_id")
    op.alter_column("vote", "praxis_id", new_column_name="submission_id")
    op.alter_column("media_item", "praxis_id", new_column_name="submission_id")

    # Reverse table renames
    op.rename_table("praxis_meta_task", "submission_meta_task")
    op.rename_table("praxis", "submission")
