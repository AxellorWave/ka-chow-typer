import { useEffect, useMemo, useRef } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import PageLoader from '../components/PageLoader.jsx'
import QueryError from '../components/QueryError.jsx'
import TrackStart from '../features/career/TrackStart.jsx'
import { lockText, trackSetup } from '../features/career/tracks.js'
import { useTracks } from '../features/career/useTracks.js'
import { useDaily } from '../features/daily/useDaily.js'
import ResultScreen from '../features/train/ResultScreen.jsx'
import RunScreen from '../features/train/RunScreen.jsx'
import RunSetup from '../features/train/RunSetup.jsx'
import { normalizeSetup } from '../features/train/options.js'
import { useRunFlow } from '../features/train/useRunFlow.js'
import { useTrainSetup } from '../features/train/useTrainSetup.js'
import { useAuthStore } from '../store/authStore.js'
import styles from './TrainPage.module.css'

function FreeTrain({ user }) {
  const storedSetup = useTrainSetup()
  const setup = normalizeSetup(storedSetup, user)
  const flow = useRunFlow(setup)

  if (flow.phase === 'run' && flow.run) {
    return (
      <RunScreen
        key={flow.run.key}
        run={flow.run}
        onFinish={flow.finish}
        onExit={flow.backToSetup}
      />
    )
  }

  if (flow.phase === 'result' && flow.result) {
    return (
      <ResultScreen
        payload={flow.result}
        user={user}
        onAgain={flow.start}
        onChangeSetup={flow.backToSetup}
      />
    )
  }

  return (
    <RunSetup
      user={user}
      setup={setup}
      onChange={storedSetup.update}
      onStart={flow.start}
      loading={flow.loading}
      error={flow.error}
    />
  )
}

function TrackRun({ user, track }) {
  const navigate = useNavigate()
  const setup = useMemo(() => trackSetup(track), [track])
  const flow = useRunFlow(setup)

  if (flow.phase === 'run' && flow.run) {
    return (
      <RunScreen
        key={flow.run.key}
        run={flow.run}
        onFinish={flow.finish}
        onExit={flow.backToSetup}
        exitLabel="К трассе"
      />
    )
  }

  if (flow.phase === 'result' && flow.result) {
    return (
      <ResultScreen
        payload={flow.result}
        user={user}
        onAgain={flow.start}
        onChangeSetup={() => navigate('/career')}
        changeLabel="К карте трасс"
      />
    )
  }

  return <TrackStart track={track} onStart={flow.start} loading={flow.loading} error={flow.error} />
}

const toMap = (
  <Link to="/career" className={styles.cta}>
    К карте трасс
  </Link>
)

function TrackTrain({ user, trackId }) {
  const { data, isPending, isError, refetch } = useTracks()

  if (isPending) return <PageLoader />
  if (isError) return <QueryError onRetry={refetch} title="Не удалось загрузить трассу" />

  const track = data.items.find((item) => item.id === trackId)
  if (!track) {
    return <EmptyState icon="🗺️" title="Такой трассы нет" action={toMap} />
  }
  if (!track.unlocked) {
    return (
      <EmptyState
        icon="🔒"
        title={`Трасса «${track.title}» закрыта`}
        description={lockText(track, data.items)}
        action={toMap}
      />
    )
  }

  return <TrackRun key={track.id} user={user} track={track} />
}

function DailyRun({ user, daily }) {
  const navigate = useNavigate()
  const setup = useMemo(() => ({ dailyDate: daily.date }), [daily.date])
  const loadText = useMemo(() => async () => daily.text, [daily.text])
  const flow = useRunFlow(setup, loadText)
  const startedRef = useRef(false)
  const { start } = flow

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    start()
  }, [start])

  const toDaily = () => navigate('/daily')

  if (flow.phase === 'run' && flow.run) {
    return (
      <RunScreen
        key={flow.run.key}
        run={flow.run}
        onFinish={flow.finish}
        onExit={toDaily}
        exitLabel="К заезду дня"
      />
    )
  }

  if (flow.phase === 'result' && flow.result) {
    return (
      <ResultScreen
        payload={flow.result}
        user={user}
        onAgain={flow.start}
        onChangeSetup={toDaily}
        changeLabel="К заезду дня"
        againLabel="Ещё попытка"
      />
    )
  }

  return <PageLoader />
}

const toDailyPage = (
  <Link to="/daily" className={styles.cta}>
    К заезду дня
  </Link>
)

function DailyTrain({ user, date }) {
  const { data, isPending, isError, refetch } = useDaily()

  if (isPending) return <PageLoader />
  if (isError) return <QueryError onRetry={refetch} title="Не удалось загрузить заезд дня" />
  if (data.date !== date) {
    return (
      <EmptyState
        icon="⏱️"
        title="Этот заезд дня уже закончился"
        description="Новый текст уже ждёт на странице заезда дня."
        action={toDailyPage}
      />
    )
  }

  return <DailyRun key={data.date} user={user} daily={data} />
}

export default function TrainPage() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const trackId = Number(searchParams.get('track')) || null
  const dailyDate = searchParams.get('daily')

  if (!trackId && !dailyDate) return <FreeTrain user={user} />
  if (status !== 'ready') return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  if (dailyDate) return <DailyTrain user={user} date={dailyDate} />
  return <TrackTrain user={user} trackId={trackId} />
}
