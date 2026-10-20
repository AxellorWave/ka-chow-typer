from flask import Blueprint

from app.api.achievements import achievements_bp
from app.api.auth import auth_bp
from app.api.daily import daily_bp
from app.api.health import health_bp
from app.api.leaderboard import leaderboard_bp
from app.api.oauth import oauth_bp
from app.api.runs import runs_bp
from app.api.stats import stats_bp
from app.api.texts import texts_bp
from app.api.tracks import tracks_bp

api_bp = Blueprint("api", __name__, url_prefix="/api")
api_bp.register_blueprint(health_bp)
api_bp.register_blueprint(auth_bp)
api_bp.register_blueprint(oauth_bp)
api_bp.register_blueprint(texts_bp)
api_bp.register_blueprint(runs_bp)
api_bp.register_blueprint(stats_bp)
api_bp.register_blueprint(leaderboard_bp)
api_bp.register_blueprint(achievements_bp)
api_bp.register_blueprint(tracks_bp)
api_bp.register_blueprint(daily_bp)
