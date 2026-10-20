from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

from app.config import Config, check_production_config
from app.errors import register_error_handlers
from app.extensions import cors, db, jwt, limiter, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1)
    if not app.debug and not app.testing:
        check_production_config(app.config)
    app.json.ensure_ascii = False

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    limiter.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=True)

    from app import models, security
    from app.api import api_bp
    from app.cli import register_cli

    app.register_blueprint(api_bp)
    register_error_handlers(app)
    register_cli(app)

    return app
