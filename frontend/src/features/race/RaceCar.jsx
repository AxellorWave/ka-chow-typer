import { memo } from 'react'
import CarLayers from '../../components/car/CarLayers.jsx'
import styles from './RaceCar.module.css'

export default memo(function RaceCar({ config, number = 95, combo = 1 }) {
  return (
    <svg
      className={styles.car}
      viewBox="-14 0 78 32"
      data-combo={combo}
      aria-hidden="true"
      focusable="false"
    >
      <g className={styles.flame}>
        <path d="M4 18c-5-1-9 1-17 3 8 2 12 4 17 3z" className={styles.flameOuter} />
        <path d="M4 19.5c-3-.5-6 .5-11 1.5 5 1 8 2 11 1.5z" className={styles.flameCore} />
      </g>
      <CarLayers config={config} wheelClassName={styles.wheel} />
      <text x="13.5" y="19.5" className={styles.number}>
        {number}
      </text>
    </svg>
  )
})
