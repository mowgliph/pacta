import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light' | 'system'

type ThemeStore = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Determinar el tema del sistema
const getSystemTheme = (): 'dark' | 'light' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Aplicar el tema al documento
const applyTheme = (theme: Theme) => {
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
  root.classList.add(effectiveTheme)
}

// Crear el store con persistencia
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light', // Valor por defecto
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
    }),
    {
      name: 'pacta-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)

// Inicializar el tema al cargar la página
if (typeof window !== 'undefined') {
  // Aplicar tema guardado o detectar tema del sistema
  const savedTheme = localStorage.getItem('pacta-theme-storage')
  const initialTheme = savedTheme 
    ? JSON.parse(savedTheme).state.theme
    : 'system'
  
  applyTheme(initialTheme)
  
  // Observar cambios en el tema del sistema si está configurado en 'system'
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  mediaQuery.addEventListener('change', (e) => {
    if (useThemeStore.getState().theme === 'system') {
      applyTheme('system')
    }
  })
} 