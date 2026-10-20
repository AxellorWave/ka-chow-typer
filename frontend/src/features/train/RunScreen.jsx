import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from 'zustand'
import ComboMeter from '../game/ComboMeter.jsx'
import NitroBar from '../game/NitroBar.jsx'
import { createScoreTracker } from '../game/scoring.js'
import { BONUS_DURATION_MS, TURBO_BONUS, getRandomBonusDelay } from '../game/bonuses.js'
import KeyboardPanel from '../keyboard/KeyboardPanel.jsx'
import { useSettingsStore } from '../../store/settingsStore.js'
import TextDisplay from '../typing/TextDisplay.jsx'
import { useTypingEngine } from '../typing/useTypingEngine.js'
import { useGhost } from '../ghost/useGhost.js'
import Hud from './Hud.jsx'
import PauseDialog from './PauseDialog.jsx'
import TrainTrack from './TrainTrack.jsx'
import styles from './RunScreen.module.css'
import {
  startEngineSound,
  updateEngineSound,
  stopEngineSound,
  closeAudioContext,
} from '../audio/audioEngine.js'
import { pauseSound, playSound, preloadSounds, resumeSound, stopSound } from '../audio/sounds.js'

const COUNTDOWN_FROM = 3
const COUNTDOWN_STEP_MS = 700
const GO_LABEL = 'Ka-chow!'
const FINISH_DELAY_MS = 900
const MUSIC = 'music-race-loop'
const MUSIC_FADE_MS = 500
const VOICE_OFFSETS = { 3: 0, 2: 1.04, 1: 2.12, 0: 3.22 }
const DANGER_STREAK = 3

function useCountdown(active, round, onDone) {
  const [count, setCount] = useState(COUNTDOWN_FROM)
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  })

  useEffect(() => {
    if (!active) return undefined
    setCount(COUNTDOWN_FROM)
    let current = COUNTDOWN_FROM
    const timer = setInterval(() => {
      current -= 1
      setCount(current)
      if (current < 0) {
        clearInterval(timer)
        doneRef.current()
      }
    }, COUNTDOWN_STEP_MS)
    return () => clearInterval(timer)
  }, [active, round])

  return count
}

function Countdown({ count }) {
  const lit = Math.min(COUNTDOWN_FROM, COUNTDOWN_FROM - count + 1)
  const go = count <= 0
  return (
    <div className={styles.overlay} aria-live="assertive">
      <div className={styles.lights} aria-hidden="true">
        {Array.from({ length: COUNTDOWN_FROM }, (_, index) => (
          <span
            key={index}
            className={styles.light}
            data-on={go || index < lit || undefined}
            data-go={go || undefined}
          />
        ))}
      </div>
      <span key={count} className={styles.count}>
        {go ? GO_LABEL : count}
      </span>
      <span className={styles.countHint}>Первая клавиша — и таймер пошёл</span>
    </div>
  )
}

function BonusChip({ seconds }) {
  const active = seconds > 0
  return (
    <span className={styles.bonus} data-active={active || undefined} role="status">
      {TURBO_BONUS.icon} {TURBO_BONUS.label} ×{TURBO_BONUS.multiplier}
      {active && ` · ${seconds} с`}
    </span>
  )
}

