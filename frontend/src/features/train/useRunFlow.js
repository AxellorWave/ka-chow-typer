import { useMutation } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { getText } from '../../api/texts.js'

const textErrorMessage = (error) =>
  error.response?.data?.message ??
  'Не удалось загрузить текст. Проверьте связь и попробуйте ещё раз.'

export function useRunFlow(setup) {
  const [phase, setPhase] = useState('setup')
  const [run, setRun] = useState(null)
  const [result, setResult] = useState(null)

  const textMutation = useMutation({
    mutationFn: getText,
    onSuccess: (data, variables) => {
      setRun({ ...data, track_id: variables.trackId ?? null, key: Date.now() })
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

  return {
    phase,
    run,
    result,
    start,
    finish,
    backToSetup,
    loading: isPending,
    error: textMutation.isError ? textErrorMessage(textMutation.error) : null,
  }
}
