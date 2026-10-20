from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_current_user, jwt_required

from app.schemas.daily import DailyLeaderboardQuerySchema
from app.services.clock import msk_today
from app.services.daily import daily_payload
from app.services.leaderboard import daily_leaderboard

daily_bp = Blueprint("daily", __name__, url_prefix="/daily")

daily_leaderboard_query_schema = DailyLeaderboardQuerySchema()


@daily_bp.get("")
@jwt_required(optional=True, locations=["headers"])
def get_daily():
    return jsonify(daily_payload(get_current_user()))


@daily_bp.get("/leaderboard")
@jwt_required(optional=True, locations=["headers"])
def get_daily_leaderboard():
    query = daily_leaderboard_query_schema.load(request.args)
    user = get_current_user()
    return jsonify(
        daily_leaderboard(
            query["date"] or msk_today(), query["limit"], user_id=user.id if user else None
        )
    )
