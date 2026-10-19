from marshmallow import Schema, fields


class ProgressSchema(Schema):
    current = fields.Integer()
    target = fields.Integer()


class AchievementSchema(Schema):
    code = fields.String()
    title = fields.String()
    description = fields.String()
    icon = fields.String(allow_none=True)
    unlocked = fields.Boolean()
    unlocked_at = fields.DateTime(allow_none=True)
    progress = fields.Nested(ProgressSchema)


achievement_schema = AchievementSchema()
