import secrets
from pathlib import Path

from flask import current_app
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.errors import ApiError
from app.extensions import db
from app.models import User

AVATAR_URL_PREFIX = "/api/uploads/avatars/"
IMAGE_SIGNATURES = (
    (b"\x89PNG\r\n\x1a\n", "png"),
    (b"\xff\xd8\xff", "jpg"),
)


def avatars_dir():
    path = Path(current_app.config["UPLOAD_DIR"]) / "avatars"
    path.mkdir(parents=True, exist_ok=True)
    return path


def detect_image(data):
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    for signature, extension in IMAGE_SIGNATURES:
        if data.startswith(signature):
            return extension
    return None


def _remove_stored_avatar(url):
    if url and url.startswith(AVATAR_URL_PREFIX):
        (avatars_dir() / url.removeprefix(AVATAR_URL_PREFIX)).unlink(missing_ok=True)


def update_nickname(user, nickname):
    if nickname == user.nickname:
        return user
    taken = db.session.scalar(select(User.id).where(User.nickname == nickname, User.id != user.id))
    if taken:
        raise ApiError(409, "nickname_taken", "Этот ник уже занят")
    user.nickname = nickname
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ApiError(409, "nickname_taken", "Этот ник уже занят")
    return user


def save_avatar(user, file):
    limit = current_app.config["MAX_AVATAR_BYTES"]
    data = file.read(limit + 1)
    if len(data) > limit:
        raise ApiError(413, "file_too_large", f"Фото должно быть не больше {limit // 1024} КБ")
    extension = detect_image(data)
    if extension is None:
        raise ApiError(415, "unsupported_image", "Подойдёт фото в формате PNG, JPEG или WebP")

    name = f"{user.id}-{secrets.token_hex(8)}.{extension}"
    path = avatars_dir() / name
    path.write_bytes(data)
    previous = user.avatar_url
    user.avatar_url = AVATAR_URL_PREFIX + name
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        path.unlink(missing_ok=True)
        raise
    _remove_stored_avatar(previous)
    return user


def remove_avatar(user):
    previous = user.avatar_url
    user.avatar_url = None
    db.session.commit()
    _remove_stored_avatar(previous)
    return user
