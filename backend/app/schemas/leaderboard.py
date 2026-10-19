from marshmallow import EXCLUDE, Schema, fields, validate

METRICS = ("wpm", "accuracy", "xp")
PERIODS = ("day", "week", "all")


class LeaderboardQuerySchema(Schema):
    class Meta:
        unknown = EXCLUDE

    metric = fields.String(
        load_default="wpm", validate=validate.OneOf(METRICS, error="Допустимо: {choices}")
    )
    period = fields.String(
        load_default="all", validate=validate.OneOf(PERIODS, error="Допустимо: {choices}")
    )
    limit = fields.Integer(
        load_default=50,
        error_messages={"invalid": "Ожидается целое число"},
        validate=validate.Range(min=1, max=100, error="От {min} до {max}"),
    )
