"""Add invite_status to submission for collab/duel invite flow.

Revision ID: 0002_invite_status
Revises: 0001_squashed
Create Date: 2026-04-14

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_invite_status"
down_revision: Union[str, None] = "0001_squashed"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum type with idempotency guard
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE invitestatus AS ENUM ('pending', 'accepted', 'declined');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)

    op.add_column(
        "submission",
        sa.Column(
            "invite_status",
            sa.Enum("pending", "accepted", "declined", name="invitestatus", create_type=False),
            nullable=True,
        ),
    )

    # Set existing collab/duel submissions to 'accepted' (grandfathered in)
    op.execute("""
        UPDATE submission
        SET invite_status = 'accepted'
        WHERE collaboration_mode IN ('collab', 'duel')
          AND partner_character_id IS NOT NULL
    """)


def downgrade() -> None:
    op.drop_column("submission", "invite_status")
    op.execute("DROP TYPE IF EXISTS invitestatus")
