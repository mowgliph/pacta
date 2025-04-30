import { contextBridge, ipcRenderer } from "electron";

/**
 * Lista de canales IPC permitidos para invocar (del renderer al main)
 */
const validInvokeChannels = [
  // Canales de la aplicación
  "app:relaunch",
  "app:exit",
  "app:getVersion",
  "app:getPath",
  "app:getInfo",

  // Canales para contratos
  "contratos:listar",
  "contratos:crear",
  "contratos:obtener",
  "contratos:actualizar",
  "contratos:archivar",
  "contracts:updateAccessControl",
  "contracts:assignUsers",

  // Canales para suplementos
  "suplementos:listar",
  "suplementos:crear",
  "suplementos:obtener",

  // Canales para usuarios y autenticación
  "usuario:autenticar",
  "usuario:cerrarSesion",
  "usuario:cambiarContrasena",
  "usuario:perfil",
  "users:list",
  "users:getAll",
  "users:getById",
  "users:create",
  "users:update",
  "users:toggleActive",
  "users:changePassword",
  "roles:getAll",

  // Canales para gestión de documentos
  "documents:save",
  "documents:getAll",
  "documents:getById",
  "documents:update",
  "documents:delete",
  "documents:download",
  "documents:getByContract",
  "documents:getBySupplement",
  "documents:open",

  // Canales para backups
  "backups:getAll",
  "backups:create",
  "backups:restore",
  "backups:delete",
  "backups:cleanOld",
  "backups:updateSchedule",
  "backup:getAll",
  "backup:create",
  "backup:restore",
  "backup:delete",
  "backup:cleanOld",

  // Canales para notificaciones
  "notificaciones:mostrar",
  "notificaciones:marcarLeida",
  "notificaciones:obtenerNoLeidas",

  // Canales para estadísticas
  "estadisticas:dashboard",
  "estadisticas:contratos",
  "estadisticas:exportar",

  // Canales para sistema
  "sistema:config",
  "sistema:tema",
  "sistema:logs",

  // Canales para API
  "api:request",
  "auth:login",
  "auth:logout",
  "auth:verify",
  "auth:refresh",
];

/**
 * Lista de canales IPC permitidos para recibir (del main al renderer)
 */
const validReceiveChannels = [
  "contrato:actualizado",
  "contrato:eliminado",
  "auth:sesion-expirada",
  "notificacion:nueva",
  "backup:completado",
  "actualizacion:disponible",
  "user:updated",
  "documents:updated",
  "documents:deleted",
];

/**
 * Validar si un canal está en la lista de canales permitidos
 * @param {string} channel - Nombre del canal a validar
 * @param {string[]} allowedChannels - Lista de canales permitidos
 * @returns {boolean} - Verdadero si el canal está permitido
 */
const isValidChannel = (
  channel: string,
  allowedChannels: string[]
): boolean => {
  return allowedChannels.includes(channel);
};

