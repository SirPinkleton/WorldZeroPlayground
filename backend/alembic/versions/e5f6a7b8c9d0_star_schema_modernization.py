"""star schema modernization

- Split character stats into character_stats table
- Replace boolean is_active/is_hidden with status enums
- Add updated_at to all dimension/mutable tables
- Make optional string columns non-nullable ('' sentinel)
- Make faction FK columns non-nullable ('ua'/'na' sentinels)
- Add 'na' sentinel faction

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-04-11 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'e5f6a7b8c9d0'
down_revision: Union[str, None] = 'd4e5f6a7b8c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # ------------------------------------------------------------------
    # 1. Create enum types
    # ------------------------------------------------------------------
    op.execute("CREATE TYPE accountstatus AS ENUM ('active', 'suspended', 'deleted')")
    op.execute("CREATE TYPE characterstatus AS ENUM ('active', 'paused', 'banned')")
    op.execute("CREATE TYPE factionstatus AS ENUM ('visible', 'hidden', 'deprecated')")

    # ------------------------------------------------------------------
    # 2. Faction table: replace is_hidden with status enum + timestamps
    #    + make description non-nullable + seed 'na' sentinel
    # ------------------------------------------------------------------

    # Seed 'na' faction before FK changes
    conn.execute(sa.text(
        "INSERT INTO faction (slug, name, description, is_hidden) "
        "VALUES ('na', 'None', 'Sentinel for tasks with no specific faction affiliation', true) "
        "ON CONFLICT (slug) DO NOTHING"
    ))

    # Add status column (nullable first, then set values, then set NOT NULL)
    op.add_column('faction', sa.Column('status', sa.Enum('visible', 'hidden', 'deprecated', name='factionstatus'), nullable=True))
    conn.execute(sa.text(
        "UPDATE faction SET status = CASE WHEN is_hidden = true THEN 'hidden'::factionstatus ELSE 'visible'::factionstatus END"
    ))
    op.alter_column('faction', 'status', nullable=False)

    op.drop_column('faction', 'is_hidden')

    # Make description non-nullable
    conn.execute(sa.text("UPDATE faction SET description = '' WHERE description IS NULL"))
    op.alter_column('faction', 'description', nullable=False, server_default='')

    # Add timestamps
    op.add_column('faction', sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.add_column('faction', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # ------------------------------------------------------------------
    # 3. Account table: replace is_active with status enum + updated_at
    # ------------------------------------------------------------------
    op.add_column('account', sa.Column('status', sa.Enum('active', 'suspended', 'deleted', name='accountstatus'), nullable=True))
    conn.execute(sa.text(
        "UPDATE account SET status = CASE WHEN is_active = true THEN 'active'::accountstatus ELSE 'suspended'::accountstatus END"
    ))
    op.alter_column('account', 'status', nullable=False)
    op.drop_column('account', 'is_active')
    op.add_column('account', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # ------------------------------------------------------------------
    # 4. OAuthProvider table: add updated_at
    # ------------------------------------------------------------------
    op.add_column('oauth_provider', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # ------------------------------------------------------------------
    # 5. Character table: major restructure
    #    - Replace is_active with status enum
    #    - Remove stats columns (moved to character_stats)
    #    - Make string columns non-nullable
    #    - Make faction_slug non-nullable (default 'ua')
    #    - Add updated_at
    # ------------------------------------------------------------------

    # Add status column
    op.add_column('character', sa.Column('status', sa.Enum('active', 'paused', 'banned', name='characterstatus'), nullable=True))
    conn.execute(sa.text(
        "UPDATE character SET status = CASE WHEN is_active = true THEN 'active'::characterstatus ELSE 'banned'::characterstatus END"
    ))
    op.alter_column('character', 'status', nullable=False)
    op.drop_column('character', 'is_active')

    # Make string columns non-nullable
    conn.execute(sa.text("UPDATE character SET bio = '' WHERE bio IS NULL"))
    op.alter_column('character', 'bio', nullable=False, server_default='')

    conn.execute(sa.text("UPDATE character SET avatar_url = '' WHERE avatar_url IS NULL"))
    op.alter_column('character', 'avatar_url', nullable=False, server_default='')

    conn.execute(sa.text("UPDATE character SET location = '' WHERE location IS NULL"))
    op.alter_column('character', 'location', nullable=False, server_default='')

    # Make faction_slug non-nullable (default 'ua' for any NULLs)
    conn.execute(sa.text("UPDATE character SET faction_slug = 'ua' WHERE faction_slug IS NULL"))
    op.alter_column('character', 'faction_slug', nullable=False, server_default='ua')

    # Add updated_at
    op.add_column('character', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # Drop stats columns — migrated to character_stats below
    op.drop_column('character', 'score')
    op.drop_column('character', 'all_time_score')
    op.drop_column('character', 'level')
    op.drop_column('character', 'votes_available')

    # ------------------------------------------------------------------
    # 6. Create character_stats table
    # ------------------------------------------------------------------
    op.create_table(
        'character_stats',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('character_id', sa.Integer(), sa.ForeignKey('character.id'), nullable=False),
        sa.Column('era_id', sa.Integer(), sa.ForeignKey('era.id'), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('all_time_score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('level', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('votes_available', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('character_id', 'era_id', name='uq_character_stats_character_era'),
    )

    # ------------------------------------------------------------------
    # 7. Role table: make description non-nullable + add timestamps
    # ------------------------------------------------------------------
    conn.execute(sa.text("UPDATE role SET description = '' WHERE description IS NULL"))
    op.alter_column('role', 'description', nullable=False, server_default='')
    op.add_column('role', sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.add_column('role', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # ------------------------------------------------------------------
    # 8. Era table: make notes non-nullable + add updated_at
    # ------------------------------------------------------------------
    conn.execute(sa.text("UPDATE era SET notes = '' WHERE notes IS NULL"))
    op.alter_column('era', 'notes', nullable=False, server_default='')
    op.add_column('era', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # ------------------------------------------------------------------
    # 9. Task table: make description/primary_faction_slug non-nullable + updated_at
    # ------------------------------------------------------------------
    conn.execute(sa.text("UPDATE task SET description = '' WHERE description IS NULL"))
    op.alter_column('task', 'description', nullable=False, server_default='')

    conn.execute(sa.text("UPDATE task SET primary_faction_slug = 'na' WHERE primary_faction_slug IS NULL"))
    op.alter_column('task', 'primary_faction_slug', nullable=False, server_default='na')

    op.add_column('task', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # ------------------------------------------------------------------
    # 10. CharacterTask table: add updated_at
    # ------------------------------------------------------------------
    op.add_column('character_task', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # ------------------------------------------------------------------
    # 11. Submission table: make body_text non-nullable
    # ------------------------------------------------------------------
    conn.execute(sa.text("UPDATE submission SET body_text = '' WHERE body_text IS NULL"))
    op.alter_column('submission', 'body_text', nullable=False, server_default='')

    # ------------------------------------------------------------------
    # 12. Flag table: make reason non-nullable
    # ------------------------------------------------------------------
    conn.execute(sa.text("UPDATE flag SET reason = '' WHERE reason IS NULL"))
    op.alter_column('flag', 'reason', nullable=False, server_default='')

    # ------------------------------------------------------------------
    # 13. Relationship table: add updated_at
    # ------------------------------------------------------------------
    op.add_column('relationship', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))

    # ------------------------------------------------------------------
    # 14. MetaTask table: add updated_at
    # ------------------------------------------------------------------
    op.add_column('meta_task', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))


def downgrade() -> None:
    conn = op.get_bind()

    # Reverse in opposite order

    op.drop_column('meta_task', 'updated_at')
    op.drop_column('relationship', 'updated_at')

    conn.execute(sa.text("ALTER TABLE flag ALTER COLUMN reason DROP NOT NULL"))
    op.drop_column('submission', 'updated_at')

    op.drop_column('character_task', 'updated_at')

    op.drop_column('task', 'updated_at')
    op.alter_column('task', 'primary_faction_slug', nullable=True, server_default=None)
    op.alter_column('task', 'description', nullable=True, server_default=None)

    op.drop_column('era', 'updated_at')
    op.alter_column('era', 'notes', nullable=True, server_default=None)

    op.drop_column('role', 'updated_at')
    op.drop_column('role', 'created_at')
    op.alter_column('role', 'description', nullable=True, server_default=None)

    op.drop_table('character_stats')

    # Restore character stats columns
    op.add_column('character', sa.Column('score', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('character', sa.Column('all_time_score', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('character', sa.Column('level', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('character', sa.Column('votes_available', sa.Integer(), nullable=False, server_default='0'))

    op.drop_column('character', 'updated_at')
    op.alter_column('character', 'faction_slug', nullable=True, server_default=None)
    op.alter_column('character', 'location', nullable=True, server_default=None)
    op.alter_column('character', 'avatar_url', nullable=True, server_default=None)
    op.alter_column('character', 'bio', nullable=True, server_default=None)

    op.add_column('character', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    conn.execute(sa.text(
        "UPDATE character SET is_active = CASE WHEN status = 'active' THEN true ELSE false END"
    ))
    op.drop_column('character', 'status')

    op.drop_column('oauth_provider', 'updated_at')

    op.drop_column('account', 'updated_at')
    op.add_column('account', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    conn.execute(sa.text(
        "UPDATE account SET is_active = CASE WHEN status = 'active' THEN true ELSE false END"
    ))
    op.drop_column('account', 'status')

    op.drop_column('faction', 'updated_at')
    op.drop_column('faction', 'created_at')
    op.alter_column('faction', 'description', nullable=True, server_default=None)

    op.add_column('faction', sa.Column('is_hidden', sa.Boolean(), nullable=False, server_default='false'))
    conn.execute(sa.text(
        "UPDATE faction SET is_hidden = CASE WHEN status = 'hidden' THEN true ELSE false END"
    ))
    op.drop_column('faction', 'status')

    conn.execute(sa.text("DELETE FROM faction WHERE slug = 'na'"))

    op.execute("DROP TYPE factionstatus")
    op.execute("DROP TYPE characterstatus")
    op.execute("DROP TYPE accountstatus")
