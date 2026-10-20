import { useEffect, useRef, useState } from 'react'
import styles from './Countdown.module.css'

const pad = (value) => String(value).padStart(2, '0')
const EXPIRE_RETRY_MS = 10_000

function formatLeft(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  return `${pad(hours)}:${pad(minutes)}:${pad(total % 60)}`
}

export default function Countdown({ endsAt, onExpire, label = 'До конца дня' }) {
  const deadline = Date.parse(endsAt)
  const [left, setLeft] = useState(() => deadline - Date.now())
  const expireRef = useRef(onExpire)

  useEffect(() => {
    expireRef.current = onExpire
  })

  useEffect(() => {
    setLeft(deadline - Date.now())
    let expiredAt = null
    const timer = setInterval(() => {
      const now = Date.now()
      const next = deadline - now
      setLeft(next)
      if (next <= 0 && (expiredAt === null || now - expiredAt >= EXPIRE_RETRY_MS)) {
        expiredAt = now
        expireRef.current?.()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [deadline])

  return (
    <span className={styles.countdown}>
      <span className={styles.label}>{label}</span>
      <time className={styles.value} dateTime={endsAt}>
        {formatLeft(left)}
      </time>
    </span>
  )
}