// APIs seguras expuestas al proceso de renderizado a través de contextBridge
contextBridge.exposeInMainWorld("Electron", {
  // API de la aplicación
  app: {
    relaunch: () => ipcRenderer.invoke("app:relaunch"),
    exit: (code: number) => ipcRenderer.invoke("app:exit", code),
    getVersion: () => ipcRenderer.invoke("app:getVersion"),
    getPath: (name: string) => ipcRenderer.invoke("app:getPath", name),
    getInfo: () => ipcRenderer.invoke("app:getInfo"),
  },

  // API para contratos
  contratos: {
    listar: (filtros?: any) => ipcRenderer.invoke("contratos:listar", filtros),
    crear: (datos: any) => ipcRenderer.invoke("contratos:crear", datos),
    obtener: (id: string) => ipcRenderer.invoke("contratos:obtener", id),
    actualizar: (id: string, datos: any) =>
      ipcRenderer.invoke("contratos:actualizar", id, datos),
    archivar: (id: string) => ipcRenderer.invoke("contratos:archivar", id),
  },

  // API para suplementos
  suplementos: {
    listar: (contratoId: string) =>
      ipcRenderer.invoke("suplementos:listar", contratoId),
    crear: (contratoId: string, datos: any) =>
      ipcRenderer.invoke("suplementos:crear", contratoId, datos),
    obtener: (id: string) => ipcRenderer.invoke("suplementos:obtener", id),
  },

  // API para usuarios y autenticación
  auth: {
    login: (credentials: {
      usuario: string;
      password: string;
      rememberMe?: boolean;
      deviceId?: string;
      isSpecialUser?: boolean;
    }) => ipcRenderer.invoke("auth:login", credentials),
    logout: () => ipcRenderer.invoke("auth:logout"),
    cambiarContrasena: (datos: { actual: string; nueva: string }) =>
      ipcRenderer.invoke("usuario:cambiarContrasena", datos),
    getPerfil: () => ipcRenderer.invoke("usuario:perfil"),
  },

  // API para usuarios
  users: {
    list: () => ipcRenderer.invoke("users:getAll"),
    getById: (id: string) => ipcRenderer.invoke("users:getById", id),
    create: (userData: any) => ipcRenderer.invoke("users:create", userData),
    update: (userData: any) => ipcRenderer.invoke("users:update", userData),
    toggleActive: (userId: string) =>
      ipcRenderer.invoke("users:toggleActive", userId),
    changePassword: (passwordData: any) =>
      ipcRenderer.invoke("users:changePassword", passwordData),
  },

  // API para roles
  roles: {
    getAll: () => ipcRenderer.invoke("roles:getAll"),
  },

  // API para documentos
  documentos: {
    abrir: (path: string) => ipcRenderer.invoke("documents:open", path),
    guardar: (path: string, content: any) =>
      ipcRenderer.invoke("documents:save", path, content),
    listar: (contratoId: string) =>
      ipcRenderer.invoke("documents:getByContract", contratoId),
  },

  // API para backups
  backups: {
    crear: (descripcion?: string) =>
      ipcRenderer.invoke("backup:create", { description: descripcion }),
    restaurar: (backupId: string) =>
      ipcRenderer.invoke("backup:restore", { backupId }),
    eliminar: (backupId: string) =>
      ipcRenderer.invoke("backup:delete", { backupId }),
    listar: () => ipcRenderer.invoke("backup:getAll"),
    limpiarAntiguos: () => ipcRenderer.invoke("backup:cleanOld"),
  },

  // API para notificaciones
  notificaciones: {
    mostrar: (opciones: { titulo: string; cuerpo: string }) =>
      ipcRenderer.invoke("notificaciones:mostrar", opciones),
    marcarLeida: (id: string) =>
      ipcRenderer.invoke("notificaciones:marcarLeida", id),
    obtenerNoLeidas: () => ipcRenderer.invoke("notificaciones:obtenerNoLeidas"),
  },

  // API para estadísticas
  estadisticas: {
    dashboard: () => ipcRenderer.invoke("estadisticas:dashboard"),
    contratos: (filtros?: any) =>
      ipcRenderer.invoke("estadisticas:contratos", filtros),
    exportar: (tipo: string, filtros?: any) =>
      ipcRenderer.invoke("estadisticas:exportar", tipo, filtros),
  },

  // API para IPC invocaciones generales
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      if (isValidChannel(channel, validInvokeChannels)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Canal IPC no permitido: ${channel}`));
    },
  },

  // API para recibir eventos del proceso principal
  receive: (channel: string, func: (...args: any[]) => void) => {
    if (isValidChannel(channel, validReceiveChannels)) {
      // Limpiar listeners previos para evitar duplicados
      ipcRenderer.removeAllListeners(channel);

      // Registrar nuevo listener
      // Usar una función wrapper para omitir el evento en el callback
      ipcRenderer.on(channel, (_event, ...args) => func(...args));

      return true;
    }
    return false;
  },

  // API para eliminar un listener específico
  removeListener: (channel: string) => {
    if (isValidChannel(channel, validReceiveChannels)) {
      ipcRenderer.removeAllListeners(channel);
      return true;
    }
    return false;
  },
});
