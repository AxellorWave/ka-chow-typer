import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'
import styles from './SaveProgressCta.module.css'

export default function SaveProgressCta() {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (user) {
    return null
  }

  return (
    <aside className={styles.cta}>
      <div className={styles.text}>
        <p className={styles.title}>Сохрани прогресс — зарегистрируйся</p>
        <p className={styles.subtitle}>
          Опыт, уровни, кубки и достижения будут копиться в твоём профиле.
        </p>
      </div>
      <div className={styles.actions}>
        <Link to="/register" state={{ from: location }} className={styles.primary}>
          Зарегистрироваться
        </Link>
        <Link to="/login" state={{ from: location }} className={styles.secondary}>
          Войти
        </Link>
      </div>
    </aside>
  )
}
