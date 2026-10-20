import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { getPitstop } from '../api/pitstop.js'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import PageLoader from '../components/PageLoader.jsx'
import QueryError from '../components/QueryError.jsx'
import TrackStart from '../features/career/TrackStart.jsx'
import { lockText, trackSetup } from '../features/career/tracks.js'
import { useTracks } from '../features/career/useTracks.js'
import { useDaily } from '../features/daily/useDaily.js'
import KeyboardRequired from '../features/keyboard/KeyboardRequired.jsx'
import { useNeedsKeyboard } from '../features/keyboard/useNeedsKeyboard.js'
import PitstopReport from '../features/pitstop/PitstopReport.jsx'
import PitstopStart from '../features/pitstop/PitstopStart.jsx'
import { pitstopLang } from '../features/pitstop/pitstop.js'
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
        againLoading={flow.loading}
        againError={flow.error}
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
  const ghostWho = useTrainSetup((state) => state.ghost)
  const updateSetup = useTrainSetup((state) => state.update)

  if (flow.phase === 'run' && flow.run) {
    return (
      <RunScreen
        key={flow.run.key}
        run={flow.run}
        onFinish={flow.finish}
        onExit={flow.backToSetup}
        exitLabel="К трассе"
        ghostWho={ghostWho}
      />
    )
  }

  if (flow.phase === 'result' && flow.result) {
    return (
      <ResultScreen
        payload={flow.result}
        ghost={flow.ghost}
        user={user}
        onAgain={flow.start}
        againLoading={flow.loading}
        againError={flow.error}
        onChangeSetup={() => navigate('/career')}
        changeLabel="К карте трасс"
      />
    )
  }

  return (
    <TrackStart
      track={track}
      ghost={ghostWho}
      onGhostChange={(ghost) => updateSetup({ ghost })}
      onStart={flow.start}
      loading={flow.loading}
      error={flow.error}
    />
  )
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
  const queryClient = useQueryClient()
  const setup = useMemo(() => ({ dailyDate: daily.date }), [daily.date])
  const loadText = useMemo(() => async () => daily.text, [daily.text])
  const flow = useRunFlow(setup, loadText)
  const ghostWho = useTrainSetup((state) => state.ghost)
  const startedRef = useRef(false)
  const { start } = flow

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    start()
  }, [start])

  const toDaily = () => navigate('/daily')
  const again = () => {
    if (Date.now() < Date.parse(daily.ends_at)) return flow.start()
    queryClient.invalidateQueries({ queryKey: ['daily'] })
    toDaily()
  }

  if (flow.phase === 'run' && flow.run) {
    return (
      <RunScreen
        key={flow.run.key}
        run={flow.run}
        onFinish={flow.finish}
        onExit={toDaily}
        exitLabel="К заезду дня"
        ghostWho={ghostWho}
      />
    )
  }

  if (flow.phase === 'result' && flow.result) {
    return (
      <ResultScreen
        payload={flow.result}
        ghost={flow.ghost}
        user={user}
        onAgain={again}
        againLoading={flow.loading}
        againError={flow.error}
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

function PitstopTrain({ user, lang }) {
  const navigate = useNavigate()
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['pitstop', lang, user.id],
    queryFn: () => getPitstop({ lang }),
    gcTime: 0,
  })
  const setup = useMemo(() => ({ lang }), [lang])
  const loadText = useMemo(() => async () => data, [data])
  const flow = useRunFlow(setup, loadText)
  const { backToSetup } = flow

  const again = useCallback(() => {
    backToSetup()
    refetch()
  }, [backToSetup, refetch])

  const renderReport = useCallback(
    (payload) => <PitstopReport pitstop={flow.run} result={payload} />,
    [flow.run],
  )

  if (flow.phase === 'run' && flow.run) {
    return (
      <RunScreen
        key={flow.run.key}
        run={flow.run}
        onFinish={flow.finish}
        onExit={backToSetup}
        exitLabel="Из боксов"
      />
    )
  }

  if (flow.phase === 'result' && flow.result) {
    return (
      <ResultScreen
        payload={flow.result}
        user={user}
        onAgain={again}
        onChangeSetup={() => navigate('/train')}
        changeLabel="К тренировке"
        againLabel="Ещё пит-стоп"
        showPitstop={false}
        renderReport={renderReport}
      />
    )
  }

  if (isFetching) return <PageLoader />
  if (isError) return <QueryError onRetry={refetch} title="Не удалось подготовить пит-стоп" />

  return <PitstopStart pitstop={data} onStart={flow.start} />
}

export default function TrainPage() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const trackId = Number(searchParams.get('track')) || null
  const dailyDate = searchParams.get('daily')
  const pitstop = searchParams.get('pitstop')
  const needsKeyboard = useNeedsKeyboard()

  if (needsKeyboard) return <KeyboardRequired />
  if (!trackId && !dailyDate && !pitstop) return <FreeTrain user={user} />
  if (status !== 'ready') return <PageLoader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  if (pitstop) return <PitstopTrain key={pitstop} user={user} lang={pitstopLang(pitstop)} />
  if (dailyDate) return <DailyTrain user={user} date={dailyDate} />
  return <TrackTrain user={user} trackId={trackId} />
}
