from marshmallow import RAISE, Schema, ValidationError, fields, validates_schema

CODE_ERRORS = {"invalid": "Ожидается код детали", "null": "Ожидается код детали"}


class GarageUpdateSchema(Schema):
    class Meta:
        unknown = RAISE

    color = fields.String(error_messages=CODE_ERRORS)
    decal = fields.String(error_messages=CODE_ERRORS)
    wheels = fields.String(error_messages=CODE_ERRORS)
    spoiler = fields.String(error_messages=CODE_ERRORS)

    @validates_schema
    def validate_not_empty(self, data, **kwargs):
        if not data:
            raise ValidationError("Нужно выбрать хотя бы одну деталь", "_schema")

    def handle_error(self, error, data, **kwargs):
        messages = {
            key: ["Такого слота в гараже нет"] if value == ["Unknown field."] else value
            for key, value in error.messages.items()
        }
        raise ValidationError(messages)
