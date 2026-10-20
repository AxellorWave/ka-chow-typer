import { useSyncExternalStore } from 'react'

const TOUCH_SCREEN = '(pointer: coarse) and (max-width: 1024px)'
const IME_KEY_CODE = 229
const STORAGE_KEY = 'kachow-physical-keyboard'

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

const isEditable = (target) =>
  target instanceof Element && target.closest('input, textarea, select, [contenteditable]') !== null

function handleKeyDown(event) {
  if (keyboardSeen || event.keyCode === IME_KEY_CODE || event.key?.length !== 1) return
  if (event.ctrlKey || event.metaKey || event.altKey || isEditable(event.target)) return
  keyboardSeen = true
  rememberSeen()
  notify()
}

function subscribe(listener) {
  const query = window.matchMedia(TOUCH_SCREEN)
  if (listeners.size === 0) window.addEventListener('keydown', handleKeyDown, true)
  listeners.add(listener)
  query.addEventListener('change', listener)
  return () => {
    listeners.delete(listener)
    query.removeEventListener('change', listener)
    if (listeners.size === 0) window.removeEventListener('keydown', handleKeyDown, true)
  }
}

const getSnapshot = () => !keyboardSeen && window.matchMedia(TOUCH_SCREEN).matches

export function useNeedsKeyboard() {
  return useSyncExternalStore(subscribe, getSnapshot)
}
