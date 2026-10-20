import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore.js'
import { parseServerError } from './validation.js'

export function useAuthForm({ initialValues, validate, submit }) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const setSession = useAuthStore((state) => state.setSession)

  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: ({ user, access_token }) => setSession(user, access_token),
    onError: (error) => {
      const { fields, form } = parseServerError(error)
      setFieldErrors(fields)
      setFormError(form)
    },
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => (current[name] ? { ...current, [name]: null } : current))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const prepared =
      typeof values.nickname === 'string' ? { ...values, nickname: values.nickname.trim() } : values
    const errors = validate(prepared)
    setFieldErrors(errors)
    setFormError(null)
    if (Object.keys(errors).length === 0) {
      mutation.mutate(prepared)
    }
  }

  return {
    values,
    fieldErrors,
    formError,
    isPending: mutation.isPending,
    handleChange,
    handleSubmit,
  }
}
