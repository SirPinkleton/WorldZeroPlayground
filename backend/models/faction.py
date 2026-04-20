import enum

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base
from models.mixins import TimestampMixin


class FactionStatus(enum.Enum):
    visible = "visible"
    hidden = "hidden"
    deprecated = "deprecated"


class Faction(TimestampMixin, Base):
    __tablename__ = "faction"

    slug: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False, server_default="")
    status: Mapped[FactionStatus] = mapped_column(
        Enum(FactionStatus, create_type=False), nullable=False, default=FactionStatus.visible
    )
    # No multiplier columns: faction rules live in game_config.py, not the DB.
    # This table exists for FK references and UI display only.
