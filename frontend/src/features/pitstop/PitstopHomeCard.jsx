import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getKeyStats } from '../../api/stats.js'
import { useAuthStore } from '../../store/authStore.js'
import { formatKey } from '../stats/format.js'
import { keyLang, pitstopPath } from './pitstop.js'
import styles from './PitstopHomeCard.module.css'

const SHOWN_KEYS = 3

export default function PitstopHomeCard() {
  const user = useAuthStore((state) => state.user)
  const { data } = useQuery({
    queryKey: ['stats', 'keys'],
    queryFn: getKeyStats,
    enabled: Boolean(user),
  })

  const weakest = data?.weakest_keys.slice(0, SHOWN_KEYS) ?? []
  if (!user || weakest.length === 0) return null

  const keys = weakest.map((item) => formatKey(item.key))

  return (
    <aside className={styles.card}>
      <span className={styles.icon} aria-hidden="true">
        🔧
      </span>
      <div className={styles.text}>
        <p className={styles.title}>
          Твоей машине нужен пит-стоп:{' '}
          {keys.map((key) => (
            <kbd key={key} className={styles.key}>
              {key}
            </kbd>
          ))}
        </p>
        <p className={styles.subtitle}>
          Короткий заезд по клавишам, на которых ты чаще ошибаешься.
        </p>
      </div>
      <Link to={pitstopPath(keyLang(weakest[0].key))} className={styles.action}>
        В боксы
      </Link>
    </aside>
  )
}
