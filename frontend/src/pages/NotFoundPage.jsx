import { Link } from 'react-router-dom'
import notFoundImage from '../assets/design/not-found.webp'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <div className={styles.copy}>
        <p className={styles.code} aria-hidden="true">
          404
        </p>
        <h1 id="not-found-title" className={styles.title}>
          Съехали с трассы
        </h1>
        <p className={styles.text}>
          Такой страницы нет. Таймер не запущен — можно спокойно вернуться.
        </p>
        <Link to="/" className={styles.home}>
          На главную
        </Link>
      </div>
      <img src={notFoundImage} alt="Мэтр растерянно улыбается" className={styles.image} />
    </section>
  )
}
