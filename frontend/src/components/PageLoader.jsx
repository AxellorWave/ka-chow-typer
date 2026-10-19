import styles from './PageLoader.module.css'

export default function PageLoader() {
  return (
    <div className={styles.loader} role="status">
      <span className={styles.bolt}>⚡</span>
      <span>Прогреваем шины…</span>
    </div>
  )
}
