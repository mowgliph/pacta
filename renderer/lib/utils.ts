import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
    if (typeof window !== 'undefined') {
      const { ipcRenderer } = await import('electron');
      // Obtener la variable desde el proceso main a través de IPC
      const result = await ipcRenderer.invoke("env:getVariable", key);
      return result;
    }
    return undefined;
  } catch (error) {
    console.error(`Error al obtener la variable de entorno ${key}:`, error);
    return undefined;
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
