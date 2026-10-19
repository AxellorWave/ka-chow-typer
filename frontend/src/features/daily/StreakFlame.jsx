import { dayWord } from './format.js'
import styles from './StreakFlame.module.css'

export default function StreakFlame({ count, size = 'sm' }) {
  const active = count > 0
  const classNames = [styles.flame, styles[size], !active && styles.idle].filter(Boolean).join(' ')
  return (
    <span className={classNames} title={`Стрик: ${count} ${dayWord(count)} подряд`}>
      <span className={styles.icon} aria-hidden="true">
        🔥
      </span>
      <span className={styles.count}>{count}</span>
      <span className={styles.srOnly}>{dayWord(count)} подряд</span>
    </span>
  )
}
