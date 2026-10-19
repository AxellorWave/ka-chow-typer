import { useMutation } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { getText } from '../api/texts.js'
import ResultScreen from '../features/train/ResultScreen.jsx'
import RunScreen from '../features/train/RunScreen.jsx'
import RunSetup from '../features/train/RunSetup.jsx'
import { normalizeSetup } from '../features/train/options.js'
import { useTrainSetup } from '../features/train/useTrainSetup.js'
import { useAuthStore } from '../store/authStore.js'

const textErrorMessage = (error) =>
  error.response?.data?.message ??
  'Не удалось загрузить текст. Проверьте связь и попробуйте ещё раз.'

export default function TrainPage() {
  const user = useAuthStore((state) => state.user)
  const storedSetup = useTrainSetup()
  const setup = normalizeSetup(storedSetup, user)
  const [phase, setPhase] = useState('setup')
  const [run, setRun] = useState(null)
  const [result, setResult] = useState(null)

  const textMutation = useMutation({
    mutationFn: getText,
    onSuccess: (data) => {
      setRun({ ...data, key: Date.now() })
      setResult(null)
      setPhase('run')
    },
  })

  const { mutate: loadText, isPending } = textMutation
  const start = useCallback(() => loadText(setup), [loadText, setup])

  const finish = useCallback((payload) => {
    setResult(payload)
    setPhase('result')
  }, [])

  const backToSetup = useCallback(() => {
    textMutation.reset()
    setPhase('setup')
  }, [textMutation])

  if (phase === 'run' && run) {
    return <RunScreen key={run.key} run={run} onFinish={finish} onExit={backToSetup} />
  }

  if (phase === 'result' && result) {
    return <ResultScreen payload={result} user={user} onAgain={start} onChangeSetup={backToSetup} />
  }

  return (
    <RunSetup
      user={user}
      setup={setup}
      onChange={storedSetup.update}
      onStart={start}
      loading={isPending}
      error={textMutation.isError ? textErrorMessage(textMutation.error) : null}
    />
  )
}
