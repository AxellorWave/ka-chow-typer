from flask import Blueprint, abort, current_app, jsonify, request

from app.models.enums import OAuthProvider
from app.services import oauth_vk, oauth_yandex
from app.services.oauth import (
    OAuthError,
    consume_state,
    find_or_create_user,
    frontend_redirect,
    start_response,
)

oauth_bp = Blueprint("oauth", __name__, url_prefix="/auth")

PROVIDERS = {
    OAuthProvider.VK.value: oauth_vk,
    OAuthProvider.YANDEX.value: oauth_yandex,
}


def get_provider(name):
    provider = PROVIDERS.get(name)
    if provider is None:
        abort(404)
    return provider


@oauth_bp.get("/providers")
def providers():
    return jsonify(providers=[name for name, provider in PROVIDERS.items() if provider.is_configured()])


@oauth_bp.get("/<provider_name>/start")
def start(provider_name):
    provider = get_provider(provider_name)
    if not provider.is_configured():
        return frontend_redirect(error="provider_unavailable")
    return start_response(provider_name, provider.authorize_url)


@oauth_bp.get("/<provider_name>/callback")
def callback(provider_name):
    provider = get_provider(provider_name)
    if request.args.get("error"):
        return frontend_redirect(error=request.args["error"])

    code = request.args.get("code")
    try:
        code_verifier = consume_state(provider_name)
        if not code:
            raise OAuthError("oauth_failed")
        profile = provider.fetch_profile(code, code_verifier)
        user = find_or_create_user(profile)
    except OAuthError as exc:
        return frontend_redirect(error=exc.code)
    except Exception:
        current_app.logger.exception("OAuth callback failed")
        return frontend_redirect(error="oauth_failed")

    return frontend_redirect(user=user)
