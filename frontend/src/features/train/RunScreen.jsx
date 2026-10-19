import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from 'zustand'
import { createScoreTracker } from '../game/scoring.js'
import TextDisplay from '../typing/TextDisplay.jsx'
import { useTypingEngine } from '../typing/useTypingEngine.js'
import Hud from './Hud.jsx'
import styles from './RunScreen.module.css'

const COUNTDOWN_FROM = 3
const COUNTDOWN_STEP_MS = 700
const GO_LABEL = 'Ka-chow!'

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

export default function RunScreen({ run, onFinish, onExit }) {
  const [phase, setPhase] = useState('countdown')
  const [round, setRound] = useState(0)
  const tracker = useMemo(() => createScoreTracker(), [])
  const errorFlashRef = useRef(null)

  const finish = useCallback(
    (result) => {
      const { score, maxCombo } = tracker.store.getState()
      onFinish({
        ...result,
        mode: run.mode,
        lang: run.lang,
        difficulty: run.difficulty,
        text_id: run.text_id ?? null,
        score,
        max_combo: maxCombo,
      })
    },
    [onFinish, run, tracker],
  )

  const engine = useTypingEngine(run.text, {
    enabled: phase === 'running',
    onCorrect: (outcome) => tracker.hit(outcome.count),
    onError: () => {
      tracker.miss()
      const node = errorFlashRef.current
      if (node) {
        node.classList.remove(styles.shake)
        void node.offsetWidth
        node.classList.add(styles.shake)
      }
    },
    onFinish: finish,
  })

  const paused = useStore(engine.store, (state) => state.pausedAt !== null)
  const count = useCountdown(phase === 'countdown', round, () => setPhase('running'))

  const restart = useCallback(() => {
    engine.reset()
    tracker.reset()
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
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        if (engine.store.getState().pausedAt !== null) engine.resume(event.timeStamp)
        restart()
        return
      }
      if (engine.store.getState().pausedAt !== null) {
        event.preventDefault()
        event.stopPropagation()
        engine.resume(event.timeStamp)
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [engine, restart])

  const isCode = run.mode === 'code'

  return (
    <section className={styles.run} aria-label="Заезд">
      <Hud engine={engine} tracker={tracker} />

      <div ref={errorFlashRef} className={styles.board}>
        <div className={phase === 'countdown' ? `${styles.text} ${styles.blurred}` : styles.text}>
          <TextDisplay
            engine={engine}
            variant={isCode ? 'code' : 'text'}
            displayMode={isCode ? 'chars' : undefined}
            lines={isCode ? 8 : 3}
          />
        </div>

        {phase === 'countdown' && (
          <div className={styles.overlay} aria-live="assertive">
            <span key={count} className={styles.count}>
              {count > 0 ? count : GO_LABEL}
            </span>
          </div>
        )}

        {paused && (
          <button
            type="button"
            className={`${styles.overlay} ${styles.pause}`}
            onClick={(event) => engine.resume(event.timeStamp)}
          >
            <span className={styles.pauseTitle}>Пит-лейн</span>
            <span className={styles.pauseHint}>
              Заезд на паузе. Нажми любую клавишу, чтобы продолжить
            </span>
          </button>
        )}
      </div>

      <footer className={styles.footer}>
        <span>
          <kbd>Esc</kbd> — заново
        </span>
        {isCode && (
          <span>
            <kbd>Tab</kbd> — отступ, <kbd>Enter</kbd> — новая строка
          </span>
        )}
        <button type="button" className={styles.exit} onClick={onExit}>
          Сменить режим
        </button>
      </footer>
    </section>
  )
}
