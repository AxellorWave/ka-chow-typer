import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getSummary } from '../../api/stats.js'
import Button from '../../components/Button.jsx'
import CarModel from '../../components/car/CarModel.jsx'
import { useAuthStore } from '../../store/authStore.js'
import styles from './HomeHero.module.css'

const RIBBON = ['KACHOWTYPER', 'ПЕЧАТЬ ГЕРОЯ', '№95', 'КИБЕРРЫВОК']

export default function HomeHero({ onStart }) {
  const user = useAuthStore((state) => state.user)
  const { data: summary } = useQuery({
    queryKey: ['stats', 'summary'],
    queryFn: getSummary,
    enabled: Boolean(user),
  })
  const best = summary?.best_wpm ? Math.round(summary.best_wpm) : null

  const kicker = user
    ? `Заезд №${(summary?.runs ?? 0) + 1} · с возвращением, ${user.nickname}`
    : 'Тренажёр слепой печати · Киберрывок 2026'
  const lead = best
    ? `Твой рекорд — ${best} WPM. Сегодня цель — ${best + 2} и ни одной лишней ошибки.`
    : 'Печатай не глядя на клавиатуру, набирай комбо, открывай трассы и гоняй против призраков.'

  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.copy}>
        <p className={styles.kicker}>{kicker}</p>
        <h1 id="home-title" className={styles.title}>
          Жми на газ.
          <br />
          Печатай вслепую.
        </h1>
        <span className={styles.stripes} aria-hidden="true" />
        <p className={styles.lead}>{lead}</p>
        <div className={styles.actions}>
          <Button className={styles.start} onClick={onStart}>
            На старт!
          </Button>
          <Link to="/train" className={styles.secondary}>
            Выбрать заезд
          </Link>
        </div>
      </div>

      <figure className={styles.poster}>
        <div className={styles.image} role="img" aria-label="Твоя машина на старте">
          <CarModel config={user?.car_config} className={styles.car} />
        </div>
        <span className={styles.sticker}>{best ? `Лучший ${best} WPM` : '№95'}</span>
        <figcaption className={styles.ribbon} aria-hidden="true">
          <span className={styles.ribbonTrack}>
            {[...RIBBON, ...RIBBON, ...RIBBON].map((item, index) => (
              <span key={index} className={styles.ribbonItem}>
                <span className={styles.ribbonLabel}>{item}</span>
                <span className={styles.ribbonStar}>★</span>
              </span>
            ))}
          </span>
        </figcaption>
      </figure>
    </section>
  )
}
