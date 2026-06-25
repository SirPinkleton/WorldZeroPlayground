from typing import TYPE_CHECKING, Optional

from sqlalchemy import CheckConstraint, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from models.mixins import CreatedAtMixin

if TYPE_CHECKING:
    from models.praxis import Praxis


class Flag(CreatedAtMixin, Base):
    """Moderation flag against exactly one of a praxis or a comment (ADR-0006).

    Same two-target pattern as Comment: ``praxis_id`` and ``comment_id`` are both
    nullable with a CHECK that exactly one is set.
    """

    __tablename__ = "flag"
    __table_args__ = (
        CheckConstraint(
            "num_nonnulls(praxis_id, comment_id) = 1", name="ck_flag_one_target"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    praxis_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("praxis.id"), nullable=True
    )
    comment_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("comment.id"), nullable=True
    )
    flagged_by: Mapped[int] = mapped_column(ForeignKey("character.id"), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False, server_default="")

    praxis: Mapped[Optional["Praxis"]] = relationship(
        "Praxis", back_populates="flags", lazy="raise"
    )
