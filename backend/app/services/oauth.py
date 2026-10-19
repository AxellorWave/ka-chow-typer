import base64
import hashlib
import re
import secrets
from dataclasses import dataclass
from urllib.parse import urlencode

from flask import current_app, redirect, request
from flask_jwt_extended import create_refresh_token, set_refresh_cookies
from itsdangerous import BadSignature, URLSafeTimedSerializer
from sqlalchemy import select

from app.extensions import db
from app.models import OAuthAccount, User

STATE_COOKIE = "kachow_oauth_state"
STATE_MAX_AGE = 600
NICKNAME_MIN = 3
NICKNAME_MAX = 32
NICKNAME_FALLBACK = "racer"


@dataclass(frozen=True)
class OAuthProfile:
    provider: str
    provider_user_id: str
    nickname: str | None
    email: str | None
    avatar_url: str | None


class OAuthError(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def _serializer():
    return URLSafeTimedSerializer(current_app.secret_key, salt="oauth-state")


def _cookie_path():
    return current_app.config["JWT_REFRESH_COOKIE_PATH"]


def generate_pkce():
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode()).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()
    return verifier, challenge


def start_response(provider, authorize_url):
    state = secrets.token_urlsafe(32)
    verifier, challenge = generate_pkce()
    response = redirect(authorize_url(state, challenge))
    response.set_cookie(
        STATE_COOKIE,
        _serializer().dumps({"provider": provider, "state": state, "verifier": verifier}),
        max_age=STATE_MAX_AGE,
        path=_cookie_path(),
        httponly=True,
        secure=current_app.config["JWT_COOKIE_SECURE"],
        samesite="Lax",
    )
    return response


def consume_state(provider):
    raw = request.cookies.get(STATE_COOKIE)
    if not raw:
        raise OAuthError("invalid_state")
    try:
        saved = _serializer().loads(raw, max_age=STATE_MAX_AGE)
    except BadSignature:
        raise OAuthError("invalid_state")
    received = request.args.get("state", "")
    if saved.get("provider") != provider or not secrets.compare_digest(saved.get("state", ""), received):
        raise OAuthError("invalid_state")
    return saved["verifier"]


def frontend_redirect(error=None, user=None):
    url = current_app.config["FRONTEND_URL"].rstrip("/") + "/oauth/callback"
    if error:
        url += "?" + urlencode({"error": error})
    response = redirect(url)
    response.delete_cookie(STATE_COOKIE, path=_cookie_path())
    if user is not None:
        set_refresh_cookies(response, create_refresh_token(identity=user))
    return response


def _sanitize_nickname(raw):
    nickname = re.sub(r"[^A-Za-zА-Яа-яЁё0-9_\-]+", "_", raw or "").strip("_-")
    if len(nickname) < NICKNAME_MIN:
        nickname = NICKNAME_FALLBACK
    return nickname[:NICKNAME_MAX]


def _nickname_taken(nickname):
    return db.session.scalar(select(User.id).where(User.nickname == nickname)) is not None


def unique_nickname(raw):
    base = _sanitize_nickname(raw)
    if not _nickname_taken(base):
        return base
    while True:
        suffix = f"_{secrets.randbelow(10000):04d}"
        candidate = base[: NICKNAME_MAX - len(suffix)] + suffix
        if not _nickname_taken(candidate):
            return candidate


def find_or_create_user(profile):
    account = db.session.scalar(
        select(OAuthAccount).where(
            OAuthAccount.provider == profile.provider,
            OAuthAccount.provider_user_id == profile.provider_user_id,
        )
    )
    if account is not None:
        user = account.user
        if user.avatar_url is None and profile.avatar_url:
            user.avatar_url = profile.avatar_url
            db.session.commit()
        return user

    email = profile.email.strip().lower() if profile.email else None
    user = db.session.scalar(select(User).where(User.email == email)) if email else None
    if user is None:
        user = User(
            email=email,
            nickname=unique_nickname(profile.nickname),
            avatar_url=profile.avatar_url,
        )
        db.session.add(user)
    elif user.avatar_url is None and profile.avatar_url:
        user.avatar_url = profile.avatar_url

    db.session.add(
        OAuthAccount(
            user=user, provider=profile.provider, provider_user_id=profile.provider_user_id
        )
    )
    db.session.commit()
    return user
