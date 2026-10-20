import { useMutation } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { getText } from '../../api/texts.js'

const textErrorMessage = (error) =>
  error.response?.data?.message ??
  'Не удалось загрузить текст. Проверьте связь и попробуйте ещё раз.'

export function useRunFlow(setup, loadText = getText) {
  const [phase, setPhase] = useState('setup')
  const [run, setRun] = useState(null)
  const [result, setResult] = useState(null)
  const [ghost, setGhost] = useState(null)

  const textMutation = useMutation({
    mutationFn: loadText,
    onSuccess: (data, variables) => {
      setRun({
        ...data,
        track_id: variables.trackId ?? null,
        daily_date: variables.dailyDate ?? null,
        key: Date.now(),
      })
      setResult(null)
      setPhase('run')
    },
  })

  const { mutate, isPending } = textMutation
  const start = useCallback(() => mutate(setup), [mutate, setup])

  const finish = useCallback((payload, finishGhost = null) => {
    setResult(payload)
    setGhost(finishGhost)
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
    ghost,
    start,
    finish,
    backToSetup,
    loading: isPending,
    error: textMutation.isError ? textErrorMessage(textMutation.error) : null,
  }
}
