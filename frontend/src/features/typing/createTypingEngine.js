import { createStore } from 'zustand/vanilla'

const INDENT_SIZE = 4
const INDENT_CHARS = new Set([' ', '\t'])

const initialState = () => ({
  position: 0,
  typed: 0,
  errors: 0,
  errorAt: null,
  startedAt: null,
  finishedAt: null,
})

const round1 = (value) => Math.round(value * 10) / 10

export const normalizeText = (text) => text.replace(/\r\n?/g, '\n')

export function computeMetrics({ correct, typed, errors, durationMs }) {
  const minutes = durationMs / 60_000
  const cpm = minutes > 0 ? correct / minutes : 0
  return {
    cpm: round1(cpm),
    wpm: round1(cpm / 5),
    accuracy: typed > 0 ? round1((correct / typed) * 100) : 100,
    errors,
  }
}

export function createTypingEngine(rawText) {
  const text = normalizeText(rawText)
  const store = createStore(initialState)
  let keystrokes = []

  const elapsed = (state, now) => Math.max(0, Math.round(now - (state.startedAt ?? now)))

  const columnAt = (position) => position - text.lastIndexOf('\n', position - 1) - 1

  const indentRunLength = (position) => {
    let end = position
    while (end < text.length && INDENT_CHARS.has(text[end])) end += 1
    return end - position
  }

  const tabWidthAt = (position) => {
    if (text[position] === '\t') return 1
    if (text[position] !== ' ') return 0
    const toNextStop = INDENT_SIZE - (columnAt(position) % INDENT_SIZE)
    let run = 0
    while (run < toNextStop && text[position + run] === ' ') run += 1
    return run
  }

  const acceptChars = (position, count, t) => {
    for (let index = position; index < position + count; index += 1) {
      keystrokes.push([text[index], t, true])
    }
  }

  function press(key, now) {
    const state = store.getState()
    if (state.finishedAt !== null || text.length === 0) return null

    const startedAt = state.startedAt ?? now
    const t = Math.max(0, Math.round(now - startedAt))
    const { position } = state
    const expected = text[position]
    const typedChar = key === 'Enter' ? '\n' : key === 'Tab' ? '\t' : key
    let count = key === 'Tab' ? tabWidthAt(position) : typedChar === expected ? 1 : 0

    if (count === 0) {
      keystrokes.push([typedChar, t, false])
      store.setState({
        startedAt,
        typed: state.typed + 1,
        errors: state.errors + 1,
        errorAt: position,
      })
      return { type: 'error', index: position, expected, typed: typedChar, time: t }
    }

    if (typedChar === '\n') {
      count += indentRunLength(position + 1)
    }
    acceptChars(position, count, t)

    const nextPosition = position + count
    const finished = nextPosition >= text.length
    store.setState({
      startedAt,
      position: nextPosition,
      typed: state.typed + count,
      errorAt: null,
      finishedAt: finished ? startedAt + t : null,
    })
    return {
      type: finished ? 'finish' : 'correct',
      index: position,
      count,
      chars: text.slice(position, nextPosition),
      time: t,
    }
  }

  function getMetrics(now) {
    const state = store.getState()
    const durationMs = state.startedAt === null ? 0 : elapsed(state, state.finishedAt ?? now)
    return computeMetrics({
      correct: state.position,
      typed: state.typed,
      errors: state.errors,
      durationMs,
    })
  }

  function getResult() {
    const state = store.getState()
    const durationMs = Math.max(1, elapsed(state, state.finishedAt ?? state.startedAt ?? 0))
    const metrics = computeMetrics({
      correct: state.position,
      typed: state.typed,
      errors: state.errors,
      durationMs,
    })
    return {
      text,
      duration_ms: durationMs,
      typed_chars: state.typed,
      correct_chars: state.position,
      errors: state.errors,
      cpm: metrics.cpm,
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      keystrokes: keystrokes.slice(),
    }
  }

  function reset() {
    keystrokes = []
    store.setState(initialState())
  }

  return { text, store, press, getMetrics, getResult, reset }
}
