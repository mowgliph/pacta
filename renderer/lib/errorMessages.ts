export const errorMessages = {
  apiUnavailable: "API no disponible",
  fetchError: "Error al obtener datos",
  downloadError: "No se pudo descargar el archivo",
  exportError: "No se pudo exportar el archivo",
  saveCancelled: "Operación cancelada",
  saveError: "Error al guardar el archivo",
  connectionError: "Error de conexión",
  unknownError: "Error desconocido",
} as const;

export type ErrorMessages = typeof errorMessages[keyof typeof errorMessages];

export const notificationMessages = {
  success: {
    export: "Archivo exportado correctamente",
    download: "Archivo descargado correctamente",
  },
  error: {
    export: "Error al exportar el archivo",
    download: "Error al descargar el archivo",
    save: "Error al guardar el archivo",
  },
  warning: {
    cancelled: "Operación cancelada",
  },
} as const;
