from pathlib import Path

from flask import Blueprint, send_file

SPEC_PATH = Path(__file__).resolve().parents[2] / "openapi.yaml"
SWAGGER_UI = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14"

SWAGGER_PAGE = f"""<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KaChowTyper API</title>
  <link rel="stylesheet" href="{SWAGGER_UI}/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="{SWAGGER_UI}/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({{ url: "/api/openapi.yaml", dom_id: "#swagger-ui", deepLinking: true }})
  </script>
</body>
</html>
"""

docs_bp = Blueprint("docs", __name__)


@docs_bp.get("/docs")
def swagger_ui():
    return SWAGGER_PAGE


@docs_bp.get("/openapi.yaml")
def openapi_spec():
    return send_file(SPEC_PATH, mimetype="application/yaml")
