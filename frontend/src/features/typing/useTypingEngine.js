import { useEffect, useMemo, useRef } from 'react'
import { createTypingEngine } from './createTypingEngine.js'

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])
const IME_KEY_CODE = 229
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

const isEditableTarget = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || EDITABLE_TAGS.has(target.tagName))

export function toEngineKey(event) {
  if (event.repeat || event.isComposing || event.keyCode === IME_KEY_CODE) return null
  const altGraph = event.getModifierState?.('AltGraph') ?? false
  if (!altGraph && (event.ctrlKey || event.metaKey || (event.altKey && !IS_MAC))) return null
  if (event.key === 'Enter' || event.key === 'Tab') return event.key
  return event.key.length === 1 ? event.key : null
}

export function useTypingEngine(text, { enabled = true, onCorrect, onError, onFinish } = {}) {
  const engine = useMemo(() => createTypingEngine(text), [text])
  const handlersRef = useRef({ onCorrect, onError, onFinish })

  useEffect(() => {
    handlersRef.current = { onCorrect, onError, onFinish }
  })

  useEffect(() => {
    if (!enabled) return undefined

    const handleKeyDown = (event) => {
      if (isEditableTarget(event.target)) return
      const key = toEngineKey(event)
      if (key === null) return
      event.preventDefault()

      const outcome = engine.press(key, event.timeStamp)
      if (outcome === null) return

      const handlers = handlersRef.current
      if (outcome.type === 'error') {
        handlers.onError?.(outcome)
        return
      }
      handlers.onCorrect?.(outcome)
      if (outcome.type === 'finish') {
        handlers.onFinish?.(engine.getResult())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [engine, enabled])

  return engine
}
