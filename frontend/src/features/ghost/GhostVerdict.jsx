import styles from './GhostVerdict.module.css'

const seconds = (ms) => (Math.abs(ms) / 1000).toFixed(1).replace('.', ',')

export default function GhostVerdict({ ghost, durationMs }) {
  const gap = ghost.duration_ms - durationMs
  const self = ghost.who === 'self'

  if (gap > 0) {
    const rival = self ? 'свой рекорд' : `призрака ${ghost.user.nickname}`
    return (
      <p className={`${styles.verdict} ${styles.win}`}>
        👻 Обогнал {rival} на {seconds(gap)} с
      </p>
    )
  }
  if (gap < 0) {
    const rival = self ? 'своего рекорда' : `призрака ${ghost.user.nickname}`
    return (
      <p className={styles.verdict}>
        👻 Отстал от {rival} на {seconds(gap)} с
      </p>
    )
  }
  return <p className={styles.verdict}>👻 Ноздря в ноздрю с призраком</p>
}
