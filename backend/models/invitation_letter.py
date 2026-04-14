from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base


class InvitationLetter(Base):
    """Tracks which faction invitation letters have been delivered to a character.

    A letter is delivered when a qualifying character (level >= 3, score >= 20)
    completes a task from a given faction. UA Masters sends invitations to all
    qualifying characters regardless of task faction. Letters are era-scoped and
    appear in the player's update feed.
    """

    __tablename__ = "invitation_letter"
    __table_args__ = (
        UniqueConstraint("character_id", "faction_slug", "era_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    character_id: Mapped[int] = mapped_column(
        ForeignKey("character.id"), nullable=False
    )
    faction_slug: Mapped[str] = mapped_column(
        ForeignKey("faction.slug"), nullable=False
    )
    era_id: Mapped[int] = mapped_column(
        ForeignKey("era.id"), nullable=False
    )
    delivered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
