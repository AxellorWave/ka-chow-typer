#!/bin/sh
set -e

cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml"

git pull --ff-only
$COMPOSE pull backend web
$COMPOSE up -d --no-build
$COMPOSE exec -T backend flask seed
docker image prune -f
