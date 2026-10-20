from marshmallow import EXCLUDE, Schema

from app.schemas.auth import nickname_field


class ProfileUpdateSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    nickname = nickname_field()
