from sqlalchemy import BigInteger, ForeignKey, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class BigramStat(db.Model):
    __tablename__ = "bigram_stats"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    bigram: Mapped[str] = mapped_column(String(8), primary_key=True)
    presses: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"), nullable=False)
    errors: Mapped[int] = mapped_column(Integer, default=0, server_default=text("0"), nullable=False)
    latency_sum_ms: Mapped[int] = mapped_column(
        BigInteger, default=0, server_default=text("0"), nullable=False
    )
