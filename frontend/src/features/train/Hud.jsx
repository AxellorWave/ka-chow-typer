import { useStore } from 'zustand'
import { comboMultiplier } from '../game/scoring.js'
import { useTypingMetrics } from '../typing/useTypingMetrics.js'
import { formatDuration, formatNumber } from './format.js'
import styles from './Hud.module.css'

export default function Hud({ engine, tracker }) {
  const metrics = useTypingMetrics(engine)
  const score = useStore(tracker.store, (state) => state.score)
  const combo = useStore(tracker.store, (state) => state.combo)
  const multiplier = comboMultiplier(combo)

  const items = [
    { label: 'WPM', value: metrics.wpm.toFixed(0), accent: true },
    { label: 'CPM', value: metrics.cpm.toFixed(0) },
    { label: 'Точность', value: `${metrics.accuracy.toFixed(1)}%` },
    { label: 'Ошибки', value: metrics.errors, error: metrics.errors > 0 },
    { label: 'Время', value: formatDuration(metrics.durationMs) },
    { label: 'Очки', value: formatNumber(score) },
  ]

  return (
    <div className={styles.hud} aria-live="off">
      {items.map((item) => (
        <div
          key={item.label}
          className={[styles.item, item.accent && styles.accent, item.error && styles.error]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={styles.value}>{item.value}</span>
          <span className={styles.label}>{item.label}</span>
        </div>
      ))}
      <div className={`${styles.item} ${styles.combo}`} data-tier={multiplier}>
        <span className={styles.value}>×{multiplier}</span>
        <span className={styles.label}>Комбо {combo}</span>
      </div>
    </div>
  )
}
