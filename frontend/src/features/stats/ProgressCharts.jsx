import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { getProgress } from '../../api/stats.js'
import EmptyState from '../../components/EmptyState.jsx'
import QueryError from '../../components/QueryError.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import StatsSection from './StatsSection.jsx'
import { formatShortDate } from './format.js'
import { useChartTheme } from './useChartTheme.js'
import styles from './ProgressCharts.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const RANGES = [
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: '90d', label: '90 дней' },
]

function buildOptions(theme, { suffix, min, max }) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme.text,
          usePointStyle: true,
          boxHeight: 8,
          font: { family: theme.font },
        },
      },
      tooltip: {
        callbacks: {
          label: (item) => `${item.dataset.label}: ${item.formattedValue}${suffix}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: theme.muted,
          maxRotation: 0,
          autoSkipPadding: 12,
          font: { family: theme.font },
        },
      },
      y: {
        min,
        max,
        beginAtZero: min === undefined,
        grid: { color: theme.grid },
        ticks: { color: theme.muted, font: { family: theme.font } },
      },
    },
  }
}

function lineDataset(label, data, color, fill = false) {
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: color,
    pointRadius: data.length > 31 ? 0 : 3,
    pointHoverRadius: 5,
    borderWidth: 3,
    tension: 0.3,
    fill,
  }
}

export default function ProgressCharts() {
  const [range, setRange] = useState('7d')
  const theme = useChartTheme()
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['stats', 'progress', range],
    queryFn: () => getProgress(range),
    placeholderData: keepPreviousData,
  })

  const charts = useMemo(() => {
    if (!data) return null
    const labels = data.points.map((point) => formatShortDate(point.date))
    const accuracies = data.points
      .map((point) => point.avg_accuracy)
      .filter((value) => value !== null)
    const accuracyMin = accuracies.length
      ? Math.max(0, Math.floor(Math.min(...accuracies) / 5) * 5 - 5)
      : 0
    return {
      hasRuns: data.points.some((point) => point.runs > 0),
      speed: {
        data: {
          labels,
          datasets: [
            lineDataset(
              'Средний WPM',
              data.points.map((point) => point.avg_wpm),
              theme.primary,
            ),
            lineDataset(
              'Лучший WPM',
              data.points.map((point) => point.best_wpm),
              theme.accent,
            ),
          ],
        },
        options: buildOptions(theme, { suffix: '' }),
      },
      accuracy: {
        data: {
          labels,
          datasets: [
            lineDataset(
              'Точность',
              data.points.map((point) => point.avg_accuracy),
              theme.success,
            ),
          ],
        },
        options: buildOptions(theme, { suffix: '%', min: accuracyMin, max: 100 }),
      },
    }
  }, [data, theme])

  const rangeSwitch = (
    <div className={styles.ranges} role="group" aria-label="Период">
      {RANGES.map((item) => (
        <button
          key={item.value}
          type="button"
          className={item.value === range ? `${styles.range} ${styles.rangeActive}` : styles.range}
          aria-pressed={item.value === range}
          onClick={() => setRange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )

  return (
    <StatsSection title="Динамика" actions={rangeSwitch}>
      {isPending && (
        <div className={styles.grid}>
          <Skeleton height="260px" />
          <Skeleton height="260px" />
        </div>
      )}
      {isError && !data && <QueryError onRetry={refetch} />}
      {charts && !charts.hasRuns && (
        <EmptyState
          icon="📉"
          title="За этот период заездов нет"
          description="Выберите период побольше или проведите новый заезд."
        />
      )}
      {charts?.hasRuns && (
        <div className={styles.grid}>
          <figure className={styles.chart}>
            <figcaption className={styles.caption}>Скорость, WPM</figcaption>
            <div className={styles.canvas}>
              <Line data={charts.speed.data} options={charts.speed.options} />
            </div>
          </figure>
          <figure className={styles.chart}>
            <figcaption className={styles.caption}>Точность, %</figcaption>
            <div className={styles.canvas}>
              <Line data={charts.accuracy.data} options={charts.accuracy.options} />
            </div>
          </figure>
        </div>
      )}
    </StatsSection>
  )
}
