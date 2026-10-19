import { formatDuration, formatNumber } from './format.js'
import styles from './SummaryCards.module.css'

export default function SummaryCards({ summary }) {
  const cards = [
    { label: 'Заездов', value: formatNumber(summary.runs) },
    { label: 'Лучший WPM', value: formatNumber(summary.best_wpm), accent: true },
    { label: 'Средний WPM', value: formatNumber(summary.avg_wpm) },
    { label: 'Средняя точность', value: `${formatNumber(summary.avg_accuracy)}%` },
    { label: 'За клавиатурой', value: formatDuration(summary.total_duration_ms) },
    { label: 'Макс. комбо', value: formatNumber(summary.max_combo) },
  ]

  return (
    <ul className={styles.grid}>
      {cards.map((card) => (
        <li
          key={card.label}
          className={card.accent ? `${styles.card} ${styles.accent}` : styles.card}
        >
          <span className={styles.value}>{card.value}</span>
          <span className={styles.label}>{card.label}</span>
        </li>
      ))}
    </ul>
  )
}
