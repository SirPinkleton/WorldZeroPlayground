"""Add praxis.submit_proposed_at — opens the collab pending-publish window (ADR-0012).

Revision ID: 0008_praxis_submit_proposed_at
Revises: 0007_rename_vote_stars_to_value
Create Date: 2026-06-26
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0008_praxis_submit_proposed_at"
down_revision: Union[str, None] = "0007_rename_vote_stars_to_value"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # IF NOT EXISTS: fresh DBs built from 0001_squashed already have this column
    # because the squashed baseline reflects the post-add ORM model.
    op.execute(sa.text(
        "ALTER TABLE praxis ADD COLUMN IF NOT EXISTS"
        " submit_proposed_at TIMESTAMP WITH TIME ZONE"
    ))


def downgrade() -> None:
    op.drop_column("praxis", "submit_proposed_at")
