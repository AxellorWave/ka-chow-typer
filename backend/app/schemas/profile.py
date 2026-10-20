from marshmallow import EXCLUDE, Schema, fields

from app.schemas.auth import STRING_ERRORS, new_password_field, nickname_field


class ProfileUpdateSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    nickname = nickname_field()


class PasswordChangeSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    current_password = fields.String(
        load_default=None, allow_none=True, load_only=True, error_messages=STRING_ERRORS
    )
    new_password = new_password_field()
