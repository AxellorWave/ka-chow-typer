from flask import Blueprint, jsonify, request
from flask_jwt_extended import current_user, jwt_required

from app.schemas.stats import RANGES, ProgressQuerySchema
from app.services import stats

stats_bp = Blueprint("stats", __name__, url_prefix="/stats")

progress_query_schema = ProgressQuerySchema()


@stats_bp.get("/summary")
@jwt_required(locations=["headers"])
def get_summary():
    return jsonify(stats.summary(current_user.id))


@stats_bp.get("/progress")
@jwt_required(locations=["headers"])
def get_progress():
    query = progress_query_schema.load(request.args)
    return jsonify(stats.progress(current_user.id, RANGES[query["range"]]))


@stats_bp.get("/keys")
@jwt_required(locations=["headers"])
def get_keys():
    return jsonify(stats.keys(current_user.id))
