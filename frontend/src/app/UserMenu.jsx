import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { logout } from '../api/auth.js'
import CarModel from '../components/car/CarModel.jsx'
import StreakFlame from '../features/daily/StreakFlame.jsx'
import { useAuthStore } from '../store/authStore.js'
import styles from './UserMenu.module.css'

export default function UserMenu() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const queryClient = useQueryClient()

  async function handleLogout() {
    await logout().catch(() => null)
    clearSession()
    queryClient.clear()
  }

  if (status !== 'ready') {
    return <div className={styles.skeleton} aria-hidden="true" />
  }

  if (!user) {
    return (
      <div className={styles.user}>
        <Link to="/login" className={styles.loginGhost}>
          Войти
        </Link>
        <Link to="/register" className={styles.login}>
          Регистрация
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.user}>
      <Link to="/daily" className={styles.streak} aria-label={`Стрик: ${user.streak_current ?? 0}`}>
        <StreakFlame count={user.streak_current ?? 0} />
      </Link>
      <Link to="/profile" className={styles.profile}>
        <span className={styles.level} aria-label={`Уровень ${user.level}`}>
          {user.level}
        </span>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className={styles.avatar} />
        ) : (
          <CarModel config={user.car_config} className={styles.car} width={44} />
        )}
        <span className={styles.nickname}>{user.nickname}</span>
      </Link>
      <button type="button" className={styles.logout} onClick={handleLogout}>
        Выйти
      </button>
    </div>
  )
}
