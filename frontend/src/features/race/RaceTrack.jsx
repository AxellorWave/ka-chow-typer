import RaceCar from './RaceCar.jsx'
import styles from './RaceTrack.module.css'

const clamp = (value) => Math.min(1, Math.max(0, value || 0))

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
          <div
            key={car.skid ?? 0}
            className={car.skid ? `${styles.car} ${styles.skid}` : styles.car}
          >
            <RaceCar config={car.config} number={car.number} combo={car.combo} />
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
      aria-label={`Трек: ${cars.map((car) => `${car.label ?? 'машинка'} ${Math.round(clamp(car.progress) * 100)}%`).join(', ')}`}
    >
      <div className={styles.start} />
      <div className={styles.finish} />
      {cars.map((car) => (
        <Lane key={car.id} car={car} />
      ))}
      {finished && <span className={styles.kachow}>Ka-chow!</span>}
    </div>
  )
}
