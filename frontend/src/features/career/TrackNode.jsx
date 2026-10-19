import CupRequirements from './CupRequirements.jsx'
import { CUPS, lockText, trackMeta } from './tracks.js'
import styles from './TrackNode.module.css'

function CupRow({ count }) {
  return (
    <span className={styles.cups} aria-label={`Кубков: ${count} из ${CUPS.length}`}>
      {CUPS.map((cup) => (
        <span
          key={cup.id}
          className={cup.id <= count ? `${styles.cup} ${styles[cup.tone]}` : styles.cup}
          aria-hidden="true"
        >
          🏆
        </span>
      ))}
    </span>
  )
}

function nodeState(track) {
  if (!track.unlocked) return 'locked'
  return track.cups > 0 ? 'done' : 'open'
}

const NODE_ICONS = { locked: '🔒', open: '🏁' }

export default function TrackNode({ track, items, onSelect }) {
  const state = nodeState(track)
  const lock = lockText(track, items)
  const tooltipId = `track-${track.id}-details`

  const select = () => {
    if (track.unlocked) onSelect(track)
  }

  return (
    <li className={`${styles.node} ${styles[state]}`}>
      <button
        type="button"
        className={styles.marker}
        aria-disabled={!track.unlocked}
        aria-describedby={tooltipId}
        onClick={select}
      >
        <span className={styles.badge} aria-hidden="true">
          {NODE_ICONS[state] ?? track.sort_order}
        </span>
        <span className={styles.name}>{track.title}</span>
        <CupRow count={track.cups} />
        {lock ? (
          <span className={styles.lock}>{lock}</span>
        ) : (
          <span className={styles.best}>
            {track.best_wpm ? `Лучший: ${track.best_wpm.toFixed(1)} WPM` : 'Ещё не пройдена'}
          </span>
        )}
      </button>

      <div id={tooltipId} role="tooltip" className={styles.tooltip}>
        <p className={styles.description}>{track.description}</p>
        <p className={styles.meta}>{trackMeta(track)}</p>
        <CupRequirements requirements={track.cup_requirements} earned={track.cups} />
      </div>
    </li>
  )
}
