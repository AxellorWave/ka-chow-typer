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
docker compose up --build -d
docker compose exec backend flask seed
```

`flask seed` загружает словари, тексты, ачивки, трассы и гараж. Без него тренировка ответит «Не нашли подходящих текстов». Повторный запуск безопасен: данные обновляются, дубли не создаются.

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

### Пит-стоп

`GET /api/texts/pitstop?lang=ru|en` — нужен вход, по умолчанию `lang=ru`. Адаптивная тренировка по слабым местам пользователя.

```json
{
  "mode": "words", "lang": "ru", "difficulty": 1, "text_id": null,
  "text": "женщин похожи боюсь жизни ож ож ож ждет сможешь ...",
  "focus": {
    "keys": [{"key": "ж", "presses": 43, "errors": 16, "error_rate": 37.2, "avg_latency_ms": 520.0}],
    "bigrams": [{"bigram": "ож", "presses": 14, "errors": 5, "error_rate": 35.7, "avg_latency_ms": 540.0}]
  },
  "fallback": false
}
```

- `focus` — до 8 худших клавиш и до 8 биграмм из `weakest_keys` / `weakest_bigrams`, только строчные буквы выбранного языка. Формат элементов тот же, что в `GET /api/stats/keys`, поэтому «до → после» сравнивается напрямую.
- `text` — слова из словаря `words/<lang>`. Вес слова — сколько раз в нём встречаются слабые клавиши и биграммы, умноженное на их `error_rate + 1`; слова выбираются случайно с учётом веса. Каждые 6 слов вставляется дрилл по одной из трёх худших целей: `ож ож ож` для биграммы, `жж жж жж` для клавиши.
- Длина — на 45 секунд печати по среднему CPM пользователя (200, если заездов нет), в пределах 150–450 символов.
- `fallback: true` — подходящей статистики по языку ещё нет: `focus` пустой, текст — обычные слова первой сложности той же длины.
- Результат сохраняется обычным `POST /api/runs` с `mode: "words"`, `difficulty: 1` и `text` из ответа.
- Без входа — `401`, недопустимый `lang` — `400`.

### Лидерборды

`GET /api/leaderboard?metric=wpm|accuracy|xp&period=day|week|all&limit=50`

Доступно и гостю. Если передан `Authorization: Bearer`, в ответе будет `me` с местом текущего пользователя, даже если он не попал в `limit`. По умолчанию `metric=wpm`, `period=all`, `limit=50` (максимум 100).

| metric | value |
|---|---|
| `wpm` | Лучший WPM пользователя за период |
| `accuracy` | Лучшая точность за период среди заездов от 100 верных символов; при равенстве выше тот, у кого больше WPM в этом заезде |
| `xp` | Сумма XP за период; для `all` — общий XP пользователя |

Периоды считаются по МСК: `day` — с 00:00 сегодня, `week` — последние 7 дней вместе с сегодняшним. При равенстве выше тот, кто показал результат раньше.

```json
{
  "metric": "wpm", "period": "week", "limit": 50,
  "since": "2026-10-13T00:00:00+03:00", "total": 4,
  "items": [
    {
      "position": 1, "user_id": 2, "nickname": "Молния_95", "avatar_url": null,
      "level": 3, "car_config": {}, "value": 120.0, "wpm": 120.0, "accuracy": 100.0,
      "achieved_at": "2026-10-19T14:30:00+00:00"
    }
  ],
  "me": null
}
```

Для `xp` поля `wpm` и `accuracy` равны `null`.

### Карьера

`GET /api/tracks` — все трассы по `sort_order` с прогрессом пользователя. Доступно и гостю: у него `cups: 0`, `best_wpm: null`, открыта только первая трасса.

```json
{
  "items": [
    {
      "id": 1, "code": "radiator_springs", "title": "Радиатор-Спрингс", "description": "...",
      "sort_order": 1, "mode": "words", "lang": "ru", "difficulty": 1, "min_level": 1,
      "cup_requirements": [{"wpm": 15, "accuracy": 85}, {"wpm": 25, "accuracy": 90}, {"wpm": 35, "accuracy": 95}],
      "cups": 2, "best_wpm": 31.5, "unlocked": true, "lock_reason": null
    }
  ],
  "total_cups": 5, "max_cups": 30
}
```

- Первая трасса открыта всегда. Следующая открывается, когда на предыдущей есть хотя бы бронза и уровень не ниже `min_level`.
- `lock_reason`: `null`, `"previous"` (нет бронзы на предыдущей трассе) или `"level"` (уровень ниже `min_level`).
- `cups` — лучший результат из `user_tracks` (0–3), `best_wpm` — лучший WPM пользователя на этой трассе.
- Кубок засчитывается, если в заезде выполнены и `wpm`, и `accuracy` порога; кубки идут по порядку: бронза, серебро, золото.

Заезд по трассе:

1. `GET /api/texts?track_id=<id>` — текст трассы. `mode`, `lang` и `difficulty` берутся из трассы, остальные параметры игнорируются. Вместо проверки режима и сложности по уровню проверяется, что трасса открыта.
2. `POST /api/runs` с `track_id` и `mode`/`lang`/`difficulty` трассы. Поле `cups` ответа: `{"track_id": 1, "cups": 2, "new_cups": 1}`.

| Ошибка | Когда |
|---|---|
| `404 track_not_found` | Трассы с таким `track_id` нет |
| `403 track_locked` | Трасса закрыта; в `message` сказано, что нужно сделать |
| `400 track_mismatch` | `mode`/`lang`/`difficulty` заезда не совпадают с трассой |

За золото на всех трассах выдаётся ачивка «Кубок Поршня» (`piston_cup`).

### Призрак

`GET /api/ghost?text_id=<id>&who=self|top` или `GET /api/ghost?track_id=<id>&who=self|top` — нужен вход. Передаётся ровно один из `text_id` и `track_id`, по умолчанию `who=self`.

Призрак — лучший по WPM завершённый заезд (напечатан весь текст) на том же тексте или той же трассе: свой (`self`) или среди всех игроков (`top`). При равном WPM выше тот, кто проехал быстрее, затем более ранний заезд.

```json
{
  "run_id": 512, "who": "top",
  "user": {"nickname": "Молния_95", "car_config": {"color": "color_red"}},
  "wpm": 74.2, "duration_ms": 48210,
  "timeline": [[0, 0.0], [350, 0.01], [720, 0.02], [48210, 1.0]]
}
```

`timeline` — точки `[t_ms, progress]`, где `progress` — доля напечатанного текста от 0 до 1. Строится по верным нажатиям из `keystrokes`, начинается с `[0, 0.0]`, заканчивается `[duration_ms, 1.0]` и равномерно прореживается до 200 точек. Так призрак сравним по прогрессу даже на трассе, где тексты у заездов разные.

Обгон: в `POST /api/runs` можно передать `ghost_run_id`. Если заезд завершён и его `duration_ms` меньше, чем у призрака, в ответе будет `"ghost_beaten": true`, а счётчик `users.ghosts_beaten` увеличится. Свой призрак тоже считается. За первый обгон выдаётся ачивка «Обогнал призрака» (`ghost_buster`).

| Ошибка | Когда |
|---|---|
| `400 validation_error` | Нет ни `text_id`, ни `track_id`, переданы оба или `who` не `self`/`top` |
| `404 text_not_found` / `404 track_not_found` | Текста или трассы нет |
| `404 ghost_not_found` | Нет подходящего заезда; в `POST /api/runs` — `ghost_run_id` не найден или это незавершённый заезд |
| `400 ghost_mismatch` | Призрак из `ghost_run_id` проехал другой текст или трассу |

### Заезд дня и стрик

`GET /api/daily` — доступно гостю. Текст дня один на всех: три предложения на русском (сложность 2), выбираются детерминированно по дате МСК и сохраняются при первом запросе за день. Заезд дня доступен с 1 уровня, даже если режим «Предложения» ещё закрыт.

```json
{
  "date": "2026-10-20",
  "ends_at": "2026-10-21T00:00:00+03:00",
  "text": {"text_id": 5281, "mode": "sentences", "lang": "ru", "difficulty": 2, "text": "Пилот плавно вошёл в поворот..."},
  "leader": {"nickname": "Молния_95", "wpm": 128.0},
  "me": {"attempts": 2, "best_wpm": 74.2, "best_accuracy": 97.5}
}
```

`leader` равен `null`, пока никто не проехал. `me` равен `null` у гостя, у пользователя без попыток — `{"attempts": 0, "best_wpm": null, "best_accuracy": null}`.

Заезд дня сохраняется обычным `POST /api/runs` с полями из `text` и `"daily_date": "<date>"`. Ошибки: `daily_closed` (400, дата не сегодняшняя по МСК), `daily_mismatch` (400, текст или параметры не совпадают с заездом дня).

`GET /api/daily/leaderboard?date=YYYY-MM-DD&limit=50` — по умолчанию сегодня. Формат строк и `me` как у `/api/leaderboard`, в зачёт идёт лучшая попытка дня по WPM.

Стрик (`streak_current`, `streak_best` в `/api/auth/me`) обновляется при любом сохранённом заезде по дате МСК: заезд вчера — `+1`, уже был сегодня — без изменений, перерыв больше дня — сброс до 1. На 7-й день подряд выдаётся ачивка «Неделя на трассе».

### Гараж

`GET /api/garage` — нужен вход. Детали и текущая машинка пользователя.

```json
{
  "config": {"color": "color_red", "decal": "decal_bolt", "wheels": "wheels_stock", "spoiler": "spoiler_none"},
  "slots": [
    {
      "slot": "color",
      "items": [
        {"code": "color_red", "title": "Красный Маквин", "asset": null, "unlocked": true, "unlock": {"type": "default", "value": null, "label": "Открыт"}},
        {"code": "color_rust", "title": "Ржавчина Мэтра", "asset": null, "unlocked": false, "unlock": {"type": "achievement", "value": "ka_chow", "label": "Ачивка Ka-chow!"}}
      ]
    }
  ]
}
```

Слоты всегда идут в порядке `color`, `decal`, `wheels`, `spoiler`. Деталь открыта, если её `unlock.type` — `default`, если уровень пользователя не ниже `value` (для `level`) или если у пользователя есть ачивка с кодом `value` (для `achievement`).

`config` — машинка пользователя: значения по умолчанию (`color_red`, `decal_bolt`, `wheels_stock`, `spoiler_none`), поверх которых наложены сохранённые детали. Устаревшие коды и коды из чужого слота заменяются значениями по умолчанию.

`PUT /api/garage` с телом `{"color": "...", "decal": "...", "wheels": "...", "spoiler": "..."}` — можно передать часть слотов, остальные не меняются. Ответ `200 {"config": {...}}`, тот же объект сохраняется в `users.car_config` и приходит в `/api/auth/me` и лидербордах.

| Ошибка | Когда |
|---|---|
| `400 validation_error` | Пустое тело, неизвестный слот, код не из этого слота или несуществующий код |
| `403 item_locked` | Деталь ещё не открыта; в `message` сказано, что нужно для открытия |
