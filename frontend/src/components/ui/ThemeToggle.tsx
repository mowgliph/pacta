import { IconSun, IconMoon } from '@tabler/icons-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full"
    >
      <IconSun 
        size={20}
        stroke={1.5}
        className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" 
        aria-hidden="true"
      />
      <IconMoon 
        size={20}
        stroke={1.5}
        className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" 
        aria-hidden="true"
      />
      <span className="sr-only">
        {theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      </span>
    </Button>
  )
}