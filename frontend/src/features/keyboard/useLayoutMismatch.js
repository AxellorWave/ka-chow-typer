import { useState } from 'react'
import { detectNeededLayout } from './detectLayout.js'
import { useEnginePresses } from './useEnginePresses.js'

const MISMATCH_THRESHOLD = 2

const idle = (engine) => ({ engine, streak: 0, needed: null })

export function useLayoutMismatch(engine) {
  const [state, setState] = useState(() => idle(engine))

  useEnginePresses(engine, ({ ok, key, expected }) => {
    if (ok) {
      setState((previous) =>
        previous.engine === engine && previous.streak === 0 ? previous : idle(engine),
      )
      return
    }
    const needed = detectNeededLayout(expected, key)
    if (needed === null) return
    setState((previous) => {
      const streak = previous.engine === engine ? previous.streak + 1 : 1
      return { engine, streak, needed: streak >= MISMATCH_THRESHOLD ? needed : null }
    })
  })

  return state.engine === engine ? state.needed : null
}
