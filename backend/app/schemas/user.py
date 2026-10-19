from marshmallow import Schema, fields


class UserSchema(Schema):
    id = fields.Integer()
    email = fields.String(allow_none=True)
    nickname = fields.String()
    avatar_url = fields.String(allow_none=True)
    xp = fields.Integer()
    level = fields.Integer()
    streak_current = fields.Integer()
    streak_best = fields.Integer()
    car_config = fields.Dict()
    has_password = fields.Method("get_has_password")
    providers = fields.Method("get_providers")
    created_at = fields.DateTime()

    def get_has_password(self, user):
        return user.password_hash is not None

    def get_providers(self, user):
        return sorted(account.provider for account in user.oauth_accounts)


user_schema = UserSchema()
