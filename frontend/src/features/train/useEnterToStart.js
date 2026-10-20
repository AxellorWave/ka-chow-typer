import { useEffect } from 'react'

const isStartTarget = (target) =>
  target === document.body || (target.tagName === 'BUTTON' && target.hasAttribute('aria-pressed'))

export function useEnterToStart(onStart, disabled = false) {
  useEffect(() => {
    if (disabled) {
      return undefined
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && !event.repeat && isStartTarget(event.target)) {
        event.preventDefault()
        onStart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onStart, disabled])
}
