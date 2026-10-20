import { useSettingsStore } from '../../store/settingsStore.js'

const SOUNDS = {
  'music-race-loop': { volume: 0.3, loop: true },
  'vo-ready': { volume: 0.9 },
  'vo-countdown-go': { volume: 0.9 },
  'vo-ka-chow': { volume: 0.9 },
  'sfx-engine-start': { volume: 0.5 },
  'sfx-engine-rev': { volume: 0.6 },
  'sfx-key': { volume: 0.25, overlap: true },
  'sfx-combo': { volume: 0.6 },
  'sfx-danger': { volume: 0.6 },
  'sfx-overtake': { volume: 0.7 },
  'sfx-pass-by': { volume: 0.6 },
  'sfx-tire-screech': { volume: 0.5 },
  'sfx-error': { volume: 0.5 },
  'sfx-bonus-pickup': { volume: 0.6 },
  'sfx-finish': { volume: 0.7 },
  'sfx-place-1': { volume: 0.8 },
  'sfx-place-last': { volume: 0.7 },
  'sfx-photo-finish': { volume: 0.8 },
  'sfx-crowd-cheer': { volume: 0.6 },
  'sfx-coin': { volume: 0.6, overlap: true },
  'sfx-cup': { volume: 0.7 },
  'sfx-level-up': { volume: 0.7 },
  'sfx-achievement': { volume: 0.7 },
  'sfx-horn': { volume: 0.8 },
  'sfx-garage-wrench': { volume: 0.6 },
  'sfx-ui-click': { volume: 0.4, overlap: true },
  'sfx-tab': { volume: 0.4, overlap: true },
  'sfx-modal-close': { volume: 0.5 },
}

const FADE_STEP_MS = 50
const POOL_SIZE = 4

const players = new Map()
const pools = new Map()
const fades = new Map()

function getPlayer(name) {
  let audio = players.get(name)
  if (!audio) {
    const { volume, loop = false } = SOUNDS[name]
    audio = new Audio(`/sounds/${name}.mp3`)
    audio.preload = 'auto'
    audio.volume = volume
    audio.loop = loop
    players.set(name, audio)
  }
  return audio
}

function playOverlapping(name) {
  let pool = pools.get(name)
  if (!pool) {
    pool = { next: 0, items: [getPlayer(name)] }
    for (let index = 1; index < POOL_SIZE; index += 1) pool.items.push(getPlayer(name).cloneNode())
    pool.items.forEach((audio) => {
      audio.volume = SOUNDS[name].volume
    })
    pools.set(name, pool)
  }
  const audio = pool.items[pool.next]
  pool.next = (pool.next + 1) % POOL_SIZE
  audio.currentTime = 0
  audio.play().catch(() => {})
}

function cancelFade(name) {
  clearInterval(fades.get(name))
  fades.delete(name)
}

export function preloadSounds(names = Object.keys(SOUNDS)) {
  names.forEach(getPlayer)
}

export function playSound(name, { from = 0 } = {}) {
  if (!useSettingsStore.getState().soundEnabled) return
  if (SOUNDS[name].overlap) {
    playOverlapping(name)
    return
  }
  const audio = getPlayer(name)
  cancelFade(name)
  audio.volume = SOUNDS[name].volume
  audio.currentTime = from
  audio.play().catch(() => {})
}

export function pauseSound(name) {
  players.get(name)?.pause()
}

export function resumeSound(name) {
  const audio = players.get(name)
  if (!audio || !useSettingsStore.getState().soundEnabled) return
  audio.play().catch(() => {})
}

export function stopSound(name, { fadeMs = 0 } = {}) {
  const audio = players.get(name)
  if (!audio) return
  cancelFade(name)
  if (fadeMs <= 0 || audio.paused) {
    audio.pause()
    return
  }
  const step = audio.volume / (fadeMs / FADE_STEP_MS)
  fades.set(
    name,
    setInterval(() => {
      audio.volume = Math.max(0, audio.volume - step)
      if (audio.volume === 0) {
        cancelFade(name)
        audio.pause()
      }
    }, FADE_STEP_MS),
  )
}

export function playSequence(steps) {
  const timers = steps.map(([name, delayMs]) => setTimeout(() => playSound(name), delayMs))
  return () => timers.forEach(clearTimeout)
}
