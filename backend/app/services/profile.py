import secrets
from io import BytesIO
from pathlib import Path

from flask import current_app
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from app.errors import ApiError
from app.extensions import db
from app.models import User
from app.security import revoke_user_refresh_tokens
from app.services.clock import msk_now

AVATAR_URL_PREFIX = "/api/uploads/avatars/"
AVATAR_SIZE = 512
AVATAR_MAX_PIXELS = 40_000_000
AVATAR_FORMATS = ("PNG", "JPEG", "WEBP")


def avatars_dir():
    path = Path(current_app.config["UPLOAD_DIR"]) / "avatars"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _unsupported_image():
    return ApiError(415, "unsupported_image", "Подойдёт фото в формате PNG, JPEG или WebP")


def reencode_avatar(data):
    try:
        with Image.open(BytesIO(data), formats=AVATAR_FORMATS) as image:
            if image.width * image.height > AVATAR_MAX_PIXELS:
                raise _unsupported_image()
            image = ImageOps.exif_transpose(image)
            image = image.convert("RGBA" if image.mode in ("RGBA", "LA", "P") else "RGB")
            image.thumbnail((AVATAR_SIZE, AVATAR_SIZE))
            output = BytesIO()
            image.save(output, "WEBP", quality=85)
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise _unsupported_image()
    return output.getvalue()


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
    avatar = reencode_avatar(data)

    name = f"{user.id}-{secrets.token_hex(8)}.webp"
    path = avatars_dir() / name
    path.write_bytes(avatar)
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


def change_password(user, current_password, new_password):
    if user.password_hash is not None and not (
        current_password and check_password_hash(user.password_hash, current_password)
    ):
        raise ApiError(
            400,
            "invalid_password",
            "Неверный текущий пароль",
            {"current_password": ["Неверный текущий пароль"]},
        )
    user.password_hash = generate_password_hash(new_password)
    user.password_changed_at = msk_now()
    revoke_user_refresh_tokens(user)
    db.session.commit()
    return user
