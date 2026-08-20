const KEY = 'rumor-archive:theme'

export type Theme = 'light' | 'dark'

export function getStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

export function setTheme(theme: Theme): void {
  applyTheme(theme)
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* 静默 */
  }
}
