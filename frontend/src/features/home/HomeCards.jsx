import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getKeyStats, getProgress } from '../../api/stats.js'
import { useAuthStore } from '../../store/authStore.js'
import { dayWord } from '../daily/format.js'
import { keyLang, pitstopPath } from '../pitstop/pitstop.js'
import { formatKey, formatNumber } from '../stats/format.js'
import { nextRank, rankFor } from './ranks.js'
import styles from './HomeCards.module.css'

const WEEKDAY = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' })
const PITSTOP_KEYS = 4

function GuestNote({ text }) {
  return (
    <p className={styles.note}>
      {text}{' '}
      <Link to="/register" className={styles.link}>
        Зарегистрироваться →
      </Link>
    </p>
  )
}

function StreakCard({ user }) {
  const { data } = useQuery({
    queryKey: ['stats', 'progress', '7d'],
    queryFn: () => getProgress('7d'),
    enabled: Boolean(user),
  })
  const days = data?.points ?? []
  const current = user?.streak_current ?? 0

  return (
    <article className={styles.card}>
      <h2 className={styles.label}>Стрик</h2>
      {user ? (
        <>
          <p className={styles.streak}>
            <span className={styles.flame} aria-hidden="true" data-on={current > 0 || undefined} />
            <span className={styles.big}>{current}</span>
            <span>{dayWord(current)} подряд</span>
          </p>
          <ol className={styles.week}>
            {days.map((day) => (
              <li key={day.date} className={styles.day} data-on={day.runs > 0 || undefined}>
                <span className={styles.dayBox} />
                <span className={styles.dayName}>
                  {WEEKDAY.format(new Date(`${day.date}T12:00:00`)).replace('.', '')}
                </span>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <GuestNote text="Заезжай каждый день — огонёк растёт." />
      )}
    </article>
  )
}

function LevelCard({ user }) {
  if (!user) {
    return (
      <article className={styles.card}>
        <h2 className={styles.label}>Уровень</h2>
        <GuestNote text="Опыт за каждый заезд открывает новые режимы и трассы." />
      </article>
    )
  }
  const span = Math.max(1, (user.next_level_xp ?? 0) - (user.level_xp ?? 0))
  const progress = Math.min(100, Math.max(0, ((user.xp - (user.level_xp ?? 0)) / span) * 100))
  const rank = rankFor(user.level)
  const next = nextRank(user.level)

  return (
    <article className={styles.card}>
      <h2 className={styles.label}>Уровень</h2>
      <div className={styles.level}>
        <span className={styles.levelBadge}>{user.level}</span>
        <span className={styles.levelText}>
          <strong className={styles.rank}>{rank.title}</strong>
          <span className={styles.mono}>
            {next ? `до «${next.title}» с ${next.from} ур.` : 'высшее звание'} ·{' '}
            {formatNumber(user.xp_to_next)} XP до {user.level + 1}
          </span>
        </span>
      </div>
      <div
        className={styles.xpTrack}
        role="progressbar"
        aria-label="Опыт до следующего уровня"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className={styles.xpFill} style={{ width: `${progress}%` }} />
      </div>
    </article>
  )
}

function PitstopCard({ user }) {
  const { data } = useQuery({
    queryKey: ['stats', 'keys'],
    queryFn: getKeyStats,
    enabled: Boolean(user),
  })
  const weakest = data?.weakest_keys.slice(0, PITSTOP_KEYS) ?? []
  const errors = weakest.reduce((sum, item) => sum + item.errors, 0)

  return (
    <article className={styles.card}>
      <h2 className={styles.label}>Пит-стоп рекомендует</h2>
      {!user ? (
        <GuestNote text="Тренировка по буквам, на которых ты ошибаешься." />
      ) : weakest.length === 0 ? (
        <p className={styles.note}>
          Слабых мест пока нет — проедь пару заездов, и мы подберём тренировку.
        </p>
      ) : (
        <>
          <ul className={styles.keys}>
            {weakest.map((item) => (
              <li key={item.key} className={styles.key}>
                {formatKey(item.key)}
              </li>
            ))}
          </ul>
          <p className={styles.pitFooter}>
            <span>Ошибок на них: {formatNumber(errors)}</span>
            <Link to={pitstopPath(keyLang(weakest[0].key))} className={styles.link}>
              Заехать в боксы →
            </Link>
          </p>
        </>
      )}
    </article>
  )
}

export default function HomeCards() {
  const user = useAuthStore((state) => state.user)
  return (
    <section className={styles.cards} aria-label="Мой прогресс">
      <StreakCard user={user} />
      <LevelCard user={user} />
      <PitstopCard user={user} />
    </section>
  )
}
