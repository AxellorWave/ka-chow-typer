from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class Run(db.Model):
    __tablename__ = "runs"
    __table_args__ = (
        Index("ix_runs_user_id_created_at", "user_id", "created_at"),
        Index("ix_runs_created_at_wpm", "created_at", "wpm"),
        Index("ix_runs_text_id_wpm", "text_id", "wpm"),
        Index("ix_runs_track_id_wpm", "track_id", "wpm"),
        Index("ix_runs_daily_date_wpm", "daily_date", "wpm"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mode: Mapped[str] = mapped_column(String(16), nullable=False)
    lang: Mapped[str] = mapped_column(String(16), nullable=False)
    difficulty: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    text_id: Mapped[int | None] = mapped_column(ForeignKey("texts.id", ondelete="SET NULL"))
    track_id: Mapped[int | None] = mapped_column(ForeignKey("tracks.id", ondelete="SET NULL"))
    daily_date: Mapped[date | None] = mapped_column(
        Date, ForeignKey("daily_challenges.date", ondelete="SET NULL")
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    duration_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    typed_chars: Mapped[int] = mapped_column(Integer, nullable=False)
    correct_chars: Mapped[int] = mapped_column(Integer, nullable=False)
    errors: Mapped[int] = mapped_column(Integer, nullable=False)
    cpm: Mapped[float] = mapped_column(Float, nullable=False)
    wpm: Mapped[float] = mapped_column(Float, nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)
    max_combo: Mapped[int] = mapped_column(Integer, nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    xp_earned: Mapped[int] = mapped_column(Integer, nullable=False)
    keystrokes: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="runs")
