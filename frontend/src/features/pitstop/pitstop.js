const CYRILLIC = /[а-яё]/i

export const PITSTOP_LANGS = ['ru', 'en']

export const pitstopLang = (lang) => (PITSTOP_LANGS.includes(lang) ? lang : 'en')

export const keyLang = (key) => (CYRILLIC.test(key) ? 'ru' : 'en')

export const pitstopPath = (lang) => `/train?pitstop=${pitstopLang(lang)}`

export function compareKey(before, after) {
  if (!after) return 'unknown'
  if (after.error_rate < before.error_rate) return 'better'
  if (after.error_rate > before.error_rate) return 'worse'
  if (after.avg_latency_ms < before.avg_latency_ms) return 'better'
  if (after.avg_latency_ms > before.avg_latency_ms) return 'worse'
  return 'same'
}
