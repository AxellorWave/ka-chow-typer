import styles from './GhostPicker.module.css'

const OPTIONS = [
  { value: 'off', label: 'Нет' },
  { value: 'self', label: 'Мой' },
  { value: 'top', label: 'Лидер' },
]

export default function GhostPicker({ value, onChange }) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Призрак</legend>
      <div className={styles.options}>
        {OPTIONS.map((option) => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              className={active ? `${styles.pill} ${styles.active}` : styles.pill}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
            >
              {option.value !== 'off' && <span aria-hidden="true">👻 </span>}
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
