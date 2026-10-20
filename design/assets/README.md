# KaChowTyper · ассеты (#33)

- garage/heroes/ — 5 героев, PNG без фона: hero-mcqueen (Молния Маккуин), hero-guido (Гвидо), hero-mater (Мэтр), hero-storm (Джексон Шторм), hero-flo (Фло).
- garage/ — car-shadow.svg, car-wheels-* (6: classic = родные колёса, gold, star, mesh, neon, aero), car-eyes.png (для Маккуина — поверх перекрашенного кузова). Диски накладываются по координатам из heroes/hero-fit.json.
- Цвет кузова — CSS filter. Базовый тон героя (hue°, saturate): mcqueen 0/1, guido 210/1.1, mater 18/1.6, storm 225/2.2, flo 172/1.3. Цвета: Красный 0°, Синий 215°, Зелёный 120°, Оранжевый 28°, Фиолетовый 275°, Графит = grayscale(1) brightness(.62) contrast(1.2). filter: hue-rotate(цвет − база) saturate(sat).

- achievements/ — 15 иконок SVG 256×256 (графика как на экранах MVP): ka-chow, typing-genius, steel-finger, clean-lap, speed-200, polyglot, coder, ghost-beaten, week-streak, gold-cup, night-racer, fire-combo, sniper, hundred, legend. Закрытая ачивка — filter: grayscale(1) opacity(.5).
- bonuses/ — чипы как в тренажёре MVP: bonus-nitro (N · Нитро), bonus-tailwind (W · Попутный ветер), bonus-grip-tires (T · Цепкие шины); *-off.svg — неактивное состояние (пунктир).
- cups/ — cup-gold, cup-silver, cup-bronze — SVG 256×256, как на экране результатов MVP.
- brand/ — logo.svg, logo-night.svg, favicon.svg.
- track/ — track-bg.svg и track-bg-night.svg, бесшовно тянутся по горизонтали (period 760px, background-repeat: repeat-x).
- sounds/ — OGG Vorbis, все сгенерированы (свободная лицензия).
  - Музыка/фон (loop: true): music-race-loop (128 bpm, 30 с, во время печати, громкость ~0.3), amb-crowd-loop (меню), amb-night-loop (ночная трасса)
  - Старт: sfx-countdown (3-2-1), sfx-go, sfx-engine-start, sfx-engine-rev, sfx-tire-screech
  - Заезд: sfx-key, sfx-error, sfx-danger (серия ошибок), sfx-tick (последние 10 с), sfx-combo, sfx-nitro, sfx-bonus-pickup, sfx-pass-by / sfx-overtake (обгон призрака)
  - Финиш: sfx-finish, sfx-crowd-cheer, sfx-photo-finish, sfx-place-1, sfx-place-last
  - Награды: sfx-cup, sfx-coin (начисление XP), sfx-level-up, sfx-achievement, sfx-streak
  - UI: sfx-ui-hover, sfx-ui-click, sfx-tab, sfx-modal-open, sfx-modal-close, sfx-garage-wrench (смена дисков/цвета)
  - Голос («3-2-1 GO!», «New record!») — не входит, брать Kenney Voiceover Pack (CC0)

Шрифт в SVG — Dela Gothic One (подключён в tokens.css).
