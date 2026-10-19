from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, current_user, jwt_required, unset_jwt_cookies

from app.schemas.auth import LoginSchema, RegisterSchema
from app.schemas.user import user_schema
from app.security import session_response
from app.services.auth import authenticate, register_user

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

register_schema = RegisterSchema()
login_schema = LoginSchema()


@auth_bp.post("/register")
def register():
    data = register_schema.load(request.get_json(silent=True) or {})
    user = register_user(**data)
    return session_response(user, 201)


@auth_bp.post("/login")
def login():
    data = login_schema.load(request.get_json(silent=True) or {})
    user = authenticate(**data)
    return session_response(user)


@auth_bp.post("/refresh")
@jwt_required(refresh=True, locations=["cookies"])
def refresh():
    return jsonify(
        access_token=create_access_token(identity=current_user), user=user_schema.dump(current_user)
    )


@auth_bp.post("/logout")
def logout():
    response = jsonify(status="ok")
    unset_jwt_cookies(response)
    return response


@auth_bp.get("/me")
@jwt_required(locations=["headers"])
def me():
    return jsonify(user=user_schema.dump(current_user))
