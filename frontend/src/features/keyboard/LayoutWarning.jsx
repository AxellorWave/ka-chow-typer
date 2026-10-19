import { useLayoutMismatch } from './useLayoutMismatch.js'
import styles from './LayoutWarning.module.css'

const MESSAGES = {
  ru: 'Похоже, включена английская раскладка. Смени раскладку на русскую.',
  en: 'Похоже, включена русская раскладка. Смени раскладку на английскую.',
}

export default function LayoutWarning({ engine }) {
  const needed = useLayoutMismatch(engine)
  if (needed === null) return null

  return (
    <div className={styles.warning} role="alert">
      <span className={styles.badge}>{needed === 'ru' ? 'RU' : 'EN'}</span>
      {MESSAGES[needed]}
    </div>
  )
}
