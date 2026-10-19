import styles from './StatsSection.module.css'

export default function StatsSection({ title, actions, children }) {
  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {actions}
      </header>
      {children}
    </section>
  )
}
