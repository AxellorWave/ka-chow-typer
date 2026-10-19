from flask import Flask

from app.config import Config
from app.errors import register_error_handlers
from app.extensions import cors, db, jwt, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.json.ensure_ascii = False

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=True)

    from app import models, security
    from app.api import api_bp
    from app.cli import register_cli

    app.register_blueprint(api_bp)
    register_error_handlers(app)
    register_cli(app)

    return app
