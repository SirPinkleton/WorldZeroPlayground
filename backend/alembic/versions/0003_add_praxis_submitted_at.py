"""Add submitted_at column to praxis table.

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
    op.add_column(
        "praxis",
        sa.Column(
            "submitted_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("praxis", "submitted_at")
