import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { getLeaderboard } from '../api/leaderboard.js'
import EmptyState from '../components/EmptyState.jsx'
import QueryError from '../components/QueryError.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'
import Skeleton from '../components/Skeleton.jsx'
import LeaderboardPodium from '../features/leaderboard/LeaderboardPodium.jsx'
import LeaderboardTable from '../features/leaderboard/LeaderboardTable.jsx'
import MyPositionBar from '../features/leaderboard/MyPositionBar.jsx'
import { METRICS, PERIODS } from '../features/leaderboard/metrics.js'
import { formatNumber } from '../features/stats/format.js'
import { useAuthStore } from '../store/authStore.js'
import styles from './LeaderboardPage.module.css'

const METRIC_OPTIONS = Object.entries(METRICS).map(([value, metric]) => ({
  value,
  label: metric.label,
}))
const PERIOD_OPTIONS = Object.entries(PERIODS).map(([value, label]) => ({ value, label }))
const LIMIT = 50

const pickOption = (value, options, fallback) => (value in options ? value : fallback)

export default function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const metricKey = pickOption(searchParams.get('metric'), METRICS, 'wpm')
  const period = pickOption(searchParams.get('period'), PERIODS, 'week')
  const metric = METRICS[metricKey]
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)

  const { data, isPending, isError, isPlaceholderData, refetch } = useQuery({
    queryKey: ['leaderboard', metricKey, period, user?.id ?? null],
    queryFn: () => getLeaderboard({ metric: metricKey, period, limit: LIMIT }),
    placeholderData: keepPreviousData,
    enabled: status === 'ready',
  })

  const shownMetric = METRICS[data?.metric] ?? metric
  const rows = isError ? null : data

  const updateParam = (name, value) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set(name, value)
      return next
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Табло лидеров</h1>
          <p className={styles.subtitle}>
            Лучшие гонщики Радиатор-Спрингс
            {rows?.total ? ` · всего ${formatNumber(rows.total)}` : ''}
          </p>
        </div>
        <div className={styles.filters}>
          <SegmentedControl
            label="Рейтинг"
            size="lg"
            options={METRIC_OPTIONS}
            value={metricKey}
            onChange={(value) => updateParam('metric', value)}
          />
          <SegmentedControl
            label="Период"
            options={PERIOD_OPTIONS}
            value={period}
            onChange={(value) => updateParam('period', value)}
          />
        </div>
      </header>

      {metric.hint && <p className={styles.hint}>{metric.hint}</p>}

      {isPending && (
        <div className={styles.skeletons}>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height="64px" />
          ))}
        </div>
      )}

      {isError && <QueryError onRetry={refetch} />}

      {rows && rows.items.length === 0 && (
        <EmptyState
          icon="🏆"
          title="Пока никого — стань первым"
          description={`За период «${PERIODS[period].toLowerCase()}» ещё нет результатов.`}
          action={
            <Link to="/train" className={styles.cta}>
              На трассу
            </Link>
          }
        />
      )}

      {rows && rows.items.length > 0 && (
        <LeaderboardPodium items={rows.items} metric={shownMetric} currentUserId={user?.id} />
      )}

      {rows && rows.items.length > 3 && (
        <LeaderboardTable
          items={rows.items.slice(3)}
          metric={shownMetric}
          currentUserId={user?.id}
          dimmed={isPlaceholderData}
        />
      )}

      {rows && <MyPositionBar user={user} me={rows.me} metric={shownMetric} total={rows.total} />}
    </div>
  )
}
