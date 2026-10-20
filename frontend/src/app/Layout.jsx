import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigation } from 'react-router-dom'
import ToastHost from '../features/effects/ToastHost.jsx'
import { useSettingsStore } from '../store/settingsStore.js'
import UserMenu from './UserMenu.jsx'
import styles from './Layout.module.css'

const NAV_ITEMS = [
  { to: '/train', label: 'Тренировка' },
  { to: '/career', label: 'Карьера' },
  { to: '/daily', label: 'Заезд дня' },
  { to: '/leaderboard', label: 'Лидеры' },
  { to: '/achievements', label: 'Достижения' },
  { to: '/garage', label: 'Гараж' },
]

const navLinkClassName = ({ isActive }) =>
  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const isNavigating = useNavigation().state !== 'idle'
  const soundEnabled = useSettingsStore((state) => state.soundEnabled)
  const toggleSound = useSettingsStore((state) => state.toggleSound)
  const theme = useSettingsStore((state) => state.theme)
  const toggleTheme = useSettingsStore((state) => state.toggleTheme)
  const dark = theme === 'dark'

  useEffect(() => {
    if (!menuOpen) {
      return
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className={styles.shell}>
      {isNavigating && <div className={styles.progress} role="progressbar" />}
      <header className={styles.header}>
        <Link
          to="/"
          className={styles.logo}
          onClick={closeMenu}
          aria-label="KaChowTyper, на главную"
        >
          <span className={styles.logoText}>
            KACHOW<span className={styles.logoAccent}>TYPER</span>
          </span>
        </Link>
        <button
          type="button"
          className={styles.burger}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          aria-controls="main-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles.burgerLine} />
          <span className={styles.burgerLine} />
          <span className={styles.burgerLine} />
        </button>
        <div
          id="main-menu"
          className={menuOpen ? `${styles.menu} ${styles.menuOpen}` : styles.menu}
          onClick={closeMenu}
        >
          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.themeButton}
              onClick={(event) => {
                event.stopPropagation()
                toggleTheme()
              }}
              aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
              aria-pressed={dark}
              title={dark ? 'Светлая тема' : 'Тёмная тема'}
            >
              <span className={styles.themeIcon} aria-hidden="true">
                {dark ? '☀' : '☾'}
              </span>
              <span className={styles.themeLabel}>{dark ? 'Светлая' : 'Тёмная'}</span>
            </button>
            <button
              type="button"
              className={styles.soundButton}
              onClick={(event) => {
                event.stopPropagation()
                toggleSound()
              }}
              aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}
              aria-pressed={soundEnabled}
              title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            >
              <span className={styles.switch} aria-hidden="true" />
              <span>Звук</span>
            </button>
            <UserMenu />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <ToastHost />
    </div>
  )
}
