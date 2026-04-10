"""add is_hidden to faction

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-04-09 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('faction', sa.Column('is_hidden', sa.Boolean(), nullable=False, server_default='false'))

    # Mark unlock-only and placeholder factions as hidden
    conn = op.get_bind()
    conn.execute(
        sa.text("UPDATE faction SET is_hidden = true WHERE slug IN ('albescent', 'aged_out')")
    )


def downgrade() -> None:
    op.drop_column('faction', 'is_hidden')
