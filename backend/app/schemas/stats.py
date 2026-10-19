from marshmallow import EXCLUDE, Schema, fields, validate

RANGES = {"7d": 7, "30d": 30, "90d": 90}


class ProgressQuerySchema(Schema):
    class Meta:
        unknown = EXCLUDE

    range = fields.String(
        load_default="7d",
        validate=validate.OneOf(list(RANGES), error="Допустимо: {choices}"),
    )
