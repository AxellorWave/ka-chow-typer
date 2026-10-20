import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getKeyStats } from '../../api/stats.js'
import QueryError from '../../components/QueryError.jsx'
import SegmentedControl from '../../components/SegmentedControl.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import VirtualKeyboard from '../keyboard/VirtualKeyboard.jsx'
import { LAYOUTS } from '../keyboard/layouts.js'
import StatsSection from './StatsSection.jsx'
import styles from './KeyboardHeatmap.module.css'

const LAYOUT_OPTIONS = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
]

const METRIC_OPTIONS = [
  { value: 'errors', label: 'Ошибки' },
  { value: 'latency', label: 'Задержка' },
]

const LEGENDS = {
  errors: ['0%', '15%', '30%+'],
  latency: ['0 мс', '300 мс', '600 мс+'],
}

function buildHeatmap(keys, layout) {
  const heatmap = {}
  for (const stat of keys) {
    const { charMap } = LAYOUTS[layout]
    const entry = charMap.get(stat.key) ?? charMap.get(stat.key.toLowerCase())
    if (!entry) continue

    const previous = heatmap[entry.code]
    const presses = (previous?.presses ?? 0) + stat.presses
    const errors = (previous?.errors ?? 0) + stat.errors
    const latencySum =
      (previous?.avg_latency_ms ?? 0) * (previous?.presses ?? 0) +
      stat.avg_latency_ms * stat.presses

    heatmap[entry.code] = {
      presses,
      errors,
      error_rate: presses > 0 ? Math.round((errors / presses) * 1000) / 10 : 0,
      avg_latency_ms: presses > 0 ? Math.round(latencySum / presses) : 0,
    }
  }
  return heatmap
}

export default function KeyboardHeatmap() {
  const [layout, setLayout] = useState('ru')
  const [metric, setMetric] = useState('errors')

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['stats', 'keys'],
    queryFn: getKeyStats,
  })

  return (
    <StatsSection title="Тепловая карта клавиатуры">
      <div className={styles.controls}>
        <SegmentedControl
          label="Раскладка клавиатуры"
          options={LAYOUT_OPTIONS}
          value={layout}
          onChange={setLayout}
        />
        <SegmentedControl
          label="Показатель статистики"
          options={METRIC_OPTIONS}
          value={metric}
          onChange={setMetric}
        />
      </div>

      {isPending && <Skeleton height="220px" />}

      {isError && <QueryError onRetry={refetch} title="Не удалось загрузить статистику клавиш" />}

      {data && (
        <>
          <div className={styles.keyboardWrapper}>
            <VirtualKeyboard
              mode="heatmap"
              layout={layout}
              metric={metric}
              heatmap={buildHeatmap(data.keys, layout)}
            />
          </div>

          <div className={styles.legend}>
            <span>Меньше</span>
            <div className={styles.gradient} />
            <span>Больше</span>
          </div>

          <div className={styles.legendValues}>
            {LEGENDS[metric].map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>

          <p className={styles.hint}>
            Наведи курсор на клавишу, чтобы увидеть процент ошибок, среднюю задержку и количество
            нажатий.
          </p>
        </>
      )}
    </StatsSection>
  )
}
