import Button from './Button.jsx'
import EmptyState from './EmptyState.jsx'

export default function QueryError({ onRetry, title = 'Не удалось загрузить данные' }) {
  return (
    <EmptyState
      icon="🛠️"
      title={title}
      description="Проверьте соединение и попробуйте ещё раз."
      action={
        <Button type="button" variant="accent" onClick={() => onRetry()}>
          Повторить
        </Button>
      }
    />
  )
}
