from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, SmallInteger, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class UserTrack(db.Model):
    __tablename__ = "user_tracks"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    track_id: Mapped[int] = mapped_column(
        ForeignKey("tracks.id", ondelete="CASCADE"), primary_key=True
    )
    cups: Mapped[int] = mapped_column(
        SmallInteger, default=0, server_default=text("0"), nullable=False
    )
    best_run_id: Mapped[int | None] = mapped_column(ForeignKey("runs.id", ondelete="SET NULL"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="tracks")
    track: Mapped["Track"] = relationship()
