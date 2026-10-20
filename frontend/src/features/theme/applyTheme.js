export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') root.dataset.theme = 'night'
  else delete root.dataset.theme
}
