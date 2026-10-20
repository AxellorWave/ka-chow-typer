from datetime import date

from sqlalchemy import Date, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db
from app.models.mixins import TimestampMixin


class User(TimestampMixin, db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    nickname: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(512))
    xp: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"), nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, server_default=text("1"), nullable=False)
    streak_current: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0"), nullable=False
    )
    streak_best: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0"), nullable=False
    )
    ghosts_beaten: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0"), nullable=False
    )
    last_active_date: Mapped[date | None] = mapped_column(Date)
    car_config: Mapped[dict] = mapped_column(
        JSONB, default=dict, server_default=text("'{}'::jsonb"), nullable=False
    )

    oauth_accounts: Mapped[list["OAuthAccount"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    runs: Mapped[list["Run"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    achievements: Mapped[list["UserAchievement"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )
    tracks: Mapped[list["UserTrack"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", passive_deletes=True
    )

    def __repr__(self):
        return f"<User {self.id} {self.nickname}>"
