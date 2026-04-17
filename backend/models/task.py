import enum
from datetime import datetime
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.praxis import Praxis


class TaskStatus(enum.Enum):
    pending = "pending"
    active = "active"
    retired = "retired"


class Task(Base):
    __tablename__ = "task"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, server_default="")
    point_value: Mapped[int] = mapped_column(Integer, nullable=False)
    level_required: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, create_type=False), default=TaskStatus.pending, nullable=False
    )
    created_by: Mapped[int] = mapped_column(ForeignKey("character.id"), nullable=False)
    # "na" is the sentinel for generic cross-faction tasks
    primary_faction_slug: Mapped[str] = mapped_column(
        ForeignKey("faction.slug"), nullable=False, server_default="na"
    )
    is_task_vision_eligible: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    praxes: Mapped[List["Praxis"]] = relationship(
        "Praxis", back_populates="task", lazy="raise"
    )


class TaskFaction(Base):
    """Join table for future multi-faction task support."""

    __tablename__ = "task_faction"

    task_id: Mapped[int] = mapped_column(ForeignKey("task.id"), primary_key=True)
    faction_slug: Mapped[str] = mapped_column(
        ForeignKey("faction.slug"), primary_key=True
    )
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
