export function dayWord(count) {
  const tens = count % 100
  const ones = count % 10
  if (tens >= 11 && tens <= 14) return 'дней'
  if (ones === 1) return 'день'
  if (ones >= 2 && ones <= 4) return 'дня'
  return 'дней'
}

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Moscow',
})

export const formatDailyDate = (date) => DATE_FORMAT.format(new Date(`${date}T12:00:00+03:00`))
