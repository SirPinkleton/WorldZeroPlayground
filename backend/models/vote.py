from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Index, Integer, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.praxis import Praxis


class Vote(Base):
    __tablename__ = "vote"
    __table_args__ = (
        # Solo/collab votes: one vote per voter per praxis (praxis_member_id IS NULL).
        # Partial unique index because duel-vote rows share (praxis_id, voter_character_id)
        # triples and must be de-duplicated only among themselves.
        Index(
            "uq_vote_praxis",
            "praxis_id",
            "voter_character_id",
            unique=True,
            postgresql_where=text("praxis_member_id IS NULL"),
        ),
        # Duel votes: one vote per voter per target member per praxis.
        # Partial index restricted to non-null praxis_member_id so the composite
        # actually enforces uniqueness (NULLs are distinct in btree uniques).
        Index(
            "uq_vote_duel",
            "praxis_id",
            "voter_character_id",
            "praxis_member_id",
            unique=True,
            postgresql_where=text("praxis_member_id IS NOT NULL"),
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    praxis_id: Mapped[int] = mapped_column(ForeignKey("praxis.id"), nullable=False)
    voter_character_id: Mapped[int] = mapped_column(
        ForeignKey("character.id"), nullable=False
    )
    voter_account_id: Mapped[int] = mapped_column(
        ForeignKey("account.id"), nullable=False
    )
    stars: Mapped[int] = mapped_column(Integer, nullable=False)
    # praxis_member_id is required for duel votes; NULL for solo/collab votes.
    praxis_member_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("praxis_member.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    praxis: Mapped["Praxis"] = relationship(
        "Praxis", foreign_keys=[praxis_id], back_populates="votes", lazy="raise"
    )
