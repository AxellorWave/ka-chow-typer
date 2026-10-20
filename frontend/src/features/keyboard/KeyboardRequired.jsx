import { useState } from 'react'
import { Link } from 'react-router-dom'
import stubImage from '../../assets/design/keyboard-required.webp'
import styles from './KeyboardRequired.module.css'

const COPY_LABELS = {
  idle: 'Скопировать ссылку',
  done: 'Ссылка скопирована',
  failed: 'Не удалось скопировать',
}

export default function KeyboardRequired() {
  const [copyState, setCopyState] = useState('idle')

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyState('done')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <section className={styles.page} aria-labelledby="keyboard-required-title">
      <img src={stubImage} alt="Молния Маквин под чехлом в боксах" className={styles.image} />
      <h1 id="keyboard-required-title" className={styles.title}>
        Подключи клавиатуру, чтобы гонять
      </h1>
      <p className={styles.text}>
        Слепая печать тренируется на физических клавишах. Открой KaChowTyper на компьютере или
        подключи клавиатуру к телефону.
      </p>
      <button type="button" className={styles.copy} onClick={copyLink} aria-live="polite">
        {COPY_LABELS[copyState]}
      </button>
      <Link to="/leaderboard" className={styles.leaders}>
        Смотреть лидеров
      </Link>
    </section>
  )
}
