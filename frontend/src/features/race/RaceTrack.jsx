import RaceCar from './RaceCar.jsx'
import styles from './RaceTrack.module.css'

const RIBBON = ['KACHOWTYPER', 'ПЕЧАТЬ ГЕРОЯ', '№95', 'КИБЕРРЫВОК']

function Ribbon() {
  const items = [...RIBBON, ...RIBBON, ...RIBBON]
  return (
    <div className={styles.sky} aria-hidden="true">
      <div className={styles.ribbon}>
        {items.map((item, index) => (
          <span key={index} className={styles.ribbonItem}>
            <span className={styles.ribbonLabel}>{item}</span>
            <span className={styles.ribbonStar}>★</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const clamp = (value) => Math.min(1, Math.max(0, value || 0))

const skidClass = (count) => (count % 2 ? styles.skid : styles.skidAlt)

const LABEL_STEP = 10

function Lane({ car }) {
  const classNames = [styles.lane, car.ghost && styles.ghost].filter(Boolean).join(' ')
  return (
    <div className={classNames}>
      <div className={styles.rail}>
        <div
          className={styles.slider}
          style={{ '--progress': clamp(car.progress) }}
          data-speed={car.speed ?? 'idle'}
          data-finished={car.finished || undefined}
          data-car={car.id}
        >
          <div className={car.skid ? `${styles.car} ${skidClass(car.skid)}` : styles.car}>
            <RaceCar config={car.config} combo={car.combo} />
          </div>
          {car.label && <span className={styles.label}>{car.label}</span>}
        </div>
      </div>
    </div>
  )
}

export default function RaceTrack({ cars, moving = false, finished = false }) {
  return (
    <div
      className={styles.track}
      data-moving={moving || undefined}
      data-finished={finished || undefined}
      role="img"
      aria-label={`Трек: ${cars.map((car) => `${car.label ?? 'машинка'} ${Math.round(clamp(car.progress) * LABEL_STEP) * LABEL_STEP}%`).join(', ')}`}
    >
      <Ribbon />
      <div className={styles.road}>
        <div className={styles.start} />
        <div className={styles.finish} />
        {cars.map((car) => (
          <Lane key={car.id} car={car} />
        ))}
        {finished && <span className={styles.kachow}>Ka-chow!</span>}
      </div>
    </div>
  )
}
