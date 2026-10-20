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
