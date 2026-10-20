import { useEffect, useRef } from 'react'
import { useStore } from 'zustand'
import { useAuthStore } from '../../store/authStore.js'
import { comboMultiplier } from '../game/scoring.js'
import { useGhostProgress } from '../ghost/useGhost.js'
import ComboBurst from '../effects/ComboBurst.jsx'
import SparkCanvas from '../effects/SparkCanvas.jsx'
import RaceTrack from '../race/RaceTrack.jsx'
import { useTypingMetrics } from '../typing/useTypingMetrics.js'
import { playSound } from '../audio/sounds.js'
import styles from './TrainTrack.module.css'

const SPEED_TIERS = [
  { below: 35, speed: 'cruise' },
  { below: 70, speed: 'fast' },
  { below: Infinity, speed: 'turbo' },
]

const LEAD_THRESHOLD = 0.01

const speedFor = (wpm) => SPEED_TIERS.find((tier) => wpm < tier.below).speed

export default function TrainTrack({ engine, tracker, finished, ghost }) {
  const user = useAuthStore((state) => state.user)
  const position = useStore(engine.store, (state) => state.position)
  const errors = useStore(engine.store, (state) => state.errors)
  const started = useStore(engine.store, (state) => state.startedAt !== null)
  const paused = useStore(engine.store, (state) => state.pausedAt !== null)
  const combo = useStore(tracker.store, (state) => comboMultiplier(state.combo))
  const { wpm } = useTypingMetrics(engine, 500)
  const ghostProgress = useGhostProgress(engine, ghost)

  const moving = started && !paused && !finished
  const total = engine.text.length
  const playerProgress = total > 0 ? position / total : 0
  const gap = ghost && moving ? playerProgress - ghostProgress : 0
  const lead = gap > LEAD_THRESHOLD ? 1 : gap < -LEAD_THRESHOLD ? -1 : 0
  const leadRef = useRef(0)

  useEffect(() => {
    if (lead === 0) return
    if (leadRef.current !== 0 && lead !== leadRef.current) {
      playSound(lead > 0 ? 'sfx-overtake' : 'sfx-pass-by')
    }
    leadRef.current = lead
  }, [lead])

  const cars = [
    {
      id: 'player',
      progress: playerProgress,
      config: user?.car_config,
      label: user?.nickname ?? 'Ты',
      speed: moving ? speedFor(wpm) : 'idle',
      combo: moving ? combo : 1,
      skid: errors,
      finished,
    },
  ]

  if (ghost) {
    cars.unshift({
      id: 'ghost',
      ghost: true,
      progress: ghostProgress,
      config: ghost.user.car_config,
      label: ghost.who === 'self' ? '👻 Мой рекорд' : `👻 ${ghost.user.nickname}`,
      speed: moving && ghostProgress < 1 ? 'cruise' : 'idle',
      finished: ghostProgress >= 1,
    })
  }

  return (
    <div className={styles.wrapper}>
      <RaceTrack cars={cars} moving={moving} finished={finished} />
      <SparkCanvas tracker={tracker} anchorSelector='[data-car="player"] svg' />
      <ComboBurst tracker={tracker} />
    </div>
  )
}
