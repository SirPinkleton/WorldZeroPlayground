from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.submission import Submission


class Vote(Base):
    __tablename__ = "vote"
    __table_args__ = (
        # Solo-submission votes: one vote per voter per submission
        UniqueConstraint("submission_id", "voter_character_id", name="uq_vote_solo"),
        # Duel votes: one vote per voter per target player per submission
        UniqueConstraint(
            "submission_id", "voter_character_id", "duel_vote_for", name="uq_vote_duel"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("submission.id"), nullable=False)
    voter_character_id: Mapped[int] = mapped_column(
        ForeignKey("character.id"), nullable=False
    )
    voter_account_id: Mapped[int] = mapped_column(
        ForeignKey("account.id"), nullable=False
    )
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    # duel_vote_for is required for duel votes; NULL for solo/collab votes.
    duel_vote_for: Mapped[Optional[int]] = mapped_column(
        ForeignKey("character.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    submission: Mapped["Submission"] = relationship(
        "Submission", foreign_keys=[submission_id], back_populates="votes", lazy="raise"
    )
