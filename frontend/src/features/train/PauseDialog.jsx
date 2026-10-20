import { useEffect, useRef } from 'react'
import Button from '../../components/Button.jsx'
import { useTypingMetrics } from '../typing/useTypingMetrics.js'
import { formatDuration } from './format.js'
import styles from './PauseDialog.module.css'

export default function PauseDialog({ engine, onResume, onRestart, onExit }) {
  const { durationMs } = useTypingMetrics(engine)
  const resumeRef = useRef(null)

  useEffect(() => {
    resumeRef.current?.focus()
  }, [])

  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="pause-title">
        <div className={styles.header}>
          <h2 id="pause-title" className={styles.title}>
            Пит-стоп
          </h2>
          <span className={styles.time}>{formatDuration(durationMs)}</span>
        </div>
        <div className={styles.stripes} aria-hidden="true" />
        <p className={styles.text}>Таймер стоит. Разомни пальцы — и обратно на трассу.</p>
        <Button ref={resumeRef} className={styles.resume} onClick={() => onResume()}>
          Продолжить · Esc
        </Button>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onRestart}>
            Заново
          </Button>
          <Button variant="ghost" onClick={onExit}>
            Выйти
          </Button>
        </div>
      </div>
    </div>
  )
}
