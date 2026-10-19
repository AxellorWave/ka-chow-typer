import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getMe } from '../api/auth.js'
import { getSummary } from '../api/stats.js'
import EmptyState from '../components/EmptyState.jsx'
import QueryError from '../components/QueryError.jsx'
import Skeleton from '../components/Skeleton.jsx'
import ProfileHeader from '../features/stats/ProfileHeader.jsx'
import ProgressCharts from '../features/stats/ProgressCharts.jsx'
import RunHistory from '../features/stats/RunHistory.jsx'
import SummaryCards from '../features/stats/SummaryCards.jsx'
import WeakSpots from '../features/stats/WeakSpots.jsx'
import { useAuthStore } from '../store/authStore.js'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const sessionUser = useAuthStore((state) => state.user)
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    placeholderData: sessionUser,
  })
  const summary = useQuery({ queryKey: ['stats', 'summary'], queryFn: getSummary })

  return (
    <div className={styles.page}>
      <ProfileHeader user={user ?? sessionUser} />

      {summary.isPending && <Skeleton height="96px" />}
      {summary.isError && <QueryError onRetry={summary.refetch} />}

      {summary.data?.runs === 0 && (
        <EmptyState
          icon="🏎️"
          title="Здесь появится твоя статистика"
          description="Пройди первый заезд: покажем скорость, точность, графики прогресса и буквы, на которых ты спотыкаешься."
          action={
            <Link to="/train" className={styles.cta}>
              Пройти первый заезд
            </Link>
          }
        />
      )}

      {summary.data?.runs > 0 && (
        <>
          <SummaryCards summary={summary.data} />
          <ProgressCharts />
          <WeakSpots />
          <RunHistory />
        </>
      )}
    </div>
  )
}
