import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Skeleton from '../../components/Skeleton.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { formatNumber } from '../stats/format.js'
import Countdown from './Countdown.jsx'
import DailyTextCard from './DailyTextCard.jsx'
import { dayWord } from './format.js'
import StreakFlame from './StreakFlame.jsx'
import { useDaily } from './useDaily.js'
import { useRideDaily } from './useRideDaily.js'
import styles from './DailyHomeCard.module.css'

function StreakCard({ user }) {
  const current = user.streak_current ?? 0
  const best = user.streak_best ?? 0
  return (
    <aside className={styles.streak} aria-label="Стрик">
      <StreakFlame count={current} size="lg" />
      <p className={styles.streakText}>
        {current > 0
          ? `${dayWord(current)} подряд за клавиатурой`
          : 'Проедь любой заезд сегодня, чтобы зажечь огонёк'}
      </p>
      <p className={styles.streakBest}>
        Рекорд: {best} {dayWord(best)}
      </p>
    </aside>
  )
}

export default function DailyHomeCard() {
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const { data, isPending, isError } = useDaily()
  const ride = useRideDaily(data?.date)

  if (isError) return null

  return (
    <section className={styles.section} aria-labelledby="home-daily-title">
      <div className={styles.daily}>
        <header className={styles.header}>
          <h2 id="home-daily-title" className={styles.title}>
            Заезд дня
          </h2>
          {data && (
            <Countdown
              endsAt={data.ends_at}
              onExpire={() => queryClient.invalidateQueries({ queryKey: ['daily'] })}
            />
          )}
        </header>

        {isPending ? (
          <Skeleton height="160px" />
        ) : (
          <>
            <DailyTextCard text={data.text} onRide={ride} compact />
            <p className={styles.footer}>
              {data.leader
                ? `Лидер: ${data.leader.nickname} · ${formatNumber(data.leader.wpm)} WPM`
                : 'Пока никто не проехал — стань первым'}
              <Link to="/daily" className={styles.link}>
                Таблица дня →
              </Link>
            </p>
          </>
        )}
      </div>

      {user && <StreakCard user={user} />}
    </section>
  )
}
