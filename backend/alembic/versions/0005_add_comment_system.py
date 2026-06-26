"""Add the comment system (ADR-0006).

Adds the ``comment`` and ``comment_mention`` tables, generalises ``flag`` to a
two-target (praxis | comment) shape, and adds ``deleted`` to the moderationstatus
enum.

Idempotent, like 0002/0003: the squashed baseline (0001) ``create_all`` reflects
the *current* ORM, so on a fresh DB these tables/columns/constraints already
exist and every statement here is a no-op (``IF NOT EXISTS`` / guarded). On a
pre-comment DB still at 0004, this builds them.

Revision ID: 0005_add_comment_system
Revises: 0004_rename_faction_slugs
Create Date: 2026-06-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005_add_comment_system"
down_revision: Union[str, None] = "0004_rename_faction_slugs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(sa.text(
        "CREATE TABLE IF NOT EXISTS comment ("
        " id SERIAL PRIMARY KEY,"
        " praxis_id INTEGER REFERENCES praxis(id),"
        " task_id INTEGER REFERENCES task(id),"
        " created_by_id INTEGER NOT NULL REFERENCES character(id),"
        " body_text TEXT NOT NULL,"
        " is_edited BOOLEAN NOT NULL DEFAULT false,"
        " is_withdrawn BOOLEAN NOT NULL DEFAULT false,"
        " moderation_status moderationstatus NOT NULL DEFAULT 'visible',"
        " created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),"
        " updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),"
        " CONSTRAINT ck_comment_one_target"
        " CHECK (num_nonnulls(praxis_id, task_id) = 1)"
        ")"
    ))
    op.execute(sa.text(
        "CREATE TABLE IF NOT EXISTS comment_mention ("
        " id SERIAL PRIMARY KEY,"
        " comment_id INTEGER NOT NULL REFERENCES comment(id),"
        " mentioned_character_id INTEGER NOT NULL REFERENCES character(id),"
        " CONSTRAINT uq_comment_mention UNIQUE (comment_id, mentioned_character_id)"
        ")"
    ))

    # Generalise flag: praxis_id nullable, add comment_id, exactly-one CHECK.
    op.execute(sa.text("ALTER TABLE flag ALTER COLUMN praxis_id DROP NOT NULL"))
    op.execute(sa.text(
        "ALTER TABLE flag ADD COLUMN IF NOT EXISTS"
        " comment_id INTEGER REFERENCES comment(id)"
    ))
    op.execute(sa.text(
        "DO $$ BEGIN"
        " IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_flag_one_target')"
        " THEN ALTER TABLE flag ADD CONSTRAINT ck_flag_one_target"
        " CHECK (num_nonnulls(praxis_id, comment_id) = 1);"
        " END IF; END $$;"
    ))

    # New enum value. IF NOT EXISTS keeps it idempotent; not used in this tx, so
    # it is safe inside Alembic's transaction on PG 12+.
    op.execute(sa.text("ALTER TYPE moderationstatus ADD VALUE IF NOT EXISTS 'deleted'"))


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE flag DROP CONSTRAINT IF EXISTS ck_flag_one_target"))
    op.execute(sa.text("ALTER TABLE flag DROP COLUMN IF EXISTS comment_id"))
    # Pre-comment flags were all praxis flags, so restoring NOT NULL is safe.
    op.execute(sa.text("ALTER TABLE flag ALTER COLUMN praxis_id SET NOT NULL"))
    op.execute(sa.text("DROP TABLE IF EXISTS comment_mention"))
    op.execute(sa.text("DROP TABLE IF EXISTS comment"))
    # The 'deleted' enum value is left in place: PostgreSQL cannot DROP an enum value.
