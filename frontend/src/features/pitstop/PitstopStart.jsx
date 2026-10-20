import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import FocusKeys from './FocusKeys.jsx'
import styles from './PitstopStart.module.css'
import { useEnterToStart } from '../train/useEnterToStart.js'

const LANG_TITLES = { ru: 'русской', en: 'английской' }

export default function PitstopStart({ pitstop, onStart }) {
  useEnterToStart(onStart)

  const { focus, fallback } = pitstop

  return (
    <section className={styles.start} aria-labelledby="pitstop-title">
      <Link to="/train" className={styles.back}>
        ← К тренировке
      </Link>

      <header className={styles.header}>
        <h1 id="pitstop-title" className={styles.title}>
          Пит-стоп 🔧
        </h1>
        <p className={styles.subtitle}>
          Короткий заезд по слабым местам на {LANG_TITLES[pitstop.lang] ?? ''} раскладке.
        </p>
      </header>

      {fallback ? (
        <p className={styles.notice}>
          Статистика ещё копится — пока это разминка. После нескольких заездов пит-стоп подстроится
          под твои слабые клавиши.
        </p>
      ) : (
        <div className={styles.focus}>
          <h2 className={styles.focusTitle}>Работаем над клавишами</h2>
          <FocusKeys items={focus.keys} field="key" />
          {focus.bigrams.length > 0 && (
            <>
              <h2 className={styles.focusTitle}>И сочетаниями</h2>
              <FocusKeys items={focus.bigrams} field="bigram" />
            </>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <Button onClick={onStart}>На старт</Button>
        <span className={styles.hint}>или нажми Enter</span>
      </div>
    </section>
  )
}
