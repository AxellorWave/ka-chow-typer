import { memo } from 'react'
import { carColor } from '../../components/carColors.js'
import styles from './RaceCar.module.css'

function Wheel({ cx }) {
  return (
    <g className={styles.wheel}>
      <circle cx={cx} cy="25" r="5.5" className={styles.tire} />
      <circle cx={cx} cy="25" r="3" className={styles.rim} />
      <path d={`M${cx - 3} 25h6M${cx} 22v6`} className={styles.spoke} />
    </g>
  )
}

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
      <g transform="translate(68 0) scale(-1 1)">
        <path
          d="M4 23c0-5 3-8 10-9l8-6c3-2 7-2.5 12-2.5h8c5 0 9 3 12 7l4 1c3 .8 4 3.5 4 7.5v2H4z"
          className={styles.body}
          style={{ fill: carColor(config) }}
        />
        <path d="M24 10l10-1.5h7c3.5 0 6.5 2 8.5 4.5H21z" className={styles.window} />
      </g>
      <path d="M31 15h8l-3 3.2h6.5L29 24l4-4.5h-6z" className={styles.bolt} />
      <text x="13.5" y="19.5" className={styles.number}>
        {number}
      </text>
      <Wheel cx={19} />
      <Wheel cx={51} />
    </svg>
  )
})
