import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import SaveProgressCta from '../auth/SaveProgressCta.jsx'
import GhostVerdict from '../ghost/GhostVerdict.jsx'
import LevelUpModal from '../effects/LevelUpModal.jsx'
import { showAchievementToasts } from '../effects/toastStore.js'
import { pitstopPath } from '../pitstop/pitstop.js'
import { formatDuration, formatNumber } from './format.js'
import { errorsWord, speedSegments, weakChars } from './runAnalysis.js'
import cupBronze from '../../assets/design/cups/cup-bronze.png'
import cupGold from '../../assets/design/cups/cup-gold.png'
import cupSilver from '../../assets/design/cups/cup-silver.png'
import { useSaveRun } from './useSaveRun.js'
import styles from './ResultScreen.module.css'

const CUPS = [
  { id: 1, name: 'Бронза', className: 'bronze', image: cupBronze },
  { id: 2, name: 'Серебро', className: 'silver', image: cupSilver },
  { id: 3, name: 'Золото', className: 'gold', image: cupGold },
]

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
    <div
      className={styles.xpTrack}
      role="progressbar"
      aria-label={`До ${result.level + 1} уровня ${formatNumber(result.xp_to_next)} XP`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div className={styles.xpFill} style={{ '--progress': `${progress}%` }} />
    </div>
  )
}

function LevelCard({ result }) {
  const previous = result.level - (result.levels_gained ?? 0)
  return (
    <div className={styles.levelCard} role={result.level_up ? 'status' : undefined}>
      <div className={styles.levelHead}>
        <span className={styles.levelTitle}>{result.level_up ? 'Level up!' : 'Опыт'}</span>
        <span className={styles.levelGain}>+{formatNumber(result.xp_earned)} XP</span>
      </div>
      <div className={styles.levelRow}>
        {result.level_up && (
          <>
            <span className={styles.levelOld}>{previous}</span>
            <span className={styles.levelArrow} aria-hidden="true">
              →
            </span>
          </>
        )}
        <span className={styles.levelNew}>{result.level}</span>
        <span className={styles.levelNote}>
          {result.level_up ? 'Новый уровень' : `Уровень ${result.level}`}
        </span>
      </div>
      <XpBar result={result} />
      <span className={styles.levelHint}>
        до {result.level + 1} уровня — {formatNumber(result.xp_to_next)} XP
      </span>
    </div>
  )
}

function Cups({ cups }) {
  return (
    <div className={styles.cups}>
      {CUPS.map((cup) => {
        const won = cups.cups >= cup.id
        const fresh = won && cups.cups - cups.new_cups < cup.id
        return (
          <div
            key={cup.id}
            className={[styles.cupCard, styles[cup.className], !won && styles.cupLocked]
              .filter(Boolean)
              .join(' ')}
          >
            <img src={cup.image} alt="" className={styles.cupIcon} />
            <span className={styles.cupName}>{cup.name}</span>
            {fresh && <span className={styles.cupNew}>Новый!</span>}
          </div>
        )
      })}
    </div>
  )
}

function SpeedChart({ segments, ghostWpm }) {
  if (segments.length === 0) return null
  const max = Math.max(...segments, ghostWpm ?? 0, 1)
  const best = Math.max(...segments)
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>Скорость по ходу заезда</h2>
        {ghostWpm ? (
          <span className={styles.cardHint}>— — призрак {Math.round(ghostWpm)} WPM</span>
        ) : null}
      </div>
      <div className={styles.chart} role="img" aria-label="Скорость по отрезкам заезда">
        {ghostWpm ? (
          <span className={styles.ghostLine} style={{ '--level': ghostWpm / max }} />
        ) : null}
        {segments.map((value, index) => (
          <span
            key={index}
            className={value === best ? `${styles.chartBar} ${styles.chartBest}` : styles.chartBar}
            style={{ '--height': value / max }}
            title={`${value} WPM`}
          />
        ))}
      </div>
    </div>
  )
}

function WeakChars({ items }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardLabel}>Слабые буквы</h2>
      {items.length === 0 ? (
        <p className={styles.cardEmpty}>Ни одной ошибки — чистый круг!</p>
      ) : (
        <ul className={styles.weak}>
          {items.map((item) => (
            <li key={item.char} className={styles.weakChip}>
              <span className={styles.weakChar}>{item.char}</span>
              {item.count} {errorsWord(item.count)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function NewAchievements({ items }) {
  if (!items?.length) return null
  return (
    <div className={styles.card}>
      <h2 className={styles.cardLabel}>Новые ачивки</h2>
      <ul className={styles.achievements}>
        {items.map((achievement) => (
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
  return <LevelCard result={save.data} />
}

export default function ResultScreen({
  payload,
  ghost,
  user,
  onAgain,
  againLoading = false,
  againError = null,
  onChangeSetup,
  changeLabel = 'К выбору заезда',
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
    { label: 'CPM', value: payload.cpm.toFixed(0) },
    { label: 'Точность', value: `${Math.round(payload.accuracy)}%` },
    { label: 'Ошибки', value: payload.errors },
    { label: 'Время', value: formatDuration(payload.duration_ms) },
    { label: 'Очки', value: formatNumber(payload.score) },
  ]
  const segments = speedSegments(payload.keystrokes ?? [], payload.duration_ms)
  const weak = weakChars(payload.text ?? '', payload.keystrokes ?? [])

  return (
    <section className={styles.result} aria-labelledby="result-title">
      <div className={styles.grid}>
        <div className={styles.side}>
          <div className={styles.hero}>
            <h1 id="result-title" className={styles.heroLabel}>
              Финиш
            </h1>
            <p className={styles.heroValue}>
              {Math.round(payload.wpm)}
              <span className={styles.heroUnit}>WPM</span>
            </p>
            <span className={styles.heroCombo}>макс. комбо {payload.max_combo}</span>
          </div>

          {user ? (
            <SaveStatus save={save} />
          ) : (
            <SaveProgressCta {...(save.sessionExpired ? EXPIRED_CTA : GUEST_CTA)} />
          )}

          {save.data?.cups && <Cups cups={save.data.cups} />}
        </div>

        <div className={styles.main}>
          <dl className={styles.metrics}>
            {metrics.map((metric) => (
              <div key={metric.label} className={styles.metric}>
                <dt className={styles.metricLabel}>{metric.label}</dt>
                <dd className={styles.metricValue}>{metric.value}</dd>
              </div>
            ))}
          </dl>

          <SpeedChart segments={segments} ghostWpm={ghost?.wpm} />

          {ghost && <GhostVerdict ghost={ghost} durationMs={payload.duration_ms} />}

          <div className={styles.cardsRow}>
            <NewAchievements items={save.data?.new_achievements} />
            <WeakChars items={weak} />
          </div>

          {renderReport?.(save)}

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
            <Button variant="ghost" onClick={onChangeSetup}>
              {changeLabel}
            </Button>
            <span className={styles.hint}>
              <kbd>Enter</kbd> — {againLabel.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {save.data && (
        <LevelUpModal
          level={save.data.level}
          levelsGained={save.data.levels_gained}
          open={levelUpOpen}
          onClose={closeLevelUp}
        />
      )}
    </section>
  )
}
