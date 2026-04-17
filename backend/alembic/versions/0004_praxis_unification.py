"""P.1 — Unify all submission systems into a single Praxis table.

Replaces: submission, submission_member, submission_invite, character_task

New tables: praxis, praxis_member, praxis_invite
Updated FK columns: vote.praxis_id, media_item.praxis_id, flag.praxis_id,
                    praxis_meta_task.praxis_id
New duel vote column: vote.praxis_member_id (replaces duel_vote_for character FK)

Design decisions:
- A solo praxis is a collab praxis with one member; type='solo' is a first-class value
- content (title, body_text) lives on praxis, not per-member
- Creating a praxis = signing up; CharacterTask is dropped
- Duel votes reference praxis_member (not character directly)
- PraxisStatus: in_progress | submitted  (replaces per-mode status fields)

Revision ID: 0004_praxis_unification
Revises: 0003_submission_unified
Create Date: 2026-04-16
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM as PgEnum

revision: str = "0004_praxis_unification"
down_revision: Union[str, None] = "0003_submission_unified"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. New enum types (idempotent) ────────────────────────────────────────

    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE praxistype AS ENUM ('solo', 'collab', 'duel');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE praxisstatus AS ENUM ('in_progress', 'submitted');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE praxisinvitestatus AS ENUM ('pending', 'accepted', 'declined');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    # ── 2. Create praxis table ────────────────────────────────────────────────
    # (The old 'praxis' table was dropped by migration 0003; this name is free.)

    op.create_table(
        "praxis",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("task.id"), nullable=False),
        sa.Column(
            "type",
            PgEnum("solo", "collab", "duel", name="praxistype", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "status",
            PgEnum("in_progress", "submitted", name="praxisstatus", create_type=False),
            nullable=False,
            server_default="in_progress",
        ),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("body_text", sa.Text(), nullable=True),
        sa.Column("is_withdrawn", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("moderation_status", sa.String(), nullable=False, server_default="visible"),
        sa.Column("admin_note", sa.Text(), nullable=True),
        sa.Column("flagged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ── 3. Migrate submission → praxis ────────────────────────────────────────
    # solo rows:        type='solo',  status='submitted',    body_text from body_text
    # collab/duel rows: type mapped,  status from collab_status, body_text from collab_body_text
    # created_by_id: solo uses character_id; collab/duel already has created_by_id

    op.execute(sa.text("""
        INSERT INTO praxis (
            id, task_id, type, status,
            title, body_text,
            is_withdrawn, moderation_status, admin_note, flagged_at,
            created_by_id, created_at, updated_at
        )
        SELECT
            id,
            task_id,
            CASE submission_type::text
                WHEN 'solo'          THEN 'solo'::praxistype
                WHEN 'collaboration' THEN 'collab'::praxistype
                WHEN 'duel'          THEN 'duel'::praxistype
            END,
            CASE
                WHEN submission_type::text = 'solo'           THEN 'submitted'::praxisstatus
                WHEN collab_status::text   = 'published'      THEN 'submitted'::praxisstatus
                ELSE 'in_progress'::praxisstatus
            END,
            title,
            CASE submission_type::text
                WHEN 'solo' THEN body_text
                ELSE        collab_body_text
            END,
            is_withdrawn,
            moderation_status,
            admin_note,
            flagged_at,
            COALESCE(character_id, created_by_id),
            created_at,
            updated_at
        FROM submission
    """))

    # Reset praxis sequence so skeleton inserts below get fresh IDs
    op.execute(sa.text("""
        SELECT setval(
            pg_get_serial_sequence('praxis', 'id'),
            COALESCE((SELECT MAX(id) FROM praxis), 0) + 1,
            false
        )
    """))

    # ── 4. Create praxis_member table ─────────────────────────────────────────

    op.create_table(
        "praxis_member",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("praxis_id", sa.Integer(), sa.ForeignKey("praxis.id"), nullable=False),
        sa.Column("character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("has_submitted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint("praxis_id", "character_id", name="uq_praxis_member"),
    )

    # ── 5. Migrate submission_member → praxis_member (collab/duel members) ────

    op.execute(sa.text("""
        INSERT INTO praxis_member (id, praxis_id, character_id, has_submitted, joined_at)
        SELECT id, submission_id, character_id, has_submitted, joined_at
        FROM submission_member
    """))

    # ── 6. Insert praxis_member for every solo submission (creator = only member) ─

    op.execute(sa.text("""
        INSERT INTO praxis_member (praxis_id, character_id, has_submitted, joined_at)
        SELECT id, character_id, true, created_at
        FROM submission
        WHERE submission_type = 'solo'
    """))

    # ── 7. Skeleton praxes from character_task (in_progress signups with no submission) ─
    # Creates a solo in_progress praxis so the bank slot is preserved.

    op.execute(sa.text("""
        INSERT INTO praxis (
            task_id, type, status, is_withdrawn, moderation_status,
            created_by_id, created_at, updated_at
        )
        SELECT
            ct.task_id,
            'solo'::praxistype,
            'in_progress'::praxisstatus,
            false,
            'visible',
            ct.character_id,
            ct.signed_up_at,
            ct.updated_at
        FROM character_task ct
        WHERE ct.status = 'in_progress'
        AND NOT EXISTS (
            SELECT 1 FROM praxis p
            WHERE p.task_id = ct.task_id
              AND p.created_by_id = ct.character_id
        )
    """))

    # Insert praxis_member for every praxis that still has no member record
    # (catches the skeleton praxes inserted above)
    op.execute(sa.text("""
        INSERT INTO praxis_member (praxis_id, character_id, has_submitted, joined_at)
        SELECT p.id, p.created_by_id, false, p.created_at
        FROM praxis p
        WHERE NOT EXISTS (
            SELECT 1 FROM praxis_member pm WHERE pm.praxis_id = p.id
        )
    """))

    # Reset sequences now that all rows are in
    op.execute(sa.text("""
        SELECT setval(
            pg_get_serial_sequence('praxis', 'id'),
            COALESCE((SELECT MAX(id) FROM praxis), 0) + 1,
            false
        )
    """))
    op.execute(sa.text("""
        SELECT setval(
            pg_get_serial_sequence('praxis_member', 'id'),
            COALESCE((SELECT MAX(id) FROM praxis_member), 0) + 1,
            false
        )
    """))

    # ── 8. Create praxis_invite table ─────────────────────────────────────────
    # invite_type is dropped: the praxis's own type is authoritative.

    op.create_table(
        "praxis_invite",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("praxis_id", sa.Integer(), sa.ForeignKey("praxis.id"), nullable=False),
        sa.Column("inviter_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("invitee_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column(
            "status",
            PgEnum("pending", "accepted", "declined", name="praxisinvitestatus", create_type=False),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # ── 9. Migrate submission_invite → praxis_invite ──────────────────────────

    op.execute(sa.text("""
        INSERT INTO praxis_invite (id, praxis_id, inviter_id, invitee_id, status, created_at)
        SELECT
            id,
            submission_id,
            inviter_id,
            invitee_id,
            status::text::praxisinvitestatus,
            created_at
        FROM submission_invite
    """))

    op.execute(sa.text("""
        SELECT setval(
            pg_get_serial_sequence('praxis_invite', 'id'),
            COALESCE((SELECT MAX(id) FROM praxis_invite), 0) + 1,
            false
        )
    """))

    # ── 10. Update vote: submission_id → praxis_id, duel_vote_for → praxis_member_id ─

    op.add_column("vote", sa.Column("praxis_id", sa.Integer(), nullable=True))
    op.add_column("vote", sa.Column("praxis_member_id", sa.Integer(), nullable=True))

    op.execute(sa.text("UPDATE vote SET praxis_id = submission_id"))

    # Map duel_vote_for (character FK) to the praxis_member record for that character
    op.execute(sa.text("""
        UPDATE vote
        SET praxis_member_id = pm.id
        FROM praxis_member pm
        WHERE vote.praxis_id = pm.praxis_id
          AND vote.duel_vote_for = pm.character_id
          AND vote.duel_vote_for IS NOT NULL
    """))

    # Drop old constraints and columns
    op.drop_constraint("uq_vote_submission", "vote", type_="unique")
    op.drop_constraint("uq_vote_duel_submission", "vote", type_="unique")
    op.drop_constraint("vote_submission_id_fkey", "vote", type_="foreignkey")
    op.drop_column("vote", "submission_id")
    op.drop_column("vote", "duel_vote_for")

    # Add new FK constraints
    op.alter_column("vote", "praxis_id", nullable=False)
    op.create_foreign_key(
        "vote_praxis_id_fkey", "vote", "praxis", ["praxis_id"], ["id"]
    )
    op.create_foreign_key(
        "vote_praxis_member_id_fkey", "vote", "praxis_member", ["praxis_member_id"], ["id"]
    )

    # Partial unique indexes:
    # - one vote per voter per praxis (solo/collab, where praxis_member_id IS NULL)
    # - one vote per voter per member per praxis (duel, where praxis_member_id IS NOT NULL)
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

    # ── 11. Update media_item: submission_id → praxis_id ─────────────────────

    op.add_column("media_item", sa.Column("praxis_id", sa.Integer(), nullable=True))
    op.execute(sa.text("UPDATE media_item SET praxis_id = submission_id"))
    op.drop_constraint("media_item_submission_id_fkey", "media_item", type_="foreignkey")
    op.alter_column("media_item", "praxis_id", nullable=False)
    op.create_foreign_key(
        "media_item_praxis_id_fkey", "media_item", "praxis", ["praxis_id"], ["id"]
    )
    op.drop_column("media_item", "submission_id")

    # ── 12. Update flag: submission_id → praxis_id ───────────────────────────

    op.add_column("flag", sa.Column("praxis_id", sa.Integer(), nullable=True))
    op.execute(sa.text("UPDATE flag SET praxis_id = submission_id"))
    op.drop_constraint("flag_submission_id_fkey", "flag", type_="foreignkey")
    op.alter_column("flag", "praxis_id", nullable=False)
    op.create_foreign_key(
        "flag_praxis_id_fkey", "flag", "praxis", ["praxis_id"], ["id"]
    )
    op.drop_column("flag", "submission_id")

    # ── 13. Update praxis_meta_task: submission_id → praxis_id ───────────────

    op.add_column("praxis_meta_task", sa.Column("praxis_id", sa.Integer(), nullable=True))
    op.execute(sa.text("UPDATE praxis_meta_task SET praxis_id = submission_id"))
    op.drop_constraint(
        "praxis_meta_task_submission_id_fkey", "praxis_meta_task", type_="foreignkey"
    )
    op.alter_column("praxis_meta_task", "praxis_id", nullable=False)
    op.create_foreign_key(
        "praxis_meta_task_praxis_id_fkey",
        "praxis_meta_task",
        "praxis",
        ["praxis_id"],
        ["id"],
    )
    op.drop_column("praxis_meta_task", "submission_id")

    # ── 14. Drop old tables ───────────────────────────────────────────────────

    op.drop_table("submission_invite")
    op.drop_table("submission_member")
    op.drop_table("submission")
    op.drop_table("character_task")

    # ── 15. Drop old enum types ───────────────────────────────────────────────

    op.execute(sa.text("DROP TYPE IF EXISTS submissiontype"))
    op.execute(sa.text("DROP TYPE IF EXISTS submissionstatus"))
    op.execute(sa.text("DROP TYPE IF EXISTS submissioninvitestatus"))
    op.execute(sa.text("DROP TYPE IF EXISTS collabmodeenum"))
    op.execute(sa.text("DROP TYPE IF EXISTS charactertaskstatus"))


def downgrade() -> None:
    # ── Recreate old enum types ───────────────────────────────────────────────

    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE submissiontype AS ENUM ('solo', 'collaboration', 'duel');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE submissionstatus AS ENUM ('in_progress', 'published');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE submissioninvitestatus AS ENUM ('pending', 'accepted', 'declined');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE collabmodeenum AS ENUM ('collaboration', 'duel');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))
    op.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE charactertaskstatus AS ENUM ('in_progress', 'submitted', 'abandoned');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    # ── Recreate submission table ─────────────────────────────────────────────

    op.create_table(
        "submission",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("task.id"), nullable=False),
        sa.Column(
            "submission_type",
            PgEnum("solo", "collaboration", "duel", name="submissiontype", create_type=False),
            nullable=False,
        ),
        sa.Column("moderation_status", sa.String(), nullable=False, server_default="visible"),
        sa.Column("is_withdrawn", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("admin_note", sa.Text(), nullable=True),
        sa.Column("flagged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=True),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("body_text", sa.Text(), nullable=True),
        sa.Column(
            "collab_mode",
            PgEnum("collaboration", "duel", name="collabmodeenum", create_type=False),
            nullable=True,
        ),
        sa.Column(
            "collab_status",
            PgEnum("in_progress", "published", name="submissionstatus", create_type=False),
            nullable=True,
        ),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=True),
        sa.Column("collab_body_text", sa.Text(), nullable=True, server_default=""),
    )

    # ── Restore submission data from praxis ───────────────────────────────────

    op.execute(sa.text("""
        INSERT INTO submission (
            id, task_id, submission_type,
            moderation_status, is_withdrawn, admin_note, flagged_at,
            created_at, updated_at,
            character_id, title, body_text
        )
        SELECT
            id, task_id, 'solo'::submissiontype,
            moderation_status, is_withdrawn, admin_note, flagged_at,
            created_at, updated_at,
            created_by_id,
            title,
            body_text
        FROM praxis
        WHERE type = 'solo'
    """))

    op.execute(sa.text("""
        INSERT INTO submission (
            id, task_id, submission_type,
            moderation_status, is_withdrawn, admin_note, flagged_at,
            created_at, updated_at,
            collab_mode, collab_status, created_by_id, collab_body_text
        )
        SELECT
            id, task_id,
            CASE type::text WHEN 'collab' THEN 'collaboration'::submissiontype ELSE 'duel'::submissiontype END,
            moderation_status, is_withdrawn, admin_note, flagged_at,
            created_at, updated_at,
            CASE type::text WHEN 'collab' THEN 'collaboration'::collabmodeenum ELSE 'duel'::collabmodeenum END,
            CASE status::text WHEN 'submitted' THEN 'published'::submissionstatus ELSE 'in_progress'::submissionstatus END,
            created_by_id,
            body_text
        FROM praxis
        WHERE type IN ('collab', 'duel')
    """))

    op.execute(sa.text("""
        SELECT setval(
            pg_get_serial_sequence('submission', 'id'),
            COALESCE((SELECT MAX(id) FROM submission), 0) + 1,
            false
        )
    """))

    # ── Recreate submission_member ────────────────────────────────────────────

    op.create_table(
        "submission_member",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("submission_id", sa.Integer(), sa.ForeignKey("submission.id"), nullable=False),
        sa.Column("character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("has_submitted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("body_text", sa.Text(), nullable=True),
        sa.Column(
            "joined_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint("submission_id", "character_id"),
    )

    # Restore submission_member from praxis_member (collab/duel praxes only; solo members have no submission_member row)
    op.execute(sa.text("""
        INSERT INTO submission_member (id, submission_id, character_id, has_submitted, joined_at)
        SELECT pm.id, pm.praxis_id, pm.character_id, pm.has_submitted, pm.joined_at
        FROM praxis_member pm
        JOIN praxis p ON p.id = pm.praxis_id
        WHERE p.type IN ('collab', 'duel')
    """))

    op.execute(sa.text("""
        SELECT setval(
            pg_get_serial_sequence('submission_member', 'id'),
            COALESCE((SELECT MAX(id) FROM submission_member), 0) + 1,
            false
        )
    """))

    # ── Recreate submission_invite ────────────────────────────────────────────

    op.create_table(
        "submission_invite",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("submission_id", sa.Integer(), sa.ForeignKey("submission.id"), nullable=False),
        sa.Column("inviter_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("invitee_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column(
            "invite_type",
            PgEnum("collaboration", "duel", name="collabmodeenum", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "status",
            PgEnum(
                "pending",
                "accepted",
                "declined",
                name="submissioninvitestatus",
                create_type=False,
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    # invite_type is restored from the praxis type (collab/duel)
    op.execute(sa.text("""
        INSERT INTO submission_invite (id, submission_id, inviter_id, invitee_id, invite_type, status, created_at)
        SELECT
            pi.id,
            pi.praxis_id,
            pi.inviter_id,
            pi.invitee_id,
            CASE p.type::text WHEN 'collab' THEN 'collaboration'::collabmodeenum ELSE 'duel'::collabmodeenum END,
            pi.status::text::submissioninvitestatus,
            pi.created_at
        FROM praxis_invite pi
        JOIN praxis p ON p.id = pi.praxis_id
    """))

    op.execute(sa.text("""
        SELECT setval(
            pg_get_serial_sequence('submission_invite', 'id'),
            COALESCE((SELECT MAX(id) FROM submission_invite), 0) + 1,
            false
        )
    """))

    # ── Recreate character_task ───────────────────────────────────────────────
    # Reconstruct from in_progress praxes that have no content (skeleton praxes).
    # Submitted praxes are reconstructed as 'submitted' character_task rows.

    op.create_table(
        "character_task",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("task.id"), nullable=False),
        sa.Column(
            "signed_up_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "status",
            PgEnum(
                "in_progress",
                "submitted",
                "abandoned",
                name="charactertaskstatus",
                create_type=False,
            ),
            nullable=False,
            server_default="in_progress",
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.execute(sa.text("""
        INSERT INTO character_task (character_id, task_id, signed_up_at, status, updated_at)
        SELECT
            created_by_id,
            task_id,
            created_at,
            CASE status::text WHEN 'submitted' THEN 'submitted'::charactertaskstatus
                              ELSE 'in_progress'::charactertaskstatus END,
            updated_at
        FROM praxis
        WHERE is_withdrawn = false
          AND type = 'solo'
        ON CONFLICT DO NOTHING
    """))

    # ── Restore vote columns ──────────────────────────────────────────────────

    op.add_column("vote", sa.Column("submission_id", sa.Integer(), nullable=True))
    op.add_column(
        "vote",
        sa.Column("duel_vote_for", sa.Integer(), sa.ForeignKey("character.id"), nullable=True),
    )

    op.execute(sa.text("UPDATE vote SET submission_id = praxis_id"))

    # Restore duel_vote_for from praxis_member
    op.execute(sa.text("""
        UPDATE vote
        SET duel_vote_for = pm.character_id
        FROM praxis_member pm
        WHERE vote.praxis_member_id = pm.id
          AND vote.praxis_member_id IS NOT NULL
    """))

    # Drop new vote indexes and FKs
    op.drop_index("uq_vote_praxis", table_name="vote")
    op.drop_index("uq_vote_duel", table_name="vote")
    op.drop_constraint("vote_praxis_id_fkey", "vote", type_="foreignkey")
    op.drop_constraint("vote_praxis_member_id_fkey", "vote", type_="foreignkey")
    op.drop_column("vote", "praxis_id")
    op.drop_column("vote", "praxis_member_id")

    op.alter_column("vote", "submission_id", nullable=False)
    op.create_foreign_key(
        "vote_submission_id_fkey", "vote", "submission", ["submission_id"], ["id"]
    )
    op.create_unique_constraint(
        "uq_vote_submission", "vote", ["submission_id", "voter_character_id"]
    )
    op.create_unique_constraint(
        "uq_vote_duel_submission",
        "vote",
        ["submission_id", "voter_character_id", "duel_vote_for"],
    )

    # ── Restore media_item.submission_id ─────────────────────────────────────

    op.add_column("media_item", sa.Column("submission_id", sa.Integer(), nullable=True))
    op.execute(sa.text("UPDATE media_item SET submission_id = praxis_id"))
    op.drop_constraint("media_item_praxis_id_fkey", "media_item", type_="foreignkey")
    op.alter_column("media_item", "submission_id", nullable=False)
    op.create_foreign_key(
        "media_item_submission_id_fkey", "media_item", "submission", ["submission_id"], ["id"]
    )
    op.drop_column("media_item", "praxis_id")

    # ── Restore flag.submission_id ────────────────────────────────────────────

    op.add_column("flag", sa.Column("submission_id", sa.Integer(), nullable=True))
    op.execute(sa.text("UPDATE flag SET submission_id = praxis_id"))
    op.drop_constraint("flag_praxis_id_fkey", "flag", type_="foreignkey")
    op.alter_column("flag", "submission_id", nullable=False)
    op.create_foreign_key(
        "flag_submission_id_fkey", "flag", "submission", ["submission_id"], ["id"]
    )
    op.drop_column("flag", "praxis_id")

    # ── Restore praxis_meta_task.submission_id ────────────────────────────────

    op.add_column(
        "praxis_meta_task", sa.Column("submission_id", sa.Integer(), nullable=True)
    )
    op.execute(sa.text("UPDATE praxis_meta_task SET submission_id = praxis_id"))
    op.drop_constraint(
        "praxis_meta_task_praxis_id_fkey", "praxis_meta_task", type_="foreignkey"
    )
    op.alter_column("praxis_meta_task", "submission_id", nullable=False)
    op.create_foreign_key(
        "praxis_meta_task_submission_id_fkey",
        "praxis_meta_task",
        "submission",
        ["submission_id"],
        ["id"],
    )
    op.drop_column("praxis_meta_task", "praxis_id")

    # ── Drop new tables ───────────────────────────────────────────────────────

    op.drop_table("praxis_invite")
    op.drop_table("praxis_member")
    op.drop_table("praxis")

    # ── Drop new enum types ───────────────────────────────────────────────────

    op.execute(sa.text("DROP TYPE IF EXISTS praxisinvitestatus"))
    op.execute(sa.text("DROP TYPE IF EXISTS praxisstatus"))
    op.execute(sa.text("DROP TYPE IF EXISTS praxistype"))
