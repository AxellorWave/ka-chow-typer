from flask import Blueprint

from app.api.auth import auth_bp
from app.api.health import health_bp
from app.api.texts import texts_bp

api_bp = Blueprint("api", __name__, url_prefix="/api")
api_bp.register_blueprint(health_bp)
api_bp.register_blueprint(auth_bp)
api_bp.register_blueprint(texts_bp)
