import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getThemeFromStorage(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'light'
  return (localStorage.getItem('theme') as 'dark' | 'light') || 'light'
}
