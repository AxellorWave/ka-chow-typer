import { carColor } from '../carColors.js'
import { withDefaults } from './carConfig.js'
import styles from './CarLayers.module.css'

const BODY_PATH = 'M4 23c0-5 3-8 10-9l8-6c3-2 7-2.5 12-2.5h8c5 0 9 3 12 7l4 1c3 .8 4 3.5 4 7.5v2H4z'
const WINDOW_PATH = 'M24 10l10-1.5h7c3.5 0 6.5 2 8.5 4.5H21z'

const star = (cx, cy, r) =>
  Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? r : r * 0.45
    const angle = (Math.PI / 5) * index - Math.PI / 2
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`
  }).join(' ')

const CHECKER = Array.from({ length: 16 }, (_, index) => ({
  x: 28 + (index % 8) * 2,
  y: 16 + Math.floor(index / 8) * 2.5,
  dark: (index + Math.floor(index / 8)) % 2 === 0,
}))

const SPOILERS = {
  spoiler_standard: { post: 'M10 16V9.5', wing: 'M2.5 8h10l-1 2h-8z', className: styles.spoiler },
  spoiler_carbon: { post: 'M10 16V9.5', wing: 'M2 7.5h11l-1.5 2.5H3z', className: styles.carbon },
  spoiler_wing: { post: 'M9 16V6M12.5 16V6', wing: 'M1 4.5h13l-1 2H2z', className: styles.spoiler },
  spoiler_champion: {
    post: 'M9 16V6M12.5 16V6',
    wing: 'M.5 4h14l-1.5 2.8H2z',
    className: styles.champion,
  },
}

function Spoiler({ code }) {
  const spoiler = SPOILERS[code]
  if (!spoiler) return null
  return (
    <g className={spoiler.className}>
      <path d={spoiler.post} className={styles.post} />
      <path d={spoiler.wing} className={styles.wing} />
    </g>
  )
}

function Decal({ code }) {
  if (code === 'decal_bolt') {
    return <path d="M31 15h8l-3 3.2h6.5L29 24l4-4.5h-6z" className={styles.bolt} />
  }
  if (code === 'decal_flames') {
    return (
      <g className={styles.flames}>
        <path d="M64 17c-6-1-11 0-17 2.5 4 0 6 .5 8 1.5-5 0-9 .5-13 2h22c1.5-2 1.5-4 0-6z" />
        <path d="M63 18.5c-4-.5-7 0-11 1.5 2.5.2 4 .6 5 1.2-3 0-5 .3-7.5 1h13c.8-1.2.8-2.5.5-3.7z" />
      </g>
    )
  }
  if (code === 'decal_stars') {
    return (
      <g className={styles.stars}>
        <polygon points={star(30, 17, 2.4)} />
        <polygon points={star(37, 20.5, 1.8)} />
        <polygon points={star(43, 16.5, 2)} />
        <polygon points={star(49, 20, 1.4)} />
      </g>
    )
  }
  if (code === 'decal_checkered') {
    return (
      <g>
        {CHECKER.map((cell) => (
          <rect
            key={`${cell.x}-${cell.y}`}
            x={cell.x}
            y={cell.y}
            width="2"
            height="2.5"
            className={cell.dark ? styles.checkerDark : styles.checkerLight}
          />
        ))}
      </g>
    )
  }
  return null
}

function Wheel({ cx, code, className }) {
  const offroad = code === 'wheels_offroad'
  return (
    <g className={[className, styles[code]].filter(Boolean).join(' ')}>
      <circle cx={cx} cy="25" r={offroad ? 6.3 : 5.5} className={styles.tire} />
      {code === 'wheels_whitewall' && <circle cx={cx} cy="25" r="4.2" className={styles.wall} />}
      <circle cx={cx} cy="25" r="3" className={styles.rim} />
      <path d={`M${cx - 3} 25h6M${cx} 22v6`} className={styles.spoke} />
    </g>
  )
}

export default function CarLayers({ config, wheelClassName, bodyClassName }) {
  const car = withDefaults(config)
  return (
    <>
      <Spoiler code={car.spoiler} />
      <g transform="translate(68 0) scale(-1 1)">
        <path
          d={BODY_PATH}
          className={[styles.body, bodyClassName].filter(Boolean).join(' ')}
          style={{ fill: carColor(car) }}
        />
        <path d={WINDOW_PATH} className={styles.window} />
      </g>
      <Decal code={car.decal} />
      <Wheel cx={19} code={car.wheels} className={wheelClassName} />
      <Wheel cx={51} code={car.wheels} className={wheelClassName} />
    </>
  )
}
