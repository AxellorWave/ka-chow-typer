from urllib.parse import urlencode

import requests
from flask import current_app, request

from app.models.enums import OAuthProvider
from app.services.oauth import OAuthError, OAuthProfile

AUTHORIZE_URL = "https://id.vk.ru/authorize"
TOKEN_URL = "https://id.vk.ru/oauth2/auth"
PROFILE_URL = "https://id.vk.ru/oauth2/user_info"
SCOPE = "vkid.personal_info email"
TIMEOUT = 10


def is_configured():
    config = current_app.config
    return bool(config["VK_CLIENT_ID"] and config["VK_REDIRECT_URI"])


def authorize_url(state, code_challenge):
    config = current_app.config
    params = {
        "response_type": "code",
        "client_id": config["VK_CLIENT_ID"],
        "redirect_uri": config["VK_REDIRECT_URI"],
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
        "scope": SCOPE,
    }
    return f"{AUTHORIZE_URL}?{urlencode(params)}"


def _post(url, data, action):
    response = requests.post(url, data=data, headers={"Accept": "application/json"}, timeout=TIMEOUT)
    try:
        payload = response.json()
    except ValueError:
        payload = {}
    if response.status_code != 200 or "error" in payload:
        current_app.logger.warning("VK ID %s failed: %s %s", action, response.status_code, response.text)
        raise OAuthError("oauth_failed")
    return payload


def _exchange_code(code, code_verifier, device_id, state):
    config = current_app.config
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "code_verifier": code_verifier,
        "client_id": config["VK_CLIENT_ID"],
        "device_id": device_id,
        "redirect_uri": config["VK_REDIRECT_URI"],
        "state": state,
    }
    if config["VK_CLIENT_SECRET"]:
        data["client_secret"] = config["VK_CLIENT_SECRET"]
    return _post(TOKEN_URL, data, "token exchange")["access_token"]


def _fetch_profile(access_token):
    payload = _post(
        PROFILE_URL,
        {"access_token": access_token, "client_id": current_app.config["VK_CLIENT_ID"]},
        "user_info",
    )
    return payload.get("user", payload)


def fetch_profile(code, code_verifier):
    device_id = request.args.get("device_id")
    if not device_id:
        raise OAuthError("oauth_failed")
    try:
        data = _fetch_profile(_exchange_code(code, code_verifier, device_id, request.args.get("state", "")))
    except requests.RequestException as exc:
        current_app.logger.warning("VK ID request error: %s", exc)
        raise OAuthError("oauth_failed")

    full_name = "_".join(part for part in (data.get("first_name"), data.get("last_name")) if part)
    return OAuthProfile(
        provider=OAuthProvider.VK.value,
        provider_user_id=str(data["user_id"]),
        nickname=full_name or None,
        email=data.get("email") or None,
        avatar_url=data.get("avatar") or None,
    )
