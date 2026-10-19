import styles from './Skeleton.module.css'

export default function Skeleton({ height = '1rem', width = '100%' }) {
  return <span className={styles.skeleton} style={{ height, width }} aria-hidden="true" />
}
