import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names or conditional class names with Tailwind's configuration
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getThemeFromStorage(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light'
  return (localStorage.getItem('theme') as 'dark' | 'light') || 'light'
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(typeof date === 'string' ? new Date(date) : date)
}
