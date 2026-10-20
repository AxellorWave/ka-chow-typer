#!/bin/sh
set -e

cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml"

git pull --ff-only
$COMPOSE pull backend web
$COMPOSE up -d --no-build

tries=0
until $COMPOSE exec -T backend python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/api/health')" >/dev/null 2>&1; do
  tries=$((tries + 1))
  if [ "$tries" -ge 60 ]; then
    echo "backend не поднялся за 2 минуты" >&2
    $COMPOSE logs --tail=50 backend >&2
    exit 1
  fi
  sleep 2
done

$COMPOSE exec -T backend flask seed
docker image prune -f
