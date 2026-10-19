import styles from './SegmentedControl.module.css'

export default function SegmentedControl({ options, value, onChange, label, size = 'md' }) {
  return (
    <div className={`${styles.control} ${styles[size]}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? `${styles.option} ${styles.active}` : styles.option}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
