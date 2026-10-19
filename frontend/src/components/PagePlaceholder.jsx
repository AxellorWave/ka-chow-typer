import styles from './PagePlaceholder.module.css'

export default function PagePlaceholder({ title, description }) {
  return (
    <section className={styles.placeholder}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <p className={styles.badge}>Скоро на трассе</p>
    </section>
  )
}
