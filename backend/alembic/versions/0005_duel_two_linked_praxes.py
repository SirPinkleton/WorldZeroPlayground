"""Duels are two linked praxes (ADR-0011).

Creates the ``duel`` table, removes ``Vote.praxis_member_id`` and its two
partial unique indexes, and replaces them with a simple unique constraint
(one vote per voter per praxis).

Existing ``type='duel'`` praxis rows are converted to ``type='solo'`` so that
they remain queryable as standalone praxes. Any votes that targeted a
specific praxis member (``praxis_member_id IS NOT NULL``) are deleted because
that concept no longer exists — duel sides are separate praxes under this model.

Revision ID: 0005_duel_two_linked_praxes
Revises: 0004_rename_faction_slugs
Create Date: 2026-06-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005_duel_two_linked_praxes"
down_revision: Union[str, None] = "0004_rename_faction_slugs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create duelstatus enum type (idempotent).
    op.execute(sa.text(
        "DO $$ BEGIN CREATE TYPE duelstatus AS ENUM "
        "('pending', 'active', 'settled', 'declined');"
        " EXCEPTION WHEN duplicate_object THEN NULL; END $$;"
    ))

    # 2. Create the duel table.
    op.create_table(
        "duel",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("task.id"), nullable=False),
        sa.Column("challenger_praxis_id", sa.Integer(), sa.ForeignKey("praxis.id"), nullable=False),
        sa.Column("opponent_character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("opponent_praxis_id", sa.Integer(), sa.ForeignKey("praxis.id"), nullable=True),
        sa.Column(
            "status",
            sa.Enum("pending", "active", "settled", "declined", name="duelstatus", create_type=False),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("declined_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # 3. Drop per-member duel votes (praxis_member_id IS NOT NULL).
    #    These no longer have meaning — duel sides are now separate praxes.
    op.execute(sa.text(
        "DELETE FROM vote WHERE praxis_member_id IS NOT NULL"
    ))

    # 4. Convert existing type='duel' praxis rows to type='solo'.
    #    They become standalone praxes; the old per-praxis duel relationship
    #    is not migrated (no Duel rows created for historical data).
    op.execute(sa.text(
        "UPDATE praxis SET type = 'solo' WHERE type = 'duel'"
    ))

    # 5. Drop the two partial unique indexes on vote before altering the column.
    op.drop_index("uq_vote_praxis", table_name="vote")
    op.drop_index("uq_vote_duel", table_name="vote")

    # 6. Drop the praxis_member_id column.
    op.drop_column("vote", "praxis_member_id")

    # 7. Add a simple unique constraint: one vote per voter per praxis.
    op.create_unique_constraint("uq_vote_praxis", "vote", ["praxis_id", "voter_character_id"])


def downgrade() -> None:
    # Reverse order.

    # Remove simple unique constraint.
    op.drop_constraint("uq_vote_praxis", "vote", type_="unique")

    # Re-add praxis_member_id.
    op.add_column("vote", sa.Column("praxis_member_id", sa.Integer(), nullable=True))

    # Restore partial unique indexes.
    op.create_index(
        "uq_vote_praxis",
        "vote",
        ["praxis_id", "voter_character_id"],
        unique=True,
        postgresql_where=sa.text("praxis_member_id IS NULL"),
    )
    op.create_index(
        "uq_vote_duel",
        "vote",
        ["praxis_id", "voter_character_id", "praxis_member_id"],
        unique=True,
        postgresql_where=sa.text("praxis_member_id IS NOT NULL"),
    )

    # Drop duel table.
    op.drop_table("duel")

    # Drop duelstatus enum.
    op.execute(sa.text("DROP TYPE IF EXISTS duelstatus"))
