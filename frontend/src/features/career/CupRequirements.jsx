import { CUPS } from './tracks.js'
import styles from './CupRequirements.module.css'

export default function CupRequirements({ requirements, earned = 0 }) {
  return (
    <ul className={styles.requirements}>
      {CUPS.map((cup, index) => {
        const requirement = requirements[index]
        if (!requirement) return null
        return (
          <li key={cup.id} className={`${styles.requirement} ${styles[`${cup.tone}Row`]}`}>
            <span>
              {cup.id <= earned ? '✓ ' : ''}
              {cup.label}
            </span>
            <span className={styles.threshold}>
              {requirement.wpm} WPM · {requirement.accuracy}%
            </span>
          </li>
        )
      })}
    </ul>
  )
}
