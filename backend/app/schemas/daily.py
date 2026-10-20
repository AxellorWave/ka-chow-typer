from marshmallow import EXCLUDE, Schema, fields, validate


class DailyLeaderboardQuerySchema(Schema):
    class Meta:
        unknown = EXCLUDE

    date = fields.Date(load_default=None, error_messages={"invalid": "Ожидается дата YYYY-MM-DD"})
    limit = fields.Integer(
        load_default=50,
        error_messages={"invalid": "Ожидается целое число"},
        validate=validate.Range(min=1, max=100, error="От {min} до {max}"),
    )
