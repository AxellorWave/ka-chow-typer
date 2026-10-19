import styles from './Button.module.css'

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  className,
  children,
  ...buttonProps
}) {
  const classNames = [styles.button, styles[variant], className].filter(Boolean).join(' ')

  return (
    <button className={classNames} disabled={disabled || loading} aria-busy={loading} {...buttonProps}>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  )
}
