import { useId } from 'react'
import styles from './TextField.module.css'

export default function TextField({ label, error, ...inputProps }) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={error ? `${styles.input} ${styles.inputInvalid}` : styles.input}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
