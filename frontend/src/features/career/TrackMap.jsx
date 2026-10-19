import TrackNode from './TrackNode.jsx'
import { groupByZone } from './tracks.js'
import styles from './TrackMap.module.css'

export default function TrackMap({ items, onSelect }) {
  const zones = groupByZone(items)

  return (
    <div className={styles.map}>
      {zones.map((zone) => {
        const cups = zone.tracks.reduce((sum, track) => sum + track.cups, 0)
        return (
          <section
            key={zone.id}
            className={`${styles.zone} ${styles[zone.id]}`}
            aria-labelledby={`zone-${zone.id}`}
          >
            <header className={styles.header}>
              <div>
                <h2 id={`zone-${zone.id}`} className={styles.title}>
                  {zone.title}
                </h2>
                <p className={styles.subtitle}>{zone.subtitle}</p>
              </div>
              <span className={styles.score}>
                🏆 {cups} / {zone.tracks.length * 3}
              </span>
            </header>
            <ol className={styles.road}>
              {zone.tracks.map((track) => (
                <TrackNode key={track.id} track={track} items={items} onSelect={onSelect} />
              ))}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
