import { memo, useRef } from 'react'
import { useStore } from 'zustand'
import { FINGERS, LAYOUTS, LAYOUT_TITLES, resolveChar } from './layouts.js'
import { useEnginePresses } from './useEnginePresses.js'
import styles from './VirtualKeyboard.module.css'

const Key = memo(function Key({ code, finger, width, caption, hint, target }) {
  const classNames = [styles.key, styles[FINGERS[finger].type], target ? styles.target : null]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} style={{ '--key-width': width }} data-code={code}>
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

export default function VirtualKeyboard({ engine, layout = 'ru' }) {
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
