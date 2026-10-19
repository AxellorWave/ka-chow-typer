import { formatNumber } from './format.js'
import styles from './ProfileHeader.module.css'

const xpForLevel = (level) => (level <= 1 ? 0 : Math.ceil(100 * level ** 1.5))

export default function ProfileHeader({ user }) {
  const levelStart = xpForLevel(user.level)
  const levelEnd = user.xp + (user.xp_to_next ?? 0)
  const progress =
    levelEnd > levelStart ? ((user.xp - levelStart) / (levelEnd - levelStart)) * 100 : 0

  return (
    <header className={styles.header}>
      {user.avatar_url ? (
        <img src={user.avatar_url} alt="" className={styles.avatar} />
      ) : (
        <span className={styles.avatar}>{user.nickname.charAt(0).toUpperCase()}</span>
      )}
      <div className={styles.info}>
        <h1 className={styles.nickname}>{user.nickname}</h1>
        <p className={styles.level}>
          Уровень {user.level}
          {user.streak_current > 0 && (
            <span className={styles.streak}>🔥 {user.streak_current} дн. подряд</span>
          )}
        </p>
        <div
          className={styles.xpBar}
          role="progressbar"
          aria-valuemin={levelStart}
          aria-valuemax={levelEnd}
          aria-valuenow={user.xp}
          aria-label="Опыт до следующего уровня"
        >
          <span className={styles.xpFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.xpText}>
          {formatNumber(user.xp)} XP · до уровня {user.level + 1} осталось{' '}
          {formatNumber(user.xp_to_next)} XP
        </p>
      </div>
    </header>
  )
}
