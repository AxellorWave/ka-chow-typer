import { memo, useLayoutEffect, useMemo, useRef } from 'react'
import { useStore } from 'zustand'
import { useSettingsStore } from '../../store/settingsStore.js'
import styles from './TextDisplay.module.css'

const TOKEN_PATTERN = /\S+\s?|\s/g
const VISIBLE_CHARS = { '\n': '↵\n', '\t': '→\t' }

function tokenize(text) {
  return Array.from(text.matchAll(TOKEN_PATTERN), (match) => ({
    start: match.index,
    chars: Array.from(match[0]),
  }))
}

function findTokenIndex(tokens, position) {
  let low = 0
  let high = tokens.length - 1
  while (low <= high) {
    const middle = (low + high) >> 1
    const token = tokens[middle]
    if (position < token.start) high = middle - 1
    else if (position >= token.start + token.chars.length) low = middle + 1
    else return middle
  }
  return tokens.length
}

function charClassName(index, cursor, hasError) {
  if (index < cursor) return styles.correct
  if (index > cursor) return styles.pending
  return hasError ? `${styles.current} ${styles.error}` : styles.current
}

const Word = memo(function Word({ chars, status, cursor, hasError }) {
  if (status !== 'current') {
    return (
      <span className={status === 'done' ? styles.correct : styles.pending}>
        {chars.map((char) => VISIBLE_CHARS[char] ?? char).join('')}
      </span>
    )
  }

  return (
    <span className={styles.wordCurrent}>
      {chars.map((char, index) => (
        <span
          key={index}
          className={charClassName(index, cursor, hasError)}
          data-cursor={index === cursor || undefined}
        >
          {VISIBLE_CHARS[char] ?? char}
        </span>
      ))}
    </span>
  )
})

export default function TextDisplay({ engine, displayMode, variant = 'text', lines = 3 }) {
  const settingsMode = useSettingsStore((state) => state.displayMode)
  const mode = displayMode ?? settingsMode
  const position = useStore(engine.store, (state) => state.position)
  const hasError = useStore(engine.store, (state) => state.errorAt !== null)
  const containerRef = useRef(null)
  const lineHeightRef = useRef(0)
  const scrollRef = useRef(0)

  const tokens = useMemo(() => tokenize(engine.text), [engine.text])
  const currentIndex = findTokenIndex(tokens, position)

  useLayoutEffect(() => {
    const container = containerRef.current
    const measure = () => {
      lineHeightRef.current = parseFloat(getComputedStyle(container).lineHeight)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const container = containerRef.current
    const cursor = container.querySelector('[data-cursor]')
    const lineHeight = lineHeightRef.current
    if (!cursor || !lineHeight) return
    const line = Math.floor((cursor.offsetTop + cursor.offsetHeight / 2) / lineHeight)
    const target = Math.max(0, (line - 1) * lineHeight)
    if (scrollRef.current !== target) {
      scrollRef.current = target
      container.scrollTop = target
    }
  }, [currentIndex])

  const classNames = [
    styles.display,
    mode === 'words' ? styles.modeWords : styles.modeChars,
    variant === 'code' ? styles.code : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={containerRef}
      className={classNames}
      style={{ '--lines': lines }}
      role="textbox"
      aria-readonly="true"
      aria-label="Текст заезда"
    >
      {tokens.map((token, index) => {
        const status = index < currentIndex ? 'done' : index > currentIndex ? 'pending' : 'current'
        return (
          <Word
            key={token.start}
            chars={token.chars}
            status={status}
            cursor={status === 'current' ? position - token.start : -1}
            hasError={status === 'current' && hasError}
          />
        )
      })}
    </div>
  )
}
