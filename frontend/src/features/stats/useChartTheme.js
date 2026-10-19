import { useMemo } from 'react'

const TOKENS = {
  primary: '--color-primary',
  accent: '--color-accent-dark',
  success: '--color-success',
  text: '--color-text',
  muted: '--color-text-muted',
  grid: '--color-bg',
  surface: '--color-surface',
  font: '--font-body',
}

export function useChartTheme() {
  return useMemo(() => {
    const styles = getComputedStyle(document.documentElement)
    return Object.fromEntries(
      Object.entries(TOKENS).map(([name, token]) => [name, styles.getPropertyValue(token).trim()]),
    )
  }, [])
}
