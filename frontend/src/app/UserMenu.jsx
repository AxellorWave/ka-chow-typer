import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { logout } from '../api/auth.js'
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
      <Link to="/login" className={styles.login}>
        Войти
      </Link>
    )
  }

  return (
    <div className={styles.user}>
      <Link to="/profile" className={styles.profile}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className={styles.avatar} />
        ) : (
          <span className={styles.avatar}>{user.nickname.charAt(0).toUpperCase()}</span>
        )}
        <span className={styles.info}>
          <span className={styles.nickname}>{user.nickname}</span>
          <span className={styles.level}>Ур. {user.level}</span>
        </span>
      </Link>
      <button type="button" className={styles.logout} onClick={handleLogout}>
        Выйти
      </button>
    </div>
  )
}
