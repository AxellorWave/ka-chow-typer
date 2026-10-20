import { useEffect } from 'react'
import { useSettingsStore } from '../../store/settingsStore.js'
import { applyTheme } from './applyTheme.js'

export function useThemeEffect() {
  const theme = useSettingsStore((state) => state.theme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])
}
