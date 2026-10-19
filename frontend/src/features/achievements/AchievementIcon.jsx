import styles from './AchievementIcon.module.css'

export default function AchievementIcon({ icon, unlocked }) {
  return (
    <span
      className={unlocked ? styles.medal : `${styles.medal} ${styles.locked}`}
      aria-hidden="true"
    >
      <span className={styles.glyph}>{icon ?? '🏁'}</span>
      {!unlocked && <span className={styles.lock}>🔒</span>}
    </span>
  )
}
