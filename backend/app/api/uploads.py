from flask import Blueprint, send_from_directory

from app.services.profile import avatars_dir

uploads_bp = Blueprint("uploads", __name__, url_prefix="/uploads")

AVATAR_MAX_AGE = 365 * 24 * 60 * 60


@uploads_bp.get("/avatars/<path:name>")
def get_avatar(name):
    response = send_from_directory(avatars_dir(), name, max_age=AVATAR_MAX_AGE)
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response
