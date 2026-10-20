import styles from './AuthCard.module.css'

export default function AuthCard({
  title,
  subtitle,
  footer,
  kicker = 'Пит-лейн открыт',
  headline = 'Снова на трассе',
  image,
  children,
}) {
  return (
    <section className={styles.layout}>
      <aside className={styles.panel}>
        <p className={styles.kicker}>{kicker}</p>
        <p className={styles.headline}>{headline}</p>
        <span className={styles.stripes} aria-hidden="true" />
        {image && <img src={image} alt="" className={styles.image} />}
      </aside>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
        {children}
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </section>
  )
}
