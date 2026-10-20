import CarModel from './CarModel.jsx'
import styles from './RacerAvatar.module.css'

export default function RacerAvatar({ racer, className }) {
  const classNames = [styles.avatar, className].filter(Boolean).join(' ')
  if (racer.avatar_url) {
    return <img src={racer.avatar_url} alt="" className={`${classNames} ${styles.photo}`} />
  }
  return <CarModel config={racer.car_config} className={classNames} />
}
