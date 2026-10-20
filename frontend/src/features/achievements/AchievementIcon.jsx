import kaChowImage from '../../assets/design/achievements/achievement-ka-chow.webp'
import typingGeniusImage from '../../assets/design/achievements/achievement-typing-genius.webp'
import steelFingerImage from '../../assets/design/achievements/achievement-steel-finger.webp'
import flawless1000Image from '../../assets/design/achievements/achievement-clean-lap.webp'
import cpm200Image from '../../assets/design/achievements/achievement-speed-200.webp'
import polyglotImage from '../../assets/design/achievements/achievement-polyglot.webp'
import coderImage from '../../assets/design/achievements/achievement-coder.webp'
import ghostBusterImage from '../../assets/design/achievements/achievement-ghost-beaten.webp'
import weekOnTrackImage from '../../assets/design/achievements/achievement-week-streak.webp'
import pistonCupImage from '../../assets/design/achievements/achievement-gold-cup.webp'
import nightRacerImage from '../../assets/design/achievements/achievement-night-racer.webp'
import comboMasterImage from '../../assets/design/achievements/achievement-fire-combo.webp'
import perfectAccuracyImage from '../../assets/design/achievements/achievement-sniper.webp'
import veteranImage from '../../assets/design/achievements/achievement-hundred.webp'
import level10Image from '../../assets/design/achievements/achievement-legend.webp'
import dailyDriverImage from '../../assets/design/achievements/achievement-daily.webp'
import marathonImage from '../../assets/design/achievements/achievement-marathon.webp'
import styles from './AchievementIcon.module.css'

const IMAGES = {
  ka_chow: kaChowImage,
  typing_genius: typingGeniusImage,
  steel_finger: steelFingerImage,
  flawless_1000: flawless1000Image,
  cpm_200: cpm200Image,
  polyglot: polyglotImage,
  coder: coderImage,
  ghost_buster: ghostBusterImage,
  week_on_track: weekOnTrackImage,
  piston_cup: pistonCupImage,
  night_racer: nightRacerImage,
  combo_master: comboMasterImage,
  perfect_accuracy: perfectAccuracyImage,
  veteran: veteranImage,
  level_10: level10Image,
  daily_driver: dailyDriverImage,
  marathon: marathonImage,
}

export default function AchievementIcon({ code, icon, unlocked }) {
  const image = IMAGES[code]
  return (
    <span
      className={unlocked ? styles.medal : `${styles.medal} ${styles.locked}`}
      aria-hidden="true"
    >
      {image ? (
        <img src={image} alt="" className={styles.image} />
      ) : (
        <span className={styles.glyph}>{icon ?? '🏁'}</span>
      )}
    </span>
  )
}
