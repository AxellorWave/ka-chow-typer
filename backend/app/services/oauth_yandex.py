from urllib.parse import urlencode

import requests
from flask import current_app

from app.models.enums import OAuthProvider
from app.services.oauth import OAuthError, OAuthProfile

AUTHORIZE_URL = "https://oauth.yandex.ru/authorize"
TOKEN_URL = "https://oauth.yandex.ru/token"
PROFILE_URL = "https://login.yandex.ru/info"
AVATAR_URL = "https://avatars.yandex.net/get-yapic/{avatar_id}/islands-200"
TIMEOUT = 10


def is_configured():
    config = current_app.config
    return bool(config["YANDEX_CLIENT_ID"] and config["YANDEX_CLIENT_SECRET"] and config["YANDEX_REDIRECT_URI"])


def authorize_url(state, code_challenge):
    config = current_app.config
    params = {
        "response_type": "code",
        "client_id": config["YANDEX_CLIENT_ID"],
        "redirect_uri": config["YANDEX_REDIRECT_URI"],
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    }
    return f"{AUTHORIZE_URL}?{urlencode(params)}"


def _exchange_code(code, code_verifier):
    config = current_app.config
    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": code,
            "client_id": config["YANDEX_CLIENT_ID"],
            "client_secret": config["YANDEX_CLIENT_SECRET"],
            "code_verifier": code_verifier,
        },
        timeout=TIMEOUT,
    )
    if response.status_code != 200:
        current_app.logger.warning("Yandex token exchange failed: %s %s", response.status_code, response.text)
        raise OAuthError("oauth_failed")
    return response.json()["access_token"]


def _fetch_profile(access_token):
    response = requests.get(
        PROFILE_URL,
        params={"format": "json"},
        headers={"Authorization": f"OAuth {access_token}"},
        timeout=TIMEOUT,
    )
    if response.status_code != 200:
        current_app.logger.warning("Yandex profile request failed: %s %s", response.status_code, response.text)
        raise OAuthError("oauth_failed")
    return response.json()


def fetch_profile(code, code_verifier):
    try:
        data = _fetch_profile(_exchange_code(code, code_verifier))
    except requests.RequestException as exc:
        current_app.logger.warning("Yandex request error: %s", exc)
        raise OAuthError("oauth_failed")

    avatar_id = data.get("default_avatar_id")
    has_avatar = avatar_id and not data.get("is_avatar_empty", False)
    return OAuthProfile(
        provider=OAuthProvider.YANDEX.value,
        provider_user_id=str(data["id"]),
        nickname=data.get("login") or data.get("display_name"),
        email=data.get("default_email"),
        avatar_url=AVATAR_URL.format(avatar_id=avatar_id) if has_avatar else None,
    )
