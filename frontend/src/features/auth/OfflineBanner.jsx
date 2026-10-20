import { useAuthStore } from '../../store/authStore.js'
import { restoreSession } from './useSessionBootstrap.js'
import styles from './OfflineBanner.module.css'

export default function OfflineBanner() {
  const offline = useAuthStore((state) => state.status === 'offline')

  if (!offline) {
    return null
  }

  return (
    <div className={styles.banner} role="status">
      <span>Нет связи с сервером. Переподключаемся…</span>
      <button type="button" className={styles.retry} onClick={restoreSession}>
        Повторить
      </button>
    </div>
  )
}
