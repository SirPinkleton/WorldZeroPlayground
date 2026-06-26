"""Rename vote.stars → vote.value (ADR-0014 vocabulary).

The DB column ``stars`` becomes ``value`` to match the new vote vocabulary:
a voter casts a 1–5 *value* (not a star rating). All application code that
referenced ``Vote.stars`` / ``vote.stars`` is updated in the same commit.

Idempotent: the rename is guarded with ``IF EXISTS`` / ``IF NOT EXISTS`` so
running it twice on the same DB is safe.

Revision ID: 0007_rename_vote_stars_to_value
Revises: 0006_duel_two_linked_praxes
Create Date: 2026-06-26
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0007_rename_vote_stars_to_value"
down_revision: Union[str, None] = "0006_duel_two_linked_praxes"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    has_stars = conn.execute(
        sa.text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='vote' AND column_name='stars'"
        )
    ).fetchone()
    if has_stars:
        op.alter_column("vote", "stars", new_column_name="value")


def downgrade() -> None:
    conn = op.get_bind()
    has_value = conn.execute(
        sa.text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='vote' AND column_name='value'"
        )
    ).fetchone()
    if has_value:
        op.alter_column("vote", "value", new_column_name="stars")
