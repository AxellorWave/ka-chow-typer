import { formatNumber } from '../stats/format.js'
import AchievementIcon from './AchievementIcon.jsx'
import styles from './AchievementCard.module.css'

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export default function AchievementCard({ achievement }) {
  const { title, description, icon, unlocked, unlocked_at: unlockedAt, progress } = achievement
  const cumulative = progress.target > 1
  const percent = Math.min(100, (progress.current / progress.target) * 100)

  return (
    <li className={unlocked ? `${styles.card} ${styles.unlocked}` : styles.card}>
      <AchievementIcon icon={icon} unlocked={unlocked} />
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        {unlocked && (
          <p className={styles.date}>
            Получено {unlockedAt ? dateFormat.format(new Date(unlockedAt)) : ''}
          </p>
        )}
        {!unlocked && cumulative && (
          <div className={styles.progress}>
            <span
              className={styles.track}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.target}
              aria-valuenow={progress.current}
              aria-label={`Прогресс: ${title}`}
            >
              <span className={styles.fill} style={{ width: `${percent}%` }} />
            </span>
            <span className={styles.count}>
              {formatNumber(progress.current)} / {formatNumber(progress.target)}
            </span>
          </div>
        )}
        {!unlocked && !cumulative && <p className={styles.pending}>Ещё не получено</p>}
      </div>
    </li>
  )
}
