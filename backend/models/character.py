import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class CharacterStatus(enum.Enum):
    active = "active"
    paused = "paused"
    banned = "banned"


class Character(Base):
    __tablename__ = "character"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("account.id"), nullable=False)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String, nullable=False)
    bio: Mapped[str] = mapped_column(Text, nullable=False, server_default="")
    avatar_url: Mapped[str] = mapped_column(String, nullable=False, server_default="")
    location: Mapped[str] = mapped_column(String, nullable=False, server_default="")
    # faction_slug defaults to "ua" — the starting faction for all new characters
    faction_slug: Mapped[str] = mapped_column(
        ForeignKey("faction.slug"), nullable=False, server_default="ua"
    )
    status: Mapped[CharacterStatus] = mapped_column(
        Enum(CharacterStatus, create_type=False), nullable=False, default=CharacterStatus.active
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    # score, level, votes_available, all_time_score live in CharacterStats (star schema split)
