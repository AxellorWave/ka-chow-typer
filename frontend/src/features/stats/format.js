const numberFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 })
const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
const shortDateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })

export const MODE_LABELS = {
  words: 'Слова',
  sentences: 'Предложения',
  quotes: 'Цитаты',
  symbols: 'Символы',
  code: 'Код',
}

export const LANG_LABELS = {
  ru: 'RU',
  en: 'EN',
  python: 'Python',
  js: 'JavaScript',
  html_css: 'HTML/CSS',
}

export const VISIBLE_KEYS = { ' ': '␣', '\n': '↵', '\t': '⇥' }

export const formatNumber = (value) => numberFormat.format(value ?? 0)

export const formatDateTime = (iso) => dateTimeFormat.format(new Date(iso))

export const formatShortDate = (isoDate) => shortDateFormat.format(new Date(`${isoDate}T00:00:00`))

export const formatKey = (value) => Array.from(value, (char) => VISIBLE_KEYS[char] ?? char).join('')

export function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60_000)
  if (totalMinutes === 0) return `${Math.round(ms / 1000)} с`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} мин`
  return minutes === 0 ? `${hours} ч` : `${hours} ч ${minutes} мин`
}
