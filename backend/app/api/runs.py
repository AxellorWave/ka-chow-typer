from flask import Blueprint, jsonify, request
from flask_jwt_extended import current_user, jwt_required

from app.schemas.runs import RunCreateSchema, RunListQuerySchema, run_schema
from app.services.runs import list_runs, save_run

runs_bp = Blueprint("runs", __name__, url_prefix="/runs")

run_create_schema = RunCreateSchema()
run_list_query_schema = RunListQuerySchema()


@runs_bp.post("")
@jwt_required(locations=["headers"])
def create_run():
    data = run_create_schema.load(request.get_json(silent=True) or {})
    return jsonify(save_run(current_user, data)), 201


@runs_bp.get("/me")
@jwt_required(locations=["headers"])
def my_runs():
    query = run_list_query_schema.load(request.args)
    runs, total = list_runs(current_user, **query)
    return jsonify(items=run_schema.dump(runs, many=True), total=total, **query)
