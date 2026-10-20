import CarModel from '../../components/car/CarModel.jsx'
import styles from './CarPreview.module.css'

export default function CarPreview({ config }) {
  return (
    <div className={styles.stage} role="img" aria-label="Твоя машинка">
      <div className={styles.podium}>
        <CarModel config={config} className={styles.car} />
        <span className={styles.shadow} aria-hidden="true" />
      </div>
    </div>
  )
}
