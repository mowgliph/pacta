import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'pacta-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, _setTheme] = useState<Theme>(() => {
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined') return defaultTheme;
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });

  useEffect(() => {
    // Solo ejecutar en el navegador
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (theme: Theme) => {
      root.classList.remove('light', 'dark') // Eliminar clases de tema existentes
      const systemTheme = mediaQuery.matches ? 'dark' : 'light'
      const effectiveTheme = theme === 'system' ? systemTheme : theme
      root.classList.add(effectiveTheme) // Añadir la nueva clase de tema
    }

    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    applyTheme(theme)

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [theme])

  const setTheme = (theme: Theme) => {
    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, theme)
    }
    _setTheme(theme)
  }

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider')

  return context
}