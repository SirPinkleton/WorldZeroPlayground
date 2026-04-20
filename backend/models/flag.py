from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base
from models.mixins import CreatedAtMixin

if TYPE_CHECKING:
    from models.praxis import Praxis


class Flag(CreatedAtMixin, Base):
    __tablename__ = "flag"

    id: Mapped[int] = mapped_column(primary_key=True)
    praxis_id: Mapped[int] = mapped_column(ForeignKey("praxis.id"), nullable=False)
    flagged_by: Mapped[int] = mapped_column(ForeignKey("character.id"), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False, server_default="")

    praxis: Mapped["Praxis"] = relationship(
        "Praxis", back_populates="flags", lazy="raise"
    )
