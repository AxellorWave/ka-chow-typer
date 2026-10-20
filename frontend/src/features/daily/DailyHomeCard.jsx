import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import QueryError from '../../components/QueryError.jsx'
import Skeleton from '../../components/Skeleton.jsx'
import { formatNumber } from '../stats/format.js'
import Countdown from './Countdown.jsx'
import { useDaily } from './useDaily.js'
import { useRideDaily } from './useRideDaily.js'
import styles from './DailyHomeCard.module.css'

const PREVIEW_LENGTH = 90

function preview(text) {
  return text.length > PREVIEW_LENGTH ? `${text.slice(0, PREVIEW_LENGTH).trimEnd()}…` : text
}

export default function DailyHomeCard() {
  const queryClient = useQueryClient()
  const { data, isPending, isError, refetch } = useDaily()
  const ride = useRideDaily(data?.date)

  if (isError) return <QueryError onRetry={refetch} title="Не удалось загрузить заезд дня" />
  if (isPending) return <Skeleton height="96px" />

  return (
    <section className={styles.banner} aria-labelledby="home-daily-title">
      <h2 id="home-daily-title" className={styles.title}>
        <Link to="/daily">Заезд дня</Link>
      </h2>
      <p className={styles.text}>
        Один текст для всех: «{preview(data.text.text)}».{' '}
        {data.leader
          ? `Лидер — ${data.leader.nickname}, ${formatNumber(data.leader.wpm)} WPM.`
          : 'Пока никто не проехал — стань первым.'}
      </p>
      <Countdown
        endsAt={data.ends_at}
        label="До конца дня"
        onExpire={() => queryClient.invalidateQueries({ queryKey: ['daily'] })}
      />
      <Button variant="accent" className={styles.ride} onClick={ride}>
        Едем
      </Button>
    </section>
  )
}
