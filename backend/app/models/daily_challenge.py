from datetime import date

from sqlalchemy import Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db
from app.models.mixins import CreatedAtMixin


class DailyChallenge(CreatedAtMixin, db.Model):
    __tablename__ = "daily_challenges"

    date: Mapped[date] = mapped_column(Date, primary_key=True)
    text_id: Mapped[int] = mapped_column(ForeignKey("texts.id", ondelete="RESTRICT"), nullable=False)

    text: Mapped["Text"] = relationship()
