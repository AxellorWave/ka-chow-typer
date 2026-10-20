from marshmallow import (
    EXCLUDE,
    Schema,
    ValidationError,
    fields,
    validate,
    validates,
    validates_schema,
)

from app.models.enums import Lang, Mode
from app.services.texts import MODE_LANGS

MAX_WPM = 400
MAX_TEXT_LENGTH = 20000
MAX_KEYSTROKES = 50000
MAX_DURATION_MS = 60 * 60 * 1000
MAX_KEY_LENGTH = 8

REQUIRED = {"required": "Обязательное поле", "null": "Обязательное поле"}
INTEGER_ERRORS = {**REQUIRED, "invalid": "Ожидается целое число"}
NUMBER_ERRORS = {**REQUIRED, "invalid": "Ожидается число"}
ENUM_ERRORS = {**REQUIRED, "unknown": "Допустимо: {choices}"}
NON_NEGATIVE = validate.Range(min=0, error="Не меньше {min}")


def required_integer(*validators):
    return fields.Integer(
        required=True, strict=True, error_messages=INTEGER_ERRORS, validate=validators
    )


def required_number(*validators):
    return fields.Float(
        required=True, allow_nan=False, error_messages=NUMBER_ERRORS, validate=validators
    )


def is_keystroke(item):
    if not isinstance(item, list) or len(item) != 3:
        return False
    char, t_ms, ok = item
    return (
        isinstance(char, str)
        and 1 <= len(char) <= MAX_KEY_LENGTH
        and isinstance(t_ms, int | float)
        and not isinstance(t_ms, bool)
        and t_ms >= 0
        and isinstance(ok, bool)
    )


class RunCreateSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    mode = fields.Enum(Mode, by_value=True, required=True, error_messages=ENUM_ERRORS)
    lang = fields.Enum(Lang, by_value=True, required=True, error_messages=ENUM_ERRORS)
    difficulty = required_integer(validate.Range(min=1, max=5, error="От {min} до {max}"))
    text_id = fields.Integer(load_default=None, strict=True, error_messages=INTEGER_ERRORS)
    track_id = fields.Integer(load_default=None, strict=True, error_messages=INTEGER_ERRORS)
    daily_date = fields.Date(load_default=None, error_messages={"invalid": "Ожидается дата"})
    ghost_run_id = fields.Integer(load_default=None, strict=True, error_messages=INTEGER_ERRORS)
    client_run_id = fields.String(
        load_default=None,
        error_messages={"invalid": "Ожидается строка"},
        validate=validate.Length(min=8, max=64, error="От {min} до {max} символов"),
    )
    text = fields.String(
        required=True,
        error_messages={**REQUIRED, "invalid": "Ожидается строка"},
        validate=validate.Length(min=1, max=MAX_TEXT_LENGTH, error="От {min} до {max} символов"),
    )
    duration_ms = required_integer(
        validate.Range(min=1, max=MAX_DURATION_MS, error="От {min} до {max} мс")
    )
    typed_chars = required_integer(NON_NEGATIVE)
    correct_chars = required_integer(NON_NEGATIVE)
    errors = required_integer(NON_NEGATIVE)
    cpm = required_number(NON_NEGATIVE)
    wpm = required_number(validate.Range(min=0, max=MAX_WPM, error="От {min} до {max}"))
    accuracy = required_number(validate.Range(min=0, max=100, error="От {min} до {max}"))
    max_combo = required_integer(NON_NEGATIVE)
    score = required_integer(NON_NEGATIVE)
    keystrokes = fields.List(
        fields.Raw(),
        required=True,
        error_messages={**REQUIRED, "invalid": "Ожидается список"},
        validate=validate.Length(max=MAX_KEYSTROKES, error="Не больше {max} нажатий"),
    )

    @validates("keystrokes")
    def validate_keystrokes(self, value, **kwargs):
        if not all(is_keystroke(item) for item in value):
            raise ValidationError("Каждое нажатие: [символ, время в мс, верно]")

    @validates_schema
    def validate_totals(self, data, **kwargs):
        if data["lang"] not in MODE_LANGS[data["mode"]]:
            allowed = ", ".join(item.value for item in MODE_LANGS[data["mode"]])
            raise ValidationError(f"Для режима {data['mode'].value} допустимо: {allowed}", "lang")
        if data["correct_chars"] > data["typed_chars"]:
            raise ValidationError("Верных символов больше, чем нажатий", "correct_chars")
        if data["correct_chars"] + data["errors"] != data["typed_chars"]:
            raise ValidationError("Нажатия не сходятся с верными символами и ошибками", "errors")
        if data["max_combo"] > data["correct_chars"]:
            raise ValidationError("Комбо больше числа верных символов", "max_combo")


class RunListQuerySchema(Schema):
    class Meta:
        unknown = EXCLUDE

    limit = fields.Integer(
        load_default=20,
        error_messages={"invalid": "Ожидается целое число"},
        validate=validate.Range(min=1, max=100, error="От {min} до {max}"),
    )
    offset = fields.Integer(
        load_default=0, error_messages={"invalid": "Ожидается целое число"}, validate=NON_NEGATIVE
    )


class RunSchema(Schema):
    id = fields.Integer()
    mode = fields.String()
    lang = fields.String()
    difficulty = fields.Integer()
    text_id = fields.Integer(allow_none=True)
    track_id = fields.Integer(allow_none=True)
    daily_date = fields.Date(allow_none=True)
    text = fields.String()
    duration_ms = fields.Integer()
    typed_chars = fields.Integer()
    correct_chars = fields.Integer()
    errors = fields.Integer()
    cpm = fields.Float()
    wpm = fields.Float()
    accuracy = fields.Float()
    max_combo = fields.Integer()
    score = fields.Integer()
    xp_earned = fields.Integer()
    created_at = fields.DateTime()


run_schema = RunSchema()
