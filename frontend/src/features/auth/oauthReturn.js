const STORAGE_KEY = 'kachow_oauth_from'

export function saveOAuthReturn(from) {
  try {
    if (from) {
      sessionStorage.setItem(STORAGE_KEY, `${from.pathname}${from.search ?? ''}`)
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    return
  }
}

export function takeOAuthReturn() {
  try {
    const path = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    return path?.startsWith('/') && !path.startsWith('//') ? path : '/'
  } catch {
    return '/'
  }
}
