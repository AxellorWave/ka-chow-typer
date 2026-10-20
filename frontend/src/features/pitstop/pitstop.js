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

export function runKeyStats(text, keystrokes) {
  const stats = new Map()
  let position = 0
  let previous = 0
  for (const [, t, ok, auto] of keystrokes) {
    const expected = text[position]
    if (auto) {
      position += 1
      continue
    }
    const entry = stats.get(expected) ?? { presses: 0, errors: 0, latency: 0 }
    entry.presses += 1
    entry.errors += ok ? 0 : 1
    entry.latency += t - previous
    previous = t
    stats.set(expected, entry)
    if (ok) position += 1
  }
  return new Map(
    [...stats].map(([key, entry]) => [
      key,
      {
        key,
        error_rate: Math.round((entry.errors * 1000) / entry.presses) / 10,
        avg_latency_ms: Math.round(entry.latency / entry.presses),
      },
    ]),
  )
}
