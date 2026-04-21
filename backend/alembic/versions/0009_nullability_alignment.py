"""Align DB nullability with models for legacy timestamp columns.

Four timestamp columns were declared ``nullable=False`` in the models
(directly or via ``TimestampMixin``) but never had the NOT NULL constraint
applied in the database:

- ``contact_messages.created_at``
- ``message.created_at``
- ``vote.created_at``
- ``vote.updated_at``

The drift predates PR #115 and was blocking a clean ``alembic revision
--autogenerate``. Each column has a ``server_default=now()``, so any
existing NULL rows (none expected, but we backfill defensively) get
``NOW()`` written in before the constraint is applied.

The ``vote`` table's partial unique indexes (``uq_vote_praxis`` for solo
votes, ``uq_vote_duel`` for duel votes) are semantically correct and
remain untouched. The model was updated in lockstep to use
``Index(..., postgresql_where=...)`` instead of plain
``UniqueConstraint``, which resolves the separate name-mismatch drift
without any DB change.

Revision ID: 0009_nullability_alignment
Revises: 0008_drop_task_faction
Create Date: 2026-04-20
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0009_nullability_alignment"
down_revision: Union[str, None] = "0008_drop_task_faction"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_COLUMNS: list[tuple[str, str]] = [
    ("contact_messages", "created_at"),
    ("message", "created_at"),
    ("vote", "created_at"),
    ("vote", "updated_at"),
]


def upgrade() -> None:
    # Defensive backfill: all four columns have a server_default of now(),
    # so unless someone inserted explicit NULL, there shouldn't be any —
    # but we belt-and-suspenders it to keep the SET NOT NULL safe.
    for table, column in _COLUMNS:
        op.execute(
            sa.text(
                f"UPDATE {table} SET {column} = NOW() WHERE {column} IS NULL"
            )
        )
        op.alter_column(
            table,
            column,
            existing_type=postgresql.TIMESTAMP(timezone=True),
            nullable=False,
            existing_server_default=sa.text("now()"),
        )


def downgrade() -> None:
    for table, column in reversed(_COLUMNS):
        op.alter_column(
            table,
            column,
            existing_type=postgresql.TIMESTAMP(timezone=True),
            nullable=True,
            existing_server_default=sa.text("now()"),
        )
