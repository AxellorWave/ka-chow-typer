# ⚡ KaChowTyper

Тренажёр слепой печати с геймификацией в стиле Молнии Маквина. Проект для хакатона «Киберрывок 2026», кейс «Печать героя».

> Фан-проект. Не связан с The Walt Disney Company и Pixar Animation Studios.

## Стек

| Слой | Технологии |
|---|---|
| Backend | Python 3.13, Flask 3, Flask-SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, marshmallow, gunicorn |
| База данных | PostgreSQL 16 |
| Frontend | React 19 (JavaScript), Vite, React Router, TanStack Query, Zustand, axios, Chart.js, Framer Motion |
| Инфраструктура | Docker Compose, Caddy (HTTPS + раздача статики + прокси `/api`) |

## Быстрый старт (разработка)

```bash
cp .env.example .env
docker compose up --build
```

- Фронтенд: http://localhost:5173
- API: http://localhost:5000/api/health (через фронтенд-прокси тоже: http://localhost:5173/api/health)
- PostgreSQL: `localhost:5432`, логин/пароль `kachow` / `kachow`

Полезные команды:

```bash
docker compose exec backend flask db migrate -m "описание"
docker compose exec backend flask db upgrade
docker compose exec backend flask seed
docker compose exec frontend npm run lint
docker compose exec frontend npm run format
```

Без Docker:

```bash
cd backend && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
flask --app wsgi run --debug

cd frontend && npm install && npm run dev
```

## Продакшен (VPS)

```bash
cp .env.example .env
docker compose -f docker-compose.prod.yml up --build -d
```

В `.env` на сервере обязательно задать `DOMAIN`, `SECRET_KEY`, `JWT_SECRET_KEY`, `JWT_COOKIE_SECURE=true`, `FRONTEND_URL`, `CORS_ORIGINS`, ключи VK ID и Yandex ID. Caddy сам выпустит сертификат Let's Encrypt для `DOMAIN`.

## Структура

```
backend/
  app/
    api/        blueprints REST API (/api/*)
    models/     модели SQLAlchemy
    services/   бизнес-логика: очки, уровни, достижения, генерация текстов, OAuth
    seeds/      JSON со словарями, предложениями, кодом, ачивками, трассами
    cli.py      команды flask (seed)
  migrations/   Alembic
frontend/
  src/
    app/        роутер, провайдеры, layout
    pages/      страницы
    features/   typing, game, effects, audio, stats
    components/ общие UI-компоненты
    api/        axios-клиент и запросы
    store/      Zustand-сторы
    styles/     дизайн-токены и глобальные стили
```

## Процесс разработки

1. Работаем поэтапно по milestones: `M1 MVP (ТЗ)` → `M2 Фичи` → `M3 Релиз` → `M4 Мультиплеер`. Пока не закрыт текущий этап, задачи следующего не берём (исключение: дизайн и devops).
2. Одна задача = одно issue = одна ветка: `<тип>/<номер>-<кратко>`, например `feat/14-typing-engine`, `fix/31-sound-mute`.
3. PR в `main` с `Closes #N` в описании. Мержим **только Squash and merge**, ветка после мержа удаляется автоматически.
4. Заголовок PR = сообщение squash-коммита: `feat(typing): движок печати (#14)`.
5. Перед PR: `npm run lint` на фронте, приложение поднимается через `docker compose up`.

## Документация API

Появится по мере реализации задач M1.
