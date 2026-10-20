import { formatNumber } from '../stats/format.js'

export const METRICS = {
  wpm: {
    label: 'Скорость',
    valueLabel: 'WPM',
    format: (value) => formatNumber(value),
    secondaryLabel: 'Точность',
    secondary: (row) => `${formatNumber(row.accuracy)}%`,
  },
  accuracy: {
    label: 'Точность',
    valueLabel: 'Точность',
    format: (value) => `${formatNumber(value)}%`,
    secondaryLabel: 'WPM',
    secondary: (row) => formatNumber(row.wpm),
    hint: 'Учитываются заезды от 100 символов.',
  },
  xp: {
    label: 'Опыт',
    valueLabel: 'XP',
    format: (value) => formatNumber(value),
    secondaryLabel: 'Уровень',
    secondary: (row) => row.level,
  },
}

export const PERIODS = {
  day: 'Сегодня',
  week: 'Неделя',
  all: 'Всё время',
}
