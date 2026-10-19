import { Link, useLocation } from 'react-router-dom'
import { formatNumber } from '../stats/format.js'
import styles from './DailyStats.module.css'

function Stat({ label, value, hint, accent }) {
  return (
    <div className={accent ? `${styles.stat} ${styles.accent}` : styles.stat}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
      {hint && <dd className={styles.hint}>{hint}</dd>}
    </div>
  )
}

export default function DailyStats({ daily, stacked = false }) {
  const location = useLocation()
  const { leader, me } = daily

  return (
    <dl className={stacked ? `${styles.stats} ${styles.stacked}` : styles.stats}>
      <Stat
        accent
        label="Лидер дня"
        value={leader ? `${formatNumber(leader.wpm)} WPM` : '—'}
        hint={leader ? leader.nickname : 'Пока никто не проехал'}
      />
      {me ? (
        <>
          <Stat label="Мои попытки" value={me.attempts} />
          <Stat
            label="Мой лучший"
            value={me.best_wpm === null ? '—' : `${formatNumber(me.best_wpm)} WPM`}
            hint={me.best_accuracy === null ? null : `точность ${formatNumber(me.best_accuracy)}%`}
          />
        </>
      ) : (
        <div className={`${styles.stat} ${styles.guest}`}>
          <dt className={styles.label}>Мой результат</dt>
          <dd className={styles.hint}>
            <Link to="/login" state={{ from: location }} className={styles.link}>
              Войди
            </Link>
            , чтобы попасть в таблицу дня
          </dd>
        </div>
      )}
    </dl>
  )
}
