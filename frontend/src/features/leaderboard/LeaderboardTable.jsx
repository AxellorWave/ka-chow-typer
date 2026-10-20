import RacerAvatar from '../../components/car/RacerAvatar.jsx'
import { PLACE_CUPS } from './cups.js'
import styles from './LeaderboardTable.module.css'

const PODIUM_CLASSES = { 1: styles.gold, 2: styles.silver, 3: styles.bronze }

export default function LeaderboardTable({ items, metric, currentUserId, dimmed }) {
  return (
    <div className={dimmed ? `${styles.board} ${styles.dimmed}` : styles.board} aria-busy={dimmed}>
      <div className={`${styles.row} ${styles.head}`} aria-hidden="true">
        <span>Место</span>
        <span />
        <span>Гонщик</span>
        <span className={styles.secondary}>{metric.secondaryLabel}</span>
        <span className={styles.value}>{metric.valueLabel}</span>
      </div>
      <ol className={styles.list}>
        {items.map((row) => {
          const classNames = [
            styles.row,
            PODIUM_CLASSES[row.position],
            row.user_id === currentUserId ? styles.mine : null,
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <li key={row.user_id} className={classNames}>
              <span className={styles.position}>
                {PLACE_CUPS[row.position] ? (
                  <img
                    src={PLACE_CUPS[row.position]}
                    alt={`${row.position} место`}
                    className={styles.cup}
                  />
                ) : (
                  row.position
                )}
              </span>
              <RacerAvatar racer={row} className={styles.car} />
              <span className={styles.player}>
                <span className={styles.nickname}>{row.nickname}</span>
                <span className={styles.level}>Ур. {row.level}</span>
              </span>
              <span className={styles.secondary}>{metric.secondary(row)}</span>
              <span className={styles.value}>{metric.format(row.value)}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
