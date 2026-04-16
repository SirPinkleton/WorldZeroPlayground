"""Add title and body_text to collaboration_member for per-member content.

Revision ID: 0002_collab_member_content
Revises: 0001_squashed
Create Date: 2026-04-15
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002_collab_member_content"
down_revision: Union[str, None] = "0001_squashed"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("collaboration_member", sa.Column("title", sa.Text(), nullable=True))
    op.add_column("collaboration_member", sa.Column("body_text", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("collaboration_member", "body_text")
    op.drop_column("collaboration_member", "title")
