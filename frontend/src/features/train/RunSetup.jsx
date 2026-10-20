import { useEffect } from 'react'
import Button from '../../components/Button.jsx'
import { DIFFICULTIES, MODES, difficultyLock, langsForMode, modeLock } from './options.js'
import { playSound, stopSound } from '../audio/sounds.js'
import styles from './RunSetup.module.css'
import { useEnterToStart } from './useEnterToStart.js'

const VOICE_FADE_MS = 300

function modeAccess(mode, user) {
  if (!modeLock(mode, user)) return 'открыт'
  return user ? `ур. ${mode.unlockLevel}` : 'вход'
}

function Spec({ label, value }) {
  return (
    <div className={styles.spec}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function ModeCard({ mode, index, user, active, onSelect }) {
  const lock = modeLock(mode, user)
  const classNames = [styles.mode, active && styles.active, lock && styles.locked]
    .filter(Boolean)
    .join(' ')
  return (
    <button
      type="button"
      className={classNames}
      aria-pressed={active}
      disabled={Boolean(lock)}
      title={lock ?? undefined}
      onClick={() => onSelect(mode.id)}
    >
      {active && <span className={styles.tag}>Выбрано</span>}
      <span className={styles.modeTop}>
        <span className={styles.modeNumber}>{String(index + 1).padStart(2, '0')}</span>
        <span className={styles.glyph} aria-hidden="true">
          {mode.glyph}
        </span>
      </span>
      <span className={styles.modeLabel}>{mode.label}</span>
      <span className={styles.modeHint}>{mode.description}</span>
      <dl className={styles.specs}>
        <Spec label="Длина" value={mode.length} />
        <Spec label="Доступ" value={modeAccess(mode, user)} />
      </dl>
      {lock && (
        <span className={styles.stamp}>Закрыто · {user ? `ур. ${mode.unlockLevel}` : 'вход'}</span>
      )}
    </button>
  )
}

export default function RunSetup({ user, setup, onChange, onStart, loading, error }) {
  const langs = langsForMode(setup.mode)
  const mode = MODES.find((item) => item.id === setup.mode) ?? MODES[0]
  const lang = langs.find((item) => item.id === setup.lang) ?? langs[0]
  const difficulty = DIFFICULTIES.find((item) => item.id === setup.difficulty) ?? DIFFICULTIES[0]

  useEffect(() => {
    playSound('vo-ready')
    return () => stopSound('vo-ready', { fadeMs: VOICE_FADE_MS })
  }, [])

  useEnterToStart(onStart, loading)

  const selectMode = (modeId) => {
    const nextLangs = langsForMode(modeId)
    const nextLang = nextLangs.some((item) => item.id === setup.lang) ? setup.lang : nextLangs[0].id
    onChange({ mode: modeId, lang: nextLang })
  }

  return (
    <section className={styles.setup} aria-labelledby="setup-title">
      <header className={styles.header}>
        <h1 id="setup-title" className={styles.title}>
          Выбор заезда
        </h1>
        <span className={styles.step}>Техкарта · шаг 1</span>
      </header>

      <fieldset className={styles.modesGroup}>
        <legend className={styles.srOnly}>Режим</legend>
        <div className={styles.modes}>
          {MODES.map((item, index) => (
            <ModeCard
              key={item.id}
              mode={item}
              index={index}
              user={user}
              active={setup.mode === item.id}
              onSelect={selectMode}
            />
          ))}
        </div>
      </fieldset>

      <div className={styles.row}>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Язык</legend>
          <div className={styles.segmented}>
            {langs.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  setup.lang === item.id ? `${styles.square} ${styles.squareActive}` : styles.square
                }
                aria-pressed={setup.lang === item.id}
                onClick={() => onChange({ lang: item.id })}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>
            Сложность · {difficulty.id} · {difficulty.label}
          </legend>
          <div className={styles.bars}>
            {DIFFICULTIES.map((item) => {
              const lock = difficultyLock(item, user)
              const filled = item.id <= setup.difficulty
              return (
                <button
                  key={item.id}
                  type="button"
                  className={[styles.bar, filled && styles.barFilled, lock && styles.barLocked]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ '--bar': item.id }}
                  aria-pressed={setup.difficulty === item.id}
                  aria-label={`Сложность ${item.id}: ${item.label}${lock ? `, ${lock.toLowerCase()}` : ''}`}
                  disabled={Boolean(lock)}
                  title={lock ?? item.label}
                  onClick={() => onChange({ difficulty: item.id })}
                />
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
        <Button className={styles.startButton} onClick={onStart} loading={loading}>
          На старт!
        </Button>
        <span className={styles.summary}>
          {mode.label} · {lang.label} · сложность {difficulty.id} — или нажми <kbd>Enter</kbd>
        </span>
      </div>
    </section>
  )
}
