"""Add praxis.submitted_at — sealed-date for the in_progress → submitted transition.

Revision ID: 0003_add_praxis_submitted_at
Revises: 0002_drop_praxis_is_withdrawn
Create Date: 2026-06-24
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003_add_praxis_submitted_at"
down_revision: Union[str, None] = "0002_drop_praxis_is_withdrawn"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # IF NOT EXISTS: fresh DBs built from 0001_squashed already have this column
    # because the squashed baseline reflects the post-add ORM model.
    op.execute(sa.text(
        "ALTER TABLE praxis ADD COLUMN IF NOT EXISTS"
        " submitted_at TIMESTAMP WITH TIME ZONE"
    ))


def downgrade() -> None:
    op.drop_column("praxis", "submitted_at")
