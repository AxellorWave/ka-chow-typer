import { createStore } from 'zustand/vanilla'

const INDENT_SIZE = 4

const initialState = () => ({
  position: 0,
  typed: 0,
  pressed: 0,
  errors: 0,
  errorAt: null,
  startedAt: null,
  finishedAt: null,
  pausedAt: null,
})

const round1 = (value) => Math.round(value * 10) / 10

export const normalizeText = (text) => text.replace(/\r\n?/g, '\n')

export function computeMetrics({ pressed, errors, durationMs }) {
  const minutes = durationMs / 60_000
  const cpm = minutes > 0 ? pressed / minutes : 0
  const presses = pressed + errors
  return {
    cpm: round1(cpm),
    wpm: round1(cpm / 5),
    accuracy: presses > 0 ? round1((pressed / presses) * 100) : 100,
    errors,
  }
}

export function createTypingEngine(rawText) {
  const text = normalizeText(rawText)
  const store = createStore(initialState)
  let keystrokes = []

  const elapsed = (state, now) => Math.max(0, Math.round(now - (state.startedAt ?? now)))

  const columnAt = (position) => position - text.lastIndexOf('\n', position - 1) - 1

  const isIndentAt = (position) =>
    /^[ \t]*$/.test(text.slice(text.lastIndexOf('\n', position - 1) + 1, position))

  const tabWidthAt = (position) => {
    if (text[position] === '\t') return 1
    if (text[position] !== ' ' || !isIndentAt(position)) return 0
    const toNextStop = INDENT_SIZE - (columnAt(position) % INDENT_SIZE)
    let run = 0
    while (run < toNextStop && text[position + run] === ' ') run += 1
    return run
  }

  const acceptChars = (position, count, t) => {
    keystrokes.push([text[position], t, true])
    for (let index = position + 1; index < position + count; index += 1) {
      keystrokes.push([text[index], t, true, true])
    }
  }

  function press(key, now) {
    const state = store.getState()
    if (state.finishedAt !== null || state.pausedAt !== null || text.length === 0) return null

    const startedAt = state.startedAt ?? now
    const t = Math.max(0, Math.round(now - startedAt))
    const { position } = state
    const expected = text[position]
    const typedChar = key === 'Enter' ? '\n' : key === 'Tab' ? '\t' : key
    const count = key === 'Tab' ? tabWidthAt(position) : typedChar === expected ? 1 : 0

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

    acceptChars(position, count, t)

    const nextPosition = position + count
    const finished = nextPosition >= text.length
    store.setState({
      startedAt,
      position: nextPosition,
      typed: state.typed + count,
      pressed: state.pressed + 1,
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
    const durationMs =
      state.startedAt === null ? 0 : elapsed(state, state.finishedAt ?? state.pausedAt ?? now)
    return {
      ...computeMetrics({
        pressed: state.pressed,
        errors: state.errors,
        durationMs,
      }),
      durationMs,
    }
  }

  function pause(now) {
    const state = store.getState()
    if (state.startedAt === null || state.finishedAt !== null || state.pausedAt !== null) return
    store.setState({ pausedAt: now })
  }

  function resume(now) {
    const state = store.getState()
    if (state.pausedAt === null) return
    store.setState({
      startedAt: state.startedAt + Math.max(0, now - state.pausedAt),
      pausedAt: null,
    })
  }

  function getResult() {
    const state = store.getState()
    const durationMs = Math.max(1, elapsed(state, state.finishedAt ?? state.startedAt ?? 0))
    const metrics = computeMetrics({
      pressed: state.pressed,
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

  return { text, store, press, pause, resume, getMetrics, getResult, reset }
}
