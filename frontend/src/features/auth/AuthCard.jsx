import styles from './AuthCard.module.css'

export default function AuthCard({ title, subtitle, footer, children }) {
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>
      {children}
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  )
}
