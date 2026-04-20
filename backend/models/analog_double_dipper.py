from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base
from models.mixins import CreatedAtMixin


class AnalogDoubleDipper(CreatedAtMixin, Base):
    """One row per level tier for Analog faction players.

    The Double Dipper ability lets an Analog player designate one task per level
    tier as their repeatable task. They may complete it a second time for full
    points with a brand new praxis. The designation is locked once chosen and
    cannot be changed.
    """

    __tablename__ = "analog_double_dipper"
    __table_args__ = (
        UniqueConstraint("character_id", "level_tier"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    character_id: Mapped[int] = mapped_column(
        ForeignKey("character.id"), nullable=False
    )
    level_tier: Mapped[int] = mapped_column(Integer, nullable=False)
    task_id: Mapped[int] = mapped_column(
        ForeignKey("task.id"), nullable=False
    )
