import { useLocation, useNavigate } from 'react-router-dom'
import PageLoader from '../components/PageLoader.jsx'
import QueryError from '../components/QueryError.jsx'
import Skeleton from '../components/Skeleton.jsx'
import SaveProgressCta from '../features/auth/SaveProgressCta.jsx'
import TrackMap from '../features/career/TrackMap.jsx'
import { useTracks } from '../features/career/useTracks.js'
import { useAuthStore } from '../store/authStore.js'
import styles from './CareerPage.module.css'

export default function CareerPage() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const location = useLocation()
  const { data, isPending, isError, refetch } = useTracks()

  if (status !== 'ready') {
    return <PageLoader />
  }

  const selectTrack = (track) => {
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }
    navigate(`/train?track=${track.id}`)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Карьера</h1>
          <p className={styles.subtitle}>
            От Радиатор-Спрингс до Кубка Поршня. Бронза на трассе открывает следующую.
          </p>
        </div>
        {data && (
          <span className={styles.total}>
            🏆 {data.total_cups} / {data.max_cups}
          </span>
        )}
      </header>

      {!user && <SaveProgressCta />}

      {isPending && (
        <div className={styles.skeletons}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} height="220px" />
          ))}
        </div>
      )}

      {isError && <QueryError onRetry={refetch} title="Не удалось загрузить трассы" />}

      {data && <TrackMap items={data.items} onSelect={selectTrack} />}
    </div>
  )
}
