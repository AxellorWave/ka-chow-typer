import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../api/health.js'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { data, isError, isLoading } = useQuery({ queryKey: ['health'], queryFn: getHealth })

  const status = isLoading ? 'проверяем…' : isError ? 'нет связи' : data.status

  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>Ka-chow!</h1>
      <p className={styles.subtitle}>Тренажёр слепой печати. Скорость. Я — скорость.</p>
      <p className={styles.status}>API: {status}</p>
    </section>
  )
}