export default function RunScreen({
  run,
  onFinish,
  onExit,
  exitLabel = 'Сменить режим',
  ghostWho = 'off',
}) {
  const [phase, setPhase] = useState('countdown')
  const [round, setRound] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const tracker = useMemo(() => createScoreTracker(), [])
  const boardRef = useRef(null)
  const sectionRef = useRef(null)
  const pausedRef = useRef(false)
  const [bonusSeconds, setBonusSeconds] = useState(0)
  const [, setBonusDelay] = useState(getRandomBonusDelay)
  const bonusActive = bonusSeconds > 0

  const finishTimerRef = useRef(null)
  const errorStreakRef = useRef(0)
  const { ghost, missing: ghostMissing } = useGhost(run, ghostWho)

  const finish = useCallback(
    (result) => {
      const { score, maxCombo } = tracker.store.getState()
      const payload = {
        ...result,
        mode: run.mode,
        lang: run.lang,
        difficulty: run.difficulty,
        text_id: run.text_id ?? null,
        track_id: run.track_id ?? null,
        daily_date: run.daily_date ?? null,
        score,
        max_combo: maxCombo,
        ...(ghost && { ghost_run_id: ghost.run_id }),
      }
      setPhase('finished')
      finishTimerRef.current = setTimeout(() => onFinish(payload, ghost), FINISH_DELAY_MS)
    },
    [onFinish, run, tracker, ghost],
  )

  useEffect(() => () => clearTimeout(finishTimerRef.current), [])

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [])

  const engine = useTypingEngine(run.text, {
    enabled: phase === 'running' && !menuOpen,
    onCorrect: () => {
      tracker.hit(bonusActive ? TURBO_BONUS.multiplier : 1)
      errorStreakRef.current = 0
      playSound('sfx-key')

      if (useSettingsStore.getState().soundEnabled) {
        startEngineSound()
      }
    },
    onError: () => {
      tracker.miss()
      errorStreakRef.current += 1
      playSound(errorStreakRef.current === DANGER_STREAK ? 'sfx-danger' : 'sfx-error')
      const node = boardRef.current
      if (node) {
        node.classList.remove(styles.shake)
        void node.offsetWidth
        node.classList.add(styles.shake)
      }
    },
    onFinish: finish,
  })

  const started = useStore(engine.store, (state) => state.startedAt !== null)
  const paused = useStore(engine.store, (state) => state.pausedAt !== null) || menuOpen
  const soundEnabled = useSettingsStore((state) => state.soundEnabled)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    preloadSounds()
    return () => {
      stopSound(MUSIC)
      void closeAudioContext()
    }
  }, [])

  useEffect(() => {
    if (phase === 'running') {
      playSound(MUSIC)
    } else if (phase === 'finished') {
      stopSound(MUSIC, { fadeMs: MUSIC_FADE_MS })
      playSound('sfx-finish')
    } else {
      stopSound(MUSIC)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'running') return
    if (paused || !soundEnabled) pauseSound(MUSIC)
    else resumeSound(MUSIC)
  }, [phase, paused, soundEnabled])

  useEffect(() => {
    if (started) playSound('sfx-engine-rev')
  }, [started])

  useEffect(() => {
    if (phase === 'running' && started && paused) playSound('sfx-tire-screech')
  }, [phase, started, paused])

  useEffect(() => {
    if (bonusActive) playSound('sfx-bonus-pickup')
  }, [bonusActive])

  useEffect(() => {
    if (phase !== 'running' || paused || !soundEnabled) {
      stopEngineSound()
      return undefined
    }

    return () => stopEngineSound()
  }, [phase, paused, soundEnabled])

  useEffect(() => {
    if (phase !== 'running' || paused || !soundEnabled) return undefined

    const timer = setInterval(() => {
      const wpm = engine.getMetrics(performance.now()).wpm
      updateEngineSound(wpm)
    }, 250)

    return () => clearInterval(timer)
  }, [engine, phase, paused, soundEnabled])

  useEffect(() => {
    if (phase !== 'running' || !started || paused) return undefined

    const timer = setInterval(() => {
      if (bonusSeconds > 0) {
        setBonusSeconds((seconds) => Math.max(0, seconds - 1))
      } else {
        setBonusDelay((delay) => {
          if (delay <= 1000) {
            setBonusSeconds(BONUS_DURATION_MS / 1000)
            return getRandomBonusDelay()
          }
          return delay - 1000
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, started, paused, bonusSeconds])

  const counting = phase === 'countdown' && !menuOpen
  const count = useCountdown(counting, round, () => setPhase('running'))

  useEffect(() => {
    if (!counting || !(count in VOICE_OFFSETS)) return
    if (count === COUNTDOWN_FROM) {
      stopSound('vo-ready')
      playSound('sfx-engine-start')
    }
    playSound('vo-countdown-go', { from: VOICE_OFFSETS[count] })
  }, [counting, count])

  const resume = useCallback(
    (now = performance.now()) => {
      engine.resume(now)
      setMenuOpen(false)
    },
    [engine],
  )

  const openPause = useCallback(() => {
    const state = engine.store.getState()
    if (state.finishedAt !== null) return
    if (state.startedAt !== null) engine.pause(performance.now())
    else setMenuOpen(true)
  }, [engine])

  const restart = useCallback(() => {
    engine.reset()
    tracker.reset()
    setBonusSeconds(0)
    setBonusDelay(getRandomBonusDelay())
    setMenuOpen(false)
    setPhase('countdown')
    setRound((value) => value + 1)
  }, [engine, tracker])

  useEffect(() => {
    const pause = () => engine.pause(performance.now())
    const handleVisibility = () => {
      if (document.hidden) pause()
    }
    window.addEventListener('blur', pause)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('blur', pause)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [engine])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        if (pausedRef.current) event.stopPropagation()
        return
      }
      event.preventDefault()
      event.stopPropagation()
      if (pausedRef.current) resume(event.timeStamp)
      else openPause()
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [openPause, resume])

  const isCode = run.mode === 'code'

  return (
    <section ref={sectionRef} className={styles.run} aria-label="Заезд">
      <TrainTrack engine={engine} tracker={tracker} finished={phase === 'finished'} ghost={ghost} />

      <Hud engine={engine} tracker={tracker} />

      <div className={styles.gameRow}>
        <ComboMeter tracker={tracker} />
        <NitroBar tracker={tracker} />
        <BonusChip seconds={bonusSeconds} />
        {ghostMissing && (
          <span className={styles.ghostMissing} role="status">
            👻 Призрака для этого заезда пока нет
          </span>
        )}
      </div>

      <div ref={boardRef} className={styles.board}>
        <div className={phase === 'countdown' ? `${styles.text} ${styles.blurred}` : styles.text}>
          <TextDisplay
            engine={engine}
            variant={isCode ? 'code' : 'text'}
            displayMode={isCode ? 'chars' : undefined}
            lines={isCode ? 8 : 3}
          />
        </div>
        {phase === 'countdown' && !menuOpen && <Countdown count={count} />}
      </div>

      <KeyboardPanel engine={engine} lang={run.lang} />

      <footer className={styles.footer}>
        <span>
          <kbd>Esc</kbd> — пит-стоп
        </span>
        {isCode && (
          <span>
            <kbd>Tab</kbd> — отступ, <kbd>Enter</kbd> — новая строка
          </span>
        )}
        <button type="button" className={styles.exit} onClick={onExit}>
          {exitLabel}
        </button>
      </footer>

      {paused && (
        <PauseDialog engine={engine} onResume={resume} onRestart={restart} onExit={onExit} />
      )}
    </section>
  )
}
