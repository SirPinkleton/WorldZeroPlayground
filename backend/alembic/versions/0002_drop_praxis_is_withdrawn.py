"""Drop praxis.is_withdrawn — status is the sole lifecycle dimension (ADR-0007).

Revision ID: 0002_drop_praxis_is_withdrawn
Revises: 0001_squashed
Create Date: 2026-06-23
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_drop_praxis_is_withdrawn"
down_revision: Union[str, None] = "0001_squashed"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # IF EXISTS: a fresh DB built from 0001_squashed won't have this column
    # because the squashed baseline reflects the post-drop ORM model.
    op.execute(sa.text("ALTER TABLE praxis DROP COLUMN IF EXISTS is_withdrawn"))


def downgrade() -> None:
    op.add_column(
        "praxis",
        sa.Column(
            "is_withdrawn",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
