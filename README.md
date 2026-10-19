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

Все ответы в JSON. Ошибки приходят в формате `{"error": "<код>", "message": "<текст>", "fields": {"<поле>": ["<текст>"]}}`, где `fields` есть только у `validation_error`.

### Авторизация

Access-токен живёт 30 минут и передаётся в заголовке `Authorization: Bearer <token>`. Refresh-токен живёт 30 дней и лежит в httpOnly cookie `kachow_refresh` с путём `/api/auth`: браузер отправляет его сам, нужен только `withCredentials: true`.

| Метод | Путь | Тело | Ответ |
|---|---|---|---|
| POST | `/api/auth/register` | `{email, password, nickname}` | `201 {access_token, user}` + cookie |
| POST | `/api/auth/login` | `{email, password}` | `200 {access_token, user}` + cookie |
| POST | `/api/auth/refresh` | — (cookie) | `200 {access_token, user}` |
| POST | `/api/auth/logout` | — | `200 {status: "ok"}`, cookie удаляется |
| GET | `/api/auth/me` | — (Bearer) | `200 {user}` |

Валидация: email приводится к нижнему регистру, пароль от 8 до 128 символов, ник от 3 до 32 символов (буквы, цифры, `_`, `-`).

Коды ошибок: `validation_error` (400), `invalid_credentials` (401), `unauthorized` (401, нет токена), `invalid_token` (401), `token_expired` (401, пора делать refresh), `email_taken` (409), `nickname_taken` (409).

Объект `user`:

```json
{
  "id": 1,
  "email": "mcqueen@rust-eze.com",
  "nickname": "Молния_95",
  "avatar_url": null,
  "xp": 0,
  "level": 1,
  "streak_current": 0,
  "streak_best": 0,
  "car_config": {},
  "has_password": true,
  "providers": [],
  "created_at": "2026-10-19T13:13:53.818952+00:00"
}
```

### Вход через соцсети

| Метод | Путь | Что делает |
|---|---|---|
| GET | `/api/auth/<provider>/start` | Редирект на страницу входа провайдера (`provider`: `yandex`, `vk`) |
| GET | `/api/auth/<provider>/callback` | Сюда провайдер возвращает пользователя; дальше редирект на `/oauth/callback` фронтенда |

При успехе бэкенд ставит cookie `kachow_refresh` и редиректит на `/oauth/callback`, фронтенд делает `POST /api/auth/refresh` и получает `access_token`. При ошибке приходит редирект на `/oauth/callback?error=<код>`:

| Код | Когда |
|---|---|
| `access_denied` | Пользователь отказался на странице провайдера |
| `invalid_state` | Истекли 10 минут на вход или подделан `state` |
| `oauth_failed` | Провайдер не обменял код на токен или не отдал профиль |
| `provider_unavailable` | На сервере не заданы ключи провайдера |

Аккаунт ищется по связке «провайдер + id». Если её нет, но email совпадает с существующим пользователем, провайдер привязывается к нему. Иначе создаётся новый пользователь без пароля, ник берётся из логина провайдера и при совпадении получает суффикс `_1234`.

Новый провайдер подключается так: модуль `services/oauth_<provider>.py` с функциями `is_configured()`, `authorize_url(state, code_challenge)`, `fetch_profile(code, code_verifier)` и строка в `PROVIDERS` в `api/oauth.py`.

В бэкенде защищённый эндпоинт помечается `@jwt_required()`, текущий пользователь доступен через `from flask_jwt_extended import current_user`. Для эндпоинтов, доступных и гостю, используется `@jwt_required(optional=True)`.

### Статистика

Все эндпоинты требуют `Authorization: Bearer`. Даты считаются по московскому времени. У нового пользователя приходят нули и пустые списки, а не ошибка.

| Метод | Путь | Что отдаёт |
|---|---|---|
| GET | `/api/stats/summary` | Общие цифры по всем заездам |
| GET | `/api/stats/progress?range=7d\|30d\|90d` | Динамика по дням, по умолчанию `7d` |
| GET | `/api/stats/keys` | Статистика по клавишам, самые сложные клавиши и биграммы |

`summary`:

```json
{
  "runs": 4, "active_days": 3, "total_duration_ms": 15240,
  "total_chars": 68, "total_typed": 75, "total_errors": 7, "total_score": 680,
  "best_wpm": 100.0, "avg_wpm": 62.8, "best_cpm": 500.0, "avg_cpm": 314.2,
  "avg_accuracy": 91.1, "max_combo": 17, "last_run_at": "2026-10-19T14:23:19+00:00"
}
```

`progress` возвращает каждый день диапазона, включая дни без заездов: у них `runs: 0`, а средние равны `null`. Для Chart.js это разрывы на графике (`spanGaps`).

```json
{
  "range_days": 7, "from": "2026-10-13", "to": "2026-10-19",
  "points": [
    {"date": "2026-10-19", "runs": 2, "avg_wpm": 67.8, "best_wpm": 100.0, "avg_accuracy": 92.5, "errors": 3, "duration_ms": 7790}
  ]
}
```

`keys`:

```json
{
  "keys": [{"key": "ы", "presses": 23, "errors": 7, "error_rate": 30.4, "avg_latency_ms": 256.0}],
  "weakest_keys": [{"key": "щ", "presses": 6, "errors": 0, "error_rate": 0.0, "avg_latency_ms": 600.0}],
  "weakest_bigrams": [{"bigram": "мы", "presses": 7, "errors": 3, "error_rate": 42.9, "avg_latency_ms": 180.0}],
  "min_presses": 5
}
```

- `keys` — все клавиши пользователя, отсортированные по символу. Нужны для тепловой карты; пробел и перевод строки тоже здесь.
- `error_rate` — процент ошибок от всех попыток нажать клавишу, `avg_latency_ms` — средняя пауза перед нажатием.
- `weakest_keys` и `weakest_bigrams` — до 10 штук, сначала по проценту ошибок, потом по задержке. Попадает клавиша с минимум `min_presses` нажатиями, у которой есть ошибки или средняя задержка в 1.2 раза выше средней по пользователю. Пробелы и переводы строк сюда не входят.
- Функции `weakest_keys(user_id)` и `weakest_bigrams(user_id)` из `services/stats.py` можно переиспользовать для пит-стопа (#29).
