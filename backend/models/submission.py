import enum
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base

if TYPE_CHECKING:
    from models.character import Character
    from models.flag import Flag
    from models.task import Task
    from models.vote import Vote
    from models.praxis import MediaItem


class SubmissionType(enum.Enum):
    solo = "solo"
    collaboration = "collaboration"
    duel = "duel"


class CollabModeEnum(enum.Enum):
    collaboration = "collaboration"
    duel = "duel"


class SubmissionStatus(enum.Enum):
    in_progress = "in_progress"
    published = "published"


class SubmissionInviteStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"


class Submission(Base):
    """Unified submission table replacing Praxis and Collaboration.

    solo rows: character_id set, collab_* columns NULL.
    collaboration/duel rows: created_by_id set, character_id NULL.
    """

    __tablename__ = "submission"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Shared
    task_id: Mapped[int] = mapped_column(ForeignKey("task.id"), nullable=False)
    submission_type: Mapped[SubmissionType] = mapped_column(
        Enum(SubmissionType, create_type=False), nullable=False
    )
    moderation_status: Mapped[str] = mapped_column(
        String, nullable=False, server_default="visible"
    )
    is_withdrawn: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    admin_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    flagged_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Solo-only (nullable when type != solo)
    character_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("character.id"), nullable=True
    )
    title: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    body_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Collaboration/duel-only (nullable when type == solo)
    collab_mode: Mapped[Optional[CollabModeEnum]] = mapped_column(
        Enum(CollabModeEnum, create_type=False), nullable=True
    )
    collab_status: Mapped[Optional[SubmissionStatus]] = mapped_column(
        Enum(SubmissionStatus, create_type=False), nullable=True
    )
    created_by_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("character.id"), nullable=True
    )
    collab_body_text: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, server_default=""
    )

    # Relationships
    task: Mapped["Task"] = relationship("Task", lazy="selectin")
    character: Mapped[Optional["Character"]] = relationship(
        "Character",
        foreign_keys=[character_id],
        lazy="selectin",
    )
    created_by: Mapped[Optional["Character"]] = relationship(
        "Character",
        foreign_keys=[created_by_id],
        lazy="selectin",
    )
    members: Mapped[List["SubmissionMember"]] = relationship(
        "SubmissionMember",
        back_populates="submission",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    invites: Mapped[List["SubmissionInvite"]] = relationship(
        "SubmissionInvite",
        back_populates="submission",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    votes: Mapped[List["Vote"]] = relationship(
        "Vote",
        foreign_keys="Vote.submission_id",
        back_populates="submission",
        lazy="selectin",
    )
    media_items: Mapped[List["MediaItem"]] = relationship(
        "MediaItem",
        foreign_keys="MediaItem.submission_id",
        back_populates="submission",
        order_by="MediaItem.display_order",
        lazy="selectin",
    )
    flags: Mapped[List["Flag"]] = relationship(
        "Flag",
        foreign_keys="Flag.submission_id",
        back_populates="submission",
        lazy="selectin",
    )


class SubmissionMember(Base):
    __tablename__ = "submission_member"
    __table_args__ = (UniqueConstraint("submission_id", "character_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("submission.id"), nullable=False)
    character_id: Mapped[int] = mapped_column(ForeignKey("character.id"), nullable=False)
    has_submitted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    title: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    body_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    submission: Mapped["Submission"] = relationship(
        "Submission", back_populates="members", lazy="raise"
    )
    character: Mapped["Character"] = relationship("Character", lazy="selectin")


class SubmissionInvite(Base):
    __tablename__ = "submission_invite"

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("submission.id"), nullable=False)
    inviter_id: Mapped[int] = mapped_column(ForeignKey("character.id"), nullable=False)
    invitee_id: Mapped[int] = mapped_column(ForeignKey("character.id"), nullable=False)
    invite_type: Mapped[CollabModeEnum] = mapped_column(
        Enum(CollabModeEnum, create_type=False), nullable=False
    )
    status: Mapped[SubmissionInviteStatus] = mapped_column(
        Enum(SubmissionInviteStatus, create_type=False),
        nullable=False,
        server_default="pending",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    submission: Mapped["Submission"] = relationship(
        "Submission", back_populates="invites", lazy="raise"
    )
    inviter: Mapped["Character"] = relationship(
        "Character", foreign_keys=[inviter_id], lazy="selectin"
    )
    invitee: Mapped["Character"] = relationship(
        "Character", foreign_keys=[invitee_id], lazy="selectin"
    )
