"""Replace praxis/collaboration with unified submission table (single-table inheritance).

Revision ID: 0003_submission_unified
Revises: 0002_collab_member_content
Create Date: 2026-04-15
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM as PgEnum

revision: str = "0003_submission_unified"
down_revision: Union[str, None] = "0002_collab_member_content"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── 1. New enum types ─────────────────────────────────────────────────────
    #
    # Do NOT use sa.Enum(...).create() here — it registers the Enum in
    # SQLAlchemy's type cache with create_type=True and op.create_table() will
    # try to CREATE TYPE again, ignoring create_type=False on the inline column.
    #
    # Use a PL/pgSQL DO block so the duplicate-object exception is caught inside
    # Postgres itself. A prior pg_type SELECT check is unreliable in the
    # asyncpg + run_sync bridge because the SELECT and CREATE TYPE execute on
    # different protocol paths and the type can appear between them.
    for typname, values in [
        ("submissiontype", ["solo", "collaboration", "duel"]),
        ("submissioninvitestatus", ["pending", "accepted", "declined"]),
        ("submissionstatus", ["in_progress", "published"]),
        ("collabmodeenum", ["collaboration", "duel"]),
    ]:
        vals = ", ".join(f"'{v}'" for v in values)
        op.execute(sa.text(
            f"DO $$ BEGIN CREATE TYPE {typname} AS ENUM ({vals});"
            f" EXCEPTION WHEN duplicate_object THEN NULL; END; $$;"
        ))

    # ── 2. Create submission table ────────────────────────────────────────────

    op.create_table(
        "submission",
        sa.Column("id", sa.Integer(), primary_key=True),
        # Shared columns
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
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        # Solo-only (nullable when type != solo)
        sa.Column("character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=True),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("body_text", sa.Text(), nullable=True),
        # Collaboration/duel-only (nullable when type == solo)
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

    # ── 3. Create submission_member table ─────────────────────────────────────

    op.create_table(
        "submission_member",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("submission_id", sa.Integer(), sa.ForeignKey("submission.id"), nullable=False),
        sa.Column("character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("has_submitted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("body_text", sa.Text(), nullable=True),
        sa.Column("joined_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("submission_id", "character_id"),
    )

    # ── 4. Create submission_invite table ─────────────────────────────────────

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
            PgEnum("pending", "accepted", "declined", name="submissioninvitestatus", create_type=False),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ── 5. Migrate data: praxis → submission (type='solo') ────────────────────

    op.execute(sa.text("""
        INSERT INTO submission (
            id, task_id, submission_type,
            moderation_status, is_withdrawn, admin_note, flagged_at,
            created_at, updated_at,
            character_id, title, body_text
        )
        SELECT
            id, task_id, 'solo'::submissiontype,
            moderation_status::text, is_withdrawn, admin_note, flagged_at,
            created_at, updated_at,
            character_id, title, body_text
        FROM praxis
    """))

    # ── 6. Migrate data: collaboration → submission (type = mode) ─────────────

    op.execute(sa.text("""
        INSERT INTO submission (
            id, task_id, submission_type,
            moderation_status, is_withdrawn,
            created_at, updated_at,
            collab_mode, collab_status, created_by_id, collab_body_text
        )
        SELECT
            -- offset IDs to avoid collision with praxis IDs
            id + (SELECT COALESCE(MAX(id), 0) FROM praxis),
            task_id,
            mode::text::submissiontype,
            'visible', false,
            created_at, updated_at,
            mode::text::collabmodeenum,
            status::text::submissionstatus,
            created_by_id,
            body_text
        FROM collaboration
    """))

    # ── 7. Migrate data: collaboration_member → submission_member ─────────────

    op.execute(sa.text("""
        INSERT INTO submission_member (
            id, submission_id, character_id,
            has_submitted, title, body_text, joined_at
        )
        SELECT
            cm.id,
            cm.collaboration_id + (SELECT COALESCE(MAX(id), 0) FROM praxis),
            cm.character_id,
            cm.has_submitted,
            cm.title,
            cm.body_text,
            cm.joined_at
        FROM collaboration_member cm
    """))

    # ── 8. Migrate data: collaboration_invite → submission_invite ─────────────

    op.execute(sa.text("""
        INSERT INTO submission_invite (
            id, submission_id, inviter_id, invitee_id,
            invite_type, status, created_at
        )
        SELECT
            ci.id,
            ci.collaboration_id + (SELECT COALESCE(MAX(id), 0) FROM praxis),
            ci.inviter_id,
            ci.invitee_id,
            ci.type::text::collabmodeenum,
            ci.status::text::submissioninvitestatus,
            ci.created_at
        FROM collaboration_invite ci
    """))

    # ── 9. Migrate media_item: add submission_id, backfill, fix FK ────────────

    op.add_column("media_item", sa.Column("submission_id", sa.Integer(), nullable=True))

    op.execute(sa.text("""
        UPDATE media_item SET submission_id = praxis_id
    """))

    # Drop the old FK constraint on praxis_id
    op.drop_constraint("media_item_praxis_id_fkey", "media_item", type_="foreignkey")

    # Make submission_id NOT NULL now that it's populated
    op.alter_column("media_item", "submission_id", nullable=False)

    # Add FK from submission_id → submission.id
    op.create_foreign_key(
        "media_item_submission_id_fkey",
        "media_item", "submission",
        ["submission_id"], ["id"],
    )

    # Drop the old praxis_id column
    op.drop_column("media_item", "praxis_id")

    # ── 10. Migrate vote: add submission_id, backfill, fix FK/constraints ──────

    op.add_column("vote", sa.Column("submission_id", sa.Integer(), nullable=True))

    # For solo votes: submission_id = praxis_id
    # For collab/duel votes: submission_id = collaboration_id + praxis_max
    op.execute(sa.text("""
        UPDATE vote SET submission_id = COALESCE(
            praxis_id,
            collaboration_id + (SELECT COALESCE(MAX(id), 0) FROM praxis)
        )
    """))

    # Drop old unique constraints
    op.drop_constraint("uq_vote_solo", "vote", type_="unique")
    op.drop_constraint("uq_vote_duel", "vote", type_="unique")

    # Drop old FK constraints
    op.drop_constraint("vote_praxis_id_fkey", "vote", type_="foreignkey")
    op.drop_constraint("vote_collaboration_id_fkey", "vote", type_="foreignkey")

    # Drop old columns
    op.drop_column("vote", "praxis_id")
    op.drop_column("vote", "collaboration_id")

    # Make submission_id NOT NULL now that it's populated
    op.alter_column("vote", "submission_id", nullable=False)

    # Add FK from submission_id → submission.id
    op.create_foreign_key(
        "vote_submission_id_fkey",
        "vote", "submission",
        ["submission_id"], ["id"],
    )

    # Add new unique constraints
    op.create_unique_constraint(
        "uq_vote_submission",
        "vote",
        ["submission_id", "voter_character_id"],
    )
    op.create_unique_constraint(
        "uq_vote_duel_submission",
        "vote",
        ["submission_id", "voter_character_id", "duel_vote_for"],
    )

    # ── 11. Migrate flag: add submission_id, backfill, fix FK ─────────────────

    op.add_column("flag", sa.Column("submission_id", sa.Integer(), nullable=True))

    op.execute(sa.text("""
        UPDATE flag SET submission_id = praxis_id
    """))

    # Drop old FK constraint
    op.drop_constraint("flag_praxis_id_fkey", "flag", type_="foreignkey")

    # Make submission_id NOT NULL
    op.alter_column("flag", "submission_id", nullable=False)

    # Add FK from submission_id → submission.id
    op.create_foreign_key(
        "flag_submission_id_fkey",
        "flag", "submission",
        ["submission_id"], ["id"],
    )

    # Drop the old praxis_id column
    op.drop_column("flag", "praxis_id")

    # ── 12. Migrate praxis_meta_task: add submission_id, backfill, fix FK ─────

    op.add_column("praxis_meta_task", sa.Column("submission_id", sa.Integer(), nullable=True))

    op.execute(sa.text("""
        UPDATE praxis_meta_task SET submission_id = praxis_id
    """))

    op.drop_constraint("praxis_meta_task_praxis_id_fkey", "praxis_meta_task", type_="foreignkey")

    op.alter_column("praxis_meta_task", "submission_id", nullable=False)

    op.create_foreign_key(
        "praxis_meta_task_submission_id_fkey",
        "praxis_meta_task", "submission",
        ["submission_id"], ["id"],
    )

    op.drop_column("praxis_meta_task", "praxis_id")

    # ── 13. Drop old tables ───────────────────────────────────────────────────

    op.drop_table("collaboration_invite")
    op.drop_table("collaboration_member")
    op.drop_table("collaboration")
    op.drop_table("praxis")

    # ── 14. Reset sequences so new inserts get fresh IDs ─────────────────────

    op.execute(sa.text("""
        SELECT setval(
            pg_get_serial_sequence('submission', 'id'),
            COALESCE((SELECT MAX(id) FROM submission), 0) + 1,
            false
        )
    """))
    op.execute(sa.text("""
        SELECT setval(
            pg_get_serial_sequence('submission_member', 'id'),
            COALESCE((SELECT MAX(id) FROM submission_member), 0) + 1,
            false
        )
    """))
    op.execute(sa.text("""
        SELECT setval(
            pg_get_serial_sequence('submission_invite', 'id'),
            COALESCE((SELECT MAX(id) FROM submission_invite), 0) + 1,
            false
        )
    """))


def downgrade() -> None:
    # ── Recreate old tables ───────────────────────────────────────────────────

    op.create_table(
        "praxis",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("task.id"), nullable=False),
        sa.Column("character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body_text", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "moderation_status",
            sa.Enum("visible", "flagged", "hidden", "failed", name="moderationstatus", create_type=False),
            nullable=False,
            server_default="visible",
        ),
        sa.Column("is_withdrawn", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("admin_note", sa.Text(), nullable=True),
        sa.Column("flagged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "collaboration",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("task_id", sa.Integer(), sa.ForeignKey("task.id"), nullable=False),
        sa.Column(
            "mode",
            sa.Enum("collaboration", "duel", name="collaborationmode", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("in_progress", "published", name="collaborationstatus", create_type=False),
            nullable=False,
            server_default="in_progress",
        ),
        sa.Column("body_text", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "collaboration_member",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("collaboration_id", sa.Integer(), sa.ForeignKey("collaboration.id"), nullable=False),
        sa.Column("character_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("has_submitted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("body_text", sa.Text(), nullable=True),
        sa.Column("joined_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("collaboration_id", "character_id"),
    )

    op.create_table(
        "collaboration_invite",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("collaboration_id", sa.Integer(), sa.ForeignKey("collaboration.id"), nullable=False),
        sa.Column("inviter_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column("invitee_id", sa.Integer(), sa.ForeignKey("character.id"), nullable=False),
        sa.Column(
            "type",
            sa.Enum("collaboration", "duel", name="collaborationmode", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("pending", "accepted", "declined", name="collaborationinvitestatus", create_type=False),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # ── Restore praxis data from solo submissions ──────────────────────────────

    op.execute(sa.text("""
        INSERT INTO praxis (
            id, task_id, character_id,
            title, body_text,
            moderation_status, is_withdrawn, admin_note, flagged_at,
            created_at, updated_at
        )
        SELECT
            id, task_id, character_id,
            COALESCE(title, ''), COALESCE(body_text, ''),
            moderation_status::text::moderationstatus,
            is_withdrawn, admin_note, flagged_at,
            created_at, updated_at
        FROM submission
        WHERE submission_type = 'solo'
    """))

    # ── Restore collaboration data from collab/duel submissions ───────────────

    op.execute(sa.text("""
        INSERT INTO collaboration (
            id, task_id, mode, status,
            body_text, created_by_id,
            created_at, updated_at
        )
        SELECT
            id - (SELECT COALESCE(MAX(id), 0) FROM praxis),
            task_id,
            collab_mode::text::collaborationmode,
            COALESCE(collab_status::text, 'in_progress')::collaborationstatus,
            COALESCE(collab_body_text, ''),
            created_by_id,
            created_at, updated_at
        FROM submission
        WHERE submission_type IN ('collaboration', 'duel')
    """))

    # ── Restore collaboration_member ───────────────────────────────────────────

    op.execute(sa.text("""
        INSERT INTO collaboration_member (
            id, collaboration_id, character_id,
            has_submitted, title, body_text, joined_at
        )
        SELECT
            sm.id,
            sm.submission_id - (SELECT COALESCE(MAX(id), 0) FROM praxis),
            sm.character_id,
            sm.has_submitted,
            sm.title,
            sm.body_text,
            sm.joined_at
        FROM submission_member sm
    """))

    # ── Restore collaboration_invite ───────────────────────────────────────────

    op.execute(sa.text("""
        INSERT INTO collaboration_invite (
            id, collaboration_id, inviter_id, invitee_id,
            type, status, created_at
        )
        SELECT
            si.id,
            si.submission_id - (SELECT COALESCE(MAX(id), 0) FROM praxis),
            si.inviter_id,
            si.invitee_id,
            si.invite_type::text::collaborationmode,
            si.status::text::collaborationinvitestatus,
            si.created_at
        FROM submission_invite si
    """))

    # ── Restore media_item.praxis_id ──────────────────────────────────────────

    op.add_column("media_item", sa.Column("praxis_id", sa.Integer(), nullable=True))

    op.execute(sa.text("""
        UPDATE media_item SET praxis_id = submission_id
    """))

    op.drop_constraint("media_item_submission_id_fkey", "media_item", type_="foreignkey")
    op.alter_column("media_item", "praxis_id", nullable=False)
    op.create_foreign_key(
        "media_item_praxis_id_fkey",
        "media_item", "praxis",
        ["praxis_id"], ["id"],
    )
    op.drop_column("media_item", "submission_id")

    # ── Restore vote columns ───────────────────────────────────────────────────

    op.add_column("vote", sa.Column("praxis_id", sa.Integer(), nullable=True))
    op.add_column("vote", sa.Column("collaboration_id", sa.Integer(), nullable=True))

    # Solo votes: praxis_id = submission_id (where submission is solo type)
    op.execute(sa.text("""
        UPDATE vote SET praxis_id = v.submission_id
        FROM vote v
        JOIN submission s ON s.id = v.submission_id
        WHERE vote.id = v.id AND s.submission_type = 'solo'
    """))

    # Collab/duel votes: collaboration_id = submission_id - praxis_max
    op.execute(sa.text("""
        UPDATE vote SET collaboration_id = v.submission_id - (SELECT COALESCE(MAX(id), 0) FROM praxis)
        FROM vote v
        JOIN submission s ON s.id = v.submission_id
        WHERE vote.id = v.id AND s.submission_type IN ('collaboration', 'duel')
    """))

    op.drop_constraint("uq_vote_submission", "vote", type_="unique")
    op.drop_constraint("uq_vote_duel_submission", "vote", type_="unique")
    op.drop_constraint("vote_submission_id_fkey", "vote", type_="foreignkey")
    op.drop_column("vote", "submission_id")

    op.create_foreign_key(
        "vote_praxis_id_fkey",
        "vote", "praxis",
        ["praxis_id"], ["id"],
    )
    op.create_foreign_key(
        "vote_collaboration_id_fkey",
        "vote", "collaboration",
        ["collaboration_id"], ["id"],
    )
    op.create_unique_constraint(
        "uq_vote_solo",
        "vote",
        ["praxis_id", "voter_character_id"],
    )
    op.create_unique_constraint(
        "uq_vote_duel",
        "vote",
        ["collaboration_id", "voter_character_id", "duel_vote_for"],
    )

    # ── Restore flag.praxis_id ────────────────────────────────────────────────

    op.add_column("flag", sa.Column("praxis_id", sa.Integer(), nullable=True))

    op.execute(sa.text("""
        UPDATE flag SET praxis_id = submission_id
    """))

    op.drop_constraint("flag_submission_id_fkey", "flag", type_="foreignkey")
    op.alter_column("flag", "praxis_id", nullable=False)
    op.create_foreign_key(
        "flag_praxis_id_fkey",
        "flag", "praxis",
        ["praxis_id"], ["id"],
    )
    op.drop_column("flag", "submission_id")

    # ── Restore praxis_meta_task.praxis_id ────────────────────────────────────

    op.add_column("praxis_meta_task", sa.Column("praxis_id", sa.Integer(), nullable=True))

    op.execute(sa.text("""
        UPDATE praxis_meta_task SET praxis_id = submission_id
    """))

    op.drop_constraint("praxis_meta_task_submission_id_fkey", "praxis_meta_task", type_="foreignkey")
    op.alter_column("praxis_meta_task", "praxis_id", nullable=False)
    op.create_foreign_key(
        "praxis_meta_task_praxis_id_fkey",
        "praxis_meta_task", "praxis",
        ["praxis_id"], ["id"],
    )
    op.drop_column("praxis_meta_task", "submission_id")

    # ── Drop new tables ───────────────────────────────────────────────────────

    op.drop_table("submission_invite")
    op.drop_table("submission_member")
    op.drop_table("submission")

    # ── Drop new enum types ───────────────────────────────────────────────────

    op.execute("DROP TYPE IF EXISTS collabmodeenum")
    op.execute("DROP TYPE IF EXISTS submissionstatus")
    op.execute("DROP TYPE IF EXISTS submissioninvitestatus")
    op.execute("DROP TYPE IF EXISTS submissiontype")
