import styles from './GhostVerdict.module.css'

const TENTH_MS = 100

const tenths = (value) => (Math.abs(value) / 10).toFixed(1).replace('.', ',')

export default function GhostVerdict({ ghost, run }) {
  const bySpeed = run.track_id != null
  const gap = bySpeed
    ? Math.round((run.wpm - ghost.wpm) * 10)
    : Math.round((ghost.duration_ms - run.duration_ms) / TENTH_MS)
  const amount = bySpeed ? `${tenths(gap)} WPM` : `${tenths(gap)} с`
  const self = ghost.who === 'self'

  if (gap > 0) {
    const rival = self ? 'свой рекорд' : `призрака ${ghost.user.nickname}`
    return (
      <p className={`${styles.verdict} ${styles.win}`}>
        👻 Обогнал {rival} на {amount}
      </p>
    )
  }
  if (gap < 0) {
    const rival = self ? 'своего рекорда' : `призрака ${ghost.user.nickname}`
    return (
      <p className={styles.verdict}>
        👻 Отстал от {rival} на {amount}
      </p>
    )
  }
  return <p className={styles.verdict}>👻 Ноздря в ноздрю с призраком</p>
}
