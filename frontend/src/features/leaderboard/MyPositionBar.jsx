import { Link, useLocation } from 'react-router-dom'
import RacerAvatar from '../../components/car/RacerAvatar.jsx'
import styles from './MyPositionBar.module.css'

export default function MyPositionBar({ user, me, metric, total }) {
  const location = useLocation()

  if (!user) {
    return (
      <aside className={styles.bar}>
        <p className={styles.message}>Войди, чтобы попасть в рейтинг и видеть своё место.</p>
        <Link to="/login" state={{ from: location }} className={styles.action}>
          Войти
        </Link>
      </aside>
    )
  }

  if (!me) {
    return (
      <aside className={styles.bar}>
        <p className={styles.message}>Тебя пока нет в рейтинге за этот период.</p>
        <Link to="/train" className={styles.action}>
          На трассу
        </Link>
      </aside>
    )
  }

  return (
    <aside className={`${styles.bar} ${styles.mine}`} aria-label="Моя позиция">
      <span className={styles.position}>
        <span className={styles.caption}>Моё место</span>
        {me.position}
        <span className={styles.total}> из {total}</span>
      </span>
      <RacerAvatar racer={me} className={styles.car} />
      <span className={styles.nickname}>{me.nickname}</span>
      <span className={styles.value}>
        {metric.format(me.value)}
        <span className={styles.caption}>{metric.valueLabel}</span>
      </span>
    </aside>
  )
}
