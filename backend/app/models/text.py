from sqlalchemy import Index, SmallInteger, String, Text as SAText, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db
from app.models.mixins import CreatedAtMixin


class Text(CreatedAtMixin, db.Model):
    __tablename__ = "texts"
    __table_args__ = (
        UniqueConstraint("mode", "lang", "content"),
        Index("ix_texts_mode_lang_difficulty", "mode", "lang", "difficulty"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    mode: Mapped[str] = mapped_column(String(16), nullable=False)
    lang: Mapped[str] = mapped_column(String(16), nullable=False)
    difficulty: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    content: Mapped[str] = mapped_column(SAText, nullable=False)
