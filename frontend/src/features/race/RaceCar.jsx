import { memo } from 'react'
import CarModel from '../../components/car/CarModel.jsx'
import styles from './RaceCar.module.css'

export default memo(function RaceCar({ config, combo = 1 }) {
  return (
    <div className={styles.car} data-combo={combo}>
      <svg className={styles.flame} viewBox="0 0 30 12" aria-hidden="true" focusable="false">
        <path d="M30 2C22 1 12 3 0 6c12 3 22 5 30 4z" className={styles.flameOuter} />
        <path d="M30 4c-6-.5-12 .5-20 2 8 1.5 14 2.5 20 2z" className={styles.flameCore} />
      </svg>
      <CarModel config={config} className={styles.body} />
    </div>
  )
})
