import { useInfiniteQuery } from '@tanstack/react-query'
import { getMyRuns } from '../../api/runs.js'
import Button from '../../components/Button.jsx'
import QueryError from '../../components/QueryError.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import StatsSection from './StatsSection.jsx'
import { LANG_LABELS, MODE_LABELS, formatDateTime, formatDuration, formatNumber } from './format.js'
import styles from './RunHistory.module.css'

const PAGE_SIZE = 10

export default function RunHistory() {
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['runs', 'me'],
      queryFn: ({ pageParam }) => getMyRuns({ limit: PAGE_SIZE, offset: pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        const next = lastPage.offset + lastPage.items.length
        return next < lastPage.total ? next : undefined
      },
    })

  const runs = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  return (
    <StatsSection title={`История заездов${total ? ` · ${formatNumber(total)}` : ''}`}>
      {isPending && <Skeleton height="240px" />}
      {isError && <QueryError onRetry={refetch} />}
      {runs.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Режим</th>
                <th className={styles.number}>WPM</th>
                <th className={styles.number}>Точность</th>
                <th className={styles.number}>Ошибки</th>
                <th className={styles.number}>Время</th>
                <th className={styles.number}>XP</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td data-label="Дата">{formatDateTime(run.created_at)}</td>
                  <td data-label="Режим">
                    {MODE_LABELS[run.mode] ?? run.mode} · {LANG_LABELS[run.lang] ?? run.lang}
                  </td>
                  <td data-label="WPM" className={`${styles.number} ${styles.wpm}`}>
                    {formatNumber(run.wpm)}
                  </td>
                  <td data-label="Точность" className={styles.number}>
                    {formatNumber(run.accuracy)}%
                  </td>
                  <td data-label="Ошибки" className={styles.number}>
                    {run.errors}
                  </td>
                  <td data-label="Время" className={styles.number}>
                    {formatDuration(run.duration_ms)}
                  </td>
                  <td data-label="XP" className={styles.number}>
                    +{formatNumber(run.xp_earned)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {hasNextPage && (
        <Button
          type="button"
          variant="accent"
          className={styles.more}
          loading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          Показать ещё
        </Button>
      )}
    </StatsSection>
  )
}
