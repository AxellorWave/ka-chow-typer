import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getSummary } from '../api/stats.js'
import EmptyState from '../components/EmptyState.jsx'
import QueryError from '../components/QueryError.jsx'
import Skeleton from '../components/Skeleton.jsx'
import PilotSection from '../features/profile/PilotSection.jsx'
import ProfileHeader from '../features/stats/ProfileHeader.jsx'
import ProgressCharts from '../features/stats/ProgressCharts.jsx'
import RunHistory from '../features/stats/RunHistory.jsx'
import SummaryCards from '../features/stats/SummaryCards.jsx'
import WeakSpots from '../features/stats/WeakSpots.jsx'
import { useAuthStore } from '../store/authStore.js'
import styles from './ProfilePage.module.css'
import KeyboardHeatmap from '../features/stats/KeyboardHeatmap.jsx'

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const summary = useQuery({ queryKey: ['stats', 'summary'], queryFn: getSummary })

  return (
    <div className={styles.page}>
      <ProfileHeader user={user} />
      <PilotSection />

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
          <KeyboardHeatmap />
          <WeakSpots />
          <RunHistory />
        </>
      )}
    </div>
  )
}
