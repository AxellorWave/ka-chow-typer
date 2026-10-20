import RacerAvatar from '../../components/car/RacerAvatar.jsx'
import { rankFor } from '../home/ranks.js'
import { formatNumber } from './format.js'
import styles from './ProfileHeader.module.css'

const xpForLevel = (level) => (level <= 1 ? 0 : Math.ceil(100 * level ** 1.5))

export default function ProfileHeader({ user }) {
  const levelStart = user.level_xp ?? xpForLevel(user.level)
  const levelEnd = user.next_level_xp ?? user.xp + (user.xp_to_next ?? 0)
  const progress =
    levelEnd > levelStart ? ((user.xp - levelStart) / (levelEnd - levelStart)) * 100 : 0

  return (
    <header className={styles.header}>
      <span className={styles.portrait}>
        <RacerAvatar racer={user} className={styles.avatar} />
      </span>
      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h1 className={styles.nickname}>{user.nickname}</h1>
          <span className={styles.rank}>{rankFor(user.level).title}</span>
        </div>
        <div className={styles.levelRow}>
          <span className={styles.levelBadge} aria-label={`Уровень ${user.level}`}>
            {user.level}
          </span>
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
          <span className={styles.xpText}>
            {formatNumber(user.xp)} / {formatNumber(levelEnd)} XP
          </span>
        </div>
        {user.streak_current > 0 && (
          <p className={styles.streak}>🔥 {user.streak_current} дн. подряд за клавиатурой</p>
        )}
      </div>
    </header>
  )
}
