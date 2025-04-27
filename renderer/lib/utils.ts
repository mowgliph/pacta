import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases con clsx y limpia clases conflictivas de Tailwind con twMerge
 * 
 * @param inputs - Clases a combinar
 * @returns Clases combinadas y limpias
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 