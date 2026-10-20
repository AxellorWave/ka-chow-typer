import { playSound } from '../features/audio/sounds.js'
import styles from './Button.module.css'

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  className,
  children,
  onClick,
  ...buttonProps
}) {
  const handleClick = (event) => {
    playSound('sfx-ui-click')
    onClick?.(event)
  }
  const classNames = [styles.button, styles[variant], className].filter(Boolean).join(' ')

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      aria-busy={loading}
      {...buttonProps}
      onClick={handleClick}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  )
}
