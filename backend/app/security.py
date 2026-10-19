from flask import jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, set_refresh_cookies

from app.errors import error_response
from app.extensions import db, jwt
from app.models import User
from app.schemas.user import user_schema


@jwt.user_identity_loader
def user_identity(user):
    return str(user.id)


@jwt.user_lookup_loader
def user_lookup(_jwt_header, jwt_data):
    return db.session.get(User, int(jwt_data["sub"]))


@jwt.user_lookup_error_loader
def user_lookup_error(_jwt_header, _jwt_data):
    return error_response(401, "user_not_found", "Пользователь не найден")


@jwt.unauthorized_loader
def missing_token(reason):
    return error_response(401, "unauthorized", "Требуется авторизация")


@jwt.invalid_token_loader
def invalid_token(reason):
    return error_response(401, "invalid_token", "Недействительный токен")


@jwt.expired_token_loader
def expired_token(_jwt_header, _jwt_data):
    return error_response(401, "token_expired", "Срок действия токена истёк")


def session_response(user, status=200):
    response = jsonify(access_token=create_access_token(identity=user), user=user_schema.dump(user))
    response.status_code = status
    set_refresh_cookies(response, create_refresh_token(identity=user))
    return response
