import { useEffect, useState } from 'react'
import { getThemeFromStorage } from '@/lib/utils'

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(getThemeFromStorage)

  useEffect(() => {
    // Solo ejecutar en el navegador
    if (typeof window === 'undefined') return
    
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return {
    theme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  }
}