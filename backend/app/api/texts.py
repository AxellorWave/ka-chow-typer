from flask import Blueprint, jsonify, request
from flask_jwt_extended import current_user, get_current_user, jwt_required

from app.schemas.texts import PitstopQuerySchema, TextQuerySchema
from app.services.pitstop import pitstop_text
from app.services.texts import check_access, generate_text
from app.services.tracks import track_text

texts_bp = Blueprint("texts", __name__, url_prefix="/texts")

text_query_schema = TextQuerySchema()
pitstop_query_schema = PitstopQuerySchema()


@texts_bp.get("")
@jwt_required(optional=True, locations=["headers"])
def get_text():
    query = text_query_schema.load(request.args)
    track_id = query.pop("track_id")
    if track_id is not None:
        return jsonify(track_text(get_current_user(), track_id))
    check_access(get_current_user(), query["mode"], query["difficulty"])
    return jsonify(generate_text(**query))


@texts_bp.get("/pitstop")
@jwt_required(locations=["headers"])
def get_pitstop():
    query = pitstop_query_schema.load(request.args)
    return jsonify(pitstop_text(current_user, query["lang"]))
