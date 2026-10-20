
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getKeyStats } from '../../api/stats.js'
import VirtualKeyboard from '../keyboard/VirtualKeyboard.jsx'
import { LAYOUTS } from '../keyboard/layouts.js'
import StatsSection from './StatsSection.jsx'
import styles from './KeyboardHeatmap.module.css'

export default function KeyboardHeatmap() {
  const [layout, setLayout] = useState('ru')
  const [metric, setMetric] = useState('errors')

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['stats', 'keys'],
    queryFn: getKeyStats,
  })


  const heatmap = {}

  for (const stat of data?.keys ?? []) {
    const character = stat.key

    const entry = LAYOUTS[layout].charMap.get(character)
      ?? LAYOUTS[layout].charMap.get(character.toLowerCase())

    if (!entry) continue

    const code = entry.code
    const previous = heatmap[code]

    const presses = (previous?.presses ?? 0) + stat.presses
    const errors = (previous?.errors ?? 0) + stat.errors

    const latencySum =
      (previous?.avg_latency_ms ?? 0) * (previous?.presses ?? 0)
      + stat.avg_latency_ms * stat.presses

    heatmap[code] = {
      presses,
      errors,
      error_rate: presses > 0 ? (errors / presses) * 100 : 0,
      avg_latency_ms: presses > 0 ? latencySum / presses : 0,
    }
  }


  const legend = metric === 'errors'
    ? ['0%', '15%', '30%+']
    : ['0 мс', '300 мс', '600 мс+']

  return (
    <StatsSection title="Тепловая карта клавиатуры">
      <div className={styles.controls}>
        <div className={styles.switchGroup} aria-label="Раскладка клавиатуры">
          <button
            type="button"
            className={layout === 'ru' ? styles.active : styles.button}
            onClick={() => setLayout('ru')}
            aria-pressed={layout === 'ru'}
          >
            RU
          </button>
          <button
            type="button"
            className={layout === 'en' ? styles.active : styles.button}
            onClick={() => setLayout('en')}
            aria-pressed={layout === 'en'}
          >
            EN
          </button>
        </div>

        <div className={styles.switchGroup} aria-label="Показатель статистики">
          <button
            type="button"
            className={metric === 'errors' ? styles.active : styles.button}
            onClick={() => setMetric('errors')}
            aria-pressed={metric === 'errors'}
          >
            Ошибки
          </button>
          <button
            type="button"
            className={metric === 'latency' ? styles.active : styles.button}
            onClick={() => setMetric('latency')}
            aria-pressed={metric === 'latency'}
          >
            Задержка
          </button>
        </div>
      </div>

      {isPending && <p>Загружаем статистику клавиш...</p>}

      {isError && (
        <div>
          <p>Не удалось загрузить статистику клавиш.</p>
          <button type="button" onClick={() => refetch()}>
            Повторить
          </button>
        </div>
      )}

      {data && (
        <>
          <div className={styles.keyboardWrapper}>
            <VirtualKeyboard
              mode="heatmap"
              layout={layout}
              metric={metric}
              heatmap={heatmap}
            />
          </div>

          <div className={styles.legend}>
            <span>Меньше</span>
            <div className={styles.gradient} />
            <span>Больше</span>
          </div>

          <div className={styles.legendValues}>
            {legend.map((value) => <span key={value}>{value}</span>)}
          </div>

          <p className={styles.hint}>
            Наведи курсор на клавишу, чтобы увидеть процент ошибок,
            среднюю задержку и количество нажатий.
          </p>
        </>
      )}
    </StatsSection>
  )
}
