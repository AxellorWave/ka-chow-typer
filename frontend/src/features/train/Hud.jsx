import { useStore } from 'zustand'
import { useTypingMetrics } from '../typing/useTypingMetrics.js'
import { formatDuration } from './format.js'
import styles from './Hud.module.css'

const pad = (value, length) => String(Math.max(0, Math.round(value))).padStart(length, '0')

export default function Hud({ engine, tracker }) {
  const metrics = useTypingMetrics(engine)
  const score = useStore(tracker.store, (state) => state.score)

  const items = [
    { label: 'WPM', value: pad(metrics.wpm, 3) },
    { label: 'CPM', value: pad(metrics.cpm, 3) },
    { label: 'Точн.', value: pad(metrics.accuracy, 3) },
    { label: 'Ошиб.', value: pad(metrics.errors, 2) },
    { label: 'Время', value: formatDuration(metrics.durationMs) },
    { label: 'Очки', value: pad(score, 4) },
  ]

  return (
    <dl className={styles.hud}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
