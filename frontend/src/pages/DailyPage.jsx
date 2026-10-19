import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import PageLoader from '../components/PageLoader.jsx'
import QueryError from '../components/QueryError.jsx'
import Skeleton from '../components/Skeleton.jsx'
import Countdown from '../features/daily/Countdown.jsx'
import DailyStats from '../features/daily/DailyStats.jsx'
import DailyTextCard from '../features/daily/DailyTextCard.jsx'
import { formatDailyDate } from '../features/daily/format.js'
import { useDaily, useDailyLeaderboard } from '../features/daily/useDaily.js'
import { useRideDaily } from '../features/daily/useRideDaily.js'
import LeaderboardTable from '../features/leaderboard/LeaderboardTable.jsx'
import MyPositionBar from '../features/leaderboard/MyPositionBar.jsx'
import { METRICS } from '../features/leaderboard/metrics.js'
import { useAuthStore } from '../store/authStore.js'
import styles from './DailyPage.module.css'

function DailyLeaderboard({ date, user }) {
  const { data, isPending, isError, refetch } = useDailyLeaderboard(date)

  if (isPending) {
    return (
      <div className={styles.skeletons}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} height="64px" />
        ))}
      </div>
    )
  }
  if (isError) return <QueryError onRetry={refetch} title="Не удалось загрузить таблицу дня" />
  if (data.items.length === 0) {
    return (
      <EmptyState
        icon="🏁"
        title="Пока никто не проехал"
        description="Стань первым — и весь день будешь во главе таблицы."
      />
    )
  }

  return (
    <>
      <LeaderboardTable items={data.items} metric={METRICS.wpm} currentUserId={user?.id} />
      {user && <MyPositionBar user={user} me={data.me} metric={METRICS.wpm} total={data.total} />}
    </>
  )
}

export default function DailyPage() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const { data, isPending, isError, refetch } = useDaily()
  const ride = useRideDaily(data?.date)

  const startNewDay = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['daily'] }),
    [queryClient],
  )

  if (status !== 'ready' || isPending) return <PageLoader />
  if (isError) return <QueryError onRetry={refetch} title="Не удалось загрузить заезд дня" />

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Заезд дня</h1>
          <p className={styles.subtitle}>
            {formatDailyDate(data.date)} · один текст на всех, в зачёт идёт лучшая попытка
          </p>
        </div>
        <Countdown endsAt={data.ends_at} onExpire={startNewDay} />
      </header>

      <div className={styles.grid}>
        <DailyTextCard text={data.text} onRide={ride} />
        <DailyStats daily={data} stacked />
      </div>

      <section className={styles.board} aria-labelledby="daily-board-title">
        <h2 id="daily-board-title" className={styles.boardTitle}>
          Таблица дня
        </h2>
        <DailyLeaderboard date={data.date} user={user} />
      </section>
    </div>
  )
}
