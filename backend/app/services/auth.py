from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from app.errors import ApiError
from app.extensions import db
from app.models import User


def register_user(email, password, nickname):
    if db.session.scalar(select(User.id).where(User.email == email)):
        raise ApiError(409, "email_taken", "Этот email уже зарегистрирован")
    if db.session.scalar(select(User.id).where(User.nickname == nickname)):
        raise ApiError(409, "nickname_taken", "Этот ник уже занят")

    user = User(email=email, nickname=nickname, password_hash=generate_password_hash(password))
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ApiError(409, "user_exists", "Пользователь с такими данными уже существует")
    return user


def authenticate(email, password):
    user = db.session.scalar(select(User).where(User.email == email))
    if user is None or user.password_hash is None or not check_password_hash(user.password_hash, password):
        raise ApiError(401, "invalid_credentials", "Неверный email или пароль")
    return user
