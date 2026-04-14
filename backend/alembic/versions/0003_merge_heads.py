"""Merge faction models and invite status migration heads.

Revision ID: 0003_merge
Revises: 0002_faction_models, 0002_invite_status
Create Date: 2026-04-14

"""
from typing import Sequence, Union

revision: str = "0003_merge"
down_revision: tuple[str, str] = ("0002_faction_models", "0002_invite_status")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
