import { useEffect, useState } from 'react'

export function useCapsLock() {
  const [capsLock, setCapsLock] = useState(false)

  useEffect(() => {
    const handleKey = (event) => {
      if (typeof event.getModifierState === 'function') {
        setCapsLock(event.getModifierState('CapsLock'))
      }
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keyup', handleKey)
    }
  }, [])

  return capsLock
}
