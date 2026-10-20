const SEGMENTS = 12
const WEAK_LIMIT = 6

export function speedSegments(keystrokes, durationMs) {
  if (!keystrokes.length || durationMs <= 0) return []
  const size = durationMs / SEGMENTS
  const correct = Array(SEGMENTS).fill(0)
  for (const [, t, ok] of keystrokes) {
    if (ok) correct[Math.min(SEGMENTS - 1, Math.floor(t / size))] += 1
  }
  const minutes = size / 60_000
  return correct.map((count) => Math.round(count / 5 / minutes))
}

export function weakChars(text, keystrokes) {
  const errors = new Map()
  let position = 0
  for (const [, , ok] of keystrokes) {
    if (ok) {
      position += 1
      continue
    }
    const expected = text[position]
    if (expected && expected.trim()) errors.set(expected, (errors.get(expected) ?? 0) + 1)
  }
  return [...errors.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, WEAK_LIMIT)
    .map(([char, count]) => ({ char, count }))
}

export function errorsWord(count) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'ошибка'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'ошибки'
  return 'ошибок'
}
