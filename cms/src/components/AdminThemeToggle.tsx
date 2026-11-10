'use client'
import { useTheme } from '@payloadcms/ui'

export function AdminThemeToggle() {
  const { theme, setTheme } = useTheme()
  return <button type="button" className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
    {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
  </button>
}
