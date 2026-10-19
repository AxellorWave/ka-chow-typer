const CYRILLIC = /^[а-яё]$/i
const LATIN = /^[a-z]$/i

export function detectNeededLayout(expected, typed) {
  if (expected === undefined || typed === undefined) return null
  if (CYRILLIC.test(expected) && LATIN.test(typed)) return 'ru'
  if (LATIN.test(expected) && CYRILLIC.test(typed)) return 'en'
  return null
}
