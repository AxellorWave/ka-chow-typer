from flask import Blueprint, jsonify, request
from flask_jwt_extended import current_user, jwt_required

from app.schemas.garage import GarageUpdateSchema
from app.services.garage import garage_payload, update_garage

garage_bp = Blueprint("garage", __name__, url_prefix="/garage")

garage_update_schema = GarageUpdateSchema()


@garage_bp.get("")
@jwt_required(locations=["headers"])
def get_garage():
    return jsonify(garage_payload(current_user))


@garage_bp.put("")
@jwt_required(locations=["headers"])
def put_garage():
    patch = garage_update_schema.load(request.get_json(silent=True) or {})
    return jsonify(update_garage(current_user, patch))
