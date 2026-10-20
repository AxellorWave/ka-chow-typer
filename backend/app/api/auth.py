from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    current_user,
    get_jwt,
    jwt_required,
    set_refresh_cookies,
    unset_jwt_cookies,
)

from app.extensions import limiter
from app.schemas.auth import LoginSchema, RegisterSchema
from app.schemas.user import user_schema
from app.security import (
    login_rate_key,
    revoke_refresh_token,
    rotate_refresh_token,
    session_response,
)
from app.services.auth import authenticate, register_user

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

register_schema = RegisterSchema()
login_schema = LoginSchema()


@auth_bp.post("/register")
@limiter.limit("20 per hour")
def register():
    data = register_schema.load(request.get_json(silent=True) or {})
    user = register_user(**data)
    return session_response(user, 201)


@auth_bp.post("/login")
@limiter.limit("30 per minute")
@limiter.limit("10 per minute", key_func=login_rate_key)
def login():
    data = login_schema.load(request.get_json(silent=True) or {})
    user = authenticate(**data)
    return session_response(user)


@auth_bp.post("/refresh")
@limiter.limit("30 per minute")
@jwt_required(refresh=True, locations=["cookies"])
def refresh():
    refresh_token = rotate_refresh_token(current_user, get_jwt()["jti"])
    response = jsonify(
        access_token=create_access_token(identity=current_user), user=user_schema.dump(current_user)
    )
    set_refresh_cookies(response, refresh_token)
    return response


@auth_bp.post("/logout")
def logout():
    revoke_refresh_token(request.cookies.get(current_app.config["JWT_REFRESH_COOKIE_NAME"]))
    response = jsonify(status="ok")
    unset_jwt_cookies(response)
    return response


@auth_bp.get("/me")
@jwt_required(locations=["headers"])
def me():
    return jsonify(user=user_schema.dump(current_user))
