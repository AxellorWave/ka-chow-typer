import CarLayers from './car/CarLayers.jsx'
import styles from './CarBadge.module.css'

export default function CarBadge({ config, width = 48 }) {
  return (
    <svg
      className={styles.car}
      viewBox="0 0 68 32"
      width={width}
      height={(width * 32) / 68}
      aria-hidden="true"
      focusable="false"
    >
      <CarLayers config={config} />
    </svg>
  )
}
