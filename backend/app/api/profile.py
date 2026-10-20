from flask import Blueprint, jsonify, request
from flask_jwt_extended import current_user, jwt_required

from app.errors import ApiError
from app.schemas.profile import PasswordChangeSchema, ProfileUpdateSchema
from app.schemas.user import user_schema
from app.security import session_response
from app.services.profile import change_password, remove_avatar, save_avatar, update_nickname

profile_bp = Blueprint("profile", __name__, url_prefix="/profile")

profile_update_schema = ProfileUpdateSchema()
password_change_schema = PasswordChangeSchema()


@profile_bp.patch("")
@jwt_required(locations=["headers"])
def patch_profile():
    data = profile_update_schema.load(request.get_json(silent=True) or {})
    return jsonify(user=user_schema.dump(update_nickname(current_user, data["nickname"])))


@profile_bp.post("/password")
@jwt_required(locations=["headers"])
def post_password():
    data = password_change_schema.load(request.get_json(silent=True) or {})
    return session_response(change_password(current_user, **data))


@profile_bp.post("/avatar")
@jwt_required(locations=["headers"])
def post_avatar():
    file = request.files.get("file")
    if file is None:
        raise ApiError(400, "validation_error", "Выберите фото", {"file": ["Обязательное поле"]})
    return jsonify(user=user_schema.dump(save_avatar(current_user, file)))


@profile_bp.delete("/avatar")
@jwt_required(locations=["headers"])
def delete_avatar():
    return jsonify(user=user_schema.dump(remove_avatar(current_user)))
