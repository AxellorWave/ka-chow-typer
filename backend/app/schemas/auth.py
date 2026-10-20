from marshmallow import EXCLUDE, Schema, fields, pre_load, validate

NICKNAME_PATTERN = r"^[A-Za-zА-Яа-яЁё0-9_\-]+$"

REQUIRED = {"required": "Обязательное поле", "null": "Обязательное поле"}
EMAIL_ERRORS = {**REQUIRED, "invalid": "Некорректный email"}
STRING_ERRORS = {**REQUIRED, "invalid": "Ожидается строка"}


def nickname_field():
    return fields.String(
        required=True,
        error_messages=STRING_ERRORS,
        validate=[
            validate.Length(min=3, max=32, error="От {min} до {max} символов"),
            validate.Regexp(NICKNAME_PATTERN, error="Только буквы, цифры, _ и -"),
        ],
    )


def new_password_field():
    return fields.String(
        required=True,
        load_only=True,
        error_messages=STRING_ERRORS,
        validate=validate.Length(min=8, max=128, error="От {min} до {max} символов"),
    )


class NormalizeEmailMixin:
    @pre_load
    def normalize_email(self, data, **kwargs):
        if isinstance(data, dict) and isinstance(data.get("email"), str):
            data = {**data, "email": data["email"].strip().lower()}
        return data


class RegisterSchema(NormalizeEmailMixin, Schema):
    class Meta:
        unknown = EXCLUDE

    email = fields.Email(
        required=True,
        error_messages=EMAIL_ERRORS,
        validate=validate.Length(max=255, error="Не длиннее {max} символов"),
    )
    password = new_password_field()
    nickname = nickname_field()


class LoginSchema(NormalizeEmailMixin, Schema):
    class Meta:
        unknown = EXCLUDE

    email = fields.Email(required=True, error_messages=EMAIL_ERRORS)
    password = fields.String(required=True, load_only=True, error_messages=STRING_ERRORS)
