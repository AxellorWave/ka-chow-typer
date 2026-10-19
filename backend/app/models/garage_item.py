from sqlalchemy import Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class GarageItem(db.Model):
    __tablename__ = "garage_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    slot: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(128), nullable=False)
    asset: Mapped[str | None] = mapped_column(String(256))
    unlock_type: Mapped[str] = mapped_column(
        String(16), default="default", server_default=text("'default'"), nullable=False
    )
    unlock_value: Mapped[str | None] = mapped_column(String(64))
    sort_order: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0"), nullable=False
    )
