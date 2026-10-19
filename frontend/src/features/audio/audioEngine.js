let audioContext = null

export function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext()
  }

  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }

  return audioContext
}

export async function closeAudioContext() {
  if (!audioContext) return

  stopEngineSound()

  const context = audioContext
  audioContext = null

  if (context.state !== 'closed') {
    await context.close()
  }
}

export function playTireSound() {
  const context = getAudioContext()
  const now = context.currentTime

  const oscillator = context.createOscillator()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()

  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(1200, now)
  oscillator.frequency.exponentialRampToValueAtTime(650, now + 0.4)

  filter.type = 'highpass'
  filter.frequency.value = 500

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)

  oscillator.connect(filter)
  filter.connect(gain)
  gain.connect(context.destination)

  oscillator.start(now)
  oscillator.stop(now + 0.4)

  oscillator.onended = () => {
    oscillator.disconnect()
    filter.disconnect()
    gain.disconnect()
  }
}


let engineOscillator = null
let engineGain = null

export function startEngineSound() {
  if (engineOscillator) return

  const context = getAudioContext()
  const now = context.currentTime

  engineOscillator = context.createOscillator()
  engineGain = context.createGain()

  engineOscillator.type = 'sawtooth'
  engineOscillator.frequency.setValueAtTime(70, now)

  engineGain.gain.setValueAtTime(0.0001, now)
  engineGain.gain.exponentialRampToValueAtTime(0.025, now + 0.1)

  engineOscillator.connect(engineGain)
  engineGain.connect(context.destination)

  engineOscillator.start()
}

export function updateEngineSound(wpm) {
  if (!engineOscillator || !audioContext) return

  const now = audioContext.currentTime
  const frequency = Math.min(250, 70 + wpm * 1.5)

  engineOscillator.frequency.setTargetAtTime(frequency, now, 0.15)
}

export function stopEngineSound() {
  if (!engineOscillator || !audioContext) return

  const oscillator = engineOscillator
  const gain = engineGain
  const now = audioContext.currentTime

  gain.gain.setTargetAtTime(0.0001, now, 0.03)
  oscillator.stop(now + 0.15)

  oscillator.onended = () => {
    oscillator.disconnect()
    gain.disconnect()
  }

  engineOscillator = null
  engineGain = null
}

export function playNitroSound() {
  const context = getAudioContext()
  const now = context.currentTime
  const duration = 0.5

  const oscillator = context.createOscillator()
  const bass = context.createOscillator()
  const gain = context.createGain()
  const bassGain = context.createGain()

  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(150, now)
  oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.4)

  bass.type = 'sawtooth'
  bass.frequency.setValueAtTime(65, now)
  bass.frequency.exponentialRampToValueAtTime(180, now + 0.4)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.055, now + 0.12)
  gain.gain.setValueAtTime(0.055, now + 0.35)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  bassGain.gain.setValueAtTime(0.0001, now)
  bassGain.gain.exponentialRampToValueAtTime(0.025, now + 0.12)
  bassGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)

  bass.connect(bassGain)
  bassGain.connect(context.destination)

  oscillator.start(now)
  bass.start(now)

  oscillator.stop(now + duration)
  bass.stop(now + duration)

  oscillator.onended = () => {
    oscillator.disconnect()
    gain.disconnect()
  }

  bass.onended = () => {
    bass.disconnect()
    bassGain.disconnect()
  }
}
