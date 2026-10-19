import { useStore } from 'zustand'
import { FINGERS, resolveChar } from './layouts.js'
import styles from './HandsHint.module.css'

const HAND_FINGERS = {
  left: [
    ['leftPinky', 12, 30],
    ['leftRing', 32, 18],
    ['leftMiddle', 52, 10],
    ['leftIndex', 72, 18],
  ],
  right: [
    ['rightPinky', 12, 30],
    ['rightRing', 32, 18],
    ['rightMiddle', 52, 10],
    ['rightIndex', 72, 18],
  ],
}

function Hand({ side, active }) {
  const fingerClass = (finger) =>
    [styles.finger, styles[FINGERS[finger].type], active.has(finger) ? styles.active : null]
      .filter(Boolean)
      .join(' ')

  return (
    <svg
      className={styles.hand}
      viewBox="0 0 120 110"
      aria-hidden="true"
      style={side === 'right' ? { transform: 'scaleX(-1)' } : undefined}
    >
      {HAND_FINGERS[side].map(([finger, x, y]) => (
        <rect
          key={finger}
          className={fingerClass(finger)}
          x={x}
          y={y}
          width="16"
          height="50"
          rx="8"
        />
      ))}
      <rect
        className={fingerClass('thumb')}
        x="88"
        y="58"
        width="16"
        height="36"
        rx="8"
        transform="rotate(-40 96 76)"
      />
      <rect className={styles.palm} x="10" y="52" width="82" height="54" rx="20" />
    </svg>
  )
}

function describe(next) {
  if (next === null) return ''
  const main = FINGERS[next.finger].label
  if (next.shiftFinger === null) return main
  return `${main} + ${FINGERS[next.shiftFinger].label.toLowerCase()} на Shift`
}

export default function HandsHint({ engine, layout = 'ru' }) {
  const nextChar = useStore(engine.store, (state) => engine.text[state.position])
  const next = resolveChar(nextChar, layout)
  const active = new Set(next === null ? [] : [next.finger, next.shiftFinger])

  return (
    <div className={styles.hint}>
      <div className={styles.hands}>
        <Hand side="left" active={active} />
        <Hand side="right" active={active} />
      </div>
      <p className={styles.caption} aria-live="polite">
        {describe(next)}
      </p>
    </div>
  )
}
