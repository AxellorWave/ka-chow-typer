from marshmallow import Schema, fields

from app.services.leveling import max_difficulty, unlocked_modes, xp_for_level, xp_to_next_level


class UserSchema(Schema):
    id = fields.Integer()
    email = fields.String(allow_none=True)
    nickname = fields.String()
    avatar_url = fields.String(allow_none=True)
    xp = fields.Integer()
    level = fields.Integer()
    xp_to_next = fields.Method("get_xp_to_next")
    level_xp = fields.Method("get_level_xp")
    next_level_xp = fields.Method("get_next_level_xp")
    unlocked_modes = fields.Method("get_unlocked_modes")
    max_difficulty = fields.Method("get_max_difficulty")
    streak_current = fields.Integer()
    streak_best = fields.Integer()
    car_config = fields.Dict()
    has_password = fields.Method("get_has_password")
    providers = fields.Method("get_providers")
    created_at = fields.DateTime()

    def get_xp_to_next(self, user):
        return xp_to_next_level(user.xp)

    def get_level_xp(self, user):
        return xp_for_level(user.level)

    def get_next_level_xp(self, user):
        return xp_for_level(user.level + 1)

    def get_unlocked_modes(self, user):
        return unlocked_modes(user.level)

    def get_max_difficulty(self, user):
        return max_difficulty(user.level)

    def get_has_password(self, user):
        return user.password_hash is not None

    def get_providers(self, user):
        return sorted(account.provider for account in user.oauth_accounts)


user_schema = UserSchema()
