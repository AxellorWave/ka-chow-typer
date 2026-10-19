from sqlalchemy import Integer, SmallInteger, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class Track(db.Model):
    __tablename__ = "tracks"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    mode: Mapped[str] = mapped_column(String(16), nullable=False)
    lang: Mapped[str] = mapped_column(String(16), nullable=False)
    difficulty: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    min_level: Mapped[int] = mapped_column(
        Integer, default=1, server_default=text("1"), nullable=False
    )
    cup_requirements: Mapped[list] = mapped_column(JSONB, nullable=False)
