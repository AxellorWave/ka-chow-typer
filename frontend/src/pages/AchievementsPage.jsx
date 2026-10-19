import { useQuery } from '@tanstack/react-query'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { getAchievements } from '../api/achievements.js'
import EmptyState from '../components/EmptyState.jsx'
import PageLoader from '../components/PageLoader.jsx'
import QueryError from '../components/QueryError.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import Skeleton from '../components/Skeleton.jsx'
import AchievementCard from '../features/achievements/AchievementCard.jsx'
import { useAuthStore } from '../store/authStore.js'
import styles from './AchievementsPage.module.css'

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'unlocked', label: 'Открытые' },
]

function GuestInvite() {
  const location = useLocation()
  return (
    <EmptyState
      icon="🏆"
      title="Войди, чтобы копить достижения"
      description="Кубки, ачивки и рекорды сохраняются в профиле гонщика."
      action={
        <Link to="/login" state={{ from: location }} className={styles.cta}>
          Войти
        </Link>
      }
    />
  )
}

export default function AchievementsPage() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('filter') === 'unlocked' ? 'unlocked' : 'all'

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: getAchievements,
    enabled: Boolean(user),
  })

  if (status !== 'ready') {
    return <PageLoader />
  }

  const unlockedCount = data?.filter((item) => item.unlocked).length ?? 0
  const items = filter === 'unlocked' ? data?.filter((item) => item.unlocked) : data

  const changeFilter = (value) => {
    setSearchParams(value === 'all' ? {} : { filter: value })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Достижения</h1>
          {data && (
            <p className={styles.summary}>
              Открыто {unlockedCount} из {data.length}
            </p>
          )}
        </div>
        {user && (
          <SegmentedControl
            label="Фильтр"
            options={FILTERS}
            value={filter}
            onChange={changeFilter}
          />
        )}
      </header>

      {data && (
        <span
          className={styles.total}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={data.length}
          aria-valuenow={unlockedCount}
          aria-label="Открыто достижений"
        >
          <span
            className={styles.totalFill}
            style={{ width: `${(unlockedCount / Math.max(data.length, 1)) * 100}%` }}
          />
        </span>
      )}

      {!user && <GuestInvite />}

      {user && isPending && (
        <div className={styles.grid}>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height="112px" />
          ))}
        </div>
      )}

      {user && isError && <QueryError onRetry={refetch} />}

      {items && items.length === 0 && (
        <EmptyState
          icon="🏁"
          title="Пока ни одного"
          description="Проведи первый заезд — и первая награда не заставит себя ждать."
          action={
            <Link to="/train" className={styles.cta}>
              На трассу
            </Link>
          }
        />
      )}

      {items && items.length > 0 && (
        <ul className={styles.grid}>
          {items.map((achievement) => (
            <AchievementCard key={achievement.code} achievement={achievement} />
          ))}
        </ul>
      )}
    </div>
  )
}
