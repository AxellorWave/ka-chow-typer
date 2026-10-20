import { Link, useLocation } from 'react-router-dom'
import { login } from '../api/auth.js'
import Button from '../components/Button.jsx'
import TextField from '../components/TextField.jsx'
import authImage from '../assets/design/auth.webp'
import AuthCard from '../features/auth/AuthCard.jsx'
import OAuthButtons from '../features/auth/OAuthButtons.jsx'
import { useAuthForm } from '../features/auth/useAuthForm.js'
import { validateLogin } from '../features/auth/validation.js'
import styles from '../features/auth/AuthForm.module.css'

export default function LoginPage() {
  const location = useLocation()
  const { values, fieldErrors, formError, isPending, handleChange, handleSubmit } = useAuthForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
    submit: login,
  })

  return (
    <AuthCard
      image={authImage}
      title="Вход"
      subtitle="С возвращением на трассу!"
      footer={
        <>
          Ещё нет аккаунта?{' '}
          <Link to="/register" state={location.state}>
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <OAuthButtons />
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className={styles.formError} role="alert">
            {formError}
          </p>
        )}
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={fieldErrors.email}
          onChange={handleChange}
        />
        <TextField
          label="Пароль"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          error={fieldErrors.password}
          onChange={handleChange}
        />
        <Button type="submit" loading={isPending} className={styles.submit}>
          {isPending ? 'Входим…' : 'Войти'}
        </Button>
      </form>
    </AuthCard>
  )
}
