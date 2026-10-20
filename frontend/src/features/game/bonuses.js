export const BONUS_MIN_DELAY_MS = 20000
export const BONUS_MAX_DELAY_MS = 40000
export const BONUS_DURATION_MS = 10000

export const TURBO_BONUS = {
  id: 'turbo',
  label: 'Турбо',
  multiplier: 2,
  icon: '⚡',
}

export function getRandomBonusDelay() {
  return (
    BONUS_MIN_DELAY_MS + Math.floor(Math.random() * (BONUS_MAX_DELAY_MS - BONUS_MIN_DELAY_MS + 1))
  )
}
