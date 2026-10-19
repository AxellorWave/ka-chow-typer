from marshmallow import EXCLUDE, Schema, ValidationError, fields, validate, validates_schema

from app.models.enums import Lang, Mode
from app.services.texts import LENGTH_LIMITS, MODE_LANGS

INTEGER_ERRORS = {"invalid": "Ожидается целое число"}


class TextQuerySchema(Schema):
    class Meta:
        unknown = EXCLUDE

    mode = fields.Enum(
        Mode,
        by_value=True,
        load_default=Mode.WORDS,
        error_messages={"unknown": "Допустимо: {choices}"},
    )
    lang = fields.Enum(
        Lang, by_value=True, load_default=None, error_messages={"unknown": "Допустимо: {choices}"}
    )
    difficulty = fields.Integer(
        load_default=1,
        error_messages=INTEGER_ERRORS,
        validate=validate.Range(min=1, max=5, error="От {min} до {max}"),
    )
    length = fields.Integer(load_default=None, error_messages=INTEGER_ERRORS)

    @validates_schema
    def validate_combination(self, data, **kwargs):
        mode, lang, length = data["mode"], data.get("lang"), data.get("length")
        if lang is not None and lang not in MODE_LANGS[mode]:
            allowed = ", ".join(item.value for item in MODE_LANGS[mode])
            raise ValidationError(f"Для режима {mode.value} допустимо: {allowed}", "lang")
        if length is None:
            return
        if mode not in LENGTH_LIMITS:
            raise ValidationError(f"Режим {mode.value} не поддерживает длину", "length")
        maximum = LENGTH_LIMITS[mode][1]
        if not 1 <= length <= maximum:
            raise ValidationError(f"От 1 до {maximum}", "length")
