import { LAYOUTS } from './layouts.js'

const CYRILLIC = /^[а-яё]$/i
const LATIN = /^[a-z]$/i

function isSameKey(expected, typed, expectedLayout, typedLayout) {
  const target = LAYOUTS[expectedLayout].charMap.get(expected)
  const pressed = LAYOUTS[typedLayout].charMap.get(typed)
  return (
    target !== undefined &&
    pressed !== undefined &&
    target.code === pressed.code &&
    target.shift === pressed.shift
  )
}

export function detectNeededLayout(expected, typed) {
  if (expected === undefined || typed === undefined) return null
  if (CYRILLIC.test(expected) && (LATIN.test(typed) || isSameKey(expected, typed, 'ru', 'en'))) {
    return 'ru'
  }
  if (CYRILLIC.test(typed) && (LATIN.test(expected) || isSameKey(expected, typed, 'en', 'ru'))) {
    return 'en'
  }
  return null
}
