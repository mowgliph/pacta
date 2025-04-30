import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ipcRenderer } from 'electron';

/**
 * Combina clases con clsx y limpia clases conflictivas de Tailwind con twMerge
 * 
 * @param inputs - Clases a combinar
 * @returns Clases combinadas y limpias
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Obtiene una variable de entorno de forma segura
 * Evita el uso de hardcoded secrets y usa el proceso main para obtener secretos
 * 
 * @param key - Clave de la variable de entorno
 * @returns Valor de la variable de entorno o undefined si no existe
 */
export async function getEnvVariable(key: string): Promise<string | undefined> {
  try {
    // Obtener la variable desde el proceso main a través de IPC
    const result = await ipcRenderer.invoke('env:getVariable', key);
    return result;
  } catch (error) {
    console.error(`Error al obtener la variable de entorno ${key}:`, error);
    return undefined;
  }
} 