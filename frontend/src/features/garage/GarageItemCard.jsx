import CarBadge from '../../components/CarBadge.jsx'
import styles from './GarageItemCard.module.css'

export default function GarageItemCard({ item, preview, selected, saved, onSelect }) {
  const classNames = [styles.card, selected && styles.selected, !item.unlocked && styles.locked]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classNames}
      aria-pressed={selected}
      disabled={!item.unlocked}
      onClick={() => onSelect(item.code)}
    >
      <CarBadge config={preview} width={96} />
      <span className={styles.title}>{item.title}</span>
      {item.unlocked ? (
        saved && <span className={styles.badge}>Стоит сейчас</span>
      ) : (
        <span className={styles.lock}>🔒 {item.unlock.label}</span>
      )}
    </button>
  )
}
