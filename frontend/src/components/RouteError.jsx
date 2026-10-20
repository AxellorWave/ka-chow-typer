import { useRouteError } from 'react-router-dom'
import Button from './Button.jsx'
import EmptyState from './EmptyState.jsx'
import styles from './RouteError.module.css'

const CHUNK_ERROR_PATTERN =
  /dynamically imported module|Importing a module script failed|Unable to preload CSS/i

const isChunkLoadError = (error) => CHUNK_ERROR_PATTERN.test(String(error?.message ?? error))

export default function RouteError({ fullPage = false }) {
  const outdated = isChunkLoadError(useRouteError())

  return (
    <div className={fullPage ? styles.fullPage : undefined} role="alert">
      <EmptyState
        icon={outdated ? '🔄' : '🛠️'}
        title={outdated ? 'Вышла новая версия' : 'Что-то пошло не так'}
        description={
          outdated
            ? 'Пока вы были на трассе, приложение обновилось. Обновите страницу, чтобы продолжить.'
            : 'Страница сломалась. Обновите её — сохранённый прогресс никуда не денется.'
        }
        action={
          <Button type="button" variant="accent" onClick={() => window.location.reload()}>
            Обновить
          </Button>
        }
      />
    </div>
  )
}
