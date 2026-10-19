import { useQuery } from '@tanstack/react-query'
import { getKeyStats } from '../../api/stats.js'
import EmptyState from '../../components/EmptyState.jsx'
import QueryError from '../../components/QueryError.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import StatsSection from './StatsSection.jsx'
import { formatKey, formatNumber } from './format.js'
import styles from './WeakSpots.module.css'

function WeakList({ title, items, field }) {
  const maxRate = Math.max(...items.map((item) => item.error_rate), 1)

  return (
    <div className={styles.column}>
      <h3 className={styles.subtitle}>{title}</h3>
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item[field]} className={styles.item}>
            <kbd className={styles.key}>{formatKey(item[field])}</kbd>
            <span className={styles.meter}>
              <span
                className={styles.meterFill}
                style={{ width: `${(item.error_rate / maxRate) * 100}%` }}
              />
            </span>
            <span className={styles.rate}>{formatNumber(item.error_rate)}%</span>
            <span className={styles.latency}>{formatNumber(item.avg_latency_ms)} мс</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function WeakSpots() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['stats', 'keys'],
    queryFn: getKeyStats,
  })

  if (isPending) {
    return (
      <StatsSection title="Слабые места">
        <Skeleton height="200px" />
      </StatsSection>
    )
  }

  if (isError) {
    return (
      <StatsSection title="Слабые места">
        <QueryError onRetry={refetch} />
      </StatsSection>
    )
  }

  const hasData = data.weakest_keys.length > 0 || data.weakest_bigrams.length > 0

  return (
    <StatsSection title="Слабые места">
      {hasData ? (
        <>
          <p className={styles.hint}>
            Доля ошибок и среднее время нажатия. Начинай тренировку с них.
          </p>
          <div className={styles.columns}>
            {data.weakest_keys.length > 0 && (
              <WeakList title="Буквы" items={data.weakest_keys} field="key" />
            )}
            {data.weakest_bigrams.length > 0 && (
              <WeakList title="Сочетания" items={data.weakest_bigrams} field="bigram" />
            )}
          </div>
        </>
      ) : (
        <EmptyState
          icon="🎯"
          title="Слабых мест пока не видно"
          description={`Нужно минимум ${data.min_presses} нажатий на клавишу, чтобы появилась статистика.`}
        />
      )}
    </StatsSection>
  )
}
