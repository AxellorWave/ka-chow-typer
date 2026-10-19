import { useEffect, useRef } from 'react'

export function useEnginePresses(engine, onPress) {
  const handlerRef = useRef(onPress)

  useEffect(() => {
    handlerRef.current = onPress
  })

  useEffect(() => {
    let pending = null

    const handleKeyDown = (event) => {
      pending = { code: event.code, key: event.key }
    }

    const unsubscribe = engine.store.subscribe((state, previous) => {
      if (pending === null) return
      const press = pending
      pending = null
      if (state.errors > previous.errors) {
        handlerRef.current({ ...press, ok: false, expected: engine.text[state.position] })
      } else if (state.position > previous.position) {
        handlerRef.current({ ...press, ok: true, expected: engine.text[previous.position] })
      }
    })

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      unsubscribe()
    }
  }, [engine])
}
