from flask import Blueprint, jsonify
from flask_jwt_extended import current_user, jwt_required

from app.schemas.achievements import achievement_schema
from app.services.achievements import list_achievements

achievements_bp = Blueprint("achievements", __name__, url_prefix="/achievements")


@achievements_bp.get("")
@jwt_required(locations=["headers"])
def get_achievements():
    items = list_achievements(current_user)
    return jsonify(items=achievement_schema.dump(items, many=True))
