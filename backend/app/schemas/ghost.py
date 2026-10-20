from marshmallow import EXCLUDE, Schema, ValidationError, fields, validate, validates_schema

WHO = ("self", "top")
INTEGER_ERRORS = {"invalid": "Ожидается целое число"}


class GhostQuerySchema(Schema):
    class Meta:
        unknown = EXCLUDE

    text_id = fields.Integer(load_default=None, error_messages=INTEGER_ERRORS)
    track_id = fields.Integer(load_default=None, error_messages=INTEGER_ERRORS)
    who = fields.String(
        load_default="self", validate=validate.OneOf(WHO, error="Допустимо: {choices}")
    )

    @validates_schema
    def validate_target(self, data, **kwargs):
        if (data["text_id"] is None) == (data["track_id"] is None):
            raise ValidationError("Укажите text_id или track_id", "text_id")
