import { useEffect } from 'react'
import Button from '../../components/Button.jsx'
import { DIFFICULTIES, MODES, difficultyLock, langsForMode, modeLock } from './options.js'
import styles from './RunSetup.module.css'

export default function RunSetup({ user, setup, onChange, onStart, loading, error }) {
  const langs = langsForMode(setup.mode)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && !event.repeat && !loading && event.target === document.body) {
        event.preventDefault()
        onStart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loading, onStart])

  const selectMode = (mode) => {
    const nextLangs = langsForMode(mode)
    const lang = nextLangs.some((item) => item.id === setup.lang) ? setup.lang : nextLangs[0].id
    onChange({ mode, lang })
  }

  return (
    <section className={styles.setup} aria-labelledby="setup-title">
      <header className={styles.header}>
        <h1 id="setup-title" className={styles.title}>
          Выбери заезд
        </h1>
        <p className={styles.subtitle}>Режим, язык и трасса. Чем сложнее — тем больше опыта.</p>
      </header>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Режим</legend>
        <div className={styles.modes}>
          {MODES.map((mode) => {
            const lock = modeLock(mode, user)
            const active = setup.mode === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                className={[styles.mode, active && styles.active, lock && styles.locked]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={active}
                disabled={Boolean(lock)}
                onClick={() => selectMode(mode.id)}
              >
                <span className={styles.modeLabel}>
                  {lock && <span aria-hidden="true">🔒 </span>}
                  {mode.label}
                </span>
                <span className={styles.modeHint}>{lock ?? mode.description}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className={styles.row}>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Язык</legend>
          <div className={styles.segmented}>
            {langs.map((lang) => (
              <button
                key={lang.id}
                type="button"
                className={setup.lang === lang.id ? `${styles.pill} ${styles.active}` : styles.pill}
                aria-pressed={setup.lang === lang.id}
                onClick={() => onChange({ lang: lang.id })}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Трасса</legend>
          <div className={styles.segmented}>
            {DIFFICULTIES.map((difficulty) => {
              const lock = difficultyLock(difficulty, user)
              const active = setup.difficulty === difficulty.id
              return (
                <button
                  key={difficulty.id}
                  type="button"
                  className={[styles.pill, active && styles.active, lock && styles.locked]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={active}
                  disabled={Boolean(lock)}
                  title={lock ?? undefined}
                  onClick={() => onChange({ difficulty: difficulty.id })}
                >
                  {lock && <span aria-hidden="true">🔒 </span>}
                  {difficulty.id}. {difficulty.label}
                </button>
              )
            })}
          </div>
        </fieldset>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.start}>
        <Button onClick={onStart} loading={loading}>
          На старт!
        </Button>
        <span className={styles.hint}>или нажми Enter</span>
      </div>
    </section>
  )
}
