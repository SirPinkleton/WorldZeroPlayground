"""Convert praxis.moderation_status from VARCHAR to the existing moderationstatus enum.

The ``moderationstatus`` Postgres enum type is already created by the
``0001_squashed`` baseline (alongside every other enum). The praxis column
itself, however, has been carrying ``VARCHAR`` as its type ever since the
table was recreated in ``0004_praxis_unification``. This migration brings the
column back in line with the ORM side (`Enum(ModerationStatus)`).

Safe to re-run: the cast is idempotent because ``moderation_status::text``
round-trips cleanly through both types.

Revision ID: 0007_moderation_status_enum
Revises: 0006_metatask_unification
Create Date: 2026-04-20
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0007_moderation_status_enum"
down_revision: Union[str, None] = "0006_metatask_unification"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # The ``moderationstatus`` enum type already exists (created in 0001); no
    # CREATE TYPE needed. Postgres refuses to ALTER TYPE while a DEFAULT of a
    # different type is attached, so drop the default, cast the column, then
    # re-apply the default against the new enum type.
    op.execute(sa.text(
        "ALTER TABLE praxis ALTER COLUMN moderation_status DROP DEFAULT"
    ))
    op.execute(sa.text(
        """
        ALTER TABLE praxis
        ALTER COLUMN moderation_status TYPE moderationstatus
        USING moderation_status::moderationstatus
        """
    ))
    op.execute(sa.text(
        "ALTER TABLE praxis ALTER COLUMN moderation_status SET DEFAULT 'visible'"
    ))


def downgrade() -> None:
    # Revert to VARCHAR so the old ORM shape (``Mapped[str]``) is restored.
    # Same dance as upgrade: drop the enum-typed default first.
    op.execute(sa.text(
        "ALTER TABLE praxis ALTER COLUMN moderation_status DROP DEFAULT"
    ))
    op.execute(sa.text(
        """
        ALTER TABLE praxis
        ALTER COLUMN moderation_status TYPE VARCHAR
        USING moderation_status::text
        """
    ))
    op.execute(sa.text(
        "ALTER TABLE praxis ALTER COLUMN moderation_status SET DEFAULT 'visible'"
    ))
    # The moderationstatus enum type is shared across migrations and is owned
    # by the 0001_squashed baseline, so we do NOT drop it here.
