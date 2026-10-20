import { Link } from 'react-router-dom'
import styles from './KeyboardRequired.module.css'

const LINKS = [
  { to: '/career', label: 'Карьера' },
  { to: '/daily', label: 'Заезд дня' },
  { to: '/leaderboard', label: 'Лидеры' },
  { to: '/garage', label: 'Гараж' },
  { to: '/profile', label: 'Профиль' },
]

export default function KeyboardRequired() {
  return (
    <section className={styles.card} aria-labelledby="keyboard-required-title">
      <span className={styles.icon} aria-hidden="true">
        ⌨️
      </span>
      <h1 id="keyboard-required-title" className={styles.title}>
        Подключи клавиатуру
      </h1>
      <p className={styles.text}>
        Тренажёр слепой печати работает с физической клавиатурой. Подключи её к планшету и нажми
        любую клавишу или зайди с компьютера.
      </p>
      <p className={styles.text}>А пока можно заглянуть сюда:</p>
      <nav className={styles.links} aria-label="Разделы">
        {LINKS.map((link) => (
          <Link key={link.to} to={link.to} className={styles.link}>
            {link.label}
          </Link>
        ))}
      </nav>
    </section>
  )
}
