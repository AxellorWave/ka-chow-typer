import { useStore } from 'zustand'
import styles from './NitroBar.module.css'

const NITRO_MAX = 100

export default function NitroBar({ tracker }) {
  const nitro = useStore(tracker.store, (state) => Math.min(state.combo, NITRO_MAX))
  const full = nitro >= NITRO_MAX

  return (
    <div className={styles.nitro} data-full={full || undefined}>
      <span className={styles.title}>Нитро</span>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Заряд нитро"
        aria-valuemin={0}
        aria-valuemax={NITRO_MAX}
        aria-valuenow={nitro}
      >
        <div className={styles.fill} style={{ width: `${nitro}%` }} />
      </div>
      <span className={styles.value}>{nitro}%</span>
    </div>
  )
}
