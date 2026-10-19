from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_current_user, jwt_required

from app.schemas.leaderboard import LeaderboardQuerySchema
from app.services.leaderboard import leaderboard

leaderboard_bp = Blueprint("leaderboard", __name__, url_prefix="/leaderboard")

leaderboard_query_schema = LeaderboardQuerySchema()


@leaderboard_bp.get("")
@jwt_required(optional=True, locations=["headers"])
def get_leaderboard():
    query = leaderboard_query_schema.load(request.args)
    user = get_current_user()
    return jsonify(leaderboard(**query, user_id=user.id if user else None))
