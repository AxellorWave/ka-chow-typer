import { useStore } from 'zustand'
import { COMBO_TIERS, comboMultiplier } from './scoring.js'
import styles from './ComboMeter.module.css'

const TIERS = [...COMBO_TIERS].reverse()

export default function ComboMeter({ tracker }) {
  const combo = useStore(tracker.store, (state) => state.combo)
  const multiplier = comboMultiplier(combo)

  return (
    <div className={styles.meter} aria-label={`Комбо ${combo}, множитель ×${multiplier}`}>
      <span className={styles.title}>Комбо</span>
      <ol className={styles.tiers}>
        {TIERS.map((tier, index) => {
          const reached = combo >= tier.from
          const active = tier.multiplier === multiplier
          return (
            <li
              key={tier.multiplier}
              className={styles.tier}
              data-active={active || undefined}
              data-top={tier.multiplier === 5 || undefined}
            >
              <span className={styles.flames} aria-hidden="true">
                {reached &&
                  Array.from({ length: index + 1 }, (_, flame) => (
                    <span key={flame} className={styles.flame} />
                  ))}
              </span>
              <span className={styles.pill}>×{tier.multiplier}</span>
            </li>
          )
        })}
      </ol>
      <span className={styles.count}>{combo}</span>
    </div>
  )
}
