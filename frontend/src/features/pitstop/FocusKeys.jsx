import { formatKey, formatNumber } from '../stats/format.js'
import styles from './FocusKeys.module.css'

export default function FocusKeys({ items, field }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item[field]} className={styles.item}>
          <kbd className={styles.key}>{formatKey(item[field])}</kbd>
          <span className={styles.rate}>{formatNumber(item.error_rate)}% ошибок</span>
          <span className={styles.latency}>{formatNumber(item.avg_latency_ms)} мс</span>
        </li>
      ))}
    </ul>
  )
}
