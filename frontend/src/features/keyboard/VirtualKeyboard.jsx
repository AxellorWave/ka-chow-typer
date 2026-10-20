import { memo, useRef } from 'react'
import { useStore } from 'zustand'
import { FINGERS, LAYOUTS, LAYOUT_TITLES, resolveChar } from './layouts.js'
import { useEnginePresses } from './useEnginePresses.js'
import styles from './VirtualKeyboard.module.css'

const Key = memo(function Key({ code, finger, width, caption, hint, target, heat, tooltip }) {
  const classNames = [
    styles.key,
    heat === undefined ? styles[FINGERS[finger].type] : styles.heatKey,
    target ? styles.target : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      style={{
        '--key-width': width,
        ...(heat === undefined ? {} : { '--heat-color': heat }),
      }}
      data-code={code}
      title={tooltip}
    >
      {hint !== null && <span className={styles.hint}>{hint}</span>}
      <span className={styles.caption}>{caption}</span>
    </div>
  )
})

function flash(container, code, className) {
  const key = container?.querySelector(`[data-code="${code}"]`)
  if (!key) return
  key.classList.remove(styles.flashOk, styles.flashError)
  void key.offsetWidth
  key.classList.add(className)
}

function TypingKeyboard({ engine, layout }) {
  const containerRef = useRef(null)
  const nextChar = useStore(engine.store, (state) => engine.text[state.position])
  const next = resolveChar(nextChar, layout)

  useEnginePresses(engine, ({ code, ok }) => {
    flash(containerRef.current, code, ok ? styles.flashOk : styles.flashError)
  })

  const handleAnimationEnd = (event) => {
    event.target.classList.remove(styles.flashOk, styles.flashError)
  }

  return (
    <div
      ref={containerRef}
      className={styles.keyboard}
      onAnimationEnd={handleAnimationEnd}
      role="img"
      aria-label={`Экранная клавиатура ${LAYOUT_TITLES[layout]}`}
    >
      {LAYOUTS[layout].rows.map((row, index) => (
        <div key={index} className={styles.row}>
          {row.map((key) => (
            <Key
              key={key.code}
              {...key}
              target={next !== null && (key.code === next.code || key.code === next.shiftCode)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const heatColor = (value) =>
  value < 0.5
    ? `color-mix(in oklab, var(--heat-low), var(--heat-mid) ${Math.round(value * 200)}%)`
    : `color-mix(in oklab, var(--heat-mid), var(--heat-high) ${Math.round(value * 200 - 100)}%)`

function HeatmapKeyboard({ layout, heatmap = {}, metric = 'errors' }) {
  return (
    <div
      className={styles.keyboard}
      role="img"
      aria-label={`Тепловая карта клавиатуры ${LAYOUT_TITLES[layout]}`}
    >
      {LAYOUTS[layout].rows.map((row, index) => (
        <div key={index} className={styles.row}>
          {row.map((key) => {
            const stat = heatmap[key.code]
            const value = metric === 'errors' ? stat?.error_rate : stat?.avg_latency_ms
            const normalized = Math.min(
              1,
              Math.max(0, (value ?? 0) / (metric === 'errors' ? 30 : 600)),
            )
            const heat = stat ? heatColor(normalized) : 'var(--color-surface)'

            const tooltip = stat
              ? `${key.caption}: ${stat.error_rate}% ошибок, ${stat.avg_latency_ms} мс, ${stat.presses} нажатий`
              : `${key.caption}: нет данных`

            return <Key key={key.code} {...key} heat={heat} tooltip={tooltip} />
          })}
        </div>
      ))}
    </div>
  )
}

export default function VirtualKeyboard({
  engine,
  layout = 'ru',
  mode = 'typing',
  heatmap,
  metric,
}) {
  if (mode === 'heatmap') {
    return <HeatmapKeyboard layout={layout} heatmap={heatmap} metric={metric} />
  }

  return <TypingKeyboard engine={engine} layout={layout} />
}
