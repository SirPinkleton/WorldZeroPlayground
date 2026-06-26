"""Duels are two linked praxes (ADR-0011).

Creates the ``duel`` table, removes ``Vote.praxis_member_id`` and its two
partial unique indexes, and replaces them with a simple unique constraint
(one vote per voter per praxis).

Existing ``type='duel'`` praxis rows are converted to ``type='solo'`` so that
they remain queryable as standalone praxes. Any votes that targeted a
specific praxis member (``praxis_member_id IS NOT NULL``) are deleted because
that concept no longer exists — duel sides are separate praxes under this model.

Idempotent, like 0002/0003/0005: the squashed baseline (0001) ``create_all``
reflects the *current* ORM, so on a fresh DB the ``duel`` table, the
``duelstatus`` enum, and the simple ``uq_vote_praxis`` constraint already exist
(and ``praxis_member_id`` / the partial indexes never did) — every statement
here is guarded to a no-op. On a pre-duel DB still at the old vote shape, this
builds the table and rewrites the vote constraints.

Revision ID: 0006_duel_two_linked_praxes
Revises: 0005_add_comment_system
Create Date: 2026-06-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0006_duel_two_linked_praxes"
down_revision: Union[str, None] = "0005_add_comment_system"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create duelstatus enum type (idempotent).
    op.execute(sa.text(
        "DO $$ BEGIN CREATE TYPE duelstatus AS ENUM "
        "('pending', 'active', 'settled', 'declined');"
        " EXCEPTION WHEN duplicate_object THEN NULL; END $$;"
    ))

    # 2. Create the duel table (no-op on a create_all fresh DB).
    op.execute(sa.text(
        "CREATE TABLE IF NOT EXISTS duel ("
        " id SERIAL PRIMARY KEY,"
        " task_id INTEGER NOT NULL REFERENCES task(id),"
        " challenger_praxis_id INTEGER NOT NULL REFERENCES praxis(id),"
        " opponent_character_id INTEGER NOT NULL REFERENCES character(id),"
        " opponent_praxis_id INTEGER REFERENCES praxis(id),"
        " status duelstatus NOT NULL DEFAULT 'pending',"
        " accepted_at TIMESTAMP WITH TIME ZONE,"
        " declined_at TIMESTAMP WITH TIME ZONE,"
        " created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()"
        ")"
    ))

    # 3. Drop per-member duel votes (praxis_member_id IS NOT NULL). Only the
    #    old vote shape has the column; on a fresh DB this is skipped.
    op.execute(sa.text(
        "DO $$ BEGIN"
        " IF EXISTS (SELECT 1 FROM information_schema.columns"
        " WHERE table_name = 'vote' AND column_name = 'praxis_member_id')"
        " THEN DELETE FROM vote WHERE praxis_member_id IS NOT NULL;"
        " END IF; END $$;"
    ))

    # 4. Convert existing type='duel' praxis rows to type='solo' (no-op if none).
    #    They become standalone praxes; the old per-praxis duel relationship
    #    is not migrated (no Duel rows created for historical data).
    op.execute(sa.text(
        "UPDATE praxis SET type = 'solo' WHERE type = 'duel'"
    ))

    # 5. Drop the old per-member partial index (old shape only).
    op.execute(sa.text("DROP INDEX IF EXISTS uq_vote_duel"))

    # 6. Replace the old partial uq_vote_praxis *index* with a plain unique
    #    *constraint*. On a fresh DB the constraint already exists (create_all),
    #    so guard on its absence to stay idempotent.
    op.execute(sa.text(
        "DO $$ BEGIN"
        " IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_vote_praxis')"
        " THEN DROP INDEX IF EXISTS uq_vote_praxis;"
        " ALTER TABLE vote ADD CONSTRAINT uq_vote_praxis"
        " UNIQUE (praxis_id, voter_character_id);"
        " END IF; END $$;"
    ))

    # 7. Drop the praxis_member_id column (old shape only).
    op.execute(sa.text("ALTER TABLE vote DROP COLUMN IF EXISTS praxis_member_id"))


def downgrade() -> None:
    # Reverse order, guarded so it works whichever shape the DB is in.

    # Restore the old per-member vote shape: drop the simple constraint, re-add
    # praxis_member_id, and rebuild the two partial unique indexes.
    op.execute(sa.text("ALTER TABLE vote DROP CONSTRAINT IF EXISTS uq_vote_praxis"))
    op.execute(sa.text("DROP INDEX IF EXISTS uq_vote_praxis"))
    op.execute(sa.text(
        "ALTER TABLE vote ADD COLUMN IF NOT EXISTS praxis_member_id INTEGER"
    ))
    op.execute(sa.text(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_vote_praxis ON vote"
        " (praxis_id, voter_character_id) WHERE praxis_member_id IS NULL"
    ))
    op.execute(sa.text(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_vote_duel ON vote"
        " (praxis_id, voter_character_id, praxis_member_id)"
        " WHERE praxis_member_id IS NOT NULL"
    ))

    # Drop duel table and its enum.
    op.execute(sa.text("DROP TABLE IF EXISTS duel"))
    op.execute(sa.text("DROP TYPE IF EXISTS duelstatus"))
