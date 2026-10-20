from marshmallow import Schema, fields


class TrackSchema(Schema):
    id = fields.Integer()
    code = fields.String()
    title = fields.String()
    description = fields.String(allow_none=True)
    sort_order = fields.Integer()
    mode = fields.String()
    lang = fields.String()
    difficulty = fields.Integer()
    min_level = fields.Integer()
    cup_requirements = fields.Raw()
    cups = fields.Integer()
    best_wpm = fields.Float(allow_none=True)
    unlocked = fields.Boolean()
    lock_reason = fields.String(allow_none=True)


track_schema = TrackSchema()
