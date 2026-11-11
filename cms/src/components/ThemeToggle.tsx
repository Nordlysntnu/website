'use client'
import { useState } from 'react'
export function ThemeToggle({ initialTheme }: { initialTheme: 'light' | 'dark' }) {
  const [theme, setTheme] = useState(initialTheme)
  return <button type="button" className="theme-toggle" onClick={() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.cookie = `payload-theme=${next};path=/;max-age=31536000;SameSite=Lax${location.protocol === 'https:' ? ';Secure' : ''}`
    document.documentElement.dataset.theme = next
    setTheme(next)
  }} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
    {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
  </button>
}
