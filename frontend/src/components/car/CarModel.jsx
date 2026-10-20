import { memo, useMemo } from 'react'
import { withDefaults } from './carConfig.js'
import { DEFAULT_HERO, HEROES, colorFilter, wheelsMarkup } from './carModel.js'
import styles from './CarModel.module.css'

export default memo(function CarModel({ config, className, width }) {
  const car = withDefaults(config)
  const heroCode = HEROES[car.hero] ? car.hero : DEFAULT_HERO
  const hero = HEROES[heroCode]
  const filter = colorFilter(car.color, hero)
  const wheels = useMemo(() => wheelsMarkup(car.wheels, heroCode), [car.wheels, heroCode])

  return (
    <span
      className={className ? `${styles.car} ${className}` : styles.car}
      style={{ aspectRatio: `${hero.width} / ${hero.height}`, width }}
      aria-hidden="true"
    >
      <img src={hero.image} alt="" draggable="false" className={styles.layer} style={{ filter }} />
      {hero.eyes && filter !== 'none' && (
        <img src={hero.eyes} alt="" draggable="false" className={styles.layer} />
      )}
      {wheels && (
        <svg
          className={styles.layer}
          viewBox={`0 0 ${hero.width} ${hero.height}`}
          dangerouslySetInnerHTML={{ __html: wheels }}
        />
      )}
    </span>
  )
})
