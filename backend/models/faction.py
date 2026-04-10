from typing import Optional

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class Faction(Base):
    __tablename__ = "faction"

    slug: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_hidden: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    # No multiplier columns: faction rules live in game_config.py, not the DB.
    # This table exists for FK references and UI display only.
