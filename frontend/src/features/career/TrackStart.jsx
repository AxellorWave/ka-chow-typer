import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import GhostPicker from '../ghost/GhostPicker.jsx'
import CupRequirements from './CupRequirements.jsx'
import { trackMeta } from './tracks.js'
import styles from './TrackStart.module.css'

export default function TrackStart({ track, ghost, onGhostChange, onStart, loading, error }) {
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

  return (
    <section className={styles.start} aria-labelledby="track-title">
      <Link to="/career" className={styles.back}>
        ← Карта трасс
      </Link>

      <header className={styles.header}>
        <p className={styles.order}>Трасса {track.sort_order}</p>
        <h1 id="track-title" className={styles.title}>
          {track.title}
        </h1>
        <p className={styles.description}>{track.description}</p>
        <p className={styles.meta}>{trackMeta(track)}</p>
      </header>

      <div className={styles.goals}>
        <h2 className={styles.goalsTitle}>Кубки за заезд</h2>
        <CupRequirements requirements={track.cup_requirements} earned={track.cups} />
        {track.best_wpm && (
          <p className={styles.best}>Твой лучший результат: {track.best_wpm.toFixed(1)} WPM</p>
        )}
      </div>

      <GhostPicker value={ghost} onChange={onGhostChange} />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <Button onClick={onStart} loading={loading}>
          На старт
        </Button>
        <span className={styles.hint}>или нажми Enter</span>
      </div>
    </section>
  )
}
