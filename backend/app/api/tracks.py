from flask import Blueprint, jsonify
from flask_jwt_extended import get_current_user, jwt_required

from app.schemas.tracks import track_schema
from app.services.tracks import career

tracks_bp = Blueprint("tracks", __name__, url_prefix="/tracks")


@tracks_bp.get("")
@jwt_required(optional=True, locations=["headers"])
def get_tracks():
    result = career(get_current_user())
    return jsonify({**result, "items": track_schema.dump(result["items"], many=True)})
