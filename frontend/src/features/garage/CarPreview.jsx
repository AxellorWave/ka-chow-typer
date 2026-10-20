import CarLayers from '../../components/car/CarLayers.jsx'
import styles from './CarPreview.module.css'

export default function CarPreview({ config }) {
  return (
    <div className={styles.stage}>
      <svg className={styles.car} viewBox="-2 0 72 34" role="img" aria-label="Твоя машинка">
        <ellipse cx="35" cy="31.5" rx="32" ry="2" className={styles.shadow} />
        <CarLayers config={config} />
      </svg>
    </div>
  )
}
