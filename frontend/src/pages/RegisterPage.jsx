import { Link, useLocation } from 'react-router-dom'
import { register } from '../api/auth.js'
import Button from '../components/Button.jsx'
import TextField from '../components/TextField.jsx'
import authImage from '../assets/design/auth.webp'
import AuthCard from '../features/auth/AuthCard.jsx'
import OAuthButtons from '../features/auth/OAuthButtons.jsx'
import { useAuthForm } from '../features/auth/useAuthForm.js'
import { validateRegister } from '../features/auth/validation.js'
import styles from '../features/auth/AuthForm.module.css'

export default function RegisterPage() {
  const location = useLocation()
  const { values, fieldErrors, formError, isPending, handleChange, handleSubmit } = useAuthForm({
    initialValues: { email: '', nickname: '', password: '' },
    validate: validateRegister,
    submit: register,
  })

  return (
    <AuthCard
      image={authImage}
      kicker="Новый пилот"
      headline="Получи номер"
      title="Регистрация"
      subtitle="Создай гонщика и копи опыт, кубки и достижения."
      footer={
        <>
          Уже есть аккаунт?{' '}
          <Link to="/login" state={location.state}>
            Войти
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
          label="Ник"
          name="nickname"
          autoComplete="nickname"
          value={values.nickname}
          error={fieldErrors.nickname}
          onChange={handleChange}
        />
        <TextField
          label="Пароль"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          error={fieldErrors.password}
          onChange={handleChange}
        />
        <Button type="submit" loading={isPending} className={styles.submit}>
          {isPending ? 'Создаём…' : 'Зарегистрироваться'}
        </Button>
      </form>
    </AuthCard>
  )
}
