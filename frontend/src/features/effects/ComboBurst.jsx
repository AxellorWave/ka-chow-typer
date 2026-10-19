import { useEffect, useState } from 'react'
import { comboMultiplier } from '../game/scoring.js'
import styles from './ComboBurst.module.css'

const BURSTS = {
  3: { text: '🔥 ×3 Огонь!', tone: 'fire' },
  5: { text: 'Ka-chow!', tone: 'kachow' },
}

export default function ComboBurst({ tracker }) {
  const [burst, setBurst] = useState(null)

  useEffect(
    () =>
      tracker.store.subscribe((state, previous) => {
        const tier = comboMultiplier(state.combo)
        if (tier === comboMultiplier(previous.combo) || !BURSTS[tier]) return
        if (state.combo < previous.combo) return
        setBurst({ id: state.combo, ...BURSTS[tier] })
      }),
    [tracker],
  )

  if (!burst) return null

  return (
    <span
      key={burst.id}
      className={`${styles.burst} ${styles[burst.tone]}`}
      role="status"
      onAnimationEnd={() => setBurst(null)}
    >
      {burst.text}
    </span>
  )
}
