from flask import jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

HTTP_MESSAGES = {
    400: "Некорректный запрос",
    401: "Требуется авторизация",
    403: "Доступ запрещён",
    404: "Не найдено",
    405: "Метод не поддерживается",
    413: "Слишком большой запрос",
    429: "Слишком много запросов",
}


class ApiError(Exception):
    def __init__(self, status, error, message, fields=None):
        super().__init__(message)
        self.status = status
        self.error = error
        self.message = message
        self.fields = fields


def error_response(status, error, message, fields=None):
    payload = {"error": error, "message": message}
    if fields:
        payload["fields"] = fields
    return jsonify(payload), status


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(exc):
        return error_response(exc.status, exc.error, exc.message, exc.fields)

    @app.errorhandler(ValidationError)
    def handle_validation_error(exc):
        return error_response(400, "validation_error", "Проверьте введённые данные", exc.messages)

    @app.errorhandler(HTTPException)
    def handle_http_error(exc):
        message = HTTP_MESSAGES.get(exc.code, exc.description)
        return error_response(exc.code, exc.name.lower().replace(" ", "_"), message)

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc):
        app.logger.exception(exc)
        return error_response(500, "internal_error", "Что-то пошло не так")
