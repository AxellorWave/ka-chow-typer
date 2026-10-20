import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import SaveProgressCta from '../auth/SaveProgressCta.jsx'
import GhostVerdict from '../ghost/GhostVerdict.jsx'
import LevelUpModal from '../effects/LevelUpModal.jsx'
import { showAchievementToasts } from '../effects/toastStore.js'
import { pitstopPath } from '../pitstop/pitstop.js'
import { formatDuration, formatNumber } from './format.js'
import { useSaveRun } from './useSaveRun.js'
import styles from './ResultScreen.module.css'

const CUP_NAMES = ['', 'бронзу', 'серебро', 'золото']

const GUEST_CTA = {
  title: 'Сохрани этот заезд — зарегистрируйся',
  subtitle: 'Результат запишется в профиль сразу после регистрации или входа.',
}

const EXPIRED_CTA = {
  title: 'Сессия истекла. Войдите — результат сохранится',
  subtitle: 'Заезд ждёт на этом устройстве и отправится сразу после входа.',
}

function XpBar({ result }) {
  const span = Math.max(1, result.next_level_xp - result.level_xp)
  const progress = Math.min(100, ((result.xp - result.level_xp) / span) * 100)
  return (
    <div className={styles.xp}>
      <div className={styles.xpHeader}>
        <span className={styles.xpGain}>+{formatNumber(result.xp_earned)} XP</span>
        <span>
          Уровень {result.level} · до следующего {formatNumber(result.xp_to_next)} XP
        </span>
      </div>
      <div
        className={styles.xpTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className={styles.xpFill} style={{ '--progress': `${progress}%` }} />
      </div>
    </div>
  )
}

function SaveStatus({ save }) {
  if (save.isPending) {
    return <p className={styles.status}>Сохраняем результат…</p>
  }
  if (save.isError) {
    return (
      <div className={styles.saveError} role="alert">
        <p>
          {save.retryable
            ? 'Нет связи с сервером. Заезд сохранён на этом устройстве: отправьте его ещё раз или он уйдёт сам при следующем заходе.'
            : (save.error.response?.data?.message ?? 'Сервер не принял результат заезда.')}
        </p>
        {save.retryable && (
          <Button variant="accent" onClick={save.retry}>
            Отправить ещё раз
          </Button>
        )}
      </div>
    )
  }
  if (!save.data) return null

  const result = save.data
  return (
    <div className={styles.rewards}>
      {result.level_up && (
        <div className={styles.levelUp} role="status">
          <span className={styles.levelUpTitle}>Новый уровень!</span>
          <span>Теперь ты на {result.level} уровне</span>
        </div>
      )}
      <XpBar result={result} />
      {result.cups?.new_cups > 0 && (
        <p className={styles.cup}>🏆 Новый кубок: {CUP_NAMES[result.cups.cups]}</p>
      )}
      {result.new_achievements?.length > 0 && (
        <ul className={styles.achievements}>
          {result.new_achievements.map((achievement) => (
            <li key={achievement.code} className={styles.achievement}>
              <span className={styles.achievementIcon} aria-hidden="true">
                {achievement.icon}
              </span>
              <span>
                <strong>{achievement.title}</strong>
                <br />
                <span className={styles.achievementText}>{achievement.description}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ResultScreen({
  payload,
  ghost,
  user,
  onAgain,
  againLoading = false,
  againError = null,
  onChangeSetup,
  changeLabel = 'Сменить режим',
  againLabel = 'Ещё заезд',
  showPitstop = true,
  renderReport,
}) {
  const navigate = useNavigate()
  const save = useSaveRun(payload, Boolean(user))
  const [levelUpOpen, setLevelUpOpen] = useState(false)
  const closeLevelUp = useCallback(() => setLevelUpOpen(false), [])

  useEffect(() => {
    if (!save.data) return
    setLevelUpOpen(Boolean(save.data.level_up))
    showAchievementToasts(save.data.new_achievements)
  }, [save.data])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === 'Enter' &&
        !event.repeat &&
        !againLoading &&
        event.target === document.body
      ) {
        event.preventDefault()
        onAgain()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onAgain, againLoading])

  const metrics = [
    { label: 'WPM', value: payload.wpm.toFixed(1), accent: true },
    { label: 'CPM', value: payload.cpm.toFixed(0) },
    { label: 'Точность', value: `${payload.accuracy.toFixed(1)}%` },
    { label: 'Ошибки', value: payload.errors },
    { label: 'Время', value: formatDuration(payload.duration_ms) },
    { label: 'Очки', value: formatNumber(payload.score) },
    { label: 'Макс. комбо', value: payload.max_combo },
    { label: 'Символов', value: payload.correct_chars },
  ]

  return (
    <section className={styles.result} aria-labelledby="result-title">
      <h1 id="result-title" className={styles.title}>
        Финиш!
      </h1>

      <dl className={styles.metrics}>
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={metric.accent ? `${styles.metric} ${styles.accent}` : styles.metric}
          >
            <dt className={styles.metricLabel}>{metric.label}</dt>
            <dd className={styles.metricValue}>{metric.value}</dd>
          </div>
        ))}
      </dl>

      {ghost && <GhostVerdict ghost={ghost} durationMs={payload.duration_ms} />}

      {user ? (
        <SaveStatus save={save} />
      ) : (
        <SaveProgressCta {...(save.sessionExpired ? EXPIRED_CTA : GUEST_CTA)} />
      )}

      {renderReport?.(save)}

      {save.data && (
        <LevelUpModal
          level={save.data.level}
          levelsGained={save.data.levels_gained}
          open={levelUpOpen}
          onClose={closeLevelUp}
        />
      )}

      {againError && (
        <p className={styles.againError} role="alert">
          {againError}
        </p>
      )}

      <div className={styles.actions}>
        <Button onClick={onAgain} loading={againLoading}>
          {againLabel}
        </Button>
        {showPitstop && (
          <Button variant="accent" onClick={() => navigate(pitstopPath(payload.lang))}>
            Пит-стоп
          </Button>
        )}
        <button type="button" className={styles.link} onClick={onChangeSetup}>
          {changeLabel}
        </button>
        <span className={styles.hint}>Enter — {againLabel.toLowerCase()}</span>
      </div>
    </section>
  )
}
