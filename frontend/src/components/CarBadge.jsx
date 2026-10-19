import styles from './CarBadge.module.css'

const CAR_COLORS = {
  color_red: 'var(--car-red)',
  color_yellow: 'var(--car-yellow)',
  color_blue: 'var(--car-blue)',
  color_rust: 'var(--car-rust)',
  color_black: 'var(--car-black)',
}

export default function CarBadge({ config, width = 48 }) {
  const color = CAR_COLORS[config?.color] ?? CAR_COLORS.color_red

  return (
    <svg
      className={styles.car}
      viewBox="0 0 64 32"
      width={width}
      height={width / 2}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 23c0-5 3-8 10-9l8-6c3-2 7-2.5 12-2.5h8c5 0 9 3 12 7l4 1c3 .8 4 3.5 4 7.5v2H4z"
        style={{ fill: color }}
      />
      <path d="M24 10l10-1.5h7c3.5 0 6.5 2 8.5 4.5H21z" className={styles.window} />
      <path d="M29 15h8l-3 3.2h6.5L27 24l4-4.5h-6z" className={styles.bolt} />
      <circle cx="17" cy="25" r="5.5" className={styles.wheel} />
      <circle cx="49" cy="25" r="5.5" className={styles.wheel} />
      <circle cx="17" cy="25" r="2.2" className={styles.hub} />
      <circle cx="49" cy="25" r="2.2" className={styles.hub} />
    </svg>
  )
}
