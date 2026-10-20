import { useState } from 'react'
import Button from '../../components/Button.jsx'
import TextField from '../../components/TextField.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { parseServerError, validateNewPassword } from '../auth/validation.js'
import StatsSection from '../stats/StatsSection.jsx'
import { useChangePassword } from './useProfile.js'
import styles from './PasswordSection.module.css'

const EMPTY_VALUES = { currentPassword: '', newPassword: '', repeatPassword: '' }

function validate({ currentPassword, newPassword, repeatPassword }, hasPassword) {
  const errors = {
    currentPassword: hasPassword && !currentPassword ? 'Обязательное поле' : null,
    newPassword: validateNewPassword(newPassword),
    repeatPassword: repeatPassword === newPassword ? null : 'Пароли не совпадают',
  }
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message))
}

export default function PasswordSection() {
  const hasPassword = useAuthStore((state) => state.user.has_password)
  const [values, setValues] = useState(EMPTY_VALUES)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [success, setSuccess] = useState(null)
  const changePassword = useChangePassword()

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => (current[name] ? { ...current, [name]: null } : current))
    setSuccess(null)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const errors = validate(values, hasPassword)
    setFieldErrors(errors)
    setFormError(null)
    if (Object.keys(errors).length > 0) return
    changePassword.mutate(
      {
        current_password: hasPassword ? values.currentPassword : null,
        new_password: values.newPassword,
      },
      {
        onSuccess: () => {
          setValues(EMPTY_VALUES)
          setSuccess(hasPassword ? 'Пароль изменён' : 'Пароль задан')
        },
        onError: (error) => {
          const { fields, form } = parseServerError(error)
          setFieldErrors({
            currentPassword: fields.current_password,
            newPassword: fields.new_password,
          })
          setFormError(form)
        },
      },
    )
  }

  return (
    <StatsSection title={hasPassword ? 'Пароль' : 'Задать пароль'}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {!hasPassword && (
          <p className={styles.hint}>
            Ты входишь через VK или Яндекс. Задай пароль, чтобы входить ещё и по почте.
          </p>
        )}
        {hasPassword && (
          <TextField
            label="Текущий пароль"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={values.currentPassword}
            error={fieldErrors.currentPassword}
            onChange={handleChange}
          />
        )}
        <TextField
          label="Новый пароль"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          maxLength={128}
          value={values.newPassword}
          error={fieldErrors.newPassword}
          onChange={handleChange}
        />
        <TextField
          label="Повтори новый пароль"
          name="repeatPassword"
          type="password"
          autoComplete="new-password"
          maxLength={128}
          value={values.repeatPassword}
          error={fieldErrors.repeatPassword}
          onChange={handleChange}
        />
        <p className={styles.hint}>
          От 8 до 128 символов. На других устройствах придётся войти заново.
        </p>
        {formError && (
          <p className={styles.error} role="alert">
            {formError}
          </p>
        )}
        {success && (
          <p className={styles.success} role="status">
            {success}
          </p>
        )}
        <Button type="submit" loading={changePassword.isPending} className={styles.submit}>
          {hasPassword ? 'Сменить пароль' : 'Задать пароль'}
        </Button>
      </form>
    </StatsSection>
  )
}
