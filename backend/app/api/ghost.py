from flask import Blueprint, jsonify, request
from flask_jwt_extended import current_user, jwt_required

from app.schemas.ghost import GhostQuerySchema
from app.services.ghost import ghost

ghost_bp = Blueprint("ghost", __name__, url_prefix="/ghost")

ghost_query_schema = GhostQuerySchema()


@ghost_bp.get("")
@jwt_required(locations=["headers"])
def get_ghost():
    query = ghost_query_schema.load(request.args)
    return jsonify(ghost(current_user, **query))
