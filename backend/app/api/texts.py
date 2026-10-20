from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_current_user, jwt_required

from app.schemas.texts import TextQuerySchema
from app.services.texts import check_access, generate_text
from app.services.tracks import track_text

texts_bp = Blueprint("texts", __name__, url_prefix="/texts")

text_query_schema = TextQuerySchema()


@texts_bp.get("")
@jwt_required(optional=True, locations=["headers"])
def get_text():
    query = text_query_schema.load(request.args)
    track_id = query.pop("track_id")
    if track_id is not None:
        return jsonify(track_text(get_current_user(), track_id))
    check_access(get_current_user(), query["mode"], query["difficulty"])
    return jsonify(generate_text(**query))
