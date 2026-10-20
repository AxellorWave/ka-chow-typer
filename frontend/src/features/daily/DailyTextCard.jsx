import Button from '../../components/Button.jsx'
import { describeSetup } from '../train/options.js'
import styles from './DailyTextCard.module.css'

export default function DailyTextCard({ text, onRide, compact = false, children }) {
  return (
    <article className={compact ? `${styles.card} ${styles.compact}` : styles.card}>
      <p className={styles.meta}>{describeSetup(text)}</p>
      <p className={styles.text}>{text.text}</p>
      {children}
      <div className={styles.actions}>
        <Button onClick={onRide}>Ехать</Button>
        <span className={styles.hint}>{text.text.length} символов</span>
      </div>
    </article>
  )
}
