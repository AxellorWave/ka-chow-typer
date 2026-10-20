# KaChowTyper · записанные звуки (sounds-recorded)

13 звуков: записи команды и файлы с открытых библиотек. Это основной набор: если звук с тем же именем есть в `design/assets/sounds/` (синтезированный), **приоритет у этой папки**.

Все файлы обработаны: тишина по краям обрезана, громкость выровнена (пик −1 дБ), моно, WAV 44.1 кГц (музыка — 22 кГц).

## Что это

| Файл | Что звучит | Длина | Исходник (uploads/) | Источник / лицензия |
|---|---|---|---|---|
| music-race-loop | Музыка заезда, бесшовный повтор | ~2 мин | 55d6fec119c1105.wav | SOURCE_TBD |
| vo-ready | Голос «Oh yeah, McQueen is ready» | 16.8 с | oh-yeah-mcqueen-is-ready-cars.wav | Запись команды |
| vo-countdown-go | Голос «3, 2, 1, GO!» | 4.4 с | mrstokes302-321-go-sfx…mp3 | Pixabay Content License, автор mrstokes302 |
| sfx-countdown | Бипы отсчёта (без голоса) | 4.3 с | mixkit-clock-countdown-bleeps-916.wav | Mixkit Free License |
| sfx-engine-start | Запуск мотора | 1.6 с | mixkit-car-engine-start-1566.wav | Mixkit Free License |
| sfx-engine-rev | Рёв мотора (первые 4.5 с старта) | 4.5 с | mixkit-cars-starting-1561.wav | Mixkit Free License |
| sfx-race-start | Старт нескольких машин | 13.8 с | mixkit-cars-starting-1561.wav | Mixkit Free License |
| sfx-garage-wrench | Пневмогайковёрт | 0.7 с | mixkit-garage-pneumatic-screwer-817.wav | Mixkit Free License |
| sfx-horn | Клаксон | 0.5 с | mixkit-car-horn-718.wav | Mixkit Free License |
| sfx-error | Ошибка | 0.3 с | choice-error-sound.wav | SOURCE_TBD |
| sfx-bonus-pickup | Подбор бонуса | 1.1 с | game-environment-audio-power-supply….wav | SOURCE_TBD |
| sfx-place-1 | Победа / 1-е место | 3.4 с | the-sound-of-victory-in-the-game-level.wav | SOURCE_TBD |
| sfx-place-last | Последнее место | 0.5 с | lost-money-on-the-game-account.wav | SOURCE_TBD |

SOURCE_TBD — дизайнер пришлёт ссылки, до релиза вписать сюда и в `design/assets/README.md`.

## Когда играет

| Файл | Событие | volume |
|---|---|---|
| music-race-loop | Тренажёр: от «GO» до финиша, `loop: true`; на финише затухание 0.5 с | 0.3 |
| vo-ready | Открыт экран тренажёра, до отсчёта (можно пропустить кликом/пробелом) | 0.9 |
| sfx-engine-start | Сразу после vo-ready | 0.7 |
| vo-countdown-go | Отсчёт 3-2-1-GO, если в настройках включён «Голос» | 0.9 |
| sfx-countdown | Отсчёт, если «Голос» выключен | 0.6 |
| sfx-engine-rev | Первое нажатие после GO (одиночный заезд) | 0.6 |
| sfx-race-start | Первое нажатие после GO в режиме «Соревнование» — вместо sfx-engine-rev | 0.6 |
| sfx-error | Каждое неверное нажатие | 0.5 |
| sfx-bonus-pickup | Подобран бонус | 0.6 |
| sfx-place-1 | Экран результатов: 1-е место или рекорд | 0.8 |
| sfx-place-last | Экран результатов: последнее место | 0.7 |
| sfx-horn | Открыта ачивка «Ka-chow!» | 0.8 |
| sfx-garage-wrench | Гараж: смена дисков или цвета | 0.6 |

Порядок старта: vo-ready → sfx-engine-start → vo-countdown-go (или sfx-countdown) → «GO» → music-race-loop.

Остальные события (клавиши, комбо, нитро, ачивки, UI) — по `design/assets/SOUND-MAP.md`, файлы из `design/assets/sounds/`.

## Как собрать в проект

1. Конвертировать в OGG (меньше размер, работает во всех браузерах):
   ```bash
   cd design/sounds-recorded
   for f in *.wav; do ffmpeg -y -loglevel error -i "$f" -c:a libvorbis -q:a 4 "${f%.wav}.ogg"; done
   ```
2. Скопировать в публичную папку фронта с заменой одноимённых:
   ```bash
   mkdir -p frontend/public/sounds
   cp design/assets/sounds/*.ogg frontend/public/sounds/
   cp design/sounds-recorded/*.ogg frontend/public/sounds/   # перезаписывает синтезированные
   ```
3. Подключить через один модуль `frontend/src/lib/sound.ts`: словарь `{ имя: { src: '/sounds/<имя>.ogg', volume } }` по таблице выше, функция `play(name)`. Компоненты зовут только `play('sfx-error')`, а не пути к файлам.
4. Правила:
   - звук без клика пользователя браузер не играет — инициализировать аудио по первому клику;
   - повторный вызов того же звука перезапускает его, не накладывает (кроме sfx-key, sfx-coin);
   - настройки: «Музыка» → music-*, amb-*; «Голос» → vo-*; «Звуки» → sfx-*.
5. Проверка: открыть тренажёр → vo-ready → мотор → «3, 2, 1, GO!» → музыка; ошибка — sfx-error; финиш на 1-м месте — sfx-place-1.

Не менять файлы местами, не переименовывать, не подставлять «похожий». Нужного звука нет в таблицах — не включать, спросить.
