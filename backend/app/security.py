from datetime import UTC, datetime, timedelta

from flask import jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_jwt_identity,
    set_refresh_cookies,
)
from flask_jwt_extended.exceptions import JWTExtendedException
from jwt import PyJWTError
from sqlalchemy import delete

from app.errors import error_response
from app.extensions import db, jwt
from app.models import RefreshToken, User
from app.schemas.user import user_schema
from app.services.clock import msk_now

REFRESH_ROTATION_GRACE = timedelta(seconds=30)


@jwt.user_identity_loader
def user_identity(user):
    return str(user.id)


@jwt.user_lookup_loader
def user_lookup(_jwt_header, jwt_data):
    return db.session.get(User, int(jwt_data["sub"]))


@jwt.token_in_blocklist_loader
def token_revoked(_jwt_header, jwt_data):
    user = db.session.get(User, int(jwt_data["sub"]))
    if user is None:
        return False
    if jwt_data["type"] == "refresh":
        stored = db.session.get(RefreshToken, jwt_data["jti"])
        if stored is None or stored.expires_at <= msk_now():
            return True
    if user.password_changed_at is None:
        return False
    return jwt_data["iat"] < int(user.password_changed_at.timestamp())


@jwt.revoked_token_loader
def revoked_token(_jwt_header, _jwt_data):
    return error_response(401, "token_revoked", "Сессия завершена, войдите снова")


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


def issue_refresh_token(user):
    token = create_refresh_token(identity=user)
    claims = decode_token(token)
    db.session.execute(
        delete(RefreshToken).where(
            RefreshToken.user_id == user.id, RefreshToken.expires_at <= msk_now()
        )
    )
    db.session.add(
        RefreshToken(
            jti=claims["jti"],
            user_id=user.id,
            expires_at=datetime.fromtimestamp(claims["exp"], UTC),
        )
    )
    db.session.commit()
    return token


def rotate_refresh_token(user, jti):
    stored = db.session.get(RefreshToken, jti)
    grace_until = msk_now() + REFRESH_ROTATION_GRACE
    if stored is not None and stored.expires_at > grace_until:
        stored.expires_at = grace_until
    return issue_refresh_token(user)


def revoke_refresh_token(token):
    if not token:
        return
    try:
        claims = decode_token(token, allow_expired=True)
    except (JWTExtendedException, PyJWTError):
        return
    db.session.execute(delete(RefreshToken).where(RefreshToken.jti == claims["jti"]))
    db.session.commit()


def revoke_user_refresh_tokens(user):
    db.session.execute(delete(RefreshToken).where(RefreshToken.user_id == user.id))


def user_rate_key():
    return f"user:{get_jwt_identity()}"


def login_rate_key():
    email = (request.get_json(silent=True) or {}).get("email")
    return f"login:{str(email).strip().lower()}"


def session_response(user, status=200):
    response = jsonify(access_token=create_access_token(identity=user), user=user_schema.dump(user))
    response.status_code = status
    set_refresh_cookies(response, issue_refresh_token(user))
    return response
