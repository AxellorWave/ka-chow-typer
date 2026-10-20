import { useSyncExternalStore } from 'react'

const TOUCH_SCREEN = '(pointer: coarse) and (max-width: 1024px)'
const FINE_POINTER = '(any-pointer: fine)'
const IME_KEY_CODE = 229
const STORAGE_KEY = 'kachow-keyboard-seen'

function readSeen() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function rememberSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    return
  }
}

let keyboardSeen = readSeen()
const listeners = new Set()

const notify = () => listeners.forEach((listener) => listener())

function handleKeyDown(event) {
  if (keyboardSeen || event.keyCode === IME_KEY_CODE || event.key === 'Unidentified') return
  keyboardSeen = true
  rememberSeen()
  notify()
}

function subscribe(listener) {
  const queries = [TOUCH_SCREEN, FINE_POINTER].map((query) => window.matchMedia(query))
  if (listeners.size === 0) window.addEventListener('keydown', handleKeyDown, true)
  listeners.add(listener)
  queries.forEach((query) => query.addEventListener('change', listener))
  return () => {
    listeners.delete(listener)
    queries.forEach((query) => query.removeEventListener('change', listener))
    if (listeners.size === 0) window.removeEventListener('keydown', handleKeyDown, true)
  }
}

const getSnapshot = () =>
  !keyboardSeen &&
  window.matchMedia(TOUCH_SCREEN).matches &&
  !window.matchMedia(FINE_POINTER).matches

export function useNeedsKeyboard() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
