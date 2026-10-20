import RacerAvatar from '../../components/car/RacerAvatar.jsx'
import { PLACE_CUPS } from './cups.js'
import styles from './LeaderboardPodium.module.css'

const ORDER = [2, 1, 3]
const PLACE_CLASS = { 1: styles.first, 2: styles.second, 3: styles.third }

export default function LeaderboardPodium({ items, metric, currentUserId }) {
  const byPosition = new Map(items.map((row) => [row.position, row]))
  return (
    <ol className={styles.podium} aria-label="Тройка лидеров">
      {ORDER.map((place) => {
        const row = byPosition.get(place)
        if (!row) return <li key={place} className={styles.empty} aria-hidden="true" />
        return (
          <li
            key={place}
            className={`${styles.card} ${PLACE_CLASS[place]}`}
            data-mine={row.user_id === currentUserId || undefined}
          >
            <span className={styles.number} aria-hidden="true">
              {place}
            </span>
            <span className={styles.place}>
              <img src={PLACE_CUPS[place]} alt="" className={styles.cup} />P{place}
            </span>
            <span className={styles.player}>
              <RacerAvatar racer={row} className={styles.car} />
              <span className={styles.nickname}>{row.nickname}</span>
            </span>
            <span className={styles.value}>
              {metric.format(row.value)} {metric.valueLabel === 'Точность' ? '' : metric.valueLabel}
              <span className={styles.dot}> · </span>
              {metric.secondary(row)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
